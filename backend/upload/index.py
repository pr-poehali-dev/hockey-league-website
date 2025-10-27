import json
import os
import base64
import uuid
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Загрузка изображений и получение URL
    Args: event - dict с httpMethod, body
          context - object с атрибутами request_id
    Returns: HTTP response dict с URL изображения
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return error_response('Method not allowed', 405)
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        image_data = body_data.get('image', '')
        
        if not image_data:
            return error_response('No image data provided', 400)
        
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        file_id = str(uuid.uuid4())
        file_ext = 'png'
        
        if image_bytes[:4] == b'\xff\xd8\xff\xe0' or image_bytes[:4] == b'\xff\xd8\xff\xe1':
            file_ext = 'jpg'
        elif image_bytes[:3] == b'GIF':
            file_ext = 'gif'
        elif image_bytes[:4] == b'\x89PNG':
            file_ext = 'png'
        
        image_url = f"data:image/{file_ext};base64,{base64.b64encode(image_bytes).decode()}"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'url': image_url})
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def error_response(message: str, status: int) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': message})
    }
