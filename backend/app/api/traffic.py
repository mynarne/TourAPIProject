import logging

from flask import Blueprint, jsonify, request

from ..services.traffic_service import TrafficService

bp = Blueprint('traffic_api', __name__)
traffic_service = TrafficService()
logger = logging.getLogger(__name__)


@bp.get('/traffic')
def get_traffic():
    language = request.args.get('language', request.args.get('lang', 'kor'))
    try:
        data = traffic_service.get_traffic_data(language)
        return jsonify({'success': True, 'data': data, 'message': None})
    except ValueError as error:
        return jsonify({'success': False, 'data': None, 'message': str(error)}), 400
    except Exception:
        logger.exception('교통 안내 API 처리 실패')
        return jsonify({'success': False, 'data': None, 'message': '교통 정보를 처리하지 못했습니다.'}), 500
