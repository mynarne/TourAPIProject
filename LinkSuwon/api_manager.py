import os
import requests
import re
import urllib3
import logging
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import unquote

# SSL Verification 비활성화 시 터미널 경고 메세지 억제
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from korean_romanizer.romanizer import Romanizer
import pykakasi

from LinkSuwon.config import Config
from LinkSuwon.seed_data import get_seed_places

logger = logging.getLogger(__name__)

class TourAPIManager():
    def __init__(self):
        # Config 클래스로부터 설정값 주입
        self.api_key = unquote(Config.TOUR_API_KEY) if Config.TOUR_API_KEY else None
        self.base_url = 'https://apis.data.go.kr/B551011'
        self.ssl_verify = Config.SSL_VERIFY
        self.catalog_cache = {}
        self.catalog_last_good = {}
        self.tour_api_unavailable_until = 0.0
        self.tour_api_unavailable_reason = None

        # 일본어 변환기 설정
        self.kks = pykakasi.kakasi()

        # 언어별 서비스 경로 매핑
        self.service_map = {
            'kor': 'KorService2',  # 국문
            'eng': 'EngService2',  # 영문
            'jpn': 'JpnService2',  # 일문
            'chs': 'ChsService2',  # 중문_간체
            'cht': 'ChtService2'   # 중문_번체
        }

    def force_https(self, url_str):
        if not url_str:
            return url_str
        if url_str.startswith('http://'):
            return url_str.replace('http://', 'https://', 1)
        return url_str

    def get_suwon_data(self, lang='kor', content_type_id=None):
        service_map = self.service_map.get(lang, 'KorService2')
        url = f'{self.base_url}/{service_map}/areaBasedList2'

        content_type = content_type_id or ('12' if lang == 'kor' else '76')

        params = {
            'serviceKey': self.api_key,
            'areaCode': '31',         # 경기도
            'sigunguCode': '13',      # 수원시
            'contentTypeId': content_type,    # 관광지
            'MobileOS': 'ETC',
            'MobileApp': 'LinkSuwon',
            '_type': 'json',
            'numOfRows': 20,
            'pageNo': 1,
        }

        # API 호출 실패 또는 오류 발생 시 사용될 Fallback 생성 헬퍼
        def make_fallback_response():
            logger.warning('TourAPI 장애로 로컬 seed data를 사용합니다: language=%s content_type=%s', lang, content_type_id)
            local_items = get_seed_places(lang) if content_type_id is None else []
            return {
                "response": {
                    "header": {
                        "resultCode": "0000",
                        "resultMsg": "SUCCESS (LOCAL FALLBACK)"
                    },
                    "body": {
                        "items": {
                            "item": local_items
                        },
                        "numOfRows": len(local_items),
                        "pageNo": 1,
                        "totalCount": len(local_items)
                    }
                }
            }

        if not self.api_key:
            return make_fallback_response()

        if self._tour_api_circuit_open():
            return make_fallback_response()

        try:
            # [보안 적용] 전역 SSL 검증 옵션 바인딩
            response = requests.get(url, params=params, timeout=10, verify=self.ssl_verify)
            
            if response.status_code == 200:
                res_data = response.json()

                # API 응답 헤더 확인
                if not isinstance(res_data, dict):
                    logger.warning('TourAPI 응답 형식 오류: language=%s content_type=%s', lang, content_type)
                    return make_fallback_response()
                envelope = res_data.get('response')
                if not isinstance(envelope, dict):
                    envelope = {}
                    res_data['response'] = envelope
                header = envelope.get('header')
                if not isinstance(header, dict):
                    header = {}
                if header.get('resultCode') != '0000':
                    logger.warning('TourAPI 응답 오류: language=%s content_type=%s code=%s message=%s', lang, content_type, header.get('resultCode'), header.get('resultMsg'))
                    return make_fallback_response()

                # 아이템별 발음 및 설명(Seed) 주입
                body = envelope.get('body') if isinstance(envelope, dict) else None
                if not isinstance(body, dict):
                    body = {}
                    envelope['body'] = body
                items_container = body.get('items')
                raw_items = items_container.get('item') if isinstance(items_container, dict) else items_container
                items = self._normalize_items(raw_items)
                body['items'] = {'item': items}

                for item in items:
                        title = item.get('title', '')
                        ko_name = title.split('(')[-1].replace(')', '').strip() if '(' in title else title
                        c_id = item.get('contentid')

                        # 발음 변환 (영문 로마자 위주)
                        if lang == 'eng':
                            r = Romanizer(ko_name)
                            item['pronunciation'] = f"Pronounce: {r.romanize()}"
                        elif lang == 'jpn':
                            item['pronunciation'] = f"読み方: {ko_name}"
                        elif lang in ['chs', 'cht']:
                            item['pronunciation'] = f"韩语发音: {ko_name}"
                        else:
                            item['pronunciation'] = ""

                        # 설명(Overview) 주입: 기본적으로 주소를 사용하되, 대표적인 곳은 하드코딩 백업
                        if not item.get('overview'):
                            if '방화수류정' in ko_name or 'Banghwasuryujeong' in title:
                                item['overview'] = "수원화성에서 가장 경관이 아름다운 곳으로, 연못인 용연과의 조화가 일품."
                            elif '창룡문' in ko_name or 'Changnyongmun' in title:
                                item['overview'] = "수원화성의 동문으로, 주변에 넓은 잔디밭이 있어 나들이하기 딱 좋습니다."
                            elif '본수원갈비' in ko_name or 'Bonsuwon' in title:
                                item['overview'] = "수원을 대표하는 갈비 명가로, 풍부한 육즙과 깊은 맛이 일품입니다."
                            else:
                                item['overview'] = item.get('addr1', '수원의 정취를 느낄 수 있는 멋진 장소!')

                # 최종 반환 전 혼합 콘텐츠(Mixed Content) 대응을 위한 모든 이미지 URL https 강제 전환
                for item in items:
                    if item.get('firstimage'):
                        item['firstimage'] = self.force_https(item['firstimage'])
                    if item.get('firstimage2'):
                        item['firstimage2'] = self.force_https(item['firstimage2'])

                # 데이터 개수 로그로 확인
                body = envelope.get('body') if isinstance(envelope, dict) else None
                if not isinstance(body, dict):
                    body = {}
                total = body.get('totalCount', 0)
                logger.debug('수원 관광 데이터 수신: language=%s content_type=%s total=%s', lang, content_type, total)
                
                return res_data
            else:
                reason_code = self._log_http_error(response, lang, content_type)
                if reason_code == '22':
                    self._open_tour_api_circuit(reason_code)
                return make_fallback_response()
                
        except requests.exceptions.SSLError as ssl_err:
            logger.error('TourAPI SSL 검증 실패: language=%s content_type=%s', lang, content_type)
            return make_fallback_response()
        except Exception as e:
            logger.exception('TourAPI 요청 처리 실패: language=%s content_type=%s', lang, content_type)
            return make_fallback_response()
        
    def get_suwon_catalog(self, lang='kor'):
        """수원 관광 카탈로그를 콘텐츠 유형별로 수집하고 하나의 목록으로 합칩니다."""
        korean_types = {
            '12': 'heritage', '14': 'museum', '15': 'festival', '25': 'course',
            '28': 'leisure', '32': 'stay', '38': 'market', '39': 'food'
        }
        foreign_types = {
            '76': 'heritage', '78': 'museum', '79': 'festival', '80': 'leisure',
            '75': 'stay', '82': 'market', '83': 'food'
        }
        type_map = korean_types if lang == 'kor' else foreign_types

        if not self.api_key:
            return get_seed_places(lang)

        if self._tour_api_circuit_open():
            if self.catalog_last_good.get(lang):
                return [dict(item) for item in self.catalog_last_good[lang]]
            return self._merge_seed_items([], lang)

        collected = []
        for content_type_id, category in type_map.items():
            # 일일 호출 제한이 확인되면 다음 콘텐츠 유형을 요청하지 않고 즉시 fallback으로 전환합니다.
            if self._tour_api_circuit_open():
                break
            try:
                response = self.get_suwon_data(lang, content_type_id)
                for item in self._extract_items(response):
                    item['contenttypeid'] = str(item.get('contenttypeid') or content_type_id)
                    item['cat'] = category
                    collected.append(item)
            except Exception:
                logger.exception('TourAPI 콘텐츠 유형 수집 실패: content_type=%s', content_type_id)

        unique_items = {}
        for item in collected:
            content_id = str(item.get('contentid') or '')
            if content_id and content_id not in unique_items:
                unique_items[content_id] = item
        items = list(unique_items.values())

        # 외부 API가 일시적으로 제한되더라도 직전 정상 카탈로그를 유지합니다.
        # 첫 실행에서 정상 수집 이력이 없을 때만 로컬 seed로 내려갑니다.
        if not items and self.catalog_last_good.get(lang):
            logger.warning('TourAPI 결과가 비어 직전 정상 카탈로그를 사용합니다: language=%s', lang)
            return [dict(item) for item in self.catalog_last_good[lang]]

        for item in items:
            self.catalog_cache[(lang, str(item.get('contentid')))] = item

        if lang != 'kor':
            korean_items = self.get_suwon_catalog('kor')
            korean_images = {
                str(item.get('contentid')): (item.get('firstimage'), item.get('firstimage2'))
                for item in korean_items
                if item.get('contentid') and item.get('firstimage')
            }
            for item in items:
                image_pair = korean_images.get(str(item.get('contentid')))
                if image_pair:
                    item['firstimage'] = item.get('firstimage') or image_pair[0]
                    item['firstimage2'] = item.get('firstimage2') or image_pair[1]

        items = self._merge_seed_items(items, lang)
        self._enrich_missing_images(items, lang)
        if collected:
            self.catalog_last_good[lang] = [dict(item) for item in items]
        return items

    @staticmethod
    def _log_http_error(response, lang, content_type):
        """TourAPI 오류 구조를 비밀정보 없이 기록합니다."""
        result_code = None
        result_message = None
        error_reason = None
        try:
            payload = response.json()
            service_response = payload.get('OpenAPI_ServiceResponse', {}) if isinstance(payload, dict) else {}
            header = service_response.get('cmmMsgHeader', {}) if isinstance(service_response, dict) else {}
            result_message = header.get('errMsg')
            error_reason = header.get('returnReasonCode')
            response_header = payload.get('response', {}).get('header', {}) if isinstance(payload, dict) else {}
            if isinstance(response_header, dict):
                result_code = response_header.get('resultCode') or result_code
                result_message = response_header.get('resultMsg') or result_message
        except (ValueError, json.JSONDecodeError):
            logger.warning('TourAPI 오류 응답 JSON 파싱 실패: language=%s content_type=%s', lang, content_type)
        logger.error(
            'TourAPI HTTP 오류: language=%s content_type=%s status=%s content_type_header=%s '
            'resultCode=%s resultMsg=%s reasonCode=%s retryAfter=%s',
            lang,
            content_type,
            response.status_code,
            response.headers.get('Content-Type'),
            result_code,
            result_message,
            error_reason,
            response.headers.get('Retry-After'),
        )
        return str(error_reason) if error_reason is not None else None

    def _open_tour_api_circuit(self, reason_code):
        self.tour_api_unavailable_reason = str(reason_code)
        self.tour_api_unavailable_until = time.time() + 86400
        logger.warning('TourAPI circuit open: reasonCode=%s', reason_code)

    def _tour_api_circuit_open(self):
        if self.tour_api_unavailable_until <= time.time():
            self.tour_api_unavailable_until = 0.0
            self.tour_api_unavailable_reason = None
            return False
        return True

    @staticmethod
    def _merge_seed_items(items, lang):
        """TourAPI 결과에 로컬 큐레이션 명소를 보완하고 contentId로 중복 제거합니다."""
        seed_items = get_seed_places(lang)
        merged = {}
        title_index = {}

        def normalize_title(value):
            return ''.join(str(value or '').lower().split())

        for item in items if isinstance(items, list) else []:
            if not isinstance(item, dict):
                continue
            content_id = str(item.get('contentid') or '')
            if content_id:
                merged[content_id] = dict(item)
                normalized_title = normalize_title(item.get('title'))
                if normalized_title:
                    title_index.setdefault(normalized_title, content_id)

        for seed in seed_items:
            if not isinstance(seed, dict):
                continue
            content_id = str(seed.get('contentid') or '')
            if not content_id:
                continue
            normalized_title = normalize_title(seed.get('title'))
            existing_id = content_id if content_id in merged else title_index.get(normalized_title)
            if not existing_id:
                merged[content_id] = dict(seed)
                if normalized_title:
                    title_index[normalized_title] = content_id
                continue
            for key, value in seed.items():
                if key in {'overview', 'description', 'firstimage', 'firstimage2'} and value:
                    merged[existing_id][key] = value
                elif not merged[existing_id].get(key) and value:
                    merged[existing_id][key] = value

        return list(merged.values())

    @staticmethod
    def _extract_items(response):
        if not isinstance(response, dict):
            return []
        envelope = response.get('response')
        body = envelope.get('body') if isinstance(envelope, dict) else None
        if not isinstance(body, dict):
            return []
        items_container = body.get('items')
        items = items_container.get('item') if isinstance(items_container, dict) else items_container
        return TourAPIManager._normalize_items(items)

    @staticmethod
    def _normalize_items(value):
        """TourAPI의 단일 객체·배열·빈 응답을 list[dict]로 통일합니다."""
        if value is None or value == '' or value == {}:
            return []
        if isinstance(value, dict):
            return [value]
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
        logger.warning('예상하지 못한 TourAPI items 형식: type=%s', type(value).__name__)
        return []

    def _enrich_missing_images(self, items, lang):
        """목록 API에서 이미지가 빠진 항목을 상세 API로 제한적으로 보강합니다."""
        # 목록 요청마다 전체 항목을 상세 이미지 API로 조회하지 않고 소수만 보강합니다.
        targets = [item for item in items if not item.get('firstimage') and item.get('contentid')][:6]
        if not targets:
            return

        def fetch_image(item):
            image, image2 = self._fetch_gallery_image(str(item['contentid']), lang, item.get('contenttypeid'))
            return item, image, image2

        with ThreadPoolExecutor(max_workers=6) as executor:
            futures = [executor.submit(fetch_image, item) for item in targets]
            for future in as_completed(futures):
                try:
                    item, image, image2 = future.result()
                    if image:
                        item['firstimage'] = self.force_https(image)
                    if image2:
                        item['firstimage2'] = self.force_https(image2)
                except Exception as image_error:
                    logger.warning('상세 이미지 보강 실패: content_id=%s', item.get('contentid'))

    def _fetch_gallery_image(self, content_id, lang, content_type_id=None):
        """상세 공통 API에 이미지가 없을 때 이미지 목록 API에서 대표 이미지를 찾습니다."""
        if not self.api_key or self._tour_api_circuit_open():
            return None, None
        service_map = self.service_map.get(lang, 'KorService2')
        content_type = content_type_id or ('12' if lang == 'kor' else '76')
        params = {
            'serviceKey': self.api_key,
            'contentId': content_id,
            'contentTypeId': content_type,
            'imageYN': 'Y',
            'MobileOS': 'ETC',
            'MobileApp': 'LinkSuwon',
            '_type': 'json',
            'numOfRows': 10,
            'pageNo': 1,
        }
        try:
            url = f'{self.base_url}/{service_map}/detailImage2'
            response = requests.get(url, params=params, timeout=8, verify=self.ssl_verify)
            payload = response.json() if response.status_code == 200 else {}
            images = self._extract_items(payload)
            first = next((image for image in images if image.get('originimgurl')), None)
            if first:
                return self.force_https(first.get('originimgurl')), self.force_https(first.get('smallimageurl'))
        except Exception as image_error:
            logger.warning('TourAPI 이미지 목록 보강 실패: content_id=%s', content_id)
        return None, None

    def get_detail_info(self, content_id, lang='kor', content_type_id=None):
        cached_item = self.catalog_cache.get((lang, str(content_id)))

        def cached_response():
            if not cached_item:
                return None
            return {
                "response": {
                    "header": {"resultCode": "0000", "resultMsg": "SUCCESS (CATALOG CACHE)"},
                    "body": {"items": {"item": [cached_item]}}
                }
            }

        if self._tour_api_circuit_open():
            return cached_response()

        # content_id가 로컬 Seed Data에 해당하는 경우 로컬에서 즉시 리턴
        if str(content_id) in ['126227', '126228', '126229', '126230', '126231', '126232', '126233', '126234']:
            local_items = get_seed_places(lang)
            matched = next((item for item in local_items if item['contentid'] == str(content_id)), None)
            if matched:
                # [이미지 수혈] 외국어 시드 데이터의 이미지가 누락된 경우 국문 시드 데이터의 이미지 매핑 적용
                if lang != 'kor' and not matched.get('firstimage'):
                    try:
                        kor_seeds = get_seed_places('kor')
                        k_matched = next((k for k in kor_seeds if k['contentid'] == str(content_id)), None)
                        if k_matched and k_matched.get('firstimage'):
                            matched['firstimage'] = k_matched.get('firstimage')
                            if k_matched.get('firstimage2'):
                                matched['firstimage2'] = k_matched.get('firstimage2')
                            logger.debug('시드 명소 이미지 보강 완료: content_id=%s', content_id)
                    except Exception as seed_img_err:
                        logger.warning('시드 명소 이미지 보강 실패: content_id=%s', content_id)
                if matched.get('firstimage'):
                    matched['firstimage'] = self.force_https(matched['firstimage'])
                if matched.get('firstimage2'):
                    matched['firstimage2'] = self.force_https(matched['firstimage2'])
                return {
                    "response": {
                        "header": {"resultCode": "0000", "resultMsg": "SUCCESS (LOCAL DETAIL)"},
                        "body": {
                            "items": {"item": [matched]}
                        }
                    }
                }

        service_map = self.service_map.get(lang, 'KorService2')
        c_type = content_type_id
        if not c_type:
            c_type = '12' if lang == 'kor' else '76' # 기본 관광지 분류로 폴백
            
        base_params = {
            'serviceKey': self.api_key,
            'contentId': content_id,
            'contentTypeId': c_type,
            'MobileOS': 'ETC',
            'MobileApp': 'LinkSuwon',
            '_type': 'json',
        }

        if not self.api_key:
            return cached_response()
        try:
            # 1차: detailCommon2 — overview, 주소, 이미지
            common_url = f'{self.base_url}/{service_map}/detailCommon2'
            # 다국어 서비스는 파라미터명 끝자리가 소문자 'Yn'인 스펙 충돌 보정
            if lang == 'kor':
                common_params = {**base_params, 'overviewYN': 'Y', 'addrinfoYN': 'Y', 'firstImageYN': 'Y', 'mapinfoYN': 'Y'}
            else:
                common_params = {**base_params, 'overviewYn': 'Y', 'addrinfoYn': 'Y', 'firstImageYn': 'Y', 'mapinfoYn': 'Y'}
            common_res = requests.get(common_url, params=common_params, timeout=10, verify=self.ssl_verify)

            if common_res.status_code != 200:
                return cached_response()

            res_data = common_res.json()
            envelope = res_data.get('response') if isinstance(res_data, dict) else None
            header = envelope.get('header') if isinstance(envelope, dict) else {}
            if not isinstance(header, dict):
                header = {}
            result_code = header.get('resultCode')
            if result_code is None:
                logger.warning('detailCommon2 응답 형식 오류: content_id=%s', content_id)
                return cached_response() or res_data
            if result_code != '0000':
                logger.warning('detailCommon2 응답 오류: content_id=%s code=%s message=%s', content_id, header.get('resultCode'), header.get('resultMsg'))
                return cached_response()

            # item 추출
            body = envelope.get('body') if isinstance(envelope, dict) else None
            if not isinstance(body, dict):
                return cached_response() or res_data
            items_container = body.get('items')
            raw_items = items_container.get('item') if isinstance(items_container, dict) else items_container
            item_list = self._normalize_items(raw_items)
            if not item_list:
                return cached_response() or res_data
            item = item_list[0]

            if not isinstance(item, dict):
                return cached_response()

            if isinstance(cached_item, dict):
                for key in ('overview', 'addr1', 'firstimage', 'firstimage2', 'mapx', 'mapy'):
                    if not item.get(key) and cached_item.get(key):
                        item[key] = cached_item[key]

            # [이미지 수혈] 외국어 환경에서 상세 정보의 이미지가 누락된 경우 국문 상세 API를 동기식으로 찔러서 이미지 수혈
            if lang != 'kor' and not item.get('firstimage'):
                try:
                    kor_common_params = {**base_params, 'overviewYN': 'Y', 'addrinfoYN': 'Y', 'firstImageYN': 'Y', 'mapinfoYN': 'Y'}
                    # 국문 서비스 경로 (KorService2) 강제 호출
                    kor_common_url = f'{self.base_url}/KorService2/detailCommon2'
                    kor_common_res = requests.get(kor_common_url, params=kor_common_params, timeout=10, verify=self.ssl_verify)
                    if kor_common_res.status_code == 200:
                        kor_res_data = kor_common_res.json()
                        kor_item_list = self._extract_items(kor_res_data)
                        if kor_item_list:
                            kor_item = kor_item_list[0]
                            if kor_item.get('firstimage'):
                                item['firstimage'] = kor_item.get('firstimage')
                                if kor_item.get('firstimage2'):
                                    item['firstimage2'] = kor_item.get('firstimage2')
                                logger.debug('외국어 상세 이미지 보강 완료: content_id=%s', content_id)
                except Exception as detail_img_err:
                    logger.warning('국문 상세 이미지 보강 실패: content_id=%s', content_id)

            # 2차: detailIntro2 — 한국어 서비스인 경우에만 전화번호, 영업시간, 휴무일, 주차, 입장료 등 추가 병합
            if lang == 'kor':
                try:
                    intro_url = f'{self.base_url}/{service_map}/detailIntro2'
                    intro_res = requests.get(intro_url, params=base_params, timeout=8, verify=self.ssl_verify)
                    if intro_res.status_code == 200:
                        intro_data = intro_res.json()
                        intro_envelope = intro_data.get('response') if isinstance(intro_data, dict) else None
                        intro_header = intro_envelope.get('header') if isinstance(intro_envelope, dict) else {}
                        if not isinstance(intro_header, dict):
                            intro_header = {}
                        if intro_header.get('resultCode') == '0000':
                            intro_body = intro_envelope.get('body') if isinstance(intro_envelope, dict) else None
                            intro_items = intro_body.get('items') if isinstance(intro_body, dict) else None
                            if intro_items:
                                intro_item_list = self._normalize_items(intro_items.get('item') if isinstance(intro_items, dict) else intro_items)
                                intro_item = intro_item_list[0] if intro_item_list else {}
                                if intro_item:
                                    # intro 정보를 main item에 병합
                                    item.update({
                                        'infocenter': intro_item.get('infocenter', intro_item.get('infocenterfood', intro_item.get('infocenterculture', ''))),
                                        'usetime': intro_item.get('usetime', intro_item.get('usetimefood', intro_item.get('usetimeculture', ''))),
                                        'restdate': intro_item.get('restdate', intro_item.get('restdatefood', intro_item.get('restdateculture', ''))),
                                        'parking': intro_item.get('parking', intro_item.get('parkingfood', intro_item.get('parkingculture', ''))),
                                        'usefee': intro_item.get('usefee', intro_item.get('usefeeculture', '')),
                                        'accomcount': intro_item.get('accomcount', ''),
                                    })
                                    logger.debug('detailIntro2 병합 성공: content_id=%s', content_id)
                except Exception:
                    logger.warning('detailIntro2 병합 실패: content_id=%s', content_id, exc_info=True)

            # 최종 반환 전 혼합 콘텐츠(Mixed Content) 대응을 위한 이미지 URL https 강제 전환
            if item.get('firstimage'):
                item['firstimage'] = self.force_https(item['firstimage'])
            if item.get('firstimage2'):
                item['firstimage2'] = self.force_https(item['firstimage2'])

            # 병합된 item을 원래 구조에 다시 넣어서 반환
            body['items'] = {'item': [item]}

            return res_data

        except requests.exceptions.SSLError as ssl_err:
            logger.error('TourAPI 상세 SSL 검증 실패: content_id=%s', content_id)
            return cached_response()
        except Exception as e:
            logger.exception('TourAPI 상세 요청 처리 실패: content_id=%s', content_id)
            return cached_response()
