import json
import logging
import re
from datetime import datetime

from openai import OpenAI

from ..config import Config
from .tourism_service import SUPPORTED_LANGUAGES, TourismService
from .traffic_service import TrafficService

logger = logging.getLogger(__name__)

MAX_MESSAGE_LENGTH = 1000
MAX_TOOL_ROUNDS = 4

LANGUAGE_NAMES = {
    'kor': 'Korean',
    'eng': 'English',
    'jpn': 'Japanese',
    'chs': 'Simplified Chinese',
    'cht': 'Traditional Chinese',
}


class ChatbotConfigurationError(Exception):
    """AI 공급자 설정이 없거나 올바르지 않습니다."""


class ChatbotProviderError(Exception):
    """AI 공급자 호출 또는 응답 처리 오류입니다."""


_UNSET = object()


class ChatbotService:
    """NVIDIA GPT-OSS-20B와 수원 관광 도구를 연결합니다."""

    def __init__(self, client=_UNSET, tourism_service=None, traffic_service=None):
        self.api_key = Config.NVIDIA_API_KEY
        self.model = Config.NVIDIA_MODEL
        if client is _UNSET:
            self.client = OpenAI(
                base_url=Config.NVIDIA_BASE_URL,
                api_key=self.api_key,
                timeout=30.0,
                max_retries=0,
            ) if self.api_key else None
        else:
            self.client = client
        if tourism_service is None:
            from ..api.tourism import tourism_service as shared_tourism_service
            self.tourism_service = shared_tourism_service
        else:
            self.tourism_service = tourism_service
        self.traffic_service = traffic_service or TrafficService()

    def answer(self, message, language='kor', location=None, user_name=None):
        self._validate(message, language)
        if not self.client:
            raise ChatbotConfigurationError('NVIDIA_API_KEY가 설정되지 않았습니다.')

        degraded = False
        tool_status = None
        messages = [
            {'role': 'system', 'content': self._system_prompt(language, user_name)},
            {'role': 'user', 'content': self._user_context(message, location)},
        ]

        try:
            for _ in range(MAX_TOOL_ROUNDS):
                completion = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=1,
                    top_p=1,
                    max_tokens=4096,
                    stream=False,
                    tools=self.tools(),
                    tool_choice='auto',
                )
                assistant = completion.choices[0].message
                tool_calls = getattr(assistant, 'tool_calls', None) or []
                messages.append(self._assistant_message(assistant))

                if not tool_calls:
                    content = getattr(assistant, 'content', None) or ''
                    response = self._normalize_response(content)
                    response['model'] = self.model
                    response['degraded'] = degraded
                    response['toolStatus'] = tool_status
                    return response

                for tool_call in tool_calls:
                    result = self._run_tool(tool_call.function.name, tool_call.function.arguments, language)
                    if result.get('degraded'):
                        degraded = True
                        tool_status = result.get('toolStatus') or tool_status
                    messages.append({
                        'role': 'tool',
                        'tool_call_id': tool_call.id,
                        'content': json.dumps(result, ensure_ascii=False),
                    })
        except ChatbotConfigurationError:
            raise
        except Exception as error:
            logger.exception('NVIDIA GPT-OSS 챗봇 호출 실패')
            raise ChatbotProviderError('챗봇 응답 생성에 실패했습니다.') from error

        raise ChatbotProviderError('챗봇 도구 호출이 제한 횟수를 초과했습니다.')

    @staticmethod
    def tools():
        return [
            {
                'type': 'function',
                'function': {
                    'name': 'search_suwon_spots',
                    'description': '수원 관광지, 맛집, 시장, 박물관, 숙박 등 관광 장소를 검색합니다. 장소 추천이나 비교 전에 사용합니다.',
                    'parameters': {
                        'type': 'object',
                        'properties': {
                            'query': {'type': 'string', 'description': '장소명, 지역명 또는 사용자의 검색어'},
                            'category': {'type': 'string', 'enum': ['all', 'heritage', 'museum', 'market', 'nature', 'food', 'festival', 'stay', 'leisure', 'course'], 'description': '장소 유형. 모르면 all'},
                        },
                        'required': ['query', 'category'],
                        'additionalProperties': False,
                    },
                },
            },
            {
                'type': 'function',
                'function': {
                    'name': 'get_suwon_spot_detail',
                    'description': '특정 수원 관광지의 주소, 운영시간, 이용요금, 주차, 설명, 위치를 확인합니다. 검색 결과의 contentId를 사용합니다.',
                    'parameters': {
                        'type': 'object',
                        'properties': {'content_id': {'type': 'string', 'description': '관광지 contentId'}},
                        'required': ['content_id'],
                        'additionalProperties': False,
                    },
                },
            },
            {
                'type': 'function',
                'function': {
                    'name': 'get_suwon_transport_guide',
                    'description': '수원역, 서울, 인천공항, 김포공항, 교통카드, 지하철, 버스, 택시 등 수원 여행 교통 안내를 조회합니다. 교통 질문에는 반드시 사용합니다.',
                    'parameters': {
                        'type': 'object',
                        'properties': {'topic': {'type': 'string', 'description': '교통 질문의 핵심 주제'}},
                        'required': ['topic'],
                        'additionalProperties': False,
                    },
                },
            },
        ]

    def _run_tool(self, name, arguments, language):
        try:
            args = json.loads(arguments or '{}')
        except json.JSONDecodeError:
            return {'error': '도구 인자가 올바른 JSON이 아닙니다.'}

        try:
            if name == 'search_suwon_spots':
                query = str(args.get('query') or '').strip()[:100]
                category = args.get('category', 'all')
                if not query:
                    return {'items': []}
                data = self.tourism_service.get_spots(language=language, page=1, page_size=8, category=category, keyword=query)
                result = {'items': [self._compact_spot(item) for item in data['items']]}
                return self._mark_tourism_degraded(result)

            if name == 'get_suwon_spot_detail':
                content_id = str(args.get('content_id') or '').strip()
                detail = self.tourism_service.get_spot_detail(content_id, language=language)
                return self._mark_tourism_degraded({'spot': self._compact_spot(detail, detail=True)})

            if name == 'get_suwon_transport_guide':
                data = self.traffic_service.get_traffic_data(language)
                return {'topic': str(args.get('topic') or '')[:100], 'transport': data['guides'], 'destinations': data['destinations']}
        except Exception:
            logger.warning('관광/교통 도구를 사용할 수 없습니다: tool=%s', name, exc_info=True)
            return {
                'degraded': True,
                'toolStatus': 'tourapi_unavailable' if name != 'get_suwon_transport_guide' else 'transport_unavailable',
                'message': '현재 외부 관광정보를 확인할 수 없습니다. 검증되지 않은 최신 정보를 추측하지 마십시오.',
                'items': [],
            }

        return {'error': '지원하지 않는 도구입니다.'}

    def _mark_tourism_degraded(self, result):
        manager = getattr(self.tourism_service, 'manager', None)
        circuit_open = bool(manager and manager._tour_api_circuit_open())
        if circuit_open:
            result.update({
                'degraded': True,
                'toolStatus': 'tourapi_unavailable',
                'message': '현재 외부 관광정보 조회가 제한되어 저장된 검증 데이터만 제공됩니다. 최신 정보는 확인할 수 없습니다.',
            })
        return result

    @staticmethod
    def _compact_spot(item, detail=False):
        fields = ['contentId', 'title', 'address', 'latitude', 'longitude', 'category', 'imageUrl']
        if detail:
            fields += ['overview', 'homepage', 'telephone', 'openHours', 'restDate', 'parking', 'usageFee', 'duration']
        return {field: item.get(field) for field in fields if field in item}

    @staticmethod
    def _assistant_message(assistant):
        message = {'role': 'assistant', 'content': getattr(assistant, 'content', None)}
        tool_calls = getattr(assistant, 'tool_calls', None) or []
        if tool_calls:
            message['tool_calls'] = [
                {'id': call.id, 'type': 'function', 'function': {'name': call.function.name, 'arguments': call.function.arguments}}
                for call in tool_calls
            ]
        return message

    @staticmethod
    def _normalize_response(content):
        text = str(content).strip()
        course = None
        match = re.search(r'(?:```(?:markdown|json)?\s*)?\[COURSE_DATA:\s*(\{.*?\})\]\s*(?:```)?\s*$', text, re.DOTALL)
        if match:
            try:
                candidate = json.loads(match.group(1))
                if isinstance(candidate, dict) and isinstance(candidate.get('places'), list):
                    course = {'title': str(candidate.get('title') or 'AI 추천 코스'), 'places': [str(place) for place in candidate['places'][:20]]}
                    text = text[:match.start()].rstrip()
            except json.JSONDecodeError:
                logger.warning('챗봇 코스 메타데이터 파싱 실패')
        return {'message': text or '답변을 생성하지 못했습니다.', 'provider': 'nvidia', 'course': course}

    @staticmethod
    def _validate(message, language):
        if language not in SUPPORTED_LANGUAGES:
            raise ValueError('지원하지 않는 언어입니다.')
        if not isinstance(message, str) or not message.strip():
            raise ValueError('message는 비어 있지 않은 문자열이어야 합니다.')
        if len(message) > MAX_MESSAGE_LENGTH:
            raise ValueError(f'message는 {MAX_MESSAGE_LENGTH}자 이하여야 합니다.')

    @staticmethod
    def _user_context(message, location):
        safe_message = re.sub(r'[\r\n\t]+', ' ', message).strip()
        if isinstance(location, dict):
            latitude = location.get('latitude')
            longitude = location.get('longitude')
            if isinstance(latitude, (int, float)) and isinstance(longitude, (int, float)):
                return f'[사용자 현재 위치: 위도 {latitude}, 경도 {longitude}. 주변 장소 질문이면 이 위치를 참고하세요.] {safe_message}'
        return safe_message

    @staticmethod
    def _system_prompt(language, user_name=None):
        language_name = LANGUAGE_NAMES[language]
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        name_instruction = f'사용자 이름은 {user_name}입니다. 자연스러울 때만 이름을 사용하세요.' if user_name else ''
        return f'''너는 LinkSuwon의 수원 전문 AI 여행 도우미다. 현재 시각은 {now}이다.

핵심 원칙 및 사실 기준:
- 수원 관광지, 문화유산, 맛집, 시장, 숙박, 교통카드, 대중교통 정보만 정확하게 안내한다.
- 관광지의 역사, 주소, 운영시간, 요금 등 확인 가능한 사실은 내부 도구 결과를 우선하고, 도구에 없는 사실은 추측하지 않는다.
- 관광지 정보(주소, 운영시간, 요금, 설명 등)는 반드시 search_suwon_spots 또는 get_suwon_spot_detail 도구를 먼저 호출하여 획득한 데이터에 기반(Grounding)하여 답변한다.
- 교통 질문(공항/서울 ➡️ 수원 이동, T-money, WOWPASS, NAMANE, 1회용 카드 등)은 get_suwon_transport_guide 도구를 우선 호출한다.
- 도구 결과에 없는 가격, 운영시간, 소요시간을 거짓으로 지어내지 말고, 불확실하면 네이버 지도 등 공식 확인 방법을 안내한다.
- 도구 결과에 `degraded` 또는 `unavailable` 상태가 포함되면 최신 관광정보를 확인할 수 없다고 명확히 알리고, 검증되지 않은 축제·운영시간·요금·교통 상태를 추측하지 않는다.
- 답변은 반드시 사용자가 요청한 언어({language_name})로 작성한다.
- 가독성이 좋은 마크다운(Markdown) 포맷으로 작성한다.
- 여행 코스나 일정을 추천할 때는 답변 맨 마지막 줄에 [COURSE_DATA: {{"title":"...", "places":["..."]}}] 형태의 메타데이터를 추가한다.
{name_instruction}'''
