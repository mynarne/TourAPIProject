from flask import Blueprint, request, render_template, current_app

# 메인 페이지 전용 블루프린트
bp = Blueprint('main', __name__, url_prefix='/')

@bp.route('/')
def index():
    lang = request.args.get('lang', 'kor')
    valid_lang = ['kor', 'eng', 'jpn', 'chs', 'cht']

    if lang not in valid_lang:
        lang = 'kor'
    
    NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']
    return render_template('index.html', current_lang=lang, ncp_id=NCP_CLIENT_ID)