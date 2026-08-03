import io
import os
import sqlite3
import tempfile
import unittest

from app import create_app
from app.services.records_service import RecordsService
import app.api.records as records_api


class RecordsApiTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path = os.path.join(self.temp_dir.name, 'test.db')
        self.upload_path = os.path.join(self.temp_dir.name, 'uploads')
        connection = sqlite3.connect(self.database_path)
        connection.execute('''CREATE TABLE visit_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
            contentid TEXT NOT NULL, title TEXT, visit_date TEXT, firstimage TEXT,
            memo TEXT, lang TEXT, custom_image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        connection.commit()
        connection.close()

        class TestConfig:
            SECRET_KEY = 'test-secret'
            DATABASE_PATH = self.database_path
            UPLOAD_FOLDER = self.upload_path
            MAX_CONTENT_LENGTH = 1024 * 1024
            NVIDIA_API_KEY = None
            NVIDIA_BASE_URL = 'https://example.invalid'
            NVIDIA_MODEL = 'test-model'

        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        records_api.records_service = RecordsService(self.database_path)

    def tearDown(self):
        records_api.records_service = None
        self.temp_dir.cleanup()

    def login(self, user_id=7):
        with self.client.session_transaction() as session:
            session['user_id'] = user_id

    def test_requires_login(self):
        response = self.client.get('/api/v1/records')
        self.assertEqual(response.status_code, 401)

    def test_crud_and_owner_check(self):
        self.login()
        created = self.client.post('/api/v1/records', json={
            'title': '수원화성 야경', 'contentId': '126508',
            'visitedAt': '2026-08-01', 'memo': '성곽길을 걸었다.', 'language': 'kor',
        })
        self.assertEqual(created.status_code, 201)
        record_id = created.get_json()['data']['id']

        listed = self.client.get('/api/v1/records')
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.get_json()['data'][0]['placeName'], '수원화성 야경')

        updated = self.client.patch(f'/api/v1/records/{record_id}', json={'memo': '야간 산책 기록'})
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.get_json()['data']['memo'], '야간 산책 기록')

        with self.client.session_transaction() as session:
            session['user_id'] = 8
        self.assertEqual(self.client.get(f'/api/v1/records/{record_id}').status_code, 404)

        with self.client.session_transaction() as session:
            session['user_id'] = 7
        self.assertEqual(self.client.delete(f'/api/v1/records/{record_id}').status_code, 200)
        self.assertEqual(self.client.get(f'/api/v1/records/{record_id}').status_code, 404)

    def test_invalid_input_and_upload_extension(self):
        self.login()
        invalid = self.client.post('/api/v1/records', json={'title': '', 'visitedAt': 'bad'})
        self.assertEqual(invalid.status_code, 400)
        upload = self.client.post('/api/v1/records/upload', data={'file': (io.BytesIO(b'not an image'), 'note.txt')}, content_type='multipart/form-data')
        self.assertEqual(upload.status_code, 400)

    def test_upload_success_uses_generated_filename(self):
        self.login()
        upload = self.client.post('/api/v1/records/upload', data={'file': (io.BytesIO(b'image bytes'), 'memory.jpg')}, content_type='multipart/form-data')
        self.assertEqual(upload.status_code, 201)
        url = upload.get_json()['data']['url']
        self.assertTrue(url.startswith('/static/uploads/'))
        self.assertTrue(os.path.exists(os.path.join(self.upload_path, os.path.basename(url))))


if __name__ == '__main__':
    unittest.main()
