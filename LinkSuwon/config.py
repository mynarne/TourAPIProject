# LinkSuwon Configuration Module
import os
from dotenv import load_dotenv

# .env 파일 로딩
load_dotenv()

class Config:
    """
    애플리케이션 전역 환경변수 및 설정을 관리합니다.
    """
    # Flask 기본 설정
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    PORT = int(os.getenv('PORT', 5001))
    HOST = '0.0.0.0'
    PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    DATABASE_PATH = os.getenv('DATABASE_PATH') or os.path.join(PROJECT_ROOT, 'LinkSuwon', 'linksuwon.db')
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER') or os.path.join(PROJECT_ROOT, 'LinkSuwon', 'static', 'uploads')
    UPLOAD_URL_PREFIX = os.getenv('UPLOAD_URL_PREFIX', '/static/uploads')
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_SAMESITE = 'Lax'

    # API Keys
    TOUR_API_KEY = os.getenv('TOUR_API_KEY')
    NAVER_CLIENT_ID = os.getenv('NAVER_CLIENT_ID')
    NVIDIA_API_KEY = os.getenv('NVIDIA_API_KEY') or os.getenv('NVIDIA_OPENAI_KEY')
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')

    # Security & SSL settings
    # SSL 검증 여부를 환경변수 'SSL_VERIFY'로부터 로드 (기본값 True)
    SSL_VERIFY = os.getenv('SSL_VERIFY', 'True').lower() == 'true'

    @classmethod
    def check_configs(cls):
        """
        주요 API Key 설정 여부를 진단하고 경고를 출력합니다.
        """
        missing_keys = []
        if not cls.TOUR_API_KEY:
            missing_keys.append('TOUR_API_KEY')
        if not cls.NAVER_CLIENT_ID:
            missing_keys.append('NAVER_CLIENT_ID')
        if not cls.NVIDIA_API_KEY:
            missing_keys.append('NVIDIA_API_KEY')
            
        if missing_keys:
            print(f"⚠️  [WARNING] 누락된 환경변수가 있습니다: {', '.join(missing_keys)}")
            print("   .env 파일을 확인하고 유효한 API 키를 설정하십시오.")
        else:
            print("✅ [INFO] 모든 필수 환경변수가 성공적으로 로드되었습니다.")
