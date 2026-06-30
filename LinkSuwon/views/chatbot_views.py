from flask import Blueprint, request, render_template
from LinkSuwon.api_manager import TourAPIManager

# 블루프린트 객체 생성 (이름: chatbot)
bp = Blueprint('chatbot', __name__)

api_manager = TourAPIManager()

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
    
    # api_manager에 추가한 제미나이 호출 함수 사용
    bot_response = api_manager.ask_gemini_multilingual(user_input, lang)
    
    # 텍스트 그대로 반환
    return bot_response