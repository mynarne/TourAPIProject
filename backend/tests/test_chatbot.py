import unittest
from types import SimpleNamespace
from unittest.mock import patch

from app import create_app
from app.api import chatbot as chatbot_api
from app.services.chatbot_service import ChatbotService


def completion(message):
    return SimpleNamespace(choices=[SimpleNamespace(message=message)])


class FakeClient:
    def __init__(self, responses):
        self.responses = iter(responses)
        self.calls = []
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=self.create))

    def create(self, **kwargs):
        self.calls.append({**kwargs, 'messages': list(kwargs['messages'])})
        return next(self.responses)


class FakeTourismService:
    def get_spots(self, **kwargs):
        return {'items': [{'contentId': '126228', 'title': '화성행궁', 'address': '수원시 팔달구', 'latitude': 37.2823, 'longitude': 127.0141}], 'pagination': {}}

    def get_spot_detail(self, content_id, **kwargs):
        return {'contentId': content_id, 'title': '화성행궁', 'overview': '수원화성의 대표 명소입니다.', 'address': '수원시 팔달구'}


class FakeTrafficService:
    def get_traffic_data(self, language):
        return {'guides': {'cards': {'title': '교통카드', 'items': []}}, 'destinations': []}


class ChatbotApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app({'TESTING': True})
        self.client = self.app.test_client()

    def test_successful_gpt_response(self):
        client = FakeClient([completion(SimpleNamespace(content='수원화성은 아름다운 역사 명소입니다.', tool_calls=None))])
        service = ChatbotService(client=client, tourism_service=FakeTourismService(), traffic_service=FakeTrafficService())
        with patch.object(chatbot_api, 'chatbot_service', service):
            response = self.client.post('/api/v1/chatbot/messages', json={'message': '수원화성 알려줘', 'language': 'kor'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['data']['provider'], 'nvidia')
        self.assertEqual(len(client.calls), 1)

    def test_tool_call_is_executed_before_final_response(self):
        tool_call = SimpleNamespace(id='call-1', function=SimpleNamespace(name='get_suwon_transport_guide', arguments='{"topic":"교통카드"}'))
        client = FakeClient([
            completion(SimpleNamespace(content=None, tool_calls=[tool_call])),
            completion(SimpleNamespace(content='T-money는 편의점과 지하철역에서 충전할 수 있습니다.', tool_calls=None)),
        ])
        service = ChatbotService(client=client, tourism_service=FakeTourismService(), traffic_service=FakeTrafficService())
        result = service.answer('교통카드 발급 방법 알려줘', 'kor')
        self.assertIn('T-money', result['message'])
        self.assertEqual(len(client.calls), 2)
        self.assertEqual(client.calls[1]['messages'][-1]['role'], 'tool')

    def test_invalid_request_returns_400(self):
        response = self.client.post('/api/v1/chatbot/messages', json={'message': '   ', 'language': 'kor'})
        self.assertEqual(response.status_code, 400)

    def test_invalid_language_returns_400(self):
        response = self.client.post('/api/v1/chatbot/messages', json={'message': 'hello', 'language': 'fr'})
        self.assertEqual(response.status_code, 400)

    def test_missing_api_key_returns_503(self):
        service = ChatbotService(client=None, tourism_service=FakeTourismService(), traffic_service=FakeTrafficService())
        with patch.object(chatbot_api, 'chatbot_service', service):
            response = self.client.post('/api/v1/chatbot/messages', json={'message': '수원 추천해줘', 'language': 'kor'})
        self.assertEqual(response.status_code, 503)

    def test_course_metadata_is_normalized(self):
        client = FakeClient([completion(SimpleNamespace(content='추천 일정입니다.\n[COURSE_DATA: {"title":"수원 코스","places":["화성행궁","방화수류정"]}]', tool_calls=None))])
        service = ChatbotService(client=client, tourism_service=FakeTourismService(), traffic_service=FakeTrafficService())
        result = service.answer('하루 코스 짜줘', 'kor')
        self.assertEqual(result['course']['title'], '수원 코스')
        self.assertNotIn('COURSE_DATA', result['message'])


if __name__ == '__main__':
    unittest.main()
