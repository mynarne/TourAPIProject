from flask import Blueprint, request, render_template, session

from backend.app.services.chatbot_service import (
    ChatbotConfigurationError,
    ChatbotProviderError,
    ChatbotService,
)

# 블루프린트 객체 생성 (이름: chatbot)
bp = Blueprint('chatbot', __name__)

chatbot_service = ChatbotService()

# 챗봇 전용 화면을 렌더링하는 라우트
@bp.route('/chat')
def chat_home():
    lang = request.args.get('lang', 'kor')
    return render_template('chatbot.html', current_lang=lang)

# 챗봇 기능 다국어 API 통신 라우트
@bp.route('/ask_chatbot', methods=['POST'])
def ask_chatbot():
    # AJAX나 폼에서 넘어온 데이터 수신
    user_input = request.form.get('message', '')
    lang = request.args.get('lang', 'kor')
    user_name = session.get('user_name')  # 세션에서 유저 이름 가져오기
    
    lat = request.form.get('lat')
    lng = request.form.get('lng')
    
    try:
        result = chatbot_service.answer(
            user_input,
            language=lang,
            location={'latitude': float(lat), 'longitude': float(lng)} if lat and lng else None,
            user_name=user_name,
        )
        response = result['message']
        if result.get('course'):
            import json
            response += f"\n[COURSE_DATA: {json.dumps(result['course'], ensure_ascii=False)}]"
        return response
    except (ValueError, ChatbotConfigurationError, ChatbotProviderError):
        return '챗봇 응답을 생성하지 못했습니다.'
