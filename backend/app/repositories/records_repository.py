import sqlite3


class RecordsRepository:
    """기존 LinkSuwon SQLite의 visit_records에 접근하는 저장소입니다."""

    def __init__(self, database_path):
        self.database_path = database_path

    def _connect(self):
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        connection.execute('PRAGMA foreign_keys = ON')
        return connection

    def list_by_user(self, user_id):
        connection = self._connect()
        try:
            rows = connection.execute(
                '''SELECT id, contentid, title, visit_date, firstimage, memo, lang,
                          custom_image, created_at
                   FROM visit_records WHERE user_id = ?
                   ORDER BY visit_date DESC, id DESC''',
                (user_id,),
            ).fetchall()
            return [dict(row) for row in rows]
        finally:
            connection.close()

    def get_by_user(self, user_id, record_id):
        connection = self._connect()
        try:
            row = connection.execute(
                '''SELECT id, contentid, title, visit_date, firstimage, memo, lang,
                          custom_image, created_at
                   FROM visit_records WHERE id = ? AND user_id = ?''',
                (record_id, user_id),
            ).fetchone()
            return dict(row) if row else None
        finally:
            connection.close()

    def create(self, user_id, values):
        connection = self._connect()
        try:
            cursor = connection.execute(
                '''INSERT INTO visit_records
                   (user_id, contentid, title, visit_date, firstimage, memo, lang, custom_image)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                (user_id, values['contentId'], values['title'], values['visitedAt'],
                 values['imageUrl'], values['memo'], values['language'], values['customImage']),
            )
            connection.commit()
            return self.get_by_user(user_id, cursor.lastrowid)
        finally:
            connection.close()

    def update(self, user_id, record_id, values):
        connection = self._connect()
        try:
            assignments = []
            parameters = []
            for column, value in values.items():
                assignments.append(f'{column} = ?')
                parameters.append(value)
            if not assignments:
                return self.get_by_user(user_id, record_id)
            parameters.extend([record_id, user_id])
            connection.execute(
                f'UPDATE visit_records SET {", ".join(assignments)} WHERE id = ? AND user_id = ?',
                parameters,
            )
            connection.commit()
            return self.get_by_user(user_id, record_id)
        finally:
            connection.close()

    def delete(self, user_id, record_id):
        connection = self._connect()
        try:
            cursor = connection.execute(
                'DELETE FROM visit_records WHERE id = ? AND user_id = ?',
                (record_id, user_id),
            )
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()
