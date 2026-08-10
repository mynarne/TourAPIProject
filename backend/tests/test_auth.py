import os
import sqlite3
import tempfile
import unittest

from app import create_app
from app.services.auth_service import AuthService
import app.api.auth as auth_api


class AuthApiTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path = os.path.join(self.temp_dir.name, 'auth.db')
        self.upload_path = os.path.join(self.temp_dir.name, 'uploads')
        connection = sqlite3.connect(self.database_path)
        connection.executescript('''
            CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, google_id TEXT UNIQUE NOT NULL, email TEXT, name TEXT, picture TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE saved_places (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, contentid TEXT NOT NULL, title TEXT, firstimage TEXT, addr1 TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE visit_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, contentid TEXT NOT NULL, title TEXT, visit_date TEXT, firstimage TEXT, memo TEXT, lang TEXT, custom_image TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE shared_courses (share_id TEXT PRIMARY KEY, overall_review TEXT, records_json TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
        ''')
        connection.commit(); connection.close()

        class TestConfig:
            SECRET_KEY = 'auth-test-secret'
            DATABASE_PATH = self.database_path
            UPLOAD_FOLDER = self.upload_path
            UPLOAD_URL_PREFIX = '/uploads'
            GOOGLE_CLIENT_ID = 'google-client-id'
            SESSION_COOKIE_HTTPONLY = True
            SESSION_COOKIE_SECURE = False
            SESSION_COOKIE_SAMESITE = 'Lax'
            MAX_CONTENT_LENGTH = 1024 * 1024

        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        auth_api.auth_service = AuthService(self.database_path, 'google-client-id', token_verifier=lambda token: {
            'sub': 'google-1', 'email': 'one@example.com', 'name': 'One', 'picture': 'https://example.com/one.png', 'aud': 'google-client-id',
        } if token == 'valid' else None)

    def tearDown(self):
        auth_api.auth_service = None
        self.temp_dir.cleanup()

    def test_me_anonymous_is_normalized_to_200(self):
        response = self.client.get('/api/v1/auth/me')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.get_json()['data']['authenticated'])

    def test_missing_secret_key_fails_fast(self):
        class MissingSecretConfig:
            SECRET_KEY = None

        with self.assertRaisesRegex(RuntimeError, 'SECRET_KEY'):
            create_app(MissingSecretConfig)

    def test_login_session_logout_and_me(self):
        login = self.client.post('/api/v1/auth/login', json={'credential': 'valid'})
        self.assertEqual(login.status_code, 200)
        self.assertTrue(login.get_json()['data']['authenticated'])
        me = self.client.get('/api/v1/auth/me')
        self.assertEqual(me.get_json()['data']['user']['email'], 'one@example.com')
        self.assertEqual(self.client.post('/api/v1/auth/logout').status_code, 200)
        self.assertFalse(self.client.get('/api/v1/auth/me').get_json()['data']['authenticated'])

    def test_invalid_login_and_cross_origin_mutation(self):
        self.assertEqual(self.client.post('/api/v1/auth/login', json={'credential': 'bad'}).status_code, 401)
        self.client.post('/api/v1/auth/login', json={'credential': 'valid'})
        response = self.client.post('/api/v1/auth/logout', headers={'Origin': 'https://evil.example'})
        self.assertEqual(response.status_code, 403)

    def test_sync_and_account_delete_are_user_scoped(self):
        self.client.post('/api/v1/auth/login', json={'credential': 'valid'})
        synced = self.client.post('/api/v1/auth/sync', json={
            'savedPlaces': [{'contentid': '126508', 'title': '수원화성'}],
            'visitRecords': [{'contentid': '126508', 'title': '수원화성', 'visit_date': '2026-08-02', 'memo': '기록'}],
        })
        self.assertEqual(synced.status_code, 200)
        self.assertEqual(len(synced.get_json()['data']['visitRecords']), 1)
        repeated = self.client.post('/api/v1/auth/sync', json={
            'savedPlaces': [],
            'visitRecords': [{'contentid': '126508', 'title': '수원화성', 'visit_date': '2026-08-02', 'memo': '기록'}],
        })
        self.assertEqual(len(repeated.get_json()['data']['visitRecords']), 1)
        self.assertEqual(self.client.delete('/api/v1/auth/account').status_code, 200)
        self.assertFalse(self.client.get('/api/v1/auth/me').get_json()['data']['authenticated'])
        connection = sqlite3.connect(self.database_path)
        self.assertEqual(connection.execute('SELECT COUNT(*) FROM users').fetchone()[0], 0)
        self.assertEqual(connection.execute('SELECT COUNT(*) FROM visit_records').fetchone()[0], 0)
        connection.close()


if __name__ == '__main__':
    unittest.main()
