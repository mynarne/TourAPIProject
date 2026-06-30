from flask import Blueprint, render_template, request, current_app

bp = Blueprint('record', __name__, url_prefix='/record')

@bp.route('/')
def record_home():
    lang = request.args.get('lang', 'kor')
    NCP_CLIENT_ID = current_app.config.get('NCP_CLIENT_ID')
    return render_template('record.html', current_lang=lang, ncp_id=NCP_CLIENT_ID)