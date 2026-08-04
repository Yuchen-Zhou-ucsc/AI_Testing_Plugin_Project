import sqlite3

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI
from pydantic import BaseModel, ValidationError

from database import get_database_connection, initialize_database

# 定义注册接口请求体的固定结构
class RegisterRequestBody(BaseModel):
    username: str
    password: str

# 定义单条测试用例的固定数据结构
class GeneratedTestCase(BaseModel):
    test_case_id: str
    test_scenario: str
    preconditions: str
    test_steps: list[str]
    test_data: str
    expected_result: str

    # 自动执行测试所需的信息
    request_method: str
    request_url: str
    request_body: RegisterRequestBody
    expected_status_code: int


# 定义 AI 返回的测试用例列表
class GeneratedTestCases(BaseModel):
    test_cases: list[GeneratedTestCase]

# 读取 backend/.env 中的环境变量
load_dotenv()

# 创建 OpenAI API 客户端
openai_client = OpenAI()


# 创建 Flask 后端应用
app = Flask(__name__)
CORS(app)

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

# AI 自动生成测试用例接口
@app.post("/api/ai/generate-tests")
def generate_tests():
    # 获取用户发送的需求文本
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "status": "error",
            "message": "Request body must be JSON"
        }), 400

    requirement = data.get("requirement", "").strip()

    # 检查需求文本是否为空
    if not requirement:
        return jsonify({
            "status": "error",
            "message": "Requirement is required"
        }), 400

    # 调用 OpenAI API，根据需求生成测试用例
    try:
        response = openai_client.responses.parse(
            model="gpt-5.6-luna",
            instructions=(
                "你是一名软件测试工程师。"
                "请根据用户提供的需求，为当前注册接口生成5条中文测试用例，"
                "覆盖正常情况、边界情况和异常情况。"
                "测试编号必须依次使用 TC-001、TC-002、TC-003、TC-004、TC-005。"
                "测试数据必须提供可直接执行的具体输入值，字符串使用双引号表示。"
                "空字符串必须写成 \"\"，不能写成“空值”。"
                "每条测试用例的 request_method 必须填写 POST。"
                "每条测试用例的 request_url 必须填写 /api/register。"
                "request_body 必须包含 username 和 password，"
                "并且其中的值必须与该测试用例的测试数据保持一致。"
                "expected_status_code 必须根据需求填写："
                "注册成功时为201；用户名重复时为409；"
                "用户名或密码为空、用户名少于6个字符等输入不符合要求时为400。"
                "用户名少于6个字符时，预期状态码必须为400。"
                "除测试编号、接口信息和具体测试数据外，其他说明字段使用中文。"
                "每条测试用例必须使用不同的用户名。"
                "不要使用 testuser、admin、user123 等常见用户名，应使用不容易与数据库现有用户重复的随机英文字母和数字组合。"
            ),
            input=requirement,
            text_format=GeneratedTestCases,
            store=False
        )

    except Exception as error:
        print("OpenAI API error:", error)

        return jsonify({
            "status": "error",
            "message": "Failed to generate test cases"
        }), 500

    parsed_tests = response.output_parsed

    if parsed_tests is None:
        return jsonify({
            "status": "error",
            "message": "AI returned no structured test cases"
        }), 500

    return jsonify({
        "status": "success",
        "message": "Test cases generated successfully",
        "requirement": requirement,
        "generated_tests": parsed_tests.model_dump()
    }), 200
    

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

# 自动执行生成的测试用例
@app.post("/api/tests/execute")
def execute_tests():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "status": "error",
            "message": "Request body must be JSON"
        }), 400

    # 检查测试用例的数据结构
    try:
        generated_tests = GeneratedTestCases.model_validate(data)
    except ValidationError as error:
        return jsonify({
            "status": "error",
            "message": "Invalid test case data",
            "details": error.errors()
        }), 400

    execution_results = []
    test_client = app.test_client()

    for test_case in generated_tests.test_cases:
        request_method = test_case.request_method.upper()
        request_url = test_case.request_url
        request_body = test_case.request_body.model_dump()
        expected_status_code = test_case.expected_status_code

        # 当前原型只允许执行注册接口，避免执行其他未知接口
        if request_method != "POST" or request_url != "/api/register":
            execution_results.append({
                **test_case.model_dump(),
                "actual_status_code": None,
                "actual_response": None,
                "test_status": "Error",
                "error_message": "Only POST /api/register is supported"
            })
            continue

        normalized_username = request_body["username"].strip()

        # 执行前检查该用户名是否已经存在
        user_existed_before = False

        if normalized_username:
            connection = get_database_connection()

            existing_user = connection.execute(
                """
                SELECT id
                FROM users
                WHERE username = ?
                """,
                (normalized_username,)
            ).fetchone()

            connection.close()
            user_existed_before = existing_user is not None
            
        # 重复用户名用例：先创建用户，满足“用户名已存在”的前置条件
        if expected_status_code == 409 and not user_existed_before:
            setup_response = test_client.post(
                "/api/register",
                json=request_body
            )

            if setup_response.status_code != 201:
                execution_results.append({
                    **test_case.model_dump(),
                    "actual_status_code": None,
                    "actual_response": None,
                    "test_status": "Error",
                    "error_message": "Failed to create prerequisite user"
                })
                continue

        # 在 Flask 内部调用真正的注册接口
        response = test_client.post(
            request_url,
            json=request_body
        )

        actual_status_code = response.status_code
        actual_response = response.get_json(silent=True)

        test_passed = (
            actual_status_code == expected_status_code
        )

        execution_results.append({
            **test_case.model_dump(),
            "actual_status_code": actual_status_code,
            "actual_response": actual_response,
            "test_status": "Pass" if test_passed else "Fail",
            "error_message": None
        })

        # 删除本次测试新注册的账号，避免测试数据污染数据库
        if (
            actual_status_code == 201
            and normalized_username
            and not user_existed_before
        ):
            connection = get_database_connection()

            connection.execute(
                """
                DELETE FROM users
                WHERE username = ?
                """,
                (normalized_username,)
            )

            connection.commit()
            connection.close()

    passed_count = sum(
        result["test_status"] == "Pass"
        for result in execution_results
    )

    failed_count = sum(
        result["test_status"] == "Fail"
        for result in execution_results
    )

    return jsonify({
        "status": "success",
        "message": "Test execution completed",
        "summary": {
            "total": len(execution_results),
            "passed": passed_count,
            "failed": failed_count
        },
        "execution_results": execution_results
    }), 200

# 直接运行 app.py 时启动后端服务器
if __name__ == "__main__":
    app.run(debug=True, port=5000)