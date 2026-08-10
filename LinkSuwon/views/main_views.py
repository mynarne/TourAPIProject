import time
import requests
from flask import Blueprint, request, render_template, current_app, jsonify

# 메인 페이지 전용 블루프린트
bp = Blueprint('main', __name__, url_prefix='/')

@bp.route('/')
def index():
    lang = request.args.get('lang', 'kor')
    valid_lang = ['kor', 'eng', 'jpn', 'chs', 'cht']

    if lang not in valid_lang:
        lang = 'kor'
    
    from LinkSuwon.config import Config
    missing_keys = []
    if not Config.NVIDIA_API_KEY:
        missing_keys.append('NVIDIA_API_KEY')
    if not Config.TOUR_API_KEY:
        missing_keys.append('TOUR_API_KEY')
    
    NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']
    return render_template('index.html', current_lang=lang, ncp_id=NCP_CLIENT_ID, missing_keys=missing_keys)

@bp.route('/courses')
def courses():
    lang = request.args.get('lang', 'kor')
    NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']
    return render_template('courses.html', current_lang=lang, ncp_id=NCP_CLIENT_ID)

@bp.route('/tips')
def tips():
    lang = request.args.get('lang', 'kor')
    NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']
    return render_template('tips.html', current_lang=lang, ncp_id=NCP_CLIENT_ID)

@bp.route('/saved')
def saved():
    lang = request.args.get('lang', 'kor')
    NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']
    return render_template('saved.html', current_lang=lang, ncp_id=NCP_CLIENT_ID)

@bp.route('/profile')
def profile():
    lang = request.args.get('lang', 'kor')
    NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']
    return render_template('profile.html', current_lang=lang, ncp_id=NCP_CLIENT_ID)

from LinkSuwon.config import Config

# 날씨 API 메모리 캐시 변수
weather_cache = None
last_fetch_time = 0
CACHE_DURATION = 600  # 10분 캐싱

@bp.route('/api/weather')
def get_weather():
    global weather_cache, last_fetch_time
    current_time = time.time()
    
    # 캐시 만료 시에만 새로 요청
    if not weather_cache or (current_time - last_fetch_time > CACHE_DURATION):
        try:
            # wttr.in JSON 포맷 호출 (SSL 검증 옵션 전역 연동)
            url = "https://wttr.in/Suwon?format=j1"
            response = requests.get(url, timeout=2.5, verify=Config.SSL_VERIFY)
            if response.status_code == 200:
                data = response.json()
                current_condition = data.get('current_condition', [{}])[0]
                temp_c = current_condition.get('temp_C', '15')
                
                # 기상 설명 추출 (기본 영문 매핑 후 번역)
                weather_desc = current_condition.get('weatherDesc', [{}])[0].get('value', 'Clear')
                desc_lower = weather_desc.lower()
                
                condition = 'cloudy'  # 기본값
                if 'clear' in desc_lower or 'sunny' in desc_lower:
                    condition = 'sunny'
                elif 'rain' in desc_lower or 'shower' in desc_lower or 'drizzle' in desc_lower:
                    condition = 'rainy'
                elif 'snow' in desc_lower or 'sleet' in desc_lower:
                    condition = 'snowy'
                
                weather_cache = {
                    'status': 'fresh',
                    'temp': temp_c,
                    'condition': condition,
                    'desc': weather_desc
                }
            last_fetch_time = current_time
        except Exception as e:
            print('날씨 정보 조회에 실패했습니다.')
            last_fetch_time = current_time  # 실패 시에도 타임스탬프 갱신하여 10분 동안 무의미한 5초 차단 루프 방지
            if weather_cache:
                weather_cache['status'] = 'stale'
            else:
                weather_cache = {
                    'status': 'unavailable',
                    'temp': None,
                    'condition': None,
                    'desc': None,
                    'fetched_at': current_time,
                }
                
    return jsonify(weather_cache)

from LinkSuwon.utils.exchange_crawler import get_exchange_rates

@bp.route('/api/exchange')
def get_exchange():
    rates = get_exchange_rates()
    return jsonify(rates)
