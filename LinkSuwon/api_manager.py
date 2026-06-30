import os
import requests
import re
from urllib.parse import unquote
from korean_romanizer.romanizer import Romanizer
import pykakasi

from LinkSuwon.config import Config
from LinkSuwon.seed_data import get_seed_places

class TourAPIManager():
    def __init__(self):
        # Config 클래스로부터 설정값 주입
        self.api_key = unquote(Config.TOUR_API_KEY) if Config.TOUR_API_KEY else None
        self.base_url = 'https://apis.data.go.kr/B551011'
        self.gemini_api_key = Config.GEMINI_API_KEY
        self.ssl_verify = Config.SSL_VERIFY

        # 일본어 변환기 설정
        self.kks = pykakasi.kakasi()

        # 언어별 서비스 경로 매핑
        self.service_map = {
            'kor': 'KorService2',  # 국문
            'eng': 'EngService2',  # 영문
            'jpn': 'JpnService2',  # 일문
            'chs': 'ChsService2',  # 중문_간체
            'cht': 'ChtService2'   # 중문_번체
        }

    def get_suwon_data(self, lang='kor'):
        service_map = self.service_map.get(lang, 'KorService2')
        url = f'{self.base_url}/{service_map}/areaBasedList2'

        content_type = '12' if lang == 'kor' else '76'

        params = {
            'serviceKey': self.api_key,
            'areaCode': '31',         # 경기도
            'sigunguCode': '13',      # 수원시
            'contentTypeId': content_type,    # 관광지
            'MobileOS': 'ETC',
            'MobileApp': 'LinkSuwon',
            '_type': 'json',
            'numOfRows': 20,
            'pageNo': 1,
        }

        # API 호출 실패 또는 오류 발생 시 사용될 Fallback 생성 헬퍼
        def make_fallback_response():
            print(f"--- [DEBUG] API 장애 감지. {lang} 언어용 로컬 Seed Data를 로드합니다. ---")
            local_items = get_seed_places(lang)
            return {
                "response": {
                    "header": {
                        "resultCode": "0000",
                        "resultMsg": "SUCCESS (LOCAL FALLBACK)"
                    },
                    "body": {
                        "items": {
                            "item": local_items
                        },
                        "numOfRows": len(local_items),
                        "pageNo": 1,
                        "totalCount": len(local_items)
                    }
                }
            }

        if not self.api_key:
            return make_fallback_response()

        try:
            # [보안 적용] 전역 SSL 검증 옵션 바인딩
            response = requests.get(url, params=params, timeout=10, verify=self.ssl_verify)
            
            if response.status_code == 200:
                res_data = response.json()
                
                # API 응답 헤더 확인
                header = res_data.get('response', {}).get('header', {})
                if header.get('resultCode') != '0000':
                    print(f"--- [DEBUG] API 응답 에러 코드: {header.get('resultCode')} ---")
                    return make_fallback_response()

                # 아이템별 발음 및 설명(Seed) 주입
                items_wrapper = res_data.get('response', {}).get('body', {}).get('items')
                if items_wrapper and 'item' in items_wrapper:
                    items = items_wrapper['item']
                    # 단일 아이템일 경우 리스트화
                    if isinstance(items, dict):
                        items = [items]
                        items_wrapper['item'] = items

                    for item in items:
                        title = item.get('title', '')
                        ko_name = title.split('(')[-1].replace(')', '').strip() if '(' in title else title

                        # 발음 변환 (영문 로마자 위주)
                        if lang == 'eng':
                            r = Romanizer(ko_name)
                            item['pronunciation'] = f"Pronounce: {r.romanize()}"
                        elif lang == 'jpn':
                            item['pronunciation'] = f"読み方: {ko_name}"
                        elif lang in ['chs', 'cht']:
                            item['pronunciation'] = f"韩语发音: {ko_name}"
                        else:
                            item['pronunciation'] = ""

                        # 설명(Overview) 주입: 기본적으로 주소를 사용하되, 대표적인 곳은 하드코딩 백업
                        if not item.get('overview'):
                            if '방화수류정' in ko_name or 'Banghwasuryujeong' in title:
                                item['overview'] = "수원화성에서 가장 경관이 아름다운 곳으로, 연못인 용연과의 조화가 일품."
                            elif '창룡문' in ko_name or 'Changnyongmun' in title:
                                item['overview'] = "수원화성의 동문으로, 주변에 넓은 잔디밭이 있어 나들이하기 딱 좋습니다."
                            elif '본수원갈비' in ko_name or 'Bonsuwon' in title:
                                item['overview'] = "수원을 대표하는 갈비 명가로, 풍부한 육즙과 깊은 맛이 일품입니다."
                            else:
                                item['overview'] = item.get('addr1', '수원의 정취를 느낄 수 있는 멋진 장소!')

                # 데이터 개수 로그로 확인
                body = res_data.get('response', {}).get('body', {})
                total = body.get('totalCount', 0)
                print(f"--- [DEBUG] 수원 데이터 수신 성공! 총 {total}개 ---")
                
                return res_data
            else:
                print(f"--- [DEBUG] HTTP 에러 발생: {response.status_code} ---")
                return make_fallback_response()
                
        except Exception as e:
            print(f"--- [DEBUG] 예외 발생: {str(e)} ---")
            return make_fallback_response()
        
    def get_detail_info(self, content_id, lang='kor'):
        # content_id가 로컬 Seed Data(126227~126234)에 해당하는 경우 로컬에서 즉시 리턴
        if str(content_id) in ['126227', '126228', '126229', '126230', '126231', '126232', '126233', '126234']:
            local_items = get_seed_places(lang)
            matched = next((item for item in local_items if item['contentid'] == str(content_id)), None)
            if matched:
                return {
                    "response": {
                        "header": {"resultCode": "0000", "resultMsg": "SUCCESS (LOCAL DETAIL)"},
                        "body": {
                            "items": {"item": [matched]}
                        }
                    }
                }

        service_map = self.service_map.get(lang, 'KorService2')
        url = f'{self.base_url}/{service_map}/detailCommon2'

        params = {
            'serviceKey': self.api_key,
            'contentId': content_id,
            'MobileOS': 'ETC',
            'MobileApp': 'LinkSuwon',
            '_type': 'json',
            'overviewYN': 'Y',
            'addrinfoYN': 'Y',
            'firstImageYN': 'Y',
            'mapinfoYN': 'Y'
        }

        if not self.api_key:
            return None

        try:
            # [보안 적용] 전역 SSL 검증 옵션 바인딩
            response = requests.get(url, params=params, timeout=10, verify=self.ssl_verify)
            if response.status_code == 200:
                res_data = response.json()
                
                header = res_data.get('response', {}).get('header', {})
                if header.get('resultCode') != '0000':
                    print(f"--- [DEBUG] API 응답 에러: {header.get('resultMsg')} ---")
                    return None
                
                return res_data
            return None
        except Exception as e:
            print(f"--- [DEBUG] 상세정보 예외 발생: {str(e)} ---")
            return None

    # 제미나이 호출 함수
    def ask_gemini_multilingual(self, user_input: str, target_language: str) -> str:
        if not self.gemini_api_key:
            return "API key is missing. Please check your .env file."

        # 시스템 프롬프트: 챗봇의 정체성을 '수원 관광 가이드'로 강제 고정
        system_instruction = (
            "너는 수원시 공식 관광 가이드 AI야. "
            "오직 수원 관광, 대중교통, 여행 팁에 관한 질문에만 답변해. "
            "만약 사용자가 수원 관광과 관련 없는 질문(정치, 사회, 개인적인 잡담 등)을 하면, "
            "정중하게 '수원 관광에 대해서만 도와드릴 수 있습니다'라고 해당 언어로 답변하고 대화를 종료해. "
        )

        # 언어 코드에 따른 시스템 지시문 정의
        lang_map = {
            'kor': "You must answer in Korean.",
            'eng': "You must answer in English.",
            'jpn': "You must answer in Japanese.",
            'chs': "You must answer in Simplified Chinese.",
            'cht': "You must answer in Traditional Chinese."
        }
        
        system_prompt = lang_map.get(target_language, "You must answer in Korean.")
        
        # [보안 강화] 악성 프롬프트 인젝션 및 개행 필터링
        safe_input = re.sub(r'[\r\n\t]+', ' ', user_input).strip()
        if len(safe_input) > 200:
            safe_input = safe_input[:200]

        # REST API 직접 호출
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "key": self.gemini_api_key
        }
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_instruction}\n\n{system_prompt}\n\nUser: {safe_input}"}
                    ]
                }
            ]
        }
        
        try:
            # [보안 적용] 전역 SSL 검증 옵션 바인딩
            response = requests.post(url, headers=headers, params=params, json=payload, timeout=15, verify=self.ssl_verify)
            
            if response.status_code == 200:
                res_data = response.json()
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "답변을 생성하지 못했습니다.")
                return "답변을 생성하지 못했습니다."
            else:
                return f"API 호출 실패 (코드: {response.status_code})"
                
        except Exception as e:
            print(f"--- [DEBUG] 예외 발생: {str(e)} ---")
            return f"에러 발생: {str(e)}"