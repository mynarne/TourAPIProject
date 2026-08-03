from flask import Blueprint, jsonify

bp = Blueprint('health_api', __name__)


@bp.get('/health')
def health_check():
    return jsonify({
        'success': True,
        'data': {
            'service': 'linksuwon-api',
            'status': 'ok',
        },
        'message': None,
    })
