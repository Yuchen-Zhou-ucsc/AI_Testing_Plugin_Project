import sqlite3
from pathlib import Path

from werkzeug.security import generate_password_hash


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "users.db"


def get_database_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_database_connection()

    try:
        table_exists = connection.execute(
            """
            SELECT name
            FROM sqlite_master
            WHERE type = 'table' AND name = 'users'
            """
        ).fetchone()

        # 第一次运行：创建使用 password_hash 的新表
        if table_exists is None:
            connection.execute(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

        else:
            columns = {
                row["name"]
                for row in connection.execute(
                    "PRAGMA table_info(users)"
                ).fetchall()
            }

            # 升级旧数据库：把 password 字段改名为 password_hash
            if "password" in columns and "password_hash" not in columns:
                connection.execute(
                    """
                    ALTER TABLE users
                    RENAME COLUMN password TO password_hash
                    """
                )

                # 把已有账号的明文密码转换成不可逆哈希
                existing_users = connection.execute(
                    """
                    SELECT id, password_hash
                    FROM users
                    """
                ).fetchall()

                for user in existing_users:
                    hashed_password = generate_password_hash(
                        user["password_hash"]
                    )

                    connection.execute(
                        """
                        UPDATE users
                        SET password_hash = ?
                        WHERE id = ?
                        """,
                        (hashed_password, user["id"])
                    )

        connection.commit()

    finally:
        connection.close()

    print(f"Database initialized: {DATABASE_PATH}")


if __name__ == "__main__":
    initialize_database()