import json
import os
import hashlib
import hmac
import base64
import time
import urllib.request
import urllib.error
import psycopg2
import boto3

from mail import send_build_ready_email, send_build_failed_email

DATABASE_URL = os.environ.get('DATABASE_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
APK_BUILD_SERVER_URL = os.environ.get('APK_BUILD_SERVER_URL', '').rstrip('/')
APK_BUILD_SERVER_TOKEN = os.environ.get('APK_BUILD_SERVER_TOKEN', '')
BUILDS_FUNCTION_URL = os.environ.get('BUILDS_FUNCTION_URL', '')
FRONTEND_URL = os.environ.get('FRONTEND_URL', '').rstrip('/') or 'https://buildapk.ru'
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID', '')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY', '')


def upload_apk_to_s3(apk_bytes: bytes, build_id: int) -> str:
    '''Загружает APK в S3-хранилище и возвращает публичную CDN-ссылку'''
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
    key = f'apk/build_{build_id}.apk'
    s3.put_object(
        Bucket='files',
        Key=key,
        Body=apk_bytes,
        ContentType='application/vnd.android.package-archive',
    )
    return f'https://cdn.poehali.dev/projects/{AWS_ACCESS_KEY_ID}/bucket/{key}'


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


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, Authorization, X-Build-Token',
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


def row_to_build(row):
    return {
        'id': row[0],
        'site_url': row[1],
        'app_name': row[2],
        'package_name': row[3],
        'icon_url': row[4],
        'splash_color': row[5],
        'theme_color': row[6],
        'push_enabled': row[7],
        'offline_enabled': row[8],
        'status': row[9],
        'apk_url': row[10],
        'created_at': str(row[11]),
        'push_provider': row[12],
        'notification_icon_set': row[13],
        'notification_icon_name': row[14],
        'addon_ids': row[15] if row[15] is not None else [],
        'config': row[16] if row[16] is not None else None,
        'error_message': row[17],
    }


BUILD_COLUMNS = (
    "id, site_url, app_name, package_name, icon_url, splash_color, theme_color, "
    "push_enabled, offline_enabled, status, apk_url, created_at, push_provider, "
    "notification_icon_set, notification_icon_name, addon_ids, config, error_message"
)


