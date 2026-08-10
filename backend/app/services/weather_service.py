import time
import requests
from ..config import Config

_weather_cache = None
_last_fetch_time = 0
CACHE_DURATION = 600  # 10분 캐싱


def get_suwon_weather():
    global _weather_cache, _last_fetch_time
    current_time = time.time()

    # 캐시 만료 시에만 새로 요청
    if not _weather_cache or (current_time - _last_fetch_time > CACHE_DURATION):
        try:
            url = "https://wttr.in/Suwon?format=j1"
            response = requests.get(url, timeout=2.5, verify=Config.SSL_VERIFY)
            if response.status_code == 200:
                data = response.json()
                current_condition = data.get('current_condition', [{}])[0]
                temp_c = current_condition.get('temp_C')
                weather_desc = current_condition.get('weatherDesc', [{}])[0].get('value', 'Clear')
                desc_lower = weather_desc.lower()

                condition = 'cloudy'
                if 'clear' in desc_lower or 'sunny' in desc_lower:
                    condition = 'sunny'
                elif 'rain' in desc_lower or 'shower' in desc_lower or 'drizzle' in desc_lower:
                    condition = 'rainy'
                elif 'snow' in desc_lower or 'sleet' in desc_lower:
                    condition = 'snowy'

                _weather_cache = {
                    'status': 'fresh',
                    'temp': temp_c,
                    'condition': condition,
                    'desc': weather_desc,
                    'fetched_at': current_time,
                }
                _last_fetch_time = current_time
        except Exception as e:
            # 실패 시 기존 캐시가 있다면 stale 상태로 유지
            if _weather_cache:
                _weather_cache['status'] = 'stale'
            else:
                _weather_cache = {
                    'status': 'unavailable',
                    'temp': None,
                    'condition': None,
                    'desc': None,
                    'fetched_at': current_time,
                }
            _last_fetch_time = current_time

    return _weather_cache or {
        'status': 'unavailable',
        'temp': None,
        'condition': None,
        'desc': None,
        'fetched_at': current_time,
    }
