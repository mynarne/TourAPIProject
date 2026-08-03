import logging

from flask import Blueprint, jsonify, request

from ..services.tourism_service import (
    SUPPORTED_CATEGORIES,
    SUPPORTED_LANGUAGES,
    TourismNotFoundError,
    TourismService,
    TourismServiceError,
)

bp = Blueprint('tourism_api', __name__)
tourism_service = TourismService()
logger = logging.getLogger(__name__)


@bp.get('/tour/spots')
def get_spots():
    try:
        language = request.args.get('language', request.args.get('lang', 'kor'))
        page = _parse_integer('page', default=1, minimum=1)
        page_size = _parse_integer('pageSize', default=20, minimum=1, maximum=100)
        category = request.args.get('category', 'all')
        keyword = request.args.get('keyword', '').strip()

        if language not in SUPPORTED_LANGUAGES:
            return _error('지원하지 않는 언어입니다.', 400)
        if category not in SUPPORTED_CATEGORIES:
            return _error('지원하지 않는 카테고리입니다.', 400)
        if len(keyword) > 100:
            return _error('검색어가 너무 깁니다.', 400)

        data = tourism_service.get_spots(
            language=language,
            page=page,
            page_size=page_size,
            category=category,
            keyword=keyword,
        )
        return jsonify({'success': True, 'data': data, 'message': None})
    except ValueError as error:
        return _error(str(error), 400)
    except TourismServiceError:
        logger.exception('TourAPI 관광 데이터 수집 실패')
        return _error('관광지 정보를 불러오지 못했습니다.', 502)
    except Exception:
        logger.exception('관광지 목록 API 처리 실패')
        return _error('관광지 정보를 처리하지 못했습니다.', 500)


@bp.get('/tour/spots/<content_id>')
def get_spot_detail(content_id):
    language = request.args.get('language', request.args.get('lang', 'kor'))
    if not content_id or not content_id.strip():
        return _error('contentId가 필요합니다.', 400)
    if language not in SUPPORTED_LANGUAGES:
        return _error('지원하지 않는 언어입니다.', 400)

    try:
        data = tourism_service.get_spot_detail(content_id.strip(), language=language)
        return jsonify({'success': True, 'data': data, 'message': None})
    except ValueError as error:
        return _error(str(error), 400)
    except TourismNotFoundError:
        return _error('관광지를 찾을 수 없습니다.', 404)
    except TourismServiceError:
        logger.exception('TourAPI 관광지 상세 수집 실패: contentId=%s', content_id)
        return _error('관광지 상세 정보를 불러오지 못했습니다.', 502)
    except Exception:
        logger.exception('관광지 상세 API 처리 실패: contentId=%s', content_id)
        return _error('관광지 상세 정보를 처리하지 못했습니다.', 500)


def _parse_integer(name, *, default, minimum, maximum=None):
    value = request.args.get(name)
    if value is None or value == '':
        return default
    try:
        parsed = int(value)
    except ValueError as error:
        raise ValueError(f'{name}은(는) 숫자여야 합니다.') from error
    if parsed < minimum or (maximum is not None and parsed > maximum):
        limit = f'{minimum}~{maximum}' if maximum is not None else f'{minimum} 이상'
        raise ValueError(f'{name}은(는) {limit} 범위여야 합니다.')
    return parsed


def _error(message, status_code):
    return jsonify({'success': False, 'data': None, 'message': message}), status_code
