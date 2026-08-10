import unittest
from unittest.mock import patch, MagicMock
from app import create_app
from app.services import weather_service


class WeatherApiTestCase(unittest.TestCase):
    def setUp(self):
        class TestConfig:
            SECRET_KEY = 'weather-test-secret'
            TESTING = True

        self.app = create_app(TestConfig)
        self.client = self.app.test_client()

    def tearDown(self):
        weather_service._weather_cache = None
        weather_service._last_fetch_time = 0

    def test_weather_endpoint_returns_200_and_schema(self):
        response = self.client.get('/api/v1/weather')
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertTrue(payload['success'])
        data = payload['data']
        self.assertIn('status', data)
        self.assertIn('temp', data)
        self.assertIn('condition', data)
        self.assertIn('desc', data)

    @patch('app.services.weather_service.requests.get')
    def test_weather_service_success_parses_fresh_data(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'current_condition': [{
                'temp_C': '22',
                'weatherDesc': [{'value': 'Sunny'}]
            }]
        }
        mock_get.return_value = mock_response

        data = weather_service.get_suwon_weather()
        self.assertEqual(data['status'], 'fresh')
        self.assertEqual(data['temp'], '22')
        self.assertEqual(data['condition'], 'sunny')

    @patch('app.services.weather_service.requests.get')
    def test_weather_service_failure_returns_unavailable_when_no_cache(self, mock_get):
        mock_get.side_effect = Exception("Network Timeout")

        data = weather_service.get_suwon_weather()
        self.assertEqual(data['status'], 'unavailable')
        self.assertIsNone(data['temp'])

    @patch('app.services.weather_service.requests.get')
    def test_weather_service_failure_returns_stale_when_has_cache(self, mock_get):
        weather_service._weather_cache = {
            'status': 'fresh',
            'temp': '20',
            'condition': 'cloudy',
            'desc': 'Cloudy',
            'fetched_at': 1000
        }
        weather_service._last_fetch_time = 0
        mock_get.side_effect = Exception("Network Timeout")

        data = weather_service.get_suwon_weather()
        self.assertEqual(data['status'], 'stale')
        self.assertEqual(data['temp'], '20')