def send_to_build_server(build_id: int, site_url: str, app_name: str, package_name, options: dict):
    '''Отправляет заявку на внешний сервер сборки APK. Сервер сам присылает результат через callback позже'''
    if not APK_BUILD_SERVER_URL:
        raise RuntimeError('APK_BUILD_SERVER_URL не настроен')

    body = {
        'build_id': build_id,
        'site_url': site_url,
        'app_name': app_name,
        'package_name': package_name,
        'callback_url': f"{BUILDS_FUNCTION_URL}?action=callback" if BUILDS_FUNCTION_URL else None,
        **options,
    }

    req = urllib.request.Request(
        f"{APK_BUILD_SERVER_URL}/build",
        data=json.dumps(body).encode(),
        headers={
            'Content-Type': 'application/json',
            'X-Build-Token': APK_BUILD_SERVER_TOKEN,
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def sql_str(value):
    return 'NULL' if value is None else f"'{escape(str(value))}'"


def build_options(
    icon_url, splash_color, theme_color, push_enabled, offline_enabled,
    push_provider, fcm_server_key, onesignal_app_id, onesignal_rest_api_key,
    notification_icon_set, notification_icon_name, addon_ids, config,
):
    return {
        'icon_url': icon_url,
        'splash_color': splash_color,
        'theme_color': theme_color,
        'push_enabled': push_enabled,
        'offline_enabled': offline_enabled,
        'push_provider': push_provider,
        'fcm_server_key': fcm_server_key,
        'onesignal_app_id': onesignal_app_id,
        'onesignal_rest_api_key': onesignal_rest_api_key,
        'notification_icon_set': notification_icon_set,
        'notification_icon_name': notification_icon_name,
        'addon_ids': addon_ids,
        'screenshot_disabled': bool((config or {}).get('screenshotDisabled', False)),
        'app_lock_enabled': bool((config or {}).get('appLockEnabled', False)),
        'web_auth_enabled': bool((config or {}).get('webAuth', False)),
        'config': config,
    }


def handler(event: dict, context) -> dict:
    '''Создание, получение, редактирование (пересборка) и удаление заявок на сборку APK; приём callback с результатом от внешнего сервера сборки'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    headers = {'Content-Type': 'application/json', **cors_headers()}
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', '')

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        if method == 'POST' and action == 'callback':
            req_headers = event.get('headers', {}) or {}
            build_token = (
                req_headers.get('X-Build-Token')
                or req_headers.get('x-build-token', '')
            )
            if not build_token or not hmac.compare_digest(build_token, APK_BUILD_SERVER_TOKEN):
                return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Неверный токен сервера сборки'})}

            body = json.loads(event.get('body') or '{}')
            build_id = body.get('build_id')
            status = body.get('status') or ''
            apk_url = body.get('apk_url')
            error_message = body.get('error')

            if not build_id or status not in ('ready', 'failed', 'building'):
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Некорректные данные callback'})}

            if status == 'ready' and apk_url:
                try:
                    req = urllib.request.Request(apk_url)
                    with urllib.request.urlopen(req, timeout=25) as resp:
                        apk_bytes = resp.read()
                    apk_url = upload_apk_to_s3(apk_bytes, int(build_id))
                except Exception as e:
                    status = 'failed'
                    error_message = f'Не удалось сохранить APK-файл: {e}'
                    apk_url = None

            cur.execute(
                f"""
                UPDATE builds
                SET status = {sql_str(status)}, apk_url = {sql_str(apk_url)},
                    error_message = {sql_str(error_message)}, updated_at = NOW()
                WHERE id = {int(build_id)}
                RETURNING id, app_name, user_id
                """
            )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Сборка не найдена'})}

            if status in ('ready', 'failed'):
                _build_id, app_name, owner_id = row
                cur.execute(f"SELECT email, email_notifications_enabled FROM users WHERE id = {int(owner_id)}")
                user_row = cur.fetchone()
                if user_row and user_row[0] and user_row[1]:
                    dashboard_url = f"{FRONTEND_URL}/dashboard"
                    try:
                        if status == 'ready':
                            send_build_ready_email(user_row[0], app_name, dashboard_url)
                        else:
                            send_build_failed_email(user_row[0], app_name, dashboard_url, error_message or '')
                    except Exception:
                        pass

            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True})}

        user_id = get_user_id(event)
        if user_id is None:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}

        if method == 'GET' and action == 'download':
            build_id = params.get('id')
            if not build_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не указан id сборки'})}

            cur.execute(
                f"""
                SELECT id FROM subscriptions
                WHERE user_id = {user_id} AND status = 'active' AND expires_at > NOW()
                LIMIT 1
                """
            )
            if not cur.fetchone():
                return {
                    'statusCode': 402,
                    'headers': headers,
                    'body': json.dumps({'error': 'Для скачивания APK нужно оформить тариф', 'needs_payment': True}),
                }

            cur.execute(
                f"SELECT apk_url, app_name FROM builds WHERE id = {int(build_id)} AND user_id = {user_id} AND status = 'ready'"
            )
            row = cur.fetchone()
            if not row or not row[0]:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'APK-файл не найден'})}

            apk_url, app_name = row

            try:
                req = urllib.request.Request(apk_url)
                with urllib.request.urlopen(req, timeout=25) as resp:
                    file_bytes = resp.read()
            except Exception as e:
                return {'statusCode': 502, 'headers': headers, 'body': json.dumps({'error': f'Не удалось получить APK с сервера сборки: {e}'})}

            safe_name = ''.join(c for c in (app_name or 'app') if c.isalnum() or c in (' ', '-', '_')).strip() or 'app'
            return {
                'statusCode': 200,
                'headers': {
                    **cors_headers(),
                    'Content-Type': 'application/vnd.android.package-archive',
                    'Content-Disposition': f'attachment; filename="{safe_name}.apk"',
                },
                'body': base64.b64encode(file_bytes).decode(),
                'isBase64Encoded': True,
            }

        if method == 'GET':
            build_id = params.get('id')
            if build_id:
                cur.execute(
                    f"SELECT {BUILD_COLUMNS} FROM builds WHERE id = {int(build_id)} AND user_id = {user_id}"
                )
                row = cur.fetchone()
                if not row:
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Сборка не найдена'})}
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(row_to_build(row))}

            cur.execute(
                f"SELECT {BUILD_COLUMNS} FROM builds WHERE user_id = {user_id} ORDER BY created_at DESC"
            )
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps([row_to_build(r) for r in rows])}

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')

            site_url = (body.get('site_url') or '').strip()
            app_name = (body.get('app_name') or '').strip()
            if not site_url or not app_name:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите сайт и название приложения'})}

            package_name = body.get('package_name') or None
            icon_url = body.get('icon_url') or None
            splash_color = body.get('splash_color') or '#000000'
            theme_color = body.get('theme_color') or '#ef4444'
            push_enabled = bool(body.get('push_enabled', False))
            offline_enabled = bool(body.get('offline_enabled', False))
            push_provider = body.get('push_provider') or 'firebase'
            fcm_server_key = body.get('fcm_server_key') or None
            onesignal_app_id = body.get('onesignal_app_id') or None
            onesignal_rest_api_key = body.get('onesignal_rest_api_key') or None
            notification_icon_set = body.get('notification_icon_set') or 'lucide'
            notification_icon_name = body.get('notification_icon_name') or 'Bell'
            addon_ids = body.get('addon_ids') or []
            config = body.get('config') or {}

            cur.execute(
                f"""
                INSERT INTO builds (
                    user_id, site_url, app_name, package_name, icon_url,
                    splash_color, theme_color, push_enabled, offline_enabled,
                    push_provider, fcm_server_key, onesignal_app_id, onesignal_rest_api_key,
                    notification_icon_set, notification_icon_name, addon_ids, config
                ) VALUES (
                    {user_id}, {sql_str(site_url)}, {sql_str(app_name)}, {sql_str(package_name)}, {sql_str(icon_url)},
                    {sql_str(splash_color)}, {sql_str(theme_color)}, {push_enabled}, {offline_enabled},
                    {sql_str(push_provider)}, {sql_str(fcm_server_key)}, {sql_str(onesignal_app_id)}, {sql_str(onesignal_rest_api_key)},
                    {sql_str(notification_icon_set)}, {sql_str(notification_icon_name)},
                    '{escape(json.dumps(addon_ids))}'::jsonb, '{escape(json.dumps(config))}'::jsonb
                )
                RETURNING {BUILD_COLUMNS}
                """
            )
            row = cur.fetchone()
            conn.commit()
            build = row_to_build(row)

            try:
                options = build_options(
                    icon_url, splash_color, theme_color, push_enabled, offline_enabled,
                    push_provider, fcm_server_key, onesignal_app_id, onesignal_rest_api_key,
                    notification_icon_set, notification_icon_name, addon_ids, config,
                )
                send_to_build_server(build['id'], site_url, app_name, package_name, options)
                cur.execute(
                    f"UPDATE builds SET status = 'building', updated_at = NOW() WHERE id = {build['id']}"
                )
                build['status'] = 'building'
                conn.commit()
            except Exception as e:
                cur.execute(
                    f"UPDATE builds SET status = 'failed', error_message = {sql_str(str(e))}, updated_at = NOW() WHERE id = {build['id']}"
                )
                conn.commit()
                build['status'] = 'failed'
                build['error_message'] = str(e)

            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(build)}

        if method == 'PUT':
            build_id = params.get('id')
            if not build_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не указан id сборки'})}

            cur.execute(
                f"SELECT {BUILD_COLUMNS} FROM builds WHERE id = {int(build_id)} AND user_id = {user_id}"
            )
            existing = cur.fetchone()
            if not existing:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Сборка не найдена'})}

            body = json.loads(event.get('body') or '{}')

            site_url = (body.get('site_url') or '').strip()
            app_name = (body.get('app_name') or '').strip()
            if not site_url or not app_name:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите сайт и название приложения'})}

            package_name = body.get('package_name') or None
            icon_url = body.get('icon_url') or None
            splash_color = body.get('splash_color') or '#000000'
            theme_color = body.get('theme_color') or '#ef4444'
            push_enabled = bool(body.get('push_enabled', False))
            offline_enabled = bool(body.get('offline_enabled', False))
            push_provider = body.get('push_provider') or 'firebase'
            fcm_server_key = body.get('fcm_server_key') or None
            onesignal_app_id = body.get('onesignal_app_id') or None
            onesignal_rest_api_key = body.get('onesignal_rest_api_key') or None
            notification_icon_set = body.get('notification_icon_set') or 'lucide'
            notification_icon_name = body.get('notification_icon_name') or 'Bell'
            addon_ids = body.get('addon_ids') or []
            config = body.get('config') or {}

            cur.execute(
                f"""
                UPDATE builds SET
                    site_url = {sql_str(site_url)},
                    app_name = {sql_str(app_name)},
                    package_name = {sql_str(package_name)},
                    icon_url = {sql_str(icon_url)},
                    splash_color = {sql_str(splash_color)},
                    theme_color = {sql_str(theme_color)},
                    push_enabled = {push_enabled},
                    offline_enabled = {offline_enabled},
                    push_provider = {sql_str(push_provider)},
                    fcm_server_key = {sql_str(fcm_server_key)},
                    onesignal_app_id = {sql_str(onesignal_app_id)},
                    onesignal_rest_api_key = {sql_str(onesignal_rest_api_key)},
                    notification_icon_set = {sql_str(notification_icon_set)},
                    notification_icon_name = {sql_str(notification_icon_name)},
                    addon_ids = '{escape(json.dumps(addon_ids))}'::jsonb,
                    config = '{escape(json.dumps(config))}'::jsonb,
                    status = 'queued',
                    apk_url = NULL,
                    error_message = NULL,
                    updated_at = NOW()
                WHERE id = {int(build_id)} AND user_id = {user_id}
                RETURNING {BUILD_COLUMNS}
                """
            )
            row = cur.fetchone()
            conn.commit()
            build = row_to_build(row)

            try:
                options = build_options(
                    icon_url, splash_color, theme_color, push_enabled, offline_enabled,
                    push_provider, fcm_server_key, onesignal_app_id, onesignal_rest_api_key,
                    notification_icon_set, notification_icon_name, addon_ids, config,
                )
                send_to_build_server(build['id'], site_url, app_name, package_name, options)
                cur.execute(
                    f"UPDATE builds SET status = 'building', updated_at = NOW() WHERE id = {build['id']}"
                )
                build['status'] = 'building'
                conn.commit()
            except Exception as e:
                cur.execute(
                    f"UPDATE builds SET status = 'failed', error_message = {sql_str(str(e))}, updated_at = NOW() WHERE id = {build['id']}"
                )
                conn.commit()
                build['status'] = 'failed'
                build['error_message'] = str(e)

            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(build)}

        if method == 'DELETE':
            build_id = params.get('id')
            if not build_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не указан id сборки'})}
            cur.execute(f"DELETE FROM builds WHERE id = {int(build_id)} AND user_id = {user_id} RETURNING id")
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Сборка не найдена'})}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True})}

        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}

    finally:
        cur.close()
        conn.close()