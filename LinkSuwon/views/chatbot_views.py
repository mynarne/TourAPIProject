from flask import Blueprint, request, render_template, session
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
    user_name = session.get('user_name')  # 세션에서 유저 이름 가져오기
    
    lat = request.form.get('lat')
    lng = request.form.get('lng')
    
    # 위치 정보가 연동된 경우 프롬프트에 힌트 컨텍스트 주입
    if lat and lng:
        user_input = f"[사용자 실시간 현재 위치 위경도: {lat}, {lng}. 사용자가 근처 맛집이나 주변 명소를 물어본다면 이 좌표와 가장 가까운 명소를 최우선 추천하고 도보/교통 거리를 감안하여 답변해줘.] {user_input}"
    
    # api_manager에 추가한 제미나이 호출 함수 사용
    bot_response = api_manager.ask_gemini_multilingual(user_input, lang, user_name)
    
    # 텍스트 그대로 반환
    return bot_response