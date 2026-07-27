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
            firstimage TEXT,
            memo TEXT,
            lang TEXT,
            custom_image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # 4. 공유 코스 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shared_courses (
            share_id TEXT PRIMARY KEY,
            overall_review TEXT,
            records_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 5. 명소별 실시간 한줄 톡 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS spot_talks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contentid TEXT NOT NULL,
            nickname TEXT NOT NULL,
            message TEXT NOT NULL,
            congestion TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 하위 호환 마이그레이션: 기존 테이블에 custom_image 또는 firstimage 컬럼이 없는 경우 추가
    try:
        cursor.execute("SELECT custom_image FROM visit_records LIMIT 1")
    except sqlite3.OperationalError:
        try:
            cursor.execute("ALTER TABLE visit_records ADD COLUMN custom_image TEXT")
            print("🚀 [MIGRATION] visit_records 테이블에 custom_image 컬럼이 안전하게 추가되었습니다.")
        except Exception as e:
            print(f"❌ [MIGRATION WARNING] {e}")
            
    try:
        cursor.execute("SELECT firstimage FROM visit_records LIMIT 1")
    except sqlite3.OperationalError:
        try:
            cursor.execute("ALTER TABLE visit_records ADD COLUMN firstimage TEXT")
            print("🚀 [MIGRATION] visit_records 테이블에 firstimage 컬럼이 안전하게 추가되었습니다.")
        except Exception as e:
            print(f"❌ [MIGRATION WARNING] {e}")
    
    conn.commit()
    conn.close()
    print("✅ [INFO] SQLite 데이터베이스 및 테이블이 성공적으로 초기화되었습니다.")
