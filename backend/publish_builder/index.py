import json
import os
import base64

import boto3


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }


def handler(event: dict, context) -> dict:
    '''Публикует актуальный шаблон сборщика APK (main.py) в стабильный CDN-адрес для сервера сборки'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    headers = {'Content-Type': 'application/json', **cors_headers()}

    body = json.loads(event.get('body') or '{}')
    content_b64 = body.get('content_b64') or ''
    if not content_b64:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'no content'})}

    data = base64.b64decode(content_b64)

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    key = 'builder-template/main.py'
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType='text/plain')

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'url': cdn_url, 'size': len(data)}),
    }
