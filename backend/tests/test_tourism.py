import unittest
from unittest.mock import patch

from app import create_app
from app.api import tourism as tourism_api
from app.services.tourism_service import TourismService, TourismServiceError


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
        self.app = create_app({'TESTING': True})
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


if __name__ == '__main__':
    unittest.main()
