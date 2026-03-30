"""
Управление учениками учителя.
GET  / — список учеников учителя
POST / — добавить ученика (генерирует код доступа)
"""

import json
import os
import secrets
import string
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}
SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def q(sql: str) -> str:
    return sql.replace("{{s}}", SCHEMA)


def ok(body: dict, status: int = 200) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(body, ensure_ascii=False)}


def err(msg: str, status: int = 400) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"error": msg}, ensure_ascii=False)}


def get_teacher_id(cur, token: str):
    cur.execute(
        q("SELECT user_id FROM {{s}}.sessions WHERE token = %s AND user_type = 'teacher' AND expires_at > NOW()"),
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None


def gen_code(length: int = 8) -> str:
    chars = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    token = (event.get("headers") or {}).get("X-Auth-Token", "")

    conn = get_conn()
    cur = conn.cursor()

    teacher_id = get_teacher_id(cur, token)
    if not teacher_id:
        conn.close()
        return err("Нет доступа — войдите как учитель", 403)

    # GET / — список учеников
    if method == "GET":
        cur.execute(
            q("SELECT id, name, access_code, created_at FROM {{s}}.students WHERE teacher_id = %s ORDER BY created_at DESC"),
            (teacher_id,)
        )
        rows = cur.fetchall()
        conn.close()
        students = [
            {"id": r[0], "name": r[1], "access_code": r[2], "created_at": str(r[3])}
            for r in rows
        ]
        return ok({"students": students})

    # POST / — добавить ученика
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        name = body.get("name", "").strip()
        if not name:
            conn.close()
            return err("Укажите имя ученика")

        # генерируем уникальный код
        for _ in range(10):
            code = gen_code()
            cur.execute(q("SELECT id FROM {{s}}.students WHERE access_code = %s"), (code,))
            if not cur.fetchone():
                break

        cur.execute(
            q("INSERT INTO {{s}}.students (teacher_id, name, access_code) VALUES (%s, %s, %s) RETURNING id, name, access_code"),
            (teacher_id, name, code)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return ok({"id": row[0], "name": row[1], "access_code": row[2]}, 201)

    conn.close()
    return err("Not found", 404)
