from math import ceil
import html
import re

from LinkSuwon.api_manager import TourAPIManager


SUPPORTED_LANGUAGES = {'kor', 'eng', 'jpn', 'chs', 'cht'}
SUPPORTED_CATEGORIES = {
    'all', 'heritage', 'museum', 'festival', 'course',
    'leisure', 'stay', 'market', 'food', 'nature', 'exchange',
}


class TourismServiceError(Exception):
    """관광 데이터 수집 또는 정규화 오류입니다."""


class TourismNotFoundError(Exception):
    """요청한 관광지를 찾을 수 없습니다."""


class TourismService:
    """기존 TourAPI 카탈로그를 REST API용 데이터로 변환합니다."""

    def __init__(self, manager=None):
        self.manager = manager or TourAPIManager()

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
        filtered_items = self._filter_items(normalized_items, category, keyword)
        total_count = len(filtered_items)
        start = (page - 1) * page_size
        end = start + page_size

        return {
            'items': filtered_items[start:end],
            'pagination': {
                'page': page,
                'pageSize': page_size,
                'totalCount': total_count,
                'totalPages': ceil(total_count / page_size) if total_count else 0,
            },
        }

    def get_spot_detail(self, content_id, *, language='kor'):
        if language not in SUPPORTED_LANGUAGES:
            raise ValueError('지원하지 않는 언어입니다.')
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,100}', content_id or ''):
            raise ValueError('contentId 형식이 올바르지 않습니다.')

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

        item = detail_items[0]
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
            'overview': self._clean_text(item.get('overview')),
            'homepage': self._clean_text(item.get('homepage')),
            'telephone': self._clean_text(item.get('infocenter')),
            'openHours': self._clean_text(item.get('usetime')),
            'restDate': self._clean_text(item.get('restdate')),
            'parking': self._clean_text(item.get('parking')),
            'usageFee': self._clean_text(item.get('usefee')),
            'duration': self._clean_text(item.get('taketime')),
            'category': str(item.get('cat') or 'heritage'),
            'pronunciation': item.get('pronunciation') or '',
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
                images.append({'url': url, 'thumbnailUrl': thumbnail_url or url})
        return images

    @staticmethod
    def _clean_text(value):
        if not value:
            return ''
        plain_text = re.sub(r'<[^>]*>', '', str(value))
        return html.unescape(plain_text).strip()

    @staticmethod
    def _normalize_item(item):
        return {
            'contentId': str(item.get('contentid') or ''),
            'title': str(item.get('title') or '').strip(),
            'address': str(item.get('addr1') or '').strip(),
            'imageUrl': item.get('firstimage') or None,
            'imageUrl2': item.get('firstimage2') or None,
            'latitude': TourismService._to_float(item.get('mapy')),
            'longitude': TourismService._to_float(item.get('mapx')),
            'overview': str(item.get('overview') or '').strip(),
            'contentTypeId': str(item.get('contenttypeid') or ''),
            'category': str(item.get('cat') or 'heritage'),
            'pronunciation': item.get('pronunciation') or '',
            'homepage': item.get('homepage') or '',
        }

    @staticmethod
    def _to_float(value):
        try:
            return float(value) if value not in (None, '') else None
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _filter_items(items, category, keyword):
        normalized_keyword = ''.join(keyword.lower().split())
        filtered = items
        if category != 'all':
            filtered = [item for item in filtered if item['category'] == category]
        if normalized_keyword:
            filtered = [
                item for item in filtered
                if normalized_keyword in ''.join(item['title'].lower().split())
                or normalized_keyword in ''.join(item['address'].lower().split())
                or normalized_keyword in ''.join(item['overview'].lower().split())
            ]
        return filtered
