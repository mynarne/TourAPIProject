import logging

from flask import Blueprint, request, render_template, session

logger = logging.getLogger(__name__)

# 블루프린트 객체 생성 (이름: chatbot)
bp = Blueprint('chatbot', __name__)

_chatbot_service = None

def get_chatbot_service():
    global _chatbot_service
    if _chatbot_service is None:
        from backend.app.services.chatbot_service import ChatbotService
        _chatbot_service = ChatbotService()
    return _chatbot_service

# 챗봇 전용 화면을 렌더링하는 라우트
@bp.route('/chat')
def chat_home():
    lang = request.args.get('lang', 'kor')
    return render_template('chatbot.html', current_lang=lang)

# 챗봇 기능 다국어 API 통신 라우트
@bp.route('/ask_chatbot', methods=['POST'])
def ask_chatbot():
    user_input = request.form.get('message', '')
    lang = request.args.get('lang', 'kor')
    user_name = session.get('user_name')

    lat = request.form.get('lat')
    lng = request.form.get('lng')

    service = get_chatbot_service()
    try:
        result = service.answer(
            user_input,
            language=lang,
            location={'latitude': float(lat), 'longitude': float(lng)} if lat and lng else None,
            user_name=user_name,
        )
        response = result['message']
        if result.get('course'):
            import json
            return json.dumps({'response': response, 'course': result['course']}, ensure_ascii=False)
        return response
    except Exception:
        logger.exception('Legacy 챗봇 요청 처리 실패')
        return '죄송합니다. 챗봇 응답을 생성하지 못했습니다.'
