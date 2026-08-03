import logging
import os
from urllib.parse import urlsplit

from flask import Blueprint, current_app, jsonify, request, session

from ..services.auth_service import AuthService, AuthServiceError, InvalidCredentialError

bp = Blueprint('auth_api', __name__)
logger = logging.getLogger(__name__)
auth_service = None


def _service():
    global auth_service
    if auth_service is None:
        auth_service = AuthService(current_app.config['DATABASE_PATH'], current_app.config.get('GOOGLE_CLIENT_ID'))
    return auth_service


@bp.get('/auth/me')
def me():
    user_id = session.get('user_id')
    user = _service().get_user(user_id) if user_id else None
    if not user:
        session.pop('user_id', None)
        return _ok({'authenticated': False, 'user': None})
    csrf_token = session.get('csrf_token') or _new_csrf_token()
    session['csrf_token'] = csrf_token
    return _ok({'authenticated': True, 'user': user, 'csrfToken': csrf_token})


@bp.post('/auth/login')
def login():
    payload = request.get_json(silent=True) or {}
    credential = payload.get('credential')
    if not isinstance(credential, str) or not credential.strip() or len(credential) > 10000:
        return _error('Google credential이 필요합니다.', 400)
    try:
        user = _service().authenticate(credential.strip())
        session.clear()
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['user_picture'] = user['picture']
        session['csrf_token'] = _new_csrf_token()
        return _ok({'authenticated': True, 'user': user, 'csrfToken': session['csrf_token']})
    except InvalidCredentialError:
        return _error('Google 로그인을 확인하지 못했습니다.', 401)
    except AuthServiceError:
        logger.exception('Google credential 검증 실패')
        return _error('Google 로그인 서비스를 사용할 수 없습니다.', 502)
    except Exception:
        logger.exception('인증 로그인 API 처리 실패')
        return _error('로그인 처리에 실패했습니다.', 500)


@bp.post('/auth/logout')
def logout():
    if not _same_origin_request():
        return _error('허용되지 않은 요청 출처입니다.', 403)
    session.clear()
    return _ok(None)


@bp.post('/auth/sync')
def sync():
    user_id = _require_user()
    if isinstance(user_id, tuple):
        return user_id
    if not _same_origin_request():
        return _error('허용되지 않은 요청 출처입니다.', 403)
    try:
        return _ok(_service().sync(user_id, request.get_json(silent=True)))
    except ValueError as error:
        return _error(str(error), 400)
    except Exception:
        logger.exception('인증 데이터 동기화 API 처리 실패')
        return _error('데이터를 동기화하지 못했습니다.', 500)


@bp.delete('/auth/account')
def delete_account():
    user_id = _require_user()
    if isinstance(user_id, tuple):
        return user_id
    if not _same_origin_request():
        return _error('허용되지 않은 요청 출처입니다.', 403)
    try:
        image_urls = _service().delete_account(user_id)
        _remove_owned_images(image_urls)
        session.clear()
        return _ok(None)
    except Exception:
        logger.exception('계정 삭제 API 처리 실패')
        return _error('계정을 삭제하지 못했습니다.', 500)


def _require_user():
    user_id = session.get('user_id')
    if not user_id or not _service().get_user(user_id):
        return _error('로그인이 필요합니다.', 401)
    return user_id


def _remove_owned_images(image_urls):
    upload_folder = os.path.realpath(current_app.config['UPLOAD_FOLDER'])
    for image_url in image_urls:
        filename = os.path.basename(urlsplit(str(image_url or '')).path)
        if not filename:
            continue
        path = os.path.realpath(os.path.join(upload_folder, filename))
        if os.path.commonpath([upload_folder, path]) == upload_folder and os.path.isfile(path):
            os.remove(path)


def _same_origin_request():
    origin = request.headers.get('Origin')
    if not origin:
        return True
    return urlsplit(origin).netloc == request.host


def _new_csrf_token():
    import secrets
    return secrets.token_urlsafe(32)


def _ok(data):
    return jsonify({'success': True, 'data': data, 'message': None})


def _error(message, status):
    return jsonify({'success': False, 'data': None, 'message': message}), status
