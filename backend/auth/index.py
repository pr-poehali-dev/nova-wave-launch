"""
Авторизация учителей и учеников.
POST /login — вход (teacher/student)
POST /register-teacher — регистрация учителя
POST /create-student — создать ученика (только учитель)
GET /me — проверить токен и вернуть данные пользователя
"""

import json
import os
import secrets
import string
import hashlib
from datetime import datetime, timedelta
import psycopg2

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def q(sql: str) -> str:
    return sql.replace("{{s}}", SCHEMA)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token(length=48) -> str:
    return secrets.token_hex(length)


def generate_access_code(length=8) -> str:
    chars = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor()

    # --- POST /login ---
    if path.endswith("/login") and method == "POST":
        role = body.get("role")
        if role == "teacher":
            login = body.get("login", "").strip()
            password = body.get("password", "")
            cur.execute(
                q("SELECT id, name, password_hash FROM {{s}}.teachers WHERE login = %s"),
                (login,),
            )
            row = cur.fetchone()
            if not row or row[2] != hash_password(password):
                conn.close()
                return {
                    "statusCode": 401,
                    "headers": CORS_HEADERS,
                    "body": json.dumps({"error": "Неверный логин или пароль"}),
                }
            teacher_id, name = row[0], row[1]
            token = generate_token()
            expires = datetime.now() + timedelta(days=30)
            cur.execute(
                q("INSERT INTO {{s}}.sessions (user_type, user_id, token, expires_at) VALUES (%s, %s, %s, %s)"),
                ("teacher", teacher_id, token, expires),
            )
            conn.commit()
            conn.close()
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"token": token, "role": "teacher", "name": name}),
            }

        elif role == "student":
            name = body.get("name", "").strip()
            code = body.get("access_code", "").strip().upper()
            cur.execute(
                q("SELECT id, name FROM {{s}}.students WHERE access_code = %s AND name ILIKE %s"),
                (code, name),
            )
            row = cur.fetchone()
            if not row:
                conn.close()
                return {
                    "statusCode": 401,
                    "headers": CORS_HEADERS,
                    "body": json.dumps({"error": "Имя или код неверны"}),
                }
            student_id, student_name = row
            token = generate_token()
            expires = datetime.now() + timedelta(days=30)
            cur.execute(
                q("INSERT INTO {{s}}.sessions (user_type, user_id, token, expires_at) VALUES (%s, %s, %s, %s)"),
                ("student", student_id, token, expires),
            )
            conn.commit()
            conn.close()
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"token": token, "role": "student", "name": student_name}),
            }

        conn.close()
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Укажите role"})}

    # --- POST /register-teacher ---
    if path.endswith("/register-teacher") and method == "POST":
        login = body.get("login", "").strip()
        password = body.get("password", "")
        name = body.get("name", "").strip()
        if not login or not password or not name:
            conn.close()
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Заполните все поля"})}
        cur.execute(q("SELECT id FROM {{s}}.teachers WHERE login = %s"), (login,))
        if cur.fetchone():
            conn.close()
            return {"statusCode": 409, "headers": CORS_HEADERS, "body": json.dumps({"error": "Логин занят"})}
        cur.execute(
            q("INSERT INTO {{s}}.teachers (login, password_hash, name) VALUES (%s, %s, %s) RETURNING id"),
            (login, hash_password(password), name),
        )
        teacher_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 201, "headers": CORS_HEADERS, "body": json.dumps({"id": teacher_id, "name": name})}

    # --- POST /create-student ---
    if path.endswith("/create-student") and method == "POST":
        token = (event.get("headers") or {}).get("X-Auth-Token", "")
        cur.execute(
            q("SELECT user_id FROM {{s}}.sessions WHERE token = %s AND user_type = 'teacher' AND expires_at > NOW()"),
            (token,),
        )
        session = cur.fetchone()
        if not session:
            conn.close()
            return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет доступа"})}
        teacher_id = session[0]
        student_name = body.get("name", "").strip()
        if not student_name:
            conn.close()
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Укажите имя ученика"})}
        code = generate_access_code()
        cur.execute(
            q("INSERT INTO {{s}}.students (teacher_id, name, access_code) VALUES (%s, %s, %s) RETURNING id"),
            (teacher_id, student_name, code),
        )
        student_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {
            "statusCode": 201,
            "headers": CORS_HEADERS,
            "body": json.dumps({"id": student_id, "name": student_name, "access_code": code}),
        }

    # --- GET /me ---
    if path.endswith("/me") and method == "GET":
        token = (event.get("headers") or {}).get("X-Auth-Token", "")
        cur.execute(
            q("SELECT user_type, user_id FROM {{s}}.sessions WHERE token = %s AND expires_at > NOW()"),
            (token,),
        )
        session = cur.fetchone()
        if not session:
            conn.close()
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не авторизован"})}
        user_type, user_id = session
        if user_type == "teacher":
            cur.execute(q("SELECT id, name, login FROM {{s}}.teachers WHERE id = %s"), (user_id,))
            row = cur.fetchone()
            conn.close()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"role": "teacher", "id": row[0], "name": row[1], "login": row[2]})}
        else:
            cur.execute(q("SELECT id, name, access_code FROM {{s}}.students WHERE id = %s"), (user_id,))
            row = cur.fetchone()
            conn.close()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"role": "student", "id": row[0], "name": row[1], "access_code": row[2]})}

    conn.close()
    return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
