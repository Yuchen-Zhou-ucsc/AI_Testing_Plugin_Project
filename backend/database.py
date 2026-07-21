import sqlite3
from pathlib import Path


# 获取 backend 文件夹的绝对路径
BASE_DIR = Path(__file__).resolve().parent

# 数据库文件将保存在 backend 文件夹中
DATABASE_PATH = BASE_DIR / "users.db"


def get_database_connection():
    """
    创建并返回 SQLite 数据库连接。
    row_factory 让查询结果可以通过字段名读取。
    """
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    """
    如果 users 表不存在，则创建 users 表。
    """
    connection = get_database_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    connection.commit()
    connection.close()

    print(f"Database initialized: {DATABASE_PATH}")


if __name__ == "__main__":
    initialize_database()