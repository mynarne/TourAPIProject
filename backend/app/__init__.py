from flask import Flask

from .config import Config


def create_app(config_class=Config):
    """Flask REST API 애플리케이션 팩토리입니다."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    if not app.config.get('SECRET_KEY') and app.config.get('FLASK_ENV') == 'production':
        raise RuntimeError('운영 환경에서는 SECRET_KEY가 필요합니다.')
    if app.config.get('SECRET_KEY'):
        app.secret_key = app.config['SECRET_KEY']

    from .api.health import bp as health_bp
    from .api.tourism import bp as tourism_bp
    from .api.traffic import bp as traffic_bp
    from .api.chatbot import bp as chatbot_bp
    from .api.records import bp as records_bp
    from .api.auth import bp as auth_bp
    app.register_blueprint(health_bp, url_prefix='/api/v1')
    app.register_blueprint(tourism_bp, url_prefix='/api/v1')
    app.register_blueprint(traffic_bp, url_prefix='/api/v1')
    app.register_blueprint(chatbot_bp, url_prefix='/api/v1')
    app.register_blueprint(records_bp, url_prefix='/api/v1')
    app.register_blueprint(auth_bp, url_prefix='/api/v1')

    return app
