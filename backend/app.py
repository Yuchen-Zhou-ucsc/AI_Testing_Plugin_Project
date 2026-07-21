import sqlite3

from flask import Flask, jsonify, request

from database import get_database_connection, initialize_database


# 创建 Flask 后端应用
app = Flask(__name__)

# 启动程序时确保数据库和 users 表存在
initialize_database()


# 浏览器访问首页时返回测试信息
@app.get("/")
def home():
    return jsonify({
        "message": "Backend is running"
    })


# 健康检查接口
@app.get("/api/health")
def health_check():
    return jsonify({
        "status": "success",
        "message": "Flask backend is running"
    })


# 用户注册接口
@app.post("/api/register")
def register():
    # 获取前端发送的 JSON 数据
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "status": "error",
            "message": "Request body must be JSON"
        }), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    # 检查用户名和密码是否为空
    if not username or not password:
        return jsonify({
            "status": "error",
            "message": "Username and password are required"
        }), 400

    # 注意：这里故意不检查用户名是否达到 6 位
    # 这是项目中预埋的业务规则 Bug

    connection = get_database_connection()

    try:
        connection.execute(
            """
            INSERT INTO users (username, password)
            VALUES (?, ?)
            """,
            (username, password)
        )
        connection.commit()

    except sqlite3.IntegrityError:
        return jsonify({
            "status": "error",
            "message": "Username already exists"
        }), 409

    finally:
        connection.close()

    return jsonify({
        "status": "success",
        "message": "Registration successful"
    }), 201

# 用户登录接口
@app.post("/api/login")
def login():
    # 获取前端发送的 JSON 数据
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "status": "error",
            "message": "Request body must be JSON"
        }), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    # 检查用户名和密码是否为空
    if not username or not password:
        return jsonify({
            "status": "error",
            "message": "Username and password are required"
        }), 400

    connection = get_database_connection()

    user = connection.execute(
        """
        SELECT id, username, password
        FROM users
        WHERE username = ?
        """,
        (username,)
    ).fetchone()

    connection.close()

    # 检查用户是否存在，以及密码是否正确
    if user is None or user["password"] != password:
        return jsonify({
            "status": "error",
            "message": "Invalid username or password"
        }), 401

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "username": user["username"]
        }
    }), 200

# 直接运行 app.py 时启动后端服务器
if __name__ == "__main__":
    app.run(debug=True, port=5000)