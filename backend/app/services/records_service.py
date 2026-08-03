from datetime import date
import os
import re

from ..repositories.records_repository import RecordsRepository


SUPPORTED_LANGUAGES = {'kor', 'eng', 'jpn', 'chs', 'cht'}
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_TEXT_LENGTH = 2000


class RecordsValidationError(ValueError):
    """기록 입력값이 정책에 맞지 않을 때 발생합니다."""


class RecordNotFoundError(Exception):
    """사용자에게 속한 기록을 찾지 못했을 때 발생합니다."""


class RecordsService:
    """기존 visit_records 스키마를 새 REST 응답으로 정규화합니다."""

    def __init__(self, database_path, tourism_service=None):
        self.repository = RecordsRepository(database_path)
        self.tourism_service = tourism_service

    def list_records(self, user_id, language='kor'):
        self._validate_language(language)
        return [self._normalize(row, language) for row in self.repository.list_by_user(user_id)]

    def get_record(self, user_id, record_id, language='kor'):
        self._validate_language(language)
        record = self.repository.get_by_user(user_id, self._parse_id(record_id))
        if not record:
            raise RecordNotFoundError()
        return self._normalize(record, language)

    def create_record(self, user_id, payload):
        values = self._validate_payload(payload, partial=False)
        return self._normalize(self.repository.create(user_id, values), values['language'])

    def update_record(self, user_id, record_id, payload):
        record_id = self._parse_id(record_id)
        if not self.repository.get_by_user(user_id, record_id):
            raise RecordNotFoundError()
        values = self._validate_payload(payload, partial=True)
        if not values:
            raise RecordsValidationError('수정할 내용이 없습니다.')
        updated = self.repository.update(user_id, record_id, values)
        return self._normalize(updated, values.get('lang', 'kor'))

    def delete_record(self, user_id, record_id):
        if not self.repository.delete(user_id, self._parse_id(record_id)):
            raise RecordNotFoundError()

    @staticmethod
    def _parse_id(record_id):
        if not re.fullmatch(r'\d{1,12}', str(record_id or '')):
            raise RecordsValidationError('기록 ID 형식이 올바르지 않습니다.')
        return int(record_id)

    @staticmethod
    def _validate_language(language):
        if language not in SUPPORTED_LANGUAGES:
            raise RecordsValidationError('지원하지 않는 언어입니다.')

    def _validate_payload(self, payload, partial):
        if not isinstance(payload, dict):
            raise RecordsValidationError('요청 본문이 올바르지 않습니다.')
        values = {}
        if not partial or 'contentId' in payload:
            values['contentId' if not partial else 'contentid'] = self._text(payload.get('contentId', ''), 100)
        if not partial or 'title' in payload:
            title = self._text(payload.get('title', ''), 200)
            if not title:
                raise RecordsValidationError('장소명 또는 제목을 입력해 주세요.')
            values['title'] = title
        if not partial or 'visitedAt' in payload:
            visited_at = self._text(payload.get('visitedAt', ''), 10) or date.today().isoformat()
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', visited_at):
                raise RecordsValidationError('방문 날짜 형식이 올바르지 않습니다.')
            values['visitedAt' if not partial else 'visit_date'] = visited_at

        mapping = {
            'imageUrl': 'imageUrl' if not partial else 'firstimage',
            'memo': 'memo',
            'language': 'language' if not partial else 'lang',
            'customImage': 'customImage' if not partial else 'custom_image',
        }
        for source, target in mapping.items():
            if source in payload:
                values[target] = self._text(payload.get(source, ''), MAX_TEXT_LENGTH)

        if not partial:
            values.setdefault('imageUrl', '')
            values.setdefault('memo', '')
            values.setdefault('language', 'kor')
            values.setdefault('customImage', '')
            self._validate_language(values['language'])
        elif 'lang' in values:
            self._validate_language(values['lang'])
        return values

    def _normalize(self, row, language='kor'):
        image_url = row.get('custom_image') or row.get('firstimage') or None
        result = {
            'id': row['id'],
            'title': row.get('title') or '',
            'placeName': row.get('title') or '',
            'contentId': row.get('contentid') or '',
            'visitedAt': row.get('visit_date') or '',
            'summary': row.get('memo') or '',
            'memo': row.get('memo') or '',
            'location': '',
            'latitude': None,
            'longitude': None,
            'imageUrl': image_url,
            'images': [image_url] if image_url else [],
            'tags': [],
            'language': row.get('lang') or language,
            'createdAt': row.get('created_at'),
            'updatedAt': row.get('created_at'),
        }
        if self.tourism_service and result['contentId']:
            try:
                spot = self.tourism_service.get_spot_detail(result['contentId'], language=language)
                result['location'] = spot.get('address', '')
                result['latitude'] = spot.get('latitude')
                result['longitude'] = spot.get('longitude')
                if not image_url and spot.get('imageUrl'):
                    result['imageUrl'] = spot['imageUrl']
                    result['images'] = [spot['imageUrl']]
            except Exception:
                pass
        return result

    @staticmethod
    def _text(value, max_length):
        if value is None:
            return ''
        value = str(value).strip()
        if len(value) > max_length:
            raise RecordsValidationError('입력값이 너무 깁니다.')
        return value

    @staticmethod
    def is_allowed_extension(filename):
        extension = os.path.splitext(filename or '')[1].lower().lstrip('.')
        return extension in ALLOWED_EXTENSIONS
