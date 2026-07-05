import json
import os
import re
import hashlib
import hmac
import base64
import time
import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def escape(value: str) -> str:
    return value.replace("'", "''")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return base64.b64encode(salt).decode() + '$' + base64.b64encode(dk).decode()


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_b64, hash_b64 = stored.split('$')
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
        dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        return hmac.compare_digest(dk, expected)
    except Exception:
        return False


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip('=')


def b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_token(user_id: int, email: str) -> str:
    header = {'alg': 'HS256', 'typ': 'JWT'}
    payload = {'user_id': user_id, 'email': email, 'exp': int(time.time()) + 30 * 24 * 3600}
    header_b64 = b64url_encode(json.dumps(header).encode())
    payload_b64 = b64url_encode(json.dumps(payload).encode())
    signing_input = f'{header_b64}.{payload_b64}'.encode()
    signature = hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest()
    signature_b64 = b64url_encode(signature)
    return f'{header_b64}.{payload_b64}.{signature_b64}'


def verify_token(token: str):
    try:
        header_b64, payload_b64, signature_b64 = token.split('.')
        signing_input = f'{header_b64}.{payload_b64}'.encode()
        expected_sig = hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest()
        actual_sig = b64url_decode(signature_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(b64url_decode(payload_b64))
        if payload.get('exp', 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, Authorization',
        'Access-Control-Max-Age': '86400',
    }


def handler(event: dict, context) -> dict:
    '''Регистрация и вход пользователей личного кабинета BuildAPK по email и паролю'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    headers = {'Content-Type': 'application/json', **cors_headers()}
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        path = event.get('queryStringParameters', {}) or {}
        action = path.get('action', '')

        if method == 'GET' and action == 'me':
            auth_header = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('x-authorization', '')
            token = auth_header.replace('Bearer ', '').strip()
            payload = verify_token(token)
            if not payload:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            cur.execute(f"SELECT id, email, name, created_at FROM users WHERE id = {int(payload['user_id'])}")
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Пользователь не найден'})}
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'id': row[0], 'email': row[1], 'name': row[2], 'created_at': str(row[3])}),
            }

        if method != 'POST':
            return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}

        body = json.loads(event.get('body') or '{}')
        action = body.get('action')

        if action == 'register':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            name = (body.get('name') or '').strip()

            if not EMAIL_RE.match(email):
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Некорректный email'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Пароль должен быть не короче 6 символов'})}

            cur.execute(f"SELECT id FROM users WHERE email = '{escape(email)}'")
            if cur.fetchone():
                return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'Пользователь с таким email уже существует'})}

            password_hash = hash_password(password)
            cur.execute(
                f"INSERT INTO users (email, password_hash, name) VALUES ('{escape(email)}', '{escape(password_hash)}', '{escape(name)}') RETURNING id, email, name"
            )
            row = cur.fetchone()
            conn.commit()
            token = create_token(row[0], row[1])
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'token': token, 'user': {'id': row[0], 'email': row[1], 'name': row[2]}}),
            }

        if action == 'login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''

            cur.execute(f"SELECT id, email, name, password_hash FROM users WHERE email = '{escape(email)}'")
            row = cur.fetchone()
            if not row or not verify_password(password, row[3]):
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный email или пароль'})}

            token = create_token(row[0], row[1])
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'token': token, 'user': {'id': row[0], 'email': row[1], 'name': row[2]}}),
            }

        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неизвестное действие'})}

    finally:
        cur.close()
        conn.close()
