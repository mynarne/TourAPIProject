from flask import Blueprint, jsonify
from ..services.weather_service import get_suwon_weather

bp = Blueprint('weather', __name__)


@bp.route('/weather', methods=['GET'])
def get_weather_endpoint():
    data = get_suwon_weather()
    return jsonify({'success': True, 'data': data, 'message': None})
