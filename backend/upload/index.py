import json
import os
import base64
import hashlib
import hmac
import time
from uuid import uuid4

import boto3

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')

ALLOWED_FOLDERS = {'icons', 'splash-json', 'splash-images', 'splash-video'}

CONTENT_TYPES = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'json': 'application/json',
    'mp4': 'video/mp4',
}

MAX_FILE_SIZE = 15 * 1024 * 1024


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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, Authorization',
        'Access-Control-Max-Age': '86400',
    }


def handler(event: dict, context) -> dict:
    '''Загрузка файлов (иконки, JSON-анимации, изображения и видео заставки) в S3-хранилище проекта'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    headers = {'Content-Type': 'application/json', **cors_headers()}

    if method != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}

    event_headers = event.get('headers', {}) or {}
    auth_header = event_headers.get('X-Authorization') or event_headers.get('x-authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    payload = verify_token(token)
    if not payload:
        return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}

    try:
        body = json.loads(event.get('body') or '{}')
    except Exception:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Некорректный формат JSON в теле запроса'})}

    file_base64 = body.get('file_base64') or ''
    filename = (body.get('filename') or '').strip()
    folder = (body.get('folder') or '').strip()

    if folder not in ALLOWED_FOLDERS:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': f'Недопустимая папка. Разрешены: {", ".join(sorted(ALLOWED_FOLDERS))}'}),
        }

    if not filename or '.' not in filename:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не указано имя файла с расширением'})}

    ext = filename.rsplit('.', 1)[-1].lower()
    content_type = CONTENT_TYPES.get(ext)
    if not content_type:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неподдерживаемый формат файла'})}

    if ',' in file_base64 and file_base64.strip().startswith('data:'):
        file_base64 = file_base64.split(',', 1)[1]

    try:
        decoded_bytes = base64.b64decode(file_base64, validate=True)
    except Exception:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не удалось декодировать base64-данные файла'})}

    if len(decoded_bytes) > MAX_FILE_SIZE:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Размер файла превышает допустимый лимит 15 МБ'}),
        }

    key = f'builder/{folder}/{uuid4()}.{ext}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=decoded_bytes, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'url': cdn_url})}
