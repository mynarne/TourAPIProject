import unittest
from unittest.mock import patch, MagicMock
from app import create_app
from app.services import exchange_service


class ExchangeApiTestCase(unittest.TestCase):
    def setUp(self):
        class TestConfig:
            SECRET_KEY = 'exchange-test-secret'
            TESTING = True

        self.app = create_app(TestConfig)
        self.client = self.app.test_client()

    def tearDown(self):
        exchange_service._exchange_cache = None
        exchange_service._last_fetch_time = 0

    def test_exchange_endpoint_returns_200_and_schema(self):
        response = self.client.get('/api/v1/exchange')
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertTrue(payload['success'])
        data = payload['data']
        self.assertIn('status', data)
        self.assertIn('USD', data)
        self.assertIn('JPY', data)
        self.assertIn('CNY', data)
        self.assertIn('TWD', data)

    @patch('app.services.exchange_service.requests.get')
    def test_exchange_service_parses_rates_correctly(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = '''
        <table>
            <tr><a href="/detail?marketindexCd=FX_USDKRW" class="tit">미국</a><td class="sale">1,380.50</td></tr>
            <tr><a href="/detail?marketindexCd=FX_JPYKRW" class="tit">일본</a><td class="sale">915.20</td></tr>
            <tr><a href="/detail?marketindexCd=FX_CNYKRW" class="tit">중국</a><td class="sale">192.30</td></tr>
            <tr><a href="/detail?marketindexCd=FX_TWDKRW" class="tit">대만</a><td class="sale">43.10</td></tr>
        </table>
        '''
        mock_get.return_value = mock_response

        data = exchange_service.get_suwon_exchange_rates()
        self.assertEqual(data['status'], 'fresh')
        self.assertEqual(data['USD'], '1380.50')
        self.assertEqual(data['JPY'], '915.20')
        self.assertEqual(data['CNY'], '192.30')
        self.assertEqual(data['TWD'], '43.10')
        self.assertEqual(data['units']['JPY'], '100 JPY')

    @patch('app.services.exchange_service.requests.get')
    def test_exchange_service_failure_returns_unavailable_without_fake_rates(self, mock_get):
        mock_get.side_effect = Exception("Scraping Failure")

        data = exchange_service.get_suwon_exchange_rates()
        self.assertEqual(data['status'], 'unavailable')
        self.assertIsNone(data['USD'])
        self.assertIsNone(data['JPY'])
        self.assertEqual(data['units']['JPY'], '100 JPY')
