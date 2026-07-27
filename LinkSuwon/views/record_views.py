import os
import uuid
import json
from flask import Blueprint, render_template, request, current_app, jsonify, redirect, url_for
from LinkSuwon.database import get_db_connection

bp = Blueprint('record', __name__, url_prefix='/record')

@bp.route('/')
def record_home():
    lang = request.args.get('lang', 'kor')
    NCP_CLIENT_ID = current_app.config.get('NCP_CLIENT_ID')
    return render_template('record.html', current_lang=lang, ncp_id=NCP_CLIENT_ID)

@bp.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400
        
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed_extensions:
        return jsonify({'success': False, 'message': 'Invalid file type. Only images are allowed.'}), 400

    try:
        # 업로드 폴더 경로 설정 (static/uploads)
        upload_dir = os.path.join(current_app.root_path, 'static', 'uploads')
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            
        # 고유한 파일명 생성
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(upload_dir, filename)
        
        # 파일 저장
        file.save(filepath)
        
        # 상대 URL 반환
        file_url = f"/static/uploads/{filename}"
        return jsonify({'success': True, 'url': file_url})
    except Exception as e:
        print(f"❌ [Image Upload Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@bp.route('/api/share', methods=['POST'])
def share_course():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
        
    overall_review = data.get('overallReview', '')
    visit_records = data.get('visitRecords', [])
    
    if not visit_records:
        return jsonify({'success': False, 'message': 'Visit records cannot be empty'}), 400
        
    try:
        share_id = str(uuid.uuid4())
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO shared_courses (share_id, overall_review, records_json) VALUES (?, ?, ?)",
            (share_id, overall_review, json.dumps(visit_records, ensure_ascii=False))
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'share_id': share_id})
    except Exception as e:
        print(f"❌ [Course Share Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@bp.route('/share/<share_id>')
def share_course_view(share_id):
    lang = request.args.get('lang', 'kor')
    valid_lang = ['kor', 'eng', 'jpn', 'chs', 'cht']
    if lang not in valid_lang:
        lang = 'kor'
        
    NCP_CLIENT_ID = current_app.config.get('NCP_CLIENT_ID')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT overall_review, records_json FROM shared_courses WHERE share_id = ?", (share_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return redirect(url_for('main.index', lang=lang))
            
        overall_review = row['overall_review']
        visit_records = json.loads(row['records_json'])
        
        return render_template(
            'share_record.html',
            current_lang=lang,
            ncp_id=NCP_CLIENT_ID,
            share_id=share_id,
            overall_review=overall_review,
            visit_records=visit_records
        )
    except Exception as e:
        print(f"❌ [Course View Error] {e}")
        return render_template('offline.html', current_lang=lang, ncp_id=NCP_CLIENT_ID)