import json
import os
import hashlib
import hmac
import base64
import time
import uuid
import urllib.request
import urllib.error
import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
YOOKASSA_SHOP_ID = os.environ.get('YOOKASSA_SHOP_ID', '')
YOOKASSA_SECRET_KEY = os.environ.get('YOOKASSA_SECRET_KEY', '')
YOOKASSA_API_URL = 'https://api.yookassa.ru/v3/payments'

PLAN_DAYS = 30
REFERRAL_BONUS_DAYS = 7


def escape(value: str) -> str:
    return value.replace("'", "''")


def b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


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


def get_user_id(event: dict):
    headers = event.get('headers', {}) or {}
    auth_header = headers.get('X-Authorization') or headers.get('x-authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    payload = verify_token(token)
    if not payload:
        return None
    return int(payload['user_id'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, Authorization',
        'Access-Control-Max-Age': '86400',
    }


def yookassa_auth_header() -> str:
    creds = f'{YOOKASSA_SHOP_ID}:{YOOKASSA_SECRET_KEY}'.encode()
    return 'Basic ' + base64.b64encode(creds).decode()


def create_yookassa_payment(amount: int, description: str, return_url: str, idempotence_key: str, metadata: dict):
    body = {
        'amount': {'value': f'{amount}.00', 'currency': 'RUB'},
        'confirmation': {'type': 'redirect', 'return_url': return_url},
        'capture': True,
        'description': description,
        'metadata': metadata,
    }
    req = urllib.request.Request(
        YOOKASSA_API_URL,
        data=json.dumps(body).encode(),
        headers={
            'Content-Type': 'application/json',
            'Authorization': yookassa_auth_header(),
            'Idempotence-Key': idempotence_key,
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def handler(event: dict, context) -> dict:
    '''Создание платежей ЮKassa за тарифы и приём webhook-уведомлений об оплате'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    headers = {'Content-Type': 'application/json', **cors_headers()}
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', '')

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        if method == 'POST' and action == 'webhook':
            body = json.loads(event.get('body') or '{}')
            event_type = body.get('event')
            payment_obj = body.get('object') or {}
            yookassa_payment_id = payment_obj.get('id')
            status = payment_obj.get('status')
            metadata = payment_obj.get('metadata') or {}

            if not yookassa_payment_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Некорректные данные webhook'})}

            if event_type == 'payment.succeeded' and status == 'succeeded':
                cur.execute(
                    f"""
                    UPDATE payments SET status = 'succeeded', paid_at = NOW()
                    WHERE yookassa_payment_id = '{escape(yookassa_payment_id)}'
                    RETURNING id, user_id, plan_code
                    """
                )
                row = cur.fetchone()
                if row:
                    payment_id, user_id, plan_code = row
                    cur.execute(
                        f"""
                        INSERT INTO subscriptions (user_id, plan_code, status, expires_at)
                        VALUES ({user_id}, '{escape(plan_code)}', 'active', NOW() + INTERVAL '{PLAN_DAYS} days')
                        """
                    )

                    cur.execute(
                        f"""
                        SELECT referred_by FROM users
                        WHERE id = {user_id} AND referred_by IS NOT NULL
                        """
                    )
                    ref_row = cur.fetchone()
                    if ref_row:
                        referrer_id = ref_row[0]
                        cur.execute(
                            f"""
                            SELECT COUNT(*) FROM payments
                            WHERE user_id = {user_id} AND status = 'succeeded'
                            """
                        )
                        paid_count = cur.fetchone()[0]
                        if paid_count == 1:
                            cur.execute(
                                f"""
                                INSERT INTO referral_bonuses (referrer_id, referred_id, payment_id, bonus_days)
                                VALUES ({referrer_id}, {user_id}, {payment_id}, {REFERRAL_BONUS_DAYS})
                                """
                            )
                            cur.execute(
                                f"""
                                UPDATE subscriptions SET expires_at = expires_at + INTERVAL '{REFERRAL_BONUS_DAYS} days'
                                WHERE id = (
                                    SELECT id FROM subscriptions
                                    WHERE user_id = {referrer_id} AND status = 'active' AND expires_at > NOW()
                                    ORDER BY expires_at DESC LIMIT 1
                                )
                                """
                            )
                conn.commit()
            elif event_type == 'payment.canceled':
                cur.execute(
                    f"UPDATE payments SET status = 'canceled' WHERE yookassa_payment_id = '{escape(yookassa_payment_id)}'"
                )
                conn.commit()

            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True})}

        user_id = get_user_id(event)
        if user_id is None:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}

        if method == 'GET' and action == 'history':
            cur.execute(
                f"""
                SELECT p.id, p.plan_code, pl.name, p.amount, p.status, p.created_at, p.paid_at
                FROM payments p
                JOIN plans pl ON pl.code = p.plan_code
                WHERE p.user_id = {user_id}
                ORDER BY p.created_at DESC
                """
            )
            rows = cur.fetchall()
            history = [
                {
                    'id': r[0], 'plan_code': r[1], 'plan_name': r[2], 'amount': r[3],
                    'status': r[4], 'created_at': str(r[5]), 'paid_at': str(r[6]) if r[6] else None,
                }
                for r in rows
            ]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(history)}

        if method == 'GET' and action == 'plans':
            cur.execute("SELECT code, name, price, builds_limit, description FROM plans ORDER BY sort_order")
            rows = cur.fetchall()
            plans = [
                {'code': r[0], 'name': r[1], 'price': r[2], 'builds_limit': r[3], 'description': r[4]}
                for r in rows
            ]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(plans)}

        if method == 'GET' and action == 'subscription':
            cur.execute(
                f"""
                SELECT s.plan_code, s.status, s.builds_used, s.expires_at, p.name, p.builds_limit
                FROM subscriptions s
                JOIN plans p ON p.code = s.plan_code
                WHERE s.user_id = {user_id} AND s.status = 'active' AND s.expires_at > NOW()
                ORDER BY s.expires_at DESC
                LIMIT 1
                """
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(None)}
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'plan_code': row[0],
                    'status': row[1],
                    'builds_used': row[2],
                    'expires_at': str(row[3]),
                    'plan_name': row[4],
                    'builds_limit': row[5],
                }),
            }

        if method == 'POST' and action == 'create':
            body = json.loads(event.get('body') or '{}')
            plan_code = (body.get('plan_code') or '').strip()
            return_url = (body.get('return_url') or '').strip()

            if not plan_code or not return_url:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите тариф и адрес возврата'})}
            if not YOOKASSA_SHOP_ID or not YOOKASSA_SECRET_KEY:
                return {'statusCode': 503, 'headers': headers, 'body': json.dumps({'error': 'Оплата временно недоступна, попробуйте позже'})}

            cur.execute(f"SELECT code, name, price FROM plans WHERE code = '{escape(plan_code)}'")
            plan = cur.fetchone()
            if not plan:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Тариф не найден'})}

            _, plan_name, price = plan
            idempotence_key = str(uuid.uuid4())

            try:
                payment = create_yookassa_payment(
                    amount=price,
                    description=f'Тариф «{plan_name}» — BuildAPK',
                    return_url=return_url,
                    idempotence_key=idempotence_key,
                    metadata={'user_id': user_id, 'plan_code': plan_code},
                )
            except urllib.error.HTTPError as e:
                error_body = e.read().decode()
                return {'statusCode': 502, 'headers': headers, 'body': json.dumps({'error': f'Ошибка ЮKassa: {error_body}'})}
            except Exception as e:
                return {'statusCode': 502, 'headers': headers, 'body': json.dumps({'error': f'Не удалось создать платёж: {e}'})}

            confirmation_url = payment.get('confirmation', {}).get('confirmation_url', '')
            yookassa_payment_id = payment.get('id')

            cur.execute(
                f"""
                INSERT INTO payments (user_id, plan_code, amount, status, yookassa_payment_id, confirmation_url)
                VALUES ({user_id}, '{escape(plan_code)}', {price}, 'pending', '{escape(yookassa_payment_id)}', '{escape(confirmation_url)}')
                """
            )
            conn.commit()

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'confirmation_url': confirmation_url, 'payment_id': yookassa_payment_id}),
            }

        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неизвестное действие'})}

    finally:
        cur.close()
        conn.close()