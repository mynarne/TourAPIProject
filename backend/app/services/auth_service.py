import json
import sqlite3
import urllib.request
from urllib.parse import quote


class AuthServiceError(Exception):
    """인증 처리 중 발생한 일반 오류입니다."""


class InvalidCredentialError(AuthServiceError):
    """Google credential이 유효하지 않을 때 발생합니다."""


class AuthService:
    """기존 users 테이블과 Flask session에 필요한 인증 작업을 담당합니다."""

    def __init__(self, database_path, google_client_id=None, token_verifier=None):
        self.database_path = database_path
        self.google_client_id = google_client_id
        self.token_verifier = token_verifier or self._verify_google_token

    def _connect(self):
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        connection.execute('PRAGMA foreign_keys = ON')
        return connection

    def authenticate(self, credential):
        payload = self.token_verifier(credential)
        if not payload or not payload.get('sub'):
            raise InvalidCredentialError('Google credential이 유효하지 않습니다.')
        if self.google_client_id and payload.get('aud') and payload.get('aud') != self.google_client_id:
            raise InvalidCredentialError('Google credential 대상이 올바르지 않습니다.')

        values = (payload.get('sub'), payload.get('email'), payload.get('name') or '여행자', payload.get('picture'))
        connection = self._connect()
        try:
            row = connection.execute('SELECT id FROM users WHERE google_id = ?', (values[0],)).fetchone()
            if row:
                user_id = row['id']
                connection.execute('UPDATE users SET email = ?, name = ?, picture = ? WHERE id = ?', (*values[1:], user_id))
            else:
                cursor = connection.execute(
                    'INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)', values,
                )
                user_id = cursor.lastrowid
            connection.commit()
            return self.get_user(user_id)
        finally:
            connection.close()

    def get_user(self, user_id):
        connection = self._connect()
        try:
            row = connection.execute(
                'SELECT id, email, name, picture FROM users WHERE id = ?', (user_id,),
            ).fetchone()
            return dict(row) if row else None
        finally:
            connection.close()

    def sync(self, user_id, data):
        if not isinstance(data, dict):
            raise ValueError('요청 본문이 올바르지 않습니다.')
        saved_places = data.get('savedPlaces', [])
        visit_records = data.get('visitRecords', [])
        if not isinstance(saved_places, list) or not isinstance(visit_records, list):
            raise ValueError('동기화 데이터 형식이 올바르지 않습니다.')
        if len(saved_places) > 500 or len(visit_records) > 500:
            raise ValueError('동기화 항목이 너무 많습니다.')

        connection = self._connect()
        try:
            existing_records = {
                (row['contentid'], row['visit_date'], row['memo'])
                for row in connection.execute(
                    'SELECT contentid, visit_date, memo FROM visit_records WHERE user_id = ?', (user_id,)
                ).fetchall()
            }
            for place in saved_places:
                if not isinstance(place, dict) or not place.get('contentid'):
                    continue
                connection.execute(
                    '''INSERT OR IGNORE INTO saved_places
                       (user_id, contentid, title, firstimage, addr1) VALUES (?, ?, ?, ?, ?)''',
                    (user_id, str(place['contentid'])[:100], str(place.get('title') or '')[:200],
                     str(place.get('firstimage') or '')[:2000], str(place.get('addr1') or '')[:500]),
                )
            for record in visit_records:
                if not isinstance(record, dict) or not record.get('contentid') or not record.get('visit_date'):
                    continue
                record_key = (str(record['contentid'])[:100], str(record['visit_date'])[:10], str(record.get('memo') or '')[:2000])
                if record_key in existing_records:
                    continue
                connection.execute(
                    '''INSERT OR IGNORE INTO visit_records
                       (user_id, contentid, title, visit_date, firstimage, memo, lang, custom_image)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                    (user_id, record_key[0], str(record.get('title') or '')[:200],
                     record_key[1], str(record.get('firstimage') or '')[:2000],
                     record_key[2], str(record.get('lang') or 'kor')[:3],
                     str(record.get('custom_image') or '')[:2000]),
                )
                existing_records.add(record_key)
            saved = [dict(row) for row in connection.execute(
                'SELECT contentid, title, firstimage, addr1 FROM saved_places WHERE user_id = ?', (user_id,)
            ).fetchall()]
            records = []
            for row in connection.execute(
                '''SELECT id, contentid, title, visit_date, firstimage, memo, lang, custom_image
                   FROM visit_records WHERE user_id = ? ORDER BY id DESC''', (user_id,)
            ).fetchall():
                item = dict(row)
                item['id'] = f"log_{row['id']}"
                records.append(item)
            connection.commit()
            return {'savedPlaces': saved, 'visitRecords': records}
        finally:
            connection.close()

    def delete_account(self, user_id):
        connection = self._connect()
        try:
            custom_images = [row['custom_image'] for row in connection.execute(
                'SELECT custom_image FROM visit_records WHERE user_id = ? AND custom_image IS NOT NULL', (user_id,)
            ).fetchall()]
            connection.execute('DELETE FROM saved_places WHERE user_id = ?', (user_id,))
            connection.execute('DELETE FROM visit_records WHERE user_id = ?', (user_id,))
            connection.execute('DELETE FROM users WHERE id = ?', (user_id,))
            connection.commit()
            return custom_images
        finally:
            connection.close()

    @staticmethod
    def _verify_google_token(credential):
        try:
            url = f'https://oauth2.googleapis.com/tokeninfo?id_token={quote(credential)}'
            with urllib.request.urlopen(urllib.request.Request(url), timeout=8) as response:
                payload = json.loads(response.read().decode('utf-8'))
            return None if payload.get('error_description') else payload
        except Exception as error:
            raise AuthServiceError('Google credential 검증에 실패했습니다.') from error
