import json
import os
import re
import hashlib
import hmac
import base64
import time
import secrets
import datetime
import psycopg2

from mail import send_verification_code

DATABASE_URL = os.environ.get('DATABASE_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
CODE_TTL_MINUTES = 15


def generate_code() -> str:
    return f'{secrets.randbelow(1000000):06d}'


def generate_referral_code() -> str:
    return secrets.token_hex(4).upper()


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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, Authorization',
        'Access-Control-Max-Age': '86400',
    }


def get_user_id(event: dict):
    headers = event.get('headers', {}) or {}
    auth_header = headers.get('X-Authorization') or headers.get('x-authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    payload = verify_token(token)
    if not payload:
        return None
    return int(payload['user_id'])


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
            cur.execute(
                f"""SELECT id, email, name, created_at, email_notifications_enabled, referral_code
                    FROM users WHERE id = {int(payload['user_id'])}"""
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Пользователь не найден'})}
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'id': row[0], 'email': row[1], 'name': row[2], 'created_at': str(row[3]),
                    'email_notifications_enabled': row[4], 'referral_code': row[5],
                }),
            }

        if method == 'GET' and action == 'referrals':
            user_id = get_user_id(event)
            if user_id is None:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}

            cur.execute(f"SELECT referral_code FROM users WHERE id = {user_id}")
            code_row = cur.fetchone()
            referral_code = code_row[0] if code_row else None

            cur.execute(
                f"""
                SELECT u.email, u.name, u.created_at,
                    EXISTS(SELECT 1 FROM payments p WHERE p.user_id = u.id AND p.status = 'succeeded')
                FROM users u WHERE u.referred_by = {user_id}
                ORDER BY u.created_at DESC
                """
            )
            invited = [
                {'email': r[0], 'name': r[1], 'created_at': str(r[2]), 'has_paid': r[3]}
                for r in cur.fetchall()
            ]

            cur.execute(
                f"""
                SELECT COALESCE(SUM(bonus_days), 0), COUNT(*)
                FROM referral_bonuses WHERE referrer_id = {user_id}
                """
            )
            bonus_row = cur.fetchone()

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'referral_code': referral_code,
                    'invited': invited,
                    'total_bonus_days': bonus_row[0],
                    'bonus_count': bonus_row[1],
                }),
            }

        if method == 'PUT' and action == 'profile':
            user_id = get_user_id(event)
            if user_id is None:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}

            body = json.loads(event.get('body') or '{}')
            name = body.get('name')
            new_password = body.get('new_password')
            current_password = body.get('current_password')

            updates = []
            if name is not None:
                updates.append(f"name = '{escape(name.strip())}'")

            if new_password:
                if len(new_password) < 6:
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Пароль должен быть не короче 6 символов'})}
                cur.execute(f"SELECT password_hash FROM users WHERE id = {user_id}")
                row = cur.fetchone()
                if not row or not verify_password(current_password or '', row[0]):
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неверный текущий пароль'})}
                updates.append(f"password_hash = '{escape(hash_password(new_password))}'")

            if not updates:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Нечего обновлять'})}

            cur.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = {user_id} RETURNING id, email, name")
            row = cur.fetchone()
            conn.commit()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'id': row[0], 'email': row[1], 'name': row[2]}),
            }

        if method == 'PUT' and action == 'notifications':
            user_id = get_user_id(event)
            if user_id is None:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}

            body = json.loads(event.get('body') or '{}')
            enabled = bool(body.get('email_notifications_enabled', True))
            cur.execute(
                f"UPDATE users SET email_notifications_enabled = {enabled} WHERE id = {user_id} RETURNING email_notifications_enabled"
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'email_notifications_enabled': row[0]})}

        if method != 'POST':
            return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}

        body = json.loads(event.get('body') or '{}')
        action = body.get('action')

        if action == 'register':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            name = (body.get('name') or '').strip()
            referral_code_input = (body.get('referral_code') or '').strip().upper()

            if not EMAIL_RE.match(email):
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Некорректный email'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Пароль должен быть не короче 6 символов'})}

            cur.execute(f"SELECT id, is_verified FROM users WHERE email = '{escape(email)}'")
            existing = cur.fetchone()
            if existing and existing[1]:
                return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'Пользователь с таким email уже существует'})}

            referred_by = None
            if referral_code_input:
                cur.execute(f"SELECT id FROM users WHERE referral_code = '{escape(referral_code_input)}'")
                ref_row = cur.fetchone()
                if ref_row:
                    referred_by = ref_row[0]

            password_hash = hash_password(password)
            code = generate_code()
            expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=CODE_TTL_MINUTES)

            if existing:
                cur.execute(
                    f"""
                    UPDATE users SET password_hash = '{escape(password_hash)}', name = '{escape(name)}',
                        verification_code = '{code}', verification_code_expires = '{expires.isoformat()}'
                    WHERE id = {existing[0]}
                    RETURNING id, email
                    """
                )
            else:
                new_referral_code = generate_referral_code()
                referred_by_sql = str(referred_by) if referred_by else 'NULL'
                cur.execute(
                    f"""
                    INSERT INTO users (email, password_hash, name, verification_code, verification_code_expires, referral_code, referred_by)
                    VALUES ('{escape(email)}', '{escape(password_hash)}', '{escape(name)}', '{code}', '{expires.isoformat()}', '{new_referral_code}', {referred_by_sql})
                    RETURNING id, email
                    """
                )
            row = cur.fetchone()
            conn.commit()

            try:
                send_verification_code(row[1], code)
            except Exception as e:
                return {'statusCode': 502, 'headers': headers, 'body': json.dumps({'error': f'Не удалось отправить код на почту: {e}'})}

            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'user_id': row[0], 'email': row[1], 'message': 'Код подтверждения отправлен на почту'}),
            }

        if action == 'verify':
            email = (body.get('email') or '').strip().lower()
            code = (body.get('code') or '').strip()

            cur.execute(
                f"SELECT id, email, name, verification_code, verification_code_expires FROM users WHERE email = '{escape(email)}'"
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Пользователь не найден'})}

            user_id, user_email, name, stored_code, expires_at = row
            if not stored_code or stored_code != code:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неверный код подтверждения'})}
            if not expires_at or expires_at < datetime.datetime.utcnow():
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Код истёк, запросите новый'})}

            cur.execute(
                f"UPDATE users SET is_verified = true, verification_code = NULL, verification_code_expires = NULL WHERE id = {user_id}"
            )
            conn.commit()

            token = create_token(user_id, user_email)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'token': token, 'user': {'id': user_id, 'email': user_email, 'name': name}}),
            }

        if action == 'resend_code':
            email = (body.get('email') or '').strip().lower()
            cur.execute(f"SELECT id, is_verified FROM users WHERE email = '{escape(email)}'")
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Пользователь не найден'})}
            if row[1]:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Email уже подтверждён'})}

            code = generate_code()
            expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=CODE_TTL_MINUTES)
            cur.execute(
                f"UPDATE users SET verification_code = '{code}', verification_code_expires = '{expires.isoformat()}' WHERE id = {row[0]}"
            )
            conn.commit()

            try:
                send_verification_code(email, code)
            except Exception as e:
                return {'statusCode': 502, 'headers': headers, 'body': json.dumps({'error': f'Не удалось отправить код на почту: {e}'})}

            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': 'Код отправлен повторно'})}

        if action == 'login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''

            cur.execute(f"SELECT id, email, name, password_hash, is_verified FROM users WHERE email = '{escape(email)}'")
            row = cur.fetchone()
            if not row or not verify_password(password, row[3]):
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный email или пароль'})}

            if not row[4]:
                return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Email не подтверждён', 'needs_verification': True})}

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