import os


def handler(event: dict, context) -> dict:
    '''Отдаёт актуальный исходник сервера сборки APK (build_server.py) как текст для установки на сервер сборки'''
    method = event.get('httpMethod', 'GET')

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    src_path = os.path.join(os.path.dirname(__file__), 'build_server.py')
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
            **cors,
        },
        'body': content,
        'isBase64Encoded': False,
    }
