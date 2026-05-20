import os
from flask import Flask
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

def create_app():
    # 플라스크 앱 객체 생성
    app = Flask(__name__, static_folder='LinkSuwon/static', template_folder='LinkSuwon/templates')

    # 네이버 클라이언트 ID 환경 변수 호출
    NCP_CLIENT_ID = os.getenv('NAVER_CLIENT_ID')
    print(f"--- [DEBUG] 네이버 아이디: {NCP_CLIENT_ID} ---")
    
    # 다른 파일(블루프린트)에서도 쓸 수 있도록 app.config에 저장
    app.config['NCP_CLIENT_ID'] = NCP_CLIENT_ID

    # 블루프린트 등록 (라우트 분리)
    from LinkSuwon.views import main_views, chatbot_views, traffic_views, record_views, spot_views
    app.register_blueprint(main_views.bp)
    app.register_blueprint(chatbot_views.bp)
    app.register_blueprint(traffic_views.bp)
    app.register_blueprint(record_views.bp)
    app.register_blueprint(spot_views.bp)

    return app

if __name__ == '__main__':
    app = create_app()
    # debug True 모드로 실행하여 코드 수정 시 서버 자동 재시작 구현
    # 포트는 5001번을 사용 (맥북 에어 포트 충돌 방지)
    app.run(host='0.0.0.0', port=5001, debug=True)