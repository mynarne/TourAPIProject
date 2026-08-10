from math import ceil
import html
import re
import unicodedata
from datetime import date

from LinkSuwon.api_manager import TourAPIManager
from .enrichment_service import EnrichmentService


SUPPORTED_LANGUAGES = {'kor', 'eng', 'jpn', 'chs', 'cht'}
SUPPORTED_CATEGORIES = {
    'all', 'heritage', 'museum', 'art_gallery', 'library', 'cultural_facility', 'festival', 'course',
    'leisure', 'stay', 'market', 'food', 'nature', 'exchange',
}


class TourismServiceError(Exception):
    """관광 데이터 수집 또는 정규화 오류입니다."""


class TourismNotFoundError(Exception):
    """요청한 관광지를 찾을 수 없습니다."""


class TourismService:
    """기존 TourAPI 카탈로그를 REST API용 데이터로 변환합니다."""

    def __init__(self, manager=None, enrichment_service=None):
        self.manager = manager or TourAPIManager()
        self.enrichment_service = enrichment_service or EnrichmentService()

    def get_spots(self, *, language='kor', page=1, page_size=20, category='all', keyword=''):
        if language not in SUPPORTED_LANGUAGES:
            raise ValueError('지원하지 않는 언어입니다.')
        if category not in SUPPORTED_CATEGORIES:
            raise ValueError('지원하지 않는 카테고리입니다.')

        try:
            raw_items = self.manager.get_suwon_catalog(language)
        except Exception as error:
            raise TourismServiceError('관광 데이터 수집에 실패했습니다.') from error

        if not isinstance(raw_items, list):
            raise TourismServiceError('관광 데이터 형식이 올바르지 않습니다.')

        normalized_items = [self._normalize_item(item) for item in raw_items if isinstance(item, dict)]
        normalized_items = self.enrichment_service.enrich_items(normalized_items)
        normalized_items = self.enrichment_service.append_verified_current_festivals(normalized_items)
        filtered_items = self._filter_items(normalized_items, category, keyword)
        filtered_items = self._final_temporal_validation(filtered_items)
        total_count = len(filtered_items)
        total_pages = ceil(total_count / page_size) if total_count else 0
        current_page = min(page, total_pages) if total_pages else 1
        start = (current_page - 1) * page_size
        end = start + page_size

        return {
            'items': filtered_items[start:end],
            'pagination': {
                'page': current_page,
                'pageSize': page_size,
                'totalCount': total_count,
                'totalPages': total_pages,
            },
        }

    def get_spot_detail(self, content_id, *, language='kor'):
        if language not in SUPPORTED_LANGUAGES:
            raise ValueError('지원하지 않는 언어입니다.')
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,100}', content_id or ''):
            raise ValueError('contentId 형식이 올바르지 않습니다.')

        verified_item = self.enrichment_service.get_verified_item(content_id)
        if verified_item:
            return self._build_detail_response(verified_item, content_id, language)

        local_item = self._find_local_or_cached_item(content_id, language)
        if local_item:
            return self._build_detail_response(local_item, content_id, language)

        try:
            detail_response = self.manager.get_detail_info(content_id, language)
        except Exception as error:
            raise TourismServiceError('관광지 상세 정보 수집에 실패했습니다.') from error

        if detail_response is None:
            try:
                catalog_items = self.manager.get_suwon_catalog(language)
            except Exception as error:
                raise TourismServiceError('관광지 상세 API 응답을 받지 못했습니다.') from error
            exists_in_catalog = any(
                str(item.get('contentid')) == content_id
                for item in catalog_items
                if isinstance(item, dict)
            )
            if exists_in_catalog:
                raise TourismServiceError('관광지 상세 API 응답을 받지 못했습니다.')
            raise TourismNotFoundError('관광지를 찾을 수 없습니다.')

        detail_items = self.manager._extract_items(detail_response)
        if not detail_items:
            raise TourismNotFoundError('관광지를 찾을 수 없습니다.')

        item = TourAPIManager._merge_seed_items([detail_items[0]], language)[0]
        return self._build_detail_response(item, content_id, language)

    def _find_local_or_cached_item(self, content_id, language):
        cached_catalog = getattr(self.manager, 'catalog_last_good', {}).get(language, [])
        for item in cached_catalog:
            if str(item.get('contentid') or '') == content_id:
                return item
        merged_seed = TourAPIManager._merge_seed_items([], language)
        return next((item for item in merged_seed if str(item.get('contentid') or '') == content_id), None)

    def _build_detail_response(self, item, content_id, language):
        images = self._build_images(item)
        if not images:
            image_url, thumbnail_url = self._get_gallery_fallback(content_id, language, item)
            if image_url:
                images = [{'url': image_url, 'thumbnailUrl': thumbnail_url or image_url}]

        return {
            'contentId': str(item.get('contentid') or content_id),
            'contentTypeId': str(item.get('contenttypeid') or ''),
            'title': self._clean_text(item.get('title')),
            'address': self._clean_text(item.get('addr1')),
            'addressDetail': self._clean_text(item.get('addr2')),
            'imageUrl': images[0]['url'] if images else None,
            'imageUrl2': images[1]['url'] if len(images) > 1 else None,
            'images': images,
            'latitude': self._to_float(item.get('mapy')),
            'longitude': self._to_float(item.get('mapx')),
            'overview': self._clean_text(item.get('overview') or item.get('description')),
            'homepage': self._clean_text(item.get('homepage')),
            'telephone': self._clean_text(item.get('infocenter')),
            'openHours': self._clean_text(item.get('usetime')),
            'restDate': self._clean_text(item.get('restdate')),
            'parking': self._clean_text(item.get('parking')),
            'usageFee': self._clean_text(item.get('usefee')),
            'duration': self._clean_text(item.get('taketime')),
            'category': self._map_category(item),
            'eventStartDate': str(item.get('eventstartdate') or ''),
            'eventEndDate': str(item.get('eventenddate') or ''),
            'pronunciation': item.get('pronunciation') or '',
            'imageSource': item.get('imageSource'),
            'imageSourceUrl': item.get('imageSourceUrl'),
            'imageAuthor': item.get('imageAuthor'),
            'imageLicense': item.get('imageLicense'),
            'imageLicenseUrl': item.get('imageLicenseUrl'),
            'imageAttributionRequired': item.get('imageAttributionRequired'),
            'sourceUrl': item.get('sourceUrl'),
            'enrichmentSource': item.get('enrichmentSource'),
        }

    def _get_gallery_fallback(self, content_id, language, item):
        fetch_gallery = getattr(self.manager, '_fetch_gallery_image', None)
        if not fetch_gallery:
            return None, None
        try:
            return fetch_gallery(content_id, language, item.get('contenttypeid'))
        except Exception:
            return None, None

    @staticmethod
    def _build_images(item):
        images = []
        for url, thumbnail_url in (
            (item.get('firstimage'), item.get('firstimage2')),
            (item.get('firstimage2'), item.get('firstimage2')),
        ):
            if url and not any(image['url'] == url for image in images):
                normalized_url = TourismService._normalize_image_url(url)
                normalized_thumbnail = TourismService._normalize_image_url(thumbnail_url or url)
                images.append({'url': normalized_url, 'thumbnailUrl': normalized_thumbnail})
        return images

    @staticmethod
    def _normalize_image_url(value):
        """Legacy 정적 이미지 경로를 React public 경로로 변환합니다."""
        if not value:
            return None
        url = str(value).strip()
        if url.startswith('/static/images/'):
            return f'/images/{url.removeprefix("/static/images/")}'
        if url.startswith('static/images/'):
            return f'/images/{url.removeprefix("static/images/")}'
        return url

    @staticmethod
    def _clean_text(value):
        if not value:
            return ''
        plain_text = re.sub(r'<[^>]*>', '', str(value))
        return html.unescape(plain_text).strip()

    @staticmethod
    def _normalize_item(item):
        category = TourismService._map_category(item)
        return {
            'contentId': str(item.get('contentid') or ''),
            'title': str(item.get('title') or '').strip(),
            'address': str(item.get('addr1') or '').strip(),
            'imageUrl': TourismService._normalize_image_url(item.get('firstimage')),
            'imageUrl2': TourismService._normalize_image_url(item.get('firstimage2')),
            'latitude': TourismService._to_float(item.get('mapy')),
            'longitude': TourismService._to_float(item.get('mapx')),
            'overview': str(item.get('overview') or item.get('description') or '').strip(),
            'contentTypeId': str(item.get('contenttypeid') or ''),
            'category': category,
            'eventStartDate': str(item.get('eventstartdate') or ''),
            'eventEndDate': str(item.get('eventenddate') or ''),
            'pronunciation': item.get('pronunciation') or '',
            'homepage': item.get('homepage') or '',
            'imageSource': item.get('imageSource'),
            'imageSourceUrl': item.get('imageSourceUrl'),
            'imageAuthor': item.get('imageAuthor'),
            'imageLicense': item.get('imageLicense'),
            'imageLicenseUrl': item.get('imageLicenseUrl'),
            'imageAttributionRequired': item.get('imageAttributionRequired'),
            'sourceUrl': item.get('sourceUrl'),
            'enrichmentSource': item.get('enrichmentSource'),
        }

    @staticmethod
    def _to_float(value):
        try:
            return float(value) if value not in (None, '') else None
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _filter_items(items, category, keyword):
        normalized_keyword = TourismService._normalize_search_text(keyword)
        filtered = list(items)
        if category != 'all':
            filtered = [item for item in filtered if item['category'] == category]
        if normalized_keyword:
            filtered = [
                item for item in filtered
                if TourismService._matches_keyword(item, normalized_keyword)
            ]
        return filtered

    @staticmethod
    def _final_temporal_validation(items, today=None):
        """최종 응답 직전에 축제의 현재성만 검증합니다."""
        reference_date = today or date.today()
        return [
            item for item in items
            if item.get('category') != 'festival'
            or TourismService._is_current_festival(item, reference_date)
        ]

    @staticmethod
    def _normalize_search_text(value):
        normalized = unicodedata.normalize('NFC', str(value or '')).strip().lower()
        return ''.join(normalized.split())

    @staticmethod
    def _matches_keyword(item, normalized_keyword):
        searchable = (
            TourismService._normalize_search_text(item.get('title')),
            TourismService._normalize_search_text(item.get('address')),
            TourismService._normalize_search_text(item.get('overview')),
        )
        if any(normalized_keyword in field for field in searchable):
            return True

        # Legacy 검색과 동일하게 수원화성 검색은 핵심 성곽 명소를 함께 찾습니다.
        if normalized_keyword in {'수원화성', '화성', 'suwonhwaseong', 'hwaseong'}:
            return str(item.get('contentId') or '') in {
                '126227', '126228', '126229', '126230',
                '126231', '126232', '126233', '126234',
            }
        return False

    @staticmethod
    def _map_category(item):
        """세부 분류를 우선 사용하고 문화시설 전체를 박물관으로 뭉치지 않습니다."""
        fields = ' '.join(str(item.get(key) or '').lower() for key in ('cat1', 'cat2', 'cat3', 'lclsSystmCode', 'title'))
        if '도서관' in fields or 'library' in fields:
            return 'library'
        if '미술관' in fields or 'art gallery' in fields or 'gallery' in fields:
            return 'art_gallery'
        if '전시관' in fields or '문화원' in fields or 'cultural facility' in fields:
            return 'cultural_facility'
        return str(item.get('cat') or 'heritage')

    @staticmethod
    def _is_current_festival(item, reference_date=None):
        if item.get('category') != 'festival':
            return True
        reference_date = reference_date or date.today()
        raw_end = str(item.get('eventEndDate') or '').strip()
        if raw_end:
            digits = re.sub(r'[^0-9]', '', raw_end)
            if len(digits) != 8:
                return False
            try:
                end_date = date(int(digits[:4]), int(digits[4:6]), int(digits[6:8]))
            except ValueError:
                return False
            return end_date >= reference_date

        raw_start = str(item.get('eventStartDate') or '').strip()
        if raw_start:
            digits = re.sub(r'[^0-9]', '', raw_start)
            if len(digits) != 8:
                return False
            try:
                start_date = date(int(digits[:4]), int(digits[4:6]), int(digits[6:8]))
            except ValueError:
                return False
            return start_date >= reference_date

        years = [int(year) for year in re.findall(r'20\d{2}', str(item.get('title') or ''))]
        if years:
            return min(years) >= reference_date.year and bool(item.get('enrichmentSource') and item.get('sourceUrl'))
        return bool(item.get('enrichmentSource') and item.get('sourceUrl'))

    @staticmethod
    def _is_past_festival(item):
        return not TourismService._is_current_festival(item)
