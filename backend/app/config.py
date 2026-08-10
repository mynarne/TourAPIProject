import os
from dotenv import load_dotenv, find_dotenv

# .env 파일 자동 탐색 및 로드 (systemd 환경변수가 이미 있으면 덮어쓰지 않음)
env_file = find_dotenv(usecwd=True)
if env_file:
    load_dotenv(env_file)
else:
    load_dotenv()


class Config:
    """새 REST API 서버의 환경변수 기반 설정입니다."""

    SECRET_KEY = os.getenv('SECRET_KEY')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_SAMESITE = 'Lax'
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    API_HOST = os.getenv('API_HOST', '127.0.0.1')
    API_PORT = int(os.getenv('API_PORT', '5002'))

    _APP_DIR = os.path.dirname(os.path.abspath(__file__))
    _ROOT_DIR = os.path.abspath(os.path.join(_APP_DIR, '..', '..'))

    DATABASE_PATH = os.getenv('DATABASE_PATH') or os.path.join(_ROOT_DIR, 'LinkSuwon', 'linksuwon.db')
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER') or os.path.join(_ROOT_DIR, 'LinkSuwon', 'static', 'uploads')
    UPLOAD_URL_PREFIX = os.getenv('UPLOAD_URL_PREFIX', '/static/uploads')
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    SSL_VERIFY = os.getenv('SSL_VERIFY', 'True').lower() == 'true'

    # Primary: NVIDIA_API_KEY, Fallback: NVIDIA_OPENAI_KEY
    NVIDIA_API_KEY = os.getenv('NVIDIA_API_KEY') or os.getenv('NVIDIA_OPENAI_KEY')
    NVIDIA_BASE_URL = os.getenv('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1')
    NVIDIA_MODEL = os.getenv('NVIDIA_MODEL', 'openai/gpt-oss-20b')
