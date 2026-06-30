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
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    PORT = int(os.getenv('PORT', 5001))
    HOST = '0.0.0.0'

    # API Keys
    TOUR_API_KEY = os.getenv('TOUR_API_KEY')
    NAVER_CLIENT_ID = os.getenv('NAVER_CLIENT_ID')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

    # Security & SSL settings
    # SSL 검증 여부를 환경변수 'SSL_VERIFY'로부터 로드 (기본값 False)
    SSL_VERIFY = os.getenv('SSL_VERIFY', 'False').lower() == 'true'

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
        if not cls.GEMINI_API_KEY:
            missing_keys.append('GEMINI_API_KEY')
            
        if missing_keys:
            print(f"⚠️  [WARNING] 누락된 환경변수가 있습니다: {', '.join(missing_keys)}")
            print("   .env 파일을 확인하고 유효한 API 키를 설정하십시오.")
        else:
            print("✅ [INFO] 모든 필수 환경변수가 성공적으로 로드되었습니다.")
