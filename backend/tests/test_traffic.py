import unittest
from unittest.mock import patch

from app import create_app
from app.api import traffic as traffic_api
from app.services.traffic_service import TrafficService


class TrafficApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app({'TESTING': True})
        self.client = self.app.test_client()

    def test_traffic_returns_localized_destinations_and_guides(self):
        response = self.client.get('/api/v1/traffic?language=eng')
        payload = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(payload['success'])
        self.assertEqual(payload['data']['destinations'][0]['name'], 'Suwon Station')
        self.assertIn('cards', payload['data']['guides'])

    def test_invalid_language_returns_400(self):
        response = self.client.get('/api/v1/traffic?language=fr')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.get_json()['success'])

    def test_service_failure_returns_500(self):
        broken_service = type('BrokenTrafficService', (), {
            'get_traffic_data': lambda self, language: (_ for _ in ()).throw(RuntimeError('데이터 오류')),
        })()
        with patch.object(traffic_api, 'traffic_service', broken_service):
            response = self.client.get('/api/v1/traffic')
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.get_json()['message'], '교통 정보를 처리하지 못했습니다.')

    def test_service_rejects_invalid_language(self):
        with self.assertRaises(ValueError):
            TrafficService().get_traffic_data('fr')


if __name__ == '__main__':
    unittest.main()
