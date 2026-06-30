import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'linksuwon.db')

def get_db_connection():
    """
    SQLite 데이터베이스 커넥션을 반환합니다.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    데이터베이스 테이블을 생성하고 초기화합니다.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. 사용자 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_id TEXT UNIQUE NOT NULL,
            email TEXT,
            name TEXT,
            picture TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 2. 즐겨찾기(찜) 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            contentid TEXT NOT NULL,
            title TEXT,
            firstimage TEXT,
            addr1 TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(user_id, contentid)
        )
    ''')
    
    # 3. 여행 기록(방문 기록) 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS visit_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            contentid TEXT NOT NULL,
            title TEXT,
            visit_date TEXT,
            memo TEXT,
            lang TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ [INFO] SQLite 데이터베이스 및 테이블이 성공적으로 초기화되었습니다.")
