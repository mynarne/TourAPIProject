import os
from flask import Flask, request, render_template
from LinkSuwon.config import Config
from LinkSuwon.i18n import get_validated_lang, translate

def create_app():
    # 플라스크 앱 객체 생성
    app = Flask(__name__, static_folder='LinkSuwon/static', template_folder='LinkSuwon/templates')
    
    # 세션 사용을 위한 비밀키 설정
    app.secret_key = os.environ.get('SECRET_KEY', 'linksuwon_secure_session_key_123987')

    # 환경설정 로드 및 검증
    app.config.from_object(Config)
    Config.check_configs()

    # 데이터베이스 초기화
    from LinkSuwon.database import init_db
    init_db()

    # 다른 파일(블루프린트)에서도 쓸 수 있도록 app.config에 명시적 저장
    app.config['NCP_CLIENT_ID'] = Config.NAVER_CLIENT_ID

    # [i18n] 템플릿 전역에서 다국어 번역 함수 '_'를 사용할 수 있도록 등록
    @app.context_processor
    def inject_i18n():
        lang = request.args.get('lang', 'kor')
        valid_lang = get_validated_lang(lang)
        
        # 템플릿에서 {{ _('key') }} 형태로 간편하게 다국어 조회가 가능합니다.
        def translate_helper(key):
            return translate(valid_lang, key)
            
        return dict(_=translate_helper, current_lang=valid_lang)

    # 블루프린트 등록 (라우트 분리)
    from LinkSuwon.views import main_views, chatbot_views, traffic_views, record_views, spot_views, auth_views
    app.register_blueprint(main_views.bp)
    app.register_blueprint(chatbot_views.bp)
    app.register_blueprint(traffic_views.bp)
    app.register_blueprint(record_views.bp)
    app.register_blueprint(spot_views.bp)
    app.register_blueprint(auth_views.bp)

    # PWA 오프라인 폴백 전용 라우트 추가
    @app.route('/offline')
    def offline_fallback():
        lang = request.args.get('lang', 'kor')
        valid_lang = get_validated_lang(lang)
        return render_template('offline.html', current_lang=valid_lang, ncp_id=Config.NAVER_CLIENT_ID)

    return app

if __name__ == '__main__':
    app = create_app()
    # debug True 모드로 실행하여 코드 수정 시 서버 자동 재시작 구현
    # 포트는 5001번을 사용 (맥북 에어 포트 충돌 방지)
    app.run(host='0.0.0.0', port=5001, debug=True)