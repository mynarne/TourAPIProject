import unittest
from unittest.mock import patch
from datetime import date

from app import create_app
from app.api import tourism as tourism_api
from app.services.tourism_service import TourismService, TourismServiceError
from app.services.enrichment_service import EnrichmentService, WikimediaCommonsAdapter
from LinkSuwon.api_manager import TourAPIManager


class FakeManager:
    def get_suwon_catalog(self, language):
        return [
            {
                'contentid': '1',
                'title': '수원화성',
                'addr1': '경기도 수원시',
                'firstimage': 'https://example.com/hwaseong.jpg',
                'mapx': '127.014',
                'mapy': '37.283',
                'overview': '수원을 대표하는 역사 명소입니다.',
                'contenttypeid': '12',
                'cat': 'heritage',
            },
        ]


class BrokenManager:
    def get_suwon_catalog(self, language):
        raise RuntimeError('외부 API 실패')


class DetailManager:
    def __init__(self, item=None, response=None):
        self.item = item
        self.response = response
        self.languages = []

    def get_suwon_catalog(self, language):
        return []

    def get_detail_info(self, content_id, language):
        self.languages.append(language)
        return self.response if self.response is not None else {'response': {}}

    @staticmethod
    def _extract_items(response):
        return response.get('response', {}).get('body', {}).get('items', {}).get('item', [])

    @staticmethod
    def _fetch_gallery_image(content_id, language, content_type_id):
        return None, None


class TourismApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app({'TESTING': True, 'SECRET_KEY': 'tourism-test-secret'})
        self.client = self.app.test_client()
        self.service = TourismService(FakeManager())

    def test_health_api(self):
        response = self.client.get('/api/v1/health')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()['success'])

    def test_spots_default_query_and_normalization(self):
        with patch.object(tourism_api, 'tourism_service', self.service):
            response = self.client.get('/api/v1/tour/spots')
        payload = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload['data']['pagination']['pageSize'], 20)
        self.assertEqual(payload['data']['items'][0]['contentId'], '1')
        self.assertEqual(payload['data']['items'][0]['imageUrl'], 'https://example.com/hwaseong.jpg')

    def test_invalid_page_returns_400(self):
        response = self.client.get('/api/v1/tour/spots?page=0')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.get_json()['success'])

    def test_empty_result_returns_200(self):
        with patch.object(tourism_api, 'tourism_service', self.service):
            response = self.client.get('/api/v1/tour/spots?keyword=없는장소')
        payload = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload['data']['items'], [])
        self.assertEqual(payload['data']['pagination']['totalCount'], 0)

    def test_external_failure_returns_502(self):
        broken_service = TourismService(BrokenManager())
        with patch.object(tourism_api, 'tourism_service', broken_service):
            response = self.client.get('/api/v1/tour/spots')
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.get_json()['message'], '관광지 정보를 불러오지 못했습니다.')

    def test_spot_detail_normalization_and_language(self):
        manager = DetailManager(response={
            'response': {'body': {'items': {'item': [{
                'contentid': '126508',
                'contenttypeid': '12',
                'title': '수원화성',
                'addr1': '경기도 수원시',
                'overview': '<p>역사적인 명소입니다.</p>',
                'firstimage': 'https://example.com/one.jpg',
                'firstimage2': 'https://example.com/two.jpg',
                'mapx': '127.014',
                'mapy': '37.283',
                'cat': 'heritage',
                'infocenter': '031-000-0000',
            }]}}}
        })
        service = TourismService(manager)
        with patch.object(tourism_api, 'tourism_service', service):
            response = self.client.get('/api/v1/tour/spots/126508?language=eng')
        payload = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload['data']['contentId'], '126508')
        self.assertEqual(payload['data']['overview'], '역사적인 명소입니다.')
        self.assertEqual(len(payload['data']['images']), 2)
        self.assertEqual(manager.languages, ['eng'])

    def test_invalid_content_id_returns_400(self):
        service = TourismService(DetailManager(response={'response': {}}))
        with patch.object(tourism_api, 'tourism_service', service):
            response = self.client.get('/api/v1/tour/spots/bad%20id')
        self.assertEqual(response.status_code, 400)

    def test_missing_detail_returns_404(self):
        service = TourismService(DetailManager(response={'response': {'body': {'items': {'item': []}}}}))
        with patch.object(tourism_api, 'tourism_service', service):
            response = self.client.get('/api/v1/tour/spots/999999')
        self.assertEqual(response.status_code, 404)

    def test_detail_external_failure_returns_502(self):
        service = TourismService(BrokenManager())
        with patch.object(tourism_api, 'tourism_service', service):
            response = self.client.get('/api/v1/tour/spots/126508')
        self.assertEqual(response.status_code, 502)

    def test_detail_without_images_is_successful(self):
        service = TourismService(DetailManager(response={
            'response': {'body': {'items': {'item': [{
                'contentid': '126508', 'title': '수원화성', 'addr1': '수원시'
            }]}}}
        }))
        with patch.object(tourism_api, 'tourism_service', service):
            response = self.client.get('/api/v1/tour/spots/126508')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['data']['images'], [])

    def test_detail_restores_local_curated_overview(self):
        service = TourismService(DetailManager(response={
            'response': {'body': {'items': {'item': [{
                'contentid': '126228', 'title': '화성행궁', 'overview': '',
            }]}}}
        }))
        detail = service.get_spot_detail('126228')
        self.assertIn('정조대왕', detail['overview'])

    def test_tour_api_items_normalizer_accepts_empty_and_single_shapes(self):
        self.assertEqual(TourAPIManager._normalize_items(None), [])
        self.assertEqual(TourAPIManager._normalize_items(''), [])
        self.assertEqual(TourAPIManager._normalize_items({}), [])
        self.assertEqual(TourAPIManager._normalize_items({'contentid': '1'}), [{'contentid': '1'}])
        self.assertEqual(TourAPIManager._normalize_items([{'contentid': '1'}, 'bad']), [{'contentid': '1'}])
        self.assertEqual(TourAPIManager._extract_items({'response': {'body': {'items': ''}}}), [])

    def test_library_is_not_mapped_to_museum(self):
        item = TourismService._normalize_item({
            'contentid': 'library-1', 'title': '수원시립도서관', 'contenttypeid': '14',
            'cat': 'museum', 'cat3': '도서관',
        })
        self.assertEqual(item['category'], 'library')

    def test_past_festival_is_filtered_by_event_end_date(self):
        items = [
            TourismService._normalize_item({
                'contentid': 'old-festival', 'title': '지난 축제', 'contenttypeid': '15',
                'cat': 'festival', 'eventenddate': '20250731',
            }),
            TourismService._normalize_item({
                'contentid': 'current-festival', 'title': '현재 축제', 'contenttypeid': '15',
                'cat': 'festival', 'eventenddate': '20991231',
            }),
        ]
        filtered = TourismService._final_temporal_validation(TourismService._filter_items(items, 'all', ''), date(2026, 8, 10))
        self.assertEqual([item['contentId'] for item in filtered], ['current-festival'])

    def test_past_festival_year_in_title_is_filtered_when_dates_are_missing(self):
        item = TourismService._normalize_item({
            'contentid': 'old-festival-title', 'title': '2025 수원 축제',
            'contenttypeid': '15', 'cat': 'festival',
        })
        filtered = TourismService._final_temporal_validation(
            TourismService._filter_items([item], 'all', ''), date(2026, 8, 10)
        )
        self.assertEqual(filtered, [])

    def test_final_temporal_gate_accepts_current_and_future_events_only(self):
        items = [
            TourismService._normalize_item({'contentid': 'old', 'title': '2025 축제', 'cat': 'festival', 'eventenddate': '20260501'}),
            TourismService._normalize_item({'contentid': 'ongoing', 'title': '여름 축제', 'cat': 'festival', 'eventstartdate': '20260801', 'eventenddate': '20260820'}),
            TourismService._normalize_item({'contentid': 'future', 'title': '가을 축제', 'cat': 'festival', 'eventstartdate': '20260901', 'eventenddate': '20260910'}),
            TourismService._normalize_item({'contentid': 'unknown', 'title': '정보 부족 축제', 'cat': 'festival'}),
            TourismService._normalize_item({'contentid': 'spot', 'title': '2025 일반 관광지', 'cat': 'heritage'}),
        ]
        result = TourismService._final_temporal_validation(items, date(2026, 8, 10))
        self.assertEqual({item['contentId'] for item in result}, {'ongoing', 'future', 'spot'})

    def test_local_seed_catalog_contains_core_suwon_spots(self):
        merged = TourAPIManager._merge_seed_items([], 'kor')
        titles = {item['title'] for item in merged}
        self.assertIn('화성행궁', titles)
        self.assertIn('방화수류정 (동북각루)', titles)
        self.assertIn('장안문', titles)

    def test_suwon_hwaseong_keyword_matches_core_heritage_spots(self):
        items = [TourismService._normalize_item(item) for item in TourAPIManager._merge_seed_items([], 'kor')]
        filtered = TourismService._filter_items(items, 'all', '수원화성')
        content_ids = {item['contentId'] for item in filtered}
        self.assertTrue({'126227', '126228', '126230'}.issubset(content_ids))

    def test_search_normalizes_unicode_and_spaces(self):
        items = [TourismService._normalize_item({
            'contentid': '1', 'title': '화성행궁', 'cat': 'heritage',
        })]
        filtered = TourismService._filter_items(items, 'all', '  화성  행궁 ')
        self.assertEqual([item['contentId'] for item in filtered], ['1'])

    def test_legacy_image_path_is_normalized_for_react(self):
        item = TourismService._normalize_item({
            'contentid': '126228', 'title': '화성행궁',
            'firstimage': '/static/images/hwaseong_haenggung.jpg',
            'firstimage2': '',
        })
        self.assertEqual(item['imageUrl'], '/images/hwaseong_haenggung.jpg')

    def test_local_api_merge_preserves_existing_api_image(self):
        merged = TourAPIManager._merge_seed_items([{
            'contentid': '126229', 'title': '창룡문',
            'firstimage': 'https://example.com/tour-api.jpg',
        }], 'kor')
        item = next(item for item in merged if item['contentid'] == '126229')
        self.assertEqual(item['firstimage'], 'https://example.com/tour-api.jpg')

    def test_local_api_merge_deduplicates_same_title_with_different_content_id(self):
        merged = TourAPIManager._merge_seed_items([{
            'contentid': 'api-museum', 'title': '수원화성박물관',
            'firstimage': 'https://example.com/museum.jpg',
        }], 'kor')
        matches = [item for item in merged if item.get('title') == '수원화성박물관']
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]['firstimage'], 'https://example.com/museum.jpg')

    def test_missing_firstimage_uses_firstimage2_in_detail_images(self):
        images = TourismService._build_images({
            'firstimage': '',
            'firstimage2': 'https://example.com/secondary.jpg',
        })
        self.assertEqual(images[0]['url'], 'https://example.com/secondary.jpg')

    def test_current_festival_snapshot_replaces_expired_edition(self):
        service = TourismService(FakeManager(), EnrichmentService())
        item = service.enrichment_service.enrich_item({
            'contentId': 'festival-1',
            'title': '2025 제62회 수원화성문화제',
            'category': 'festival',
            'eventStartDate': '20251001',
            'eventEndDate': '20251005',
            'address': '수원시',
        })
        self.assertEqual(item['title'], '제63회 수원화성문화제')
        self.assertEqual(item['eventStartDate'], '20261004')
        self.assertEqual(item['eventEndDate'], '20261011')
        self.assertEqual(item['enrichmentSource'], 'official_suwon')
        self.assertIn('visitsuwon.or.kr', item['sourceUrl'])

    def test_wikimedia_adapter_requests_license_metadata(self):
        params = WikimediaCommonsAdapter.build_search_params('Janganmun Suwon')
        self.assertEqual(params['prop'], 'imageinfo|info')
        self.assertEqual(params['iiprop'], 'url|extmetadata')
        self.assertEqual(params['gsrnamespace'], 6)


if __name__ == '__main__':
    unittest.main()
