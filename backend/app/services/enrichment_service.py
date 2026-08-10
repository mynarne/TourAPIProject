import json
import re
from datetime import date
from pathlib import Path


SNAPSHOT_PATH = Path(__file__).resolve().parents[1] / 'data' / 'tourism_enrichment.json'


class WikimediaCommonsAdapter:
    """검증된 snapshot 생성에 사용할 Wikimedia Commons 검색 adapter입니다.

    이 adapter는 사용자 요청 처리 중 호출하지 않습니다. 검색 결과는 라이선스와
    출처 메타데이터를 검토한 뒤에만 정적 snapshot에 기록해야 합니다.
    """

    API_URL = 'https://commons.wikimedia.org/w/api.php'

    @classmethod
    def build_search_params(cls, query):
        return {
            'action': 'query',
            'generator': 'search',
            'gsrsearch': query,
            'gsrnamespace': 6,
            'gsrlimit': 10,
            'prop': 'imageinfo|info',
            'iiprop': 'url|extmetadata',
            'iiurlwidth': 1200,
            'format': 'json',
        }


class EnrichmentService:
    """검증 완료된 정적 enrichment snapshot을 관광 데이터에 적용합니다."""

    def __init__(self, snapshot_path=SNAPSHOT_PATH):
        self.snapshot_path = Path(snapshot_path)
        self.snapshot = self._load_snapshot()

    def _load_snapshot(self):
        try:
            with self.snapshot_path.open(encoding='utf-8') as file:
                data = json.load(file)
            return data if isinstance(data, dict) else {'festivals': [], 'images': []}
        except (OSError, json.JSONDecodeError):
            return {'festivals': [], 'images': []}

    def enrich_items(self, items):
        return [self.enrich_item(item) for item in items if isinstance(item, dict)]

    def append_verified_current_festivals(self, items):
        """TourAPI에 아직 등록되지 않은 검증 snapshot의 현재 축제를 추가합니다."""
        result = list(items)
        existing_keys = {
            self.normalize_festival_title(item.get('title'))
            for item in result
            if isinstance(item, dict) and item.get('category') == 'festival'
        }
        for entry in self.snapshot.get('festivals', []):
            if not isinstance(entry, dict) or not self._is_current_or_upcoming(entry):
                continue
            key = self.normalize_festival_title(entry.get('normalizedTitle') or entry.get('title'))
            if not key or key in existing_keys:
                continue
            result.append({
                'contentId': str(entry.get('contentId') or f'enrichment-festival-{key}'),
                'contentTypeId': '15',
                'title': entry.get('title', ''),
                'address': entry.get('address', ''),
                'imageUrl': entry.get('imageUrl'),
                'imageUrl2': None,
                'latitude': None,
                'longitude': None,
                'overview': entry.get('overview', ''),
                'category': 'festival',
                'eventStartDate': entry.get('eventStartDate', ''),
                'eventEndDate': entry.get('eventEndDate', ''),
                'pronunciation': '',
                'homepage': '',
                'sourceUrl': entry.get('sourceUrl'),
                'enrichmentSource': entry.get('source'),
            })
            existing_keys.add(key)
        return result

    def get_verified_item(self, content_id):
        for entry in self.snapshot.get('festivals', []):
            if str(entry.get('contentId') or '') == str(content_id) and self._is_current_or_upcoming(entry):
                return {
                    'contentid': str(content_id),
                    'contenttypeid': '15',
                    'title': entry.get('title', ''),
                    'addr1': entry.get('address', ''),
                    'overview': entry.get('overview', ''),
                    'eventstartdate': entry.get('eventStartDate', ''),
                    'eventenddate': entry.get('eventEndDate', ''),
                    'cat': 'festival',
                    'sourceUrl': entry.get('sourceUrl'),
                    'enrichmentSource': entry.get('source'),
                }
        return None

    def enrich_item(self, item):
        enriched = dict(item)
        if enriched.get('category') == 'festival':
            enriched = self._reconcile_festival(enriched)
        enriched = self._apply_image_metadata(enriched)
        return enriched

    def _reconcile_festival(self, item):
        key = self.normalize_festival_title(item.get('title'))
        if not key:
            return item
        current = next(
            (entry for entry in self.snapshot.get('festivals', [])
             if isinstance(entry, dict)
             and self.normalize_festival_title(entry.get('normalizedTitle') or entry.get('title')) == key
             and self._is_current_or_upcoming(entry)),
            None,
        )
        if not current:
            return item

        result = dict(item)
        result['title'] = current.get('title') or result.get('title')
        result['eventStartDate'] = current.get('eventStartDate') or result.get('eventStartDate', '')
        result['eventEndDate'] = current.get('eventEndDate') or result.get('eventEndDate', '')
        result['address'] = current.get('address') or result.get('address', '')
        result['overview'] = current.get('overview') or result.get('overview', '')
        result['sourceUrl'] = current.get('sourceUrl') or result.get('sourceUrl')
        if current.get('source'):
            result['enrichmentSource'] = current['source']
        return result

    def _apply_image_metadata(self, item):
        key = self.normalize_festival_title(item.get('title'))
        content_id = str(item.get('contentId') or '')
        entry = next(
            (candidate for candidate in self.snapshot.get('images', [])
             if isinstance(candidate, dict)
             and ((content_id and str(candidate.get('contentId') or '') == content_id)
                  or (key and self.normalize_festival_title(candidate.get('title')) == key))),
            None,
        )
        if not entry or not entry.get('imageUrl') or not self._has_usable_license(entry):
            return item
        result = dict(item)
        if not result.get('imageUrl'):
            result['imageUrl'] = entry['imageUrl']
        return self._apply_source_metadata(result, entry)

    @staticmethod
    def _apply_source_metadata(item, source):
        result = dict(item)
        for key in ('source', 'sourceUrl', 'author', 'license', 'licenseUrl', 'attributionRequired'):
            value = source.get(key)
            if value not in (None, ''):
                result_key = {
                    'source': 'imageSource',
                    'sourceUrl': 'imageSourceUrl',
                    'author': 'imageAuthor',
                    'license': 'imageLicense',
                    'licenseUrl': 'imageLicenseUrl',
                    'attributionRequired': 'imageAttributionRequired',
                }.get(key, key)
                if key == 'sourceUrl' and item.get('category') == 'festival':
                    result['sourceUrl'] = value
                else:
                    result[result_key] = value
        return result

    @staticmethod
    def _has_usable_license(entry):
        source = str(entry.get('source') or '')
        return source == 'official_suwon' or bool(entry.get('license') and entry.get('licenseUrl'))

    @staticmethod
    def _is_current_or_upcoming(entry):
        raw_end = re.sub(r'[^0-9]', '', str(entry.get('eventEndDate') or ''))
        if len(raw_end) != 8:
            return False
        try:
            end_date = date(int(raw_end[:4]), int(raw_end[4:6]), int(raw_end[6:8]))
        except ValueError:
            return False
        return end_date >= date.today()

    @staticmethod
    def normalize_festival_title(value):
        text = str(value or '').lower()
        text = re.sub(r'20\d{2}', '', text)
        text = re.sub(r'제\s*\d+\s*회', '', text)
        text = re.sub(r'\(.*?\)', '', text)
        text = re.sub(r'[^0-9a-z가-힣]+', '', text)
        return text
