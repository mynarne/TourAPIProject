import os

from dotenv import load_dotenv

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
    PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    DATABASE_PATH = os.getenv('DATABASE_PATH') or os.path.join(PROJECT_ROOT, 'LinkSuwon', 'linksuwon.db')
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER') or os.path.join(PROJECT_ROOT, 'LinkSuwon', 'static', 'uploads')
    UPLOAD_URL_PREFIX = os.getenv('UPLOAD_URL_PREFIX', '/static/uploads')
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    NVIDIA_API_KEY = os.getenv('NVIDIA_API_KEY')
    NVIDIA_BASE_URL = os.getenv('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1')
    NVIDIA_MODEL = os.getenv('NVIDIA_MODEL', 'openai/gpt-oss-20b')
