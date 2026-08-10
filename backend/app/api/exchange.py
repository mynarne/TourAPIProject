from flask import Blueprint, jsonify
from ..services.exchange_service import get_suwon_exchange_rates

bp = Blueprint('exchange', __name__)


@bp.route('/exchange', methods=['GET'])
def get_exchange_endpoint():
    data = get_suwon_exchange_rates()
    return jsonify({'success': True, 'data': data, 'message': None})
