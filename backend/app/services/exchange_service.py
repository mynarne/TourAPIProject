import time
import requests
import re
from ..config import Config

_exchange_cache = None
_last_fetch_time = 0
CACHE_DURATION = 600  # 10분 캐싱


def get_suwon_exchange_rates():
    global _exchange_cache, _last_fetch_time
    current_time = time.time()

    if not _exchange_cache or (current_time - _last_fetch_time > CACHE_DURATION):
        try:
            url = "https://finance.naver.com/marketindex/exchangeList.naver"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=3, verify=Config.SSL_VERIFY)
            if response.status_code == 200:
                html = response.text
                pattern = r'marketindexCd=(FX_[A-Z]{6})"[^>]*>.*?<td class="sale">([^<]+)</td>'
                matches = re.findall(pattern, html, re.DOTALL)

                rates = {}
                for code, val in matches:
                    rates[code] = val.strip().replace(',', '')

                required_codes = ('FX_USDKRW', 'FX_JPYKRW', 'FX_CNYKRW', 'FX_TWDKRW')
                if all(code in rates for code in required_codes):
                    _exchange_cache = {
                        'status': 'fresh',
                        'USD': rates['FX_USDKRW'],
                        'JPY': rates['FX_JPYKRW'],
                        'CNY': rates['FX_CNYKRW'],
                        'TWD': rates['FX_TWDKRW'],
                        'units': {'USD': '1 USD', 'JPY': '100 JPY', 'CNY': '1 CNY', 'TWD': '1 TWD'},
                        'fetched_at': current_time,
                    }
                    _last_fetch_time = current_time
                else:
                    raise ValueError('필수 환율 데이터가 누락되었습니다.')
        except Exception as e:
            if _exchange_cache:
                _exchange_cache['status'] = 'stale'
            else:
                _exchange_cache = {
                    'status': 'unavailable',
                    'USD': None,
                    'JPY': None,
                    'CNY': None,
                    'TWD': None,
                    'units': {'USD': '1 USD', 'JPY': '100 JPY', 'CNY': '1 CNY', 'TWD': '1 TWD'},
                    'fetched_at': current_time,
                }
            _last_fetch_time = current_time

    return _exchange_cache or {
        'status': 'unavailable',
        'USD': None,
        'JPY': None,
        'CNY': None,
        'TWD': None,
        'units': {'USD': '1 USD', 'JPY': '100 JPY', 'CNY': '1 CNY', 'TWD': '1 TWD'},
        'fetched_at': current_time,
    }
