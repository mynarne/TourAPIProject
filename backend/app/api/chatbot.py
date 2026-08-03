import logging

from flask import Blueprint, jsonify, request, session

from ..services.chatbot_service import (
    ChatbotConfigurationError,
    ChatbotProviderError,
    ChatbotService,
    MAX_MESSAGE_LENGTH,
)
from ..services.tourism_service import SUPPORTED_LANGUAGES

bp = Blueprint('chatbot_api', __name__)
chatbot_service = ChatbotService()
logger = logging.getLogger(__name__)


@bp.post('/chatbot/messages')
def create_message():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return _error('JSON 요청이 필요합니다.', 400)

    message = payload.get('message')
    language = payload.get('language', 'kor')
    if language not in SUPPORTED_LANGUAGES:
        return _error('지원하지 않는 언어입니다.', 400)
    if not isinstance(message, str) or not message.strip():
        return _error('message는 비어 있지 않은 문자열이어야 합니다.', 400)
    if len(message) > MAX_MESSAGE_LENGTH:
        return _error(f'message는 {MAX_MESSAGE_LENGTH}자 이하여야 합니다.', 400)

    location = payload.get('location')
    if location is not None and not isinstance(location, dict):
        return _error('location 형식이 올바르지 않습니다.', 400)

    try:
        data = chatbot_service.answer(
            message,
            language=language,
            location=location,
            user_name=session.get('user_name'),
        )
        return jsonify({'success': True, 'data': data, 'message': None})
    except ValueError as error:
        return _error(str(error), 400)
    except ChatbotConfigurationError:
        logger.error('NVIDIA 챗봇 API 키가 설정되지 않았습니다.')
        return _error('챗봇을 사용할 수 없습니다.', 503)
    except ChatbotProviderError:
        return _error('챗봇 응답을 생성하지 못했습니다.', 502)
    except Exception:
        logger.exception('챗봇 API 처리 실패')
        return _error('챗봇 요청을 처리하지 못했습니다.', 500)


def _error(message, status_code):
    return jsonify({'success': False, 'data': None, 'message': message}), status_code
