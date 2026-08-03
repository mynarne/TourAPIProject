import logging
import os
import uuid

from flask import Blueprint, current_app, jsonify, request, session
from werkzeug.utils import secure_filename

from ..services.records_service import (
    RecordNotFoundError,
    RecordsService,
    RecordsValidationError,
)
from ..services.tourism_service import TourismService

bp = Blueprint('records_api', __name__)
logger = logging.getLogger(__name__)
records_service = None
ALLOWED_MIME_TYPES = {'image/png', 'image/jpeg', 'image/gif', 'image/webp'}


def _service():
    global records_service
    if records_service is None:
        records_service = RecordsService(current_app.config['DATABASE_PATH'], TourismService())
    return records_service


@bp.get('/records')
def list_records():
    user_id = _require_user()
    if isinstance(user_id, tuple):
        return user_id
    language = request.args.get('language', request.args.get('lang', 'kor'))
    try:
        return _ok(_service().list_records(user_id, language))
    except RecordsValidationError as error:
        return _error(str(error), 400)
    except Exception:
        logger.exception('여행 기록 목록 API 처리 실패')
        return _error('여행 기록을 불러오지 못했습니다.', 500)


@bp.get('/records/<record_id>')
def get_record(record_id):
    user_id = _require_user()
    if isinstance(user_id, tuple):
        return user_id
    language = request.args.get('language', request.args.get('lang', 'kor'))
    try:
        return _ok(_service().get_record(user_id, record_id, language))
    except RecordsValidationError as error:
        return _error(str(error), 400)
    except RecordNotFoundError:
        return _error('기록을 찾을 수 없습니다.', 404)
    except Exception:
        logger.exception('여행 기록 상세 API 처리 실패')
        return _error('여행 기록을 불러오지 못했습니다.', 500)


@bp.post('/records')
def create_record():
    user_id = _require_user()
    if isinstance(user_id, tuple):
        return user_id
    try:
        return _ok(_service().create_record(user_id, request.get_json(silent=True)), 201)
    except RecordsValidationError as error:
        return _error(str(error), 400)
    except Exception:
        logger.exception('여행 기록 생성 API 처리 실패')
        return _error('여행 기록을 저장하지 못했습니다.', 500)


@bp.patch('/records/<record_id>')
def update_record(record_id):
    user_id = _require_user()
    if isinstance(user_id, tuple):
        return user_id
    try:
        return _ok(_service().update_record(user_id, record_id, request.get_json(silent=True)))
    except RecordsValidationError as error:
        return _error(str(error), 400)
    except RecordNotFoundError:
        return _error('기록을 찾을 수 없습니다.', 404)
    except Exception:
        logger.exception('여행 기록 수정 API 처리 실패')
        return _error('여행 기록을 수정하지 못했습니다.', 500)


@bp.delete('/records/<record_id>')
def delete_record(record_id):
    user_id = _require_user()
    if isinstance(user_id, tuple):
        return user_id
    try:
        _service().delete_record(user_id, record_id)
        return _ok(None)
    except RecordsValidationError as error:
        return _error(str(error), 400)
    except RecordNotFoundError:
        return _error('기록을 찾을 수 없습니다.', 404)
    except Exception:
        logger.exception('여행 기록 삭제 API 처리 실패')
        return _error('여행 기록을 삭제하지 못했습니다.', 500)


@bp.post('/records/upload')
def upload_record_image():
    user_id = _require_user()
    if isinstance(user_id, tuple):
        return user_id
    uploaded = request.files.get('file')
    if not uploaded or not uploaded.filename:
        return _error('업로드할 이미지가 없습니다.', 400)
    if not RecordsService.is_allowed_extension(uploaded.filename):
        return _error('지원하지 않는 이미지 형식입니다.', 400)
    if uploaded.mimetype not in ALLOWED_MIME_TYPES:
        return _error('이미지 MIME 형식이 올바르지 않습니다.', 400)
    try:
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        extension = os.path.splitext(secure_filename(uploaded.filename))[1].lower()
        filename = f'{uuid.uuid4().hex}{extension}'
        uploaded.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
        prefix = current_app.config.get('UPLOAD_URL_PREFIX', '/static/uploads').rstrip('/')
        return _ok({'url': f'{prefix}/{filename}'}, 201)
    except Exception:
        logger.exception('여행 기록 이미지 업로드 실패')
        return _error('이미지를 업로드하지 못했습니다.', 500)


def _require_user():
    if not session.get('user_id'):
        return _error('로그인이 필요합니다.', 401)
    return session['user_id']


def _ok(data, status=200):
    return jsonify({'success': True, 'data': data, 'message': None}), status


def _error(message, status):
    return jsonify({'success': False, 'data': None, 'message': message}), status
