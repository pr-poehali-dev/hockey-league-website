import json
import os
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления данными хоккейной лиги (команды, матчи, соцсети, чемпионы)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return error_response('DATABASE_URL not configured', 500)
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        path = event.get('queryStringParameters', {}).get('path', '')
        
        if method == 'GET':
            if path == 'teams':
                cur.execute('SELECT * FROM teams ORDER BY points DESC, (goals_for - goals_against) DESC')
                teams = cur.fetchall()
                return success_response(teams)
            
            elif path == 'matches':
                cur.execute('SELECT * FROM matches ORDER BY date DESC, time DESC')
                matches = cur.fetchall()
                return success_response(matches)
            
            elif path == 'socials':
                cur.execute('SELECT * FROM social_links ORDER BY id')
                socials = cur.fetchall()
                return success_response(socials)
            
            elif path == 'champions':
                cur.execute('SELECT * FROM champions ORDER BY year DESC')
                champions = cur.fetchall()
                return success_response(champions)
            
            elif path == 'rules':
                cur.execute("SELECT value FROM settings WHERE key = 'rules'")
                result = cur.fetchone()
                return success_response({'rules': result['value'] if result else ''})
            
            else:
                return error_response('Invalid path', 400)
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'teams':
                cur.execute(
                    'INSERT INTO teams (name, wins, losses, points, goals_for, goals_against, logo) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *',
                    (body_data['name'], body_data.get('wins', 0), body_data.get('losses', 0), 
                     body_data.get('points', 0), body_data.get('goalsFor', 0), 
                     body_data.get('goalsAgainst', 0), body_data.get('logo', ''))
                )
                team = cur.fetchone()
                conn.commit()
                return success_response(team)
            
            elif path == 'matches':
                cur.execute(
                    'INSERT INTO matches (date, time, home_team, away_team, home_score, away_score, home_team_logo, away_team_logo) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *',
                    (body_data['date'], body_data['time'], body_data['homeTeam'], 
                     body_data['awayTeam'], body_data.get('homeScore'), body_data.get('awayScore'),
                     body_data.get('homeTeamLogo', ''), body_data.get('awayTeamLogo', ''))
                )
                match = cur.fetchone()
                conn.commit()
                return success_response(match)
            
            elif path == 'champions':
                cur.execute(
                    'INSERT INTO champions (year, team_name, logo) VALUES (%s, %s, %s) RETURNING *',
                    (body_data['year'], body_data['teamName'], body_data.get('logo', ''))
                )
                champion = cur.fetchone()
                conn.commit()
                return success_response(champion)
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'teams':
                cur.execute(
                    'UPDATE teams SET name=%s, wins=%s, losses=%s, points=%s, goals_for=%s, goals_against=%s, logo=%s WHERE id=%s RETURNING *',
                    (body_data['name'], body_data['wins'], body_data['losses'], 
                     body_data['points'], body_data['goalsFor'], body_data['goalsAgainst'],
                     body_data.get('logo', ''), body_data['id'])
                )
                team = cur.fetchone()
                conn.commit()
                return success_response(team)
            
            elif path == 'socials':
                cur.execute(
                    'UPDATE social_links SET url=%s WHERE platform=%s RETURNING *',
                    (body_data['url'], body_data['platform'])
                )
                social = cur.fetchone()
                conn.commit()
                return success_response(social)
            
            elif path == 'rules':
                cur.execute(
                    "INSERT INTO settings (key, value) VALUES ('rules', %s) ON CONFLICT (key) DO UPDATE SET value=%s, updated_at=CURRENT_TIMESTAMP RETURNING *",
                    (body_data['rules'], body_data['rules'])
                )
                result = cur.fetchone()
                conn.commit()
                return success_response(result)
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            item_id = params.get('id')
            
            if path == 'teams':
                cur.execute('DELETE FROM teams WHERE id=%s', (item_id,))
                conn.commit()
                return success_response({'deleted': True})
            
            elif path == 'matches':
                cur.execute('DELETE FROM matches WHERE id=%s', (item_id,))
                conn.commit()
                return success_response({'deleted': True})
            
            elif path == 'champions':
                cur.execute('DELETE FROM champions WHERE id=%s', (item_id,))
                conn.commit()
                return success_response({'deleted': True})
        
        cur.close()
        conn.close()
        return error_response('Method not allowed', 405)
    
    except Exception as e:
        return error_response(str(e), 500)

def success_response(data: Any) -> Dict[str, Any]:
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps(data, default=str)
    }

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
