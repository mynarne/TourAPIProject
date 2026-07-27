import time
import requests
import re
from LinkSuwon.config import Config

# 환율 메모리 캐시 변수
_exchange_cache = None
_last_fetch_time = 0
CACHE_DURATION = 600  # 10분 캐싱

def get_exchange_rates():
    global _exchange_cache, _last_fetch_time
    current_time = time.time()
    
    # 캐시 만료 시에만 새로 요청
    if not _exchange_cache or (current_time - _last_fetch_time > CACHE_DURATION):
        try:
            url = "https://finance.naver.com/marketindex/exchangeList.naver"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=3, verify=Config.SSL_VERIFY)
            if response.status_code == 200:
                html = response.text
                
                # 정규식으로 통화 코드와 매매기준율 일괄 획득
                pattern = r'marketindexCd=(FX_[A-Z]{6})"[^>]*>.*?<td class="sale">([^<]+)</td>'
                matches = re.findall(pattern, html, re.DOTALL)
                
                rates = {}
                for code, val in matches:
                    rates[code] = val.strip().replace(',', '')
                
                if rates:
                    _exchange_cache = {
                        'USD': rates.get('FX_USDKRW', '1350.00'),
                        'JPY': rates.get('FX_JPYKRW', '900.00'),
                        'CNY': rates.get('FX_CNYKRW', '190.00'),
                        'TWD': rates.get('FX_TWDKRW', '42.00'),
                        'fetched_at': current_time
                    }
            _last_fetch_time = current_time
        except Exception as e:
            print(f"❌ [Exchange Rate Fetch Error] {e}")
            _last_fetch_time = current_time  # 실패 시에도 캐시 갱신하여 10분 동안 무의미한 연속 차단 방지
            
            # 캐시가 전혀 없으면 안전 Fallback 기본값 로드
            if not _exchange_cache:
                _exchange_cache = {
                    'USD': '1350.00',
                    'JPY': '900.00',
                    'CNY': '190.00',
                    'TWD': '42.00',
                    'fetched_at': current_time
                }
                
    return _exchange_cache
