from flask import Blueprint, render_template, request, current_app

bp = Blueprint('traffic', __name__, url_prefix='/traffic')

@bp.route('/')
def traffic_home():
    lang = request.args.get('lang', 'kor')
    # app.config에서 네이버 지도 API 키값 추출
    NCP_CLIENT_ID = current_app.config.get('NCP_CLIENT_ID')
    return render_template('traffic.html', current_lang=lang, ncp_id=NCP_CLIENT_ID)