import urllib.request
import json
from flask import Blueprint, request, jsonify, session
from LinkSuwon.database import get_db_connection

bp = Blueprint('auth', __name__, url_prefix='/auth')

def verify_google_token(token):
    """
    구글 API를 직접 호출하여 ID 토큰을 검증합니다.
    추가적인 외부 라이브러리(google-auth) 없이 안전하게 검증을 수행합니다.
    """
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            if "error_description" in data:
                print(f"❌ [Google Verification Error] {data['error_description']}")
                return None
            return data
    except Exception as e:
        print(f"❌ [Google Verification Exception] {e}")
        return None

@bp.route('/login', methods=['POST'])
def login():
    token = request.form.get('credential') or request.json.get('credential')
    if not token:
        return jsonify({'success': False, 'message': 'Missing credential'}), 400

    payload = verify_google_token(token)
    if not payload:
        return jsonify({'success': False, 'message': 'Invalid token'}), 401

    google_id = payload.get('sub')
    email = payload.get('email')
    name = payload.get('name')
    picture = payload.get('picture')

    conn = get_db_connection()
    cursor = conn.cursor()

    # 기존 유저 확인 또는 생성
    cursor.execute("SELECT id FROM users WHERE google_id = ?", (google_id,))
    row = cursor.fetchone()

    if row:
        user_id = row['id']
        # 유저 정보 업데이트 (이름이나 프로필 이미지가 바뀔 수 있으므로)
        cursor.execute(
            "UPDATE users SET name = ?, picture = ?, email = ? WHERE id = ?",
            (name, picture, email, user_id)
        )
    else:
        cursor.execute(
            "INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)",
            (google_id, email, name, picture)
        )
        user_id = cursor.lastrowid

    conn.commit()
    conn.close()

    # 세션에 로그인 상태 저장
    session['user_id'] = user_id
    session['user_name'] = name
    session['user_picture'] = picture

    return jsonify({
        'success': True,
        'user': {
            'name': name,
            'picture': picture,
            'email': email
        }
    })

@bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@bp.route('/status', methods=['GET'])
def status():
    if 'user_id' in session:
        return jsonify({
            'is_logged_in': True,
            'user': {
                'name': session.get('user_name'),
                'picture': session.get('user_picture')
            }
        })
    return jsonify({'is_logged_in': False})

@bp.route('/sync', methods=['POST'])
def sync_data():
    """
    LocalStorage 데이터와 SQLite DB 데이터 간의 양방향 병합(Sync) 파이프라인
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    user_id = session['user_id']
    data = request.json or {}
    
    client_saved = data.get('savedPlaces', [])
    client_records = data.get('visitRecords', [])

    conn = get_db_connection()
    cursor = conn.cursor()

    # ==========================================
    # 1. 즐겨찾기(saved_places) 병합
    # ==========================================
    # 클라이언트 데이터를 DB에 삽입 (중복 시 무시)
    for place in client_saved:
        contentid = place.get('contentid')
        title = place.get('title')
        firstimage = place.get('firstimage')
        addr1 = place.get('addr1')
        
        if contentid:
            cursor.execute('''
                INSERT OR IGNORE INTO saved_places (user_id, contentid, title, firstimage, addr1)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, contentid, title, firstimage, addr1))

    # DB의 최종 즐겨찾기 목록 조회
    cursor.execute('SELECT contentid, title, firstimage, addr1 FROM saved_places WHERE user_id = ?', (user_id,))
    db_saved_rows = cursor.fetchall()
    merged_saved = [dict(row) for row in db_saved_rows]

    # ==========================================
    # 2. 여행 기록(visit_records) 병합
    # ==========================================
    # DB에 이미 존재하는 여행 기록들 조회 (비교용)
    cursor.execute('SELECT contentid, visit_date, memo, lang, custom_image, firstimage FROM visit_records WHERE user_id = ?', (user_id,))
    db_record_rows = cursor.fetchall()
    db_records_set = {(r['contentid'], r['visit_date'], r['memo']) for r in db_record_rows}

    # 클라이언트 데이터를 DB에 삽입 (중복되지 않는 것만)
    for rec in client_records:
        contentid = rec.get('contentid')
        title = rec.get('title')
        visit_date = rec.get('visit_date')
        memo = rec.get('memo')
        lang = rec.get('lang', 'kor')
        custom_image = rec.get('custom_image')
        firstimage = rec.get('firstimage')

        if contentid and visit_date:
            # 기준: (contentid, visit_date, memo) 조합이 없으면 신규 삽입
            key = (contentid, visit_date, memo)
            if key not in db_records_set:
                cursor.execute('''
                    INSERT INTO visit_records (user_id, contentid, title, visit_date, firstimage, memo, lang, custom_image)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (user_id, contentid, title, visit_date, firstimage, memo, lang, custom_image))
                db_records_set.add(key)
            else:
                # 이미 동일한 키가 존재하되 클라이언트가 이미지 경로를 추가한 경우, DB 이미지 업데이트
                if custom_image:
                    cursor.execute('''
                        UPDATE visit_records SET custom_image = ?
                        WHERE user_id = ? AND contentid = ? AND visit_date = ? AND memo = ? AND (custom_image IS NULL OR custom_image = '')
                    ''', (custom_image, user_id, contentid, visit_date, memo))

    # DB의 최종 여행 기록 목록 조회 (기본 키인 id 포함)
    cursor.execute('SELECT id, contentid, title, visit_date, firstimage, memo, lang, custom_image FROM visit_records WHERE user_id = ?', (user_id,))
    db_record_final_rows = cursor.fetchall()
    
    merged_records = []
    for row in db_record_final_rows:
        r_dict = dict(row)
        # 클라이언트 record.js 및 storage.js 구조와의 호환을 위해 id 값을 'log_PK'로 치환해서 뱉어줌!
        r_dict['id'] = f"log_{row['id']}"
        merged_records.append(r_dict)

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'savedPlaces': merged_saved,
        'visitRecords': merged_records
    })

@bp.route('/delete_account', methods=['POST'])
def delete_account():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
        
    db_path = current_app.config['DATABASE_PATH']
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    
    try:
        # SQLite CASCADE 제약조건이 작동하지만 안전을 위해 순차 수동 제거 실행
        cursor.execute('DELETE FROM saved_places WHERE user_id = ?', (user_id,))
        cursor.execute('DELETE FROM visit_records WHERE user_id = ?', (user_id,))
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        
        conn.commit()
        
        # 세션 초기화
        session.clear()
        
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        print(f"❌ [Delete Account Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()
