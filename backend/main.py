import json
from flask import Flask, request, jsonify
from time import sleep
import flask_cors
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk import capture_exception
import os




sentry_sdk.init(
    #NOTE TO SELF do not push the sentry dsn to github AGAIN! PS if you do do it its under settings>sdk setup>client keys (DSN) disable leaked dsn and create a new one!
    #FFS if you push the .env file to github i will loose all my trust in myself
    dsn=os.getenv('SENTRY_DSN'),
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for tracing.
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0,
    _experiments={
        # Set continuous_profiling_auto_start to True
        # to automatically start the profiler on when
        # possible.
        "continuous_profiling_auto_start": True,
    },
)


app = Flask(__name__)
CORS(app, supports_credentials=True)



# Database connection
engine = create_engine('mysql+pymysql://app:app123@db:3306/hs-counter')

def get_db_connection():
    try:
        connection = engine.connect()
        return connection
    except OperationalError as err:
        print(f"OperationalError: {err}")
        return None

def log_action(log_level, message, user_id=None, username=None, method=None, url=None, status_code=None, stack_trace=None, ip_address=None, device=None):
    connection = get_db_connection()
    if connection:
        try:
            connection.execute(text("""
                INSERT INTO logs (timestamp, log_level, message, module, user_id, username, method, url, status_code, stack_trace, ip_address, device)
                VALUES (:timestamp, :log_level, :message, :module, :user_id, :username, :method, :url, :status_code, :stack_trace, :ip_address, :device)
            """), {
                'timestamp': datetime.utcnow(),
                'log_level': log_level,
                'message': message,
                'module': 'main.py',
                'user_id': user_id,
                'username': username,
                'method': method,
                'url': url,
                'status_code': status_code,
                'stack_trace': stack_trace,
                'ip_address': request.remote_addr,
                'device': request.user_agent.platform
            })
            connection.commit()
        except Exception as e:
            capture_exception(e)
            print(f"Logging error: {e}")
        finally:
            connection.close()





@app.route('/api/search_users', methods=['OPTIONS', 'GET'])
def search_users():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    query = request.args.get('query', '').lower()
    user_type = request.args.get('userType', 'student').lower()
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for search_users')
        return jsonify([]), 500


    if user_type == 'teacher':
        # Query the users table for teachers
        result = connection.execute(text("SELECT id, name, email FROM users WHERE LOWER(name) LIKE :query OR LOWER(email) LIKE :query"), {'query': f'%{query}%'})
    else:
        # Query the students table
        result = connection.execute(text("SELECT id, first_name as name FROM students WHERE LOWER(first_name) LIKE :query OR LOWER(last_name) LIKE :query"), {'query': f'%{query}%'})

    
    filtered_users = [dict(row._mapping) for row in result]
    connection.close()

    log_action('INFO', 'search_users executed successfully', method=request.method, url=request.url, status_code=200)
    response = jsonify(filtered_users)
    response.headers.add("Access-Control-Allow-Origin", os.getenv("FRONTEND_URL"))
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

@app.route('/search_teachers', methods=['OPTIONS', 'GET'])
def search_teachers():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    query = request.args.get('query', '').lower()
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for search_teachers')
        return jsonify([]), 500

    # Simulate API call delay
    sleep(0.3)  # 300ms delay

    # Query the users table for teachers
    result = connection.execute(text("SELECT id, name, email FROM users WHERE LOWER(name) LIKE :query OR LOWER(email) LIKE :query"), {'query': f'%{query}%'})
    filtered_teachers = [dict(row._mapping) for row in result]
    connection.close()

    log_action('INFO', 'search_teachers executed successfully', method=request.method, url=request.url, status_code=200)
    response = jsonify(filtered_teachers)
    response.headers.add("Access-Control-Allow-Origin", os.getenv("FRONTEND_URL"))
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

def _build_cors_preflight_response():
    response = jsonify({'status': 'OK'})
    response.headers.add("Access-Control-Allow-Origin", os.getenv("FRONTEND_URL"))
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type")
    response.status_code = 204  # Preflight requests expect a No Content (204) response
    return response


@app.route("/login", methods=["OPTIONS", "POST"])
def auth():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    useGoogle = data.get('useGoogle')
    
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for login')
        return jsonify({"error": "Database connection failed"}), 500

    # Query the user table
    result = connection.execute(text("SELECT * FROM users WHERE email = :username"), {'username': username})
    user = result.fetchone()
    if not useGoogle:
        if user and check_password_hash(user[2], password):  # Access password by index
            token = user[5]  # Assuming 'token' is the 6th column in the 'users' table
            if not token or len(token) != 36:
                token = str(uuid.uuid4())
                connection.execute(text("UPDATE users SET token = :token WHERE id = :id"), {'token': token, 'id': user[0]})
                connection.commit()  # Ensure the token is committed to the database
            connection.close()
            log_action('INFO', 'User logged in successfully', user_id=user[0], username=username, method=request.method, url=request.url, status_code=200)
            return jsonify(token=token)
        else:
            connection.close()
            log_action('ERROR', 'Invalid login attempt', username=username, method=request.method, url=request.url, status_code=401)
            return jsonify({"error": "Invalid credentials"}), 401
    else:
        if not user[6]:
            connection.execute(text("UPDATE users SET google_sub = :google_sub WHERE id = :id"), {'google_sub': data.get('password'), 'id': user[0]})
            connection.commit()
            connection.close()
            log_action('INFO', 'User logged in successfully', user_id=user[0], username=username, method=request.method, url=request.url, status_code=200)
            return jsonify(token=user[5])
        else:
            if user[6] == password:
                token = user[5]
                return jsonify(token=token)
            else:
                return jsonify({"error": "Invalid credentials"}), 401
            
@app.route('/api/getstudents', methods=['OPTIONS', 'GET'])
def get_students():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for get_students')
        return jsonify([]), 500

    # Query the students table and join with the users table to get the teacher's name
    result = connection.execute(text("""
        SELECT students.id, students.first_name, students.last_name, students.points, students.grad_year, students.house, users.name as teacher_name
        FROM students
        LEFT JOIN users ON students.teacher = users.id
    """))
    students = [dict(row._mapping) for row in result]
    connection.close()

    log_action('INFO', 'get_students executed successfully', method=request.method, url=request.url, status_code=200)
    return jsonify(students)

@app.route('/api/currentuser', methods=['OPTIONS', 'GET'])
def get_current_user():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    print(auth_header)
    if not auth_header:
        log_action('ERROR', 'Token is missing for get_current_user', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header
    print(token)

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for get_current_user')
        return jsonify({"error": "Database connection failed"}), 500

    result = connection.execute(text("SELECT id, name, email FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    connection.close()

    if user:
        user_dict = dict(user._mapping)
        log_action('INFO', 'get_current_user executed successfully', user_id=user[0], username=user[1], method=request.method, url=request.url, status_code=200)
        return jsonify(user_dict)
    else:
        log_action('ERROR', 'User not found for get_current_user', method=request.method, url=request.url, status_code=404)
        return jsonify({"error": "User not found"}), 404

@app.route('/api/addstudent', methods=['OPTIONS', 'POST'])
def add_student():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for add_student', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else token

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for add_student')
        return jsonify({"error": "Database connection failed"}), 500

    result = connection.execute(text("SELECT id FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    if not user:
        connection.close()
        log_action('ERROR', 'Invalid token for add_student', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Invalid token"}), 401

    data = request.get_json()
    try:
        connection.execute(text("""
            INSERT INTO students (first_name, last_name, grad_year, points, teacher, house)
            VALUES (:first_name, :last_name, :grad_year, :points, :teacher_id, :house)
        """), data)
        connection.commit()  # Ensure the transaction is committed
        connection.close()
        log_action('INFO', 'Student added successfully', user_id=user[0], method=request.method, url=request.url, status_code=201)
        return jsonify({"status": "success"}), 201
    except Exception as e:
        connection.rollback()  # Rollback the transaction in case of error
        connection.close()
        log_action('ERROR', f'Error adding student: {e}', user_id=user[0], method=request.method, url=request.url, status_code=500, stack_trace=str(e))
        print(f"Error: {e}")  # Log the error
        return jsonify({"error": str(e)}), 500

@app.route('/api/gethouses', methods=['OPTIONS', 'GET'])
def get_houses():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for get_houses')
        return jsonify([]), 500

    result = connection.execute(text("SELECT id, name FROM houses"))
    houses = [dict(row._mapping) for row in result]
    connection.close()

    log_action('INFO', 'get_houses executed successfully', method=request.method, url=request.url, status_code=200)
    return jsonify(houses)

@app.route('/api/gethousepoints', methods=['OPTIONS', 'GET'])
def get_house_points():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    house_id = request.args.get('houseId')
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for get_house_points')
        return jsonify({"points": 0}), 500

    result = connection.execute(text("SELECT SUM(points) as points FROM students WHERE house = :house_id"), {'house_id': house_id})
    points = result.fetchone()[0] or 0  # Access the first element of the tuple
    connection.close()

    log_action('INFO', 'get_house_points executed successfully', method=request.method, url=request.url, status_code=200)
    return jsonify({"points": points})

@app.route('/api/topteachers', methods=['OPTIONS', 'GET'])
def top_teachers():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for top_teachers')
        return jsonify([]), 500

    result = connection.execute(text("""
        SELECT users.name, SUM(students.points) as total_points
        FROM students
        JOIN users ON students.teacher = users.id
        GROUP BY users.name
        ORDER BY total_points DESC
        LIMIT 10
    """))
    top_teachers = [{"rank": idx + 1, "name": row[0], "value": row[1]} for idx, row in enumerate(result)]
    connection.close()

    log_action('INFO', 'top_teachers executed successfully', method=request.method, url=request.url, status_code=200)
    return jsonify(top_teachers)

@app.route('/api/topstudents', methods=['OPTIONS', 'GET'])
def top_students():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for top_students')
        return jsonify([]), 500

    result = connection.execute(text("""
        SELECT first_name, last_name, points
        FROM students
        ORDER BY points DESC
        LIMIT 10
    """))
    top_students = [{"rank": idx + 1, "name": f"{row[0]} {row[1]}", "value": row[2]} for idx, row in enumerate(result)]
    connection.close()

    log_action('INFO', 'top_students executed successfully', method=request.method, url=request.url, status_code=200)
    return jsonify(top_students)

@app.route('/api/editself', methods=['OPTIONS', 'PUT'])
def edit_self():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for edit_self', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401
    
    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header
    
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for edit_self')
        return jsonify({"error": "Database connection failed"}), 500
    
    result = connection.execute(text("SELECT id, name, email, password FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    if not user:
        connection.close()
        log_action('ERROR', 'Invalid token for edit_self', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Invalid token"}), 401
    
    data = request.get_json()
    updates = {}
    if 'name' in data:
        updates['name'] = data['name']
    if 'email' in data:
        updates['email'] = data['email']
    if 'currentPassword' in data and 'newPassword' in data:
        if check_password_hash(user[3], data['currentPassword']):  # Access password by index
            updates['password'] = generate_password_hash(data['newPassword'])
        else:
            connection.close()
            log_action('ERROR', 'Invalid current password for edit_self', user_id=user[0], method=request.method, url=request.url, status_code=401)
            return jsonify({"error": "Invalid current password"}), 401

    if updates:
        try:
            connection.execute(text("UPDATE users SET " + ", ".join(f"{key} = :{key}" for key in updates.keys()) + " WHERE id = :id"), {**updates, 'id': user[0]})
            connection.commit()
            connection.close()
            log_action('INFO', 'User edited successfully', user_id=user[0], method=request.method, url=request.url, status_code=200)
            return jsonify({"status": "success"}), 200
        except Exception as e:
            connection.rollback()
            connection.close()
            log_action('ERROR', f'Error editing user: {e}', user_id=user[0], method=request.method, url=request.url, status_code=500, stack_trace=str(e))
            return jsonify({"error": str(e)}), 500
    else:
        connection.close()
        log_action('INFO', 'No changes made for edit_self', user_id=user[0], method=request.method, url=request.url, status_code=200)
        return jsonify({"status": "no changes made"}), 200

@app.route('/api/isadmin', methods=['OPTIONS', 'GET'])
def is_admin():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for is_admin', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for is_admin')
        return jsonify({"error": "Database connection failed"}), 500

    result = connection.execute(text("SELECT admin FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    connection.close()

    if user and user[0] == 1:
        log_action('INFO', 'is_admin executed successfully', user_id=user[0], method=request.method, url=request.url, status_code=200)
        return jsonify({"is_admin": True})
    else:
        log_action('INFO', 'is_admin executed successfully', user_id=user[0], method=request.method, url=request.url, status_code=200)
        return jsonify({"is_admin": False})

@app.route('/admin', methods=['OPTIONS', 'GET'])
def admin_page():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for admin_page', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for admin_page')
        return jsonify({"error": "Database connection failed"}), 500

    result = connection.execute(text("SELECT admin FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    connection.close()

    if user and user[0] == 1:
        log_action('INFO', 'Admin accessed admin_page', user_id=user[0], method=request.method, url=request.url, status_code=200)
        return jsonify({"message": "Welcome to the admin page"})
    else:
        log_action('ERROR', 'Access denied for admin_page', user_id=user[0], method=request.method, url=request.url, status_code=403)
        return jsonify({"error": "Access denied"}), 403

@app.route('/api/awardpoints', methods=['OPTIONS', 'POST'])
def award_points():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for award_points', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for award_points')
        return jsonify({"error": "Database connection failed"}), 500

    result = connection.execute(text("SELECT id FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    if not user:
        connection.close()
        log_action('ERROR', 'Invalid token for award_points', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Invalid token"}), 401

    data = request.get_json()
    try:
        connection.execute(text("""
            INSERT INTO transaction_log (student_id, ammount, reason, teacher_id)
            VALUES (:student_id, :points, :reason, :teacher_id)
        """), {'student_id': data['studentId'], 'points': data['points'], 'reason': data['reason'], 'teacher_id': user[0]})
        connection.execute(text("""
            UPDATE students SET points = points + :points WHERE id = :student_id
        """), {'points': data['points'], 'student_id': data['studentId']})
        connection.commit()
        connection.close()
        log_action('INFO', 'Points awarded successfully', user_id=user[0], method=request.method, url=request.url, status_code=201)
        return jsonify({"status": "success"}), 201
    except Exception as e:
        connection.rollback()
        connection.close()
        log_action('ERROR', f'Error awarding points: {e}', user_id=user[0], method=request.method, url=request.url, status_code=500, stack_trace=str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/getteachers', methods=['OPTIONS', 'GET'])
def get_teachers():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for get_teachers')
        return jsonify([]), 500

    result = connection.execute(text("SELECT id, name, email, admin FROM users"))
    teachers = [dict(row._mapping) for row in result]
    connection.close()

    log_action('INFO', 'get_teachers executed successfully', method=request.method, url=request.url, status_code=200)
    return jsonify(teachers)

@app.route('/api/deleteteacher', methods=['OPTIONS', 'DELETE'])
def delete_teacher():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for delete_teacher', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for delete_teacher')
        return jsonify({"error": "Database connection failed"}), 500

    result = connection.execute(text("SELECT id FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    if not user:
        connection.close()
        log_action('ERROR', 'Invalid token for delete_teacher', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Invalid token"}), 401

    data = request.get_json()
    user_id = data.get('userId')
    if not user_id:
        connection.close()
        log_action('ERROR', 'User ID is missing for delete_teacher', method=request.method, url=request.url, status_code=400)
        return jsonify({"error": "User ID is missing"}), 400

    try:
        connection.execute(text("UPDATE students SET teacher = 1 WHERE teacher = :user_id"), {'user_id': user_id})
        connection.execute(text("DELETE FROM users WHERE id = :user_id"), {'user_id': user_id})
        connection.commit()
        connection.close()
        log_action('INFO', 'Teacher deleted successfully', user_id=user[0], method=request.method, url=request.url, status_code=200)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        connection.rollback()
        connection.close()
        log_action('ERROR', f'Error deleting teacher: {e}', user_id=user[0], method=request.method, url=request.url, status_code=500, stack_trace=str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/deletestudent', methods=['OPTIONS', 'DELETE'])
def delete_student():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for delete_student', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for delete_student')
        return jsonify({"error": "Database connection failed"}), 500

    result = connection.execute(text("SELECT id FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    if not user:
        connection.close()
        log_action('ERROR', 'Invalid token for delete_student', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Invalid token"}), 401

    data = request.get_json()
    student_id = data.get('userId')
    if not student_id:
        connection.close()
        log_action('ERROR', 'Student ID is missing for delete_student', method=request.method, url=request.url, status_code=400)
        return jsonify({"error": "Student ID is missing"}), 400

    try:
        # Delete related entries in transaction_log first
        connection.execute(text("DELETE FROM transaction_log WHERE student_id = :student_id"), {'student_id': student_id})
        connection.execute(text("DELETE FROM students WHERE id = :student_id"), {'student_id': student_id})
        connection.commit()
        connection.close()
        log_action('INFO', 'Student deleted successfully', user_id=user[0], method=request.method, url=request.url, status_code=200)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        connection.rollback()
        connection.close()
        log_action('ERROR', f'Error deleting student: {e}', user_id=user[0], method=request.method, url=request.url, status_code=500, stack_trace=str(e))
        return jsonify({"error": str(e)}), 500

def is_admin_user(token):
    connection = get_db_connection()
    if not connection:
        return False
    result = connection.execute(text("SELECT admin FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    connection.close()
    return user and user[0] == 1

@app.route('/api/clearhousepoints', methods=['OPTIONS', 'POST'])
def clear_housepoints():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for clear_housepoints', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header

    if not is_admin_user(token):
        log_action('ERROR', 'Unauthorized access to clear_housepoints', method=request.method, url=request.url, status_code=403)
        return jsonify({"error": "Unauthorized"}), 403

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for clear_housepoints')
        return jsonify({"error": "Database connection failed"}), 500

    try:
        connection.execute(text("UPDATE students SET points = 0"))
        connection.commit()
        connection.close()
        log_action('INFO', 'House points cleared successfully', method=request.method, url=request.url, status_code=200)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        connection.rollback()
        connection.close()
        log_action('ERROR', f'Error clearing house points: {e}', method=request.method, url=request.url, status_code=500, stack_trace=str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/deleteallstudents', methods=['OPTIONS', 'DELETE'])
def delete_all_students():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for delete_all_students', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header

    if not is_admin_user(token):
        log_action('ERROR', 'Unauthorized access to delete_all_students', method=request.method, url=request.url, status_code=403)
        return jsonify({"error": "Unauthorized"}), 403

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for delete_all_students')
        return jsonify({"error": "Database connection failed"}), 500

    try:
        # Delete related entries in transaction_log first
        connection.execute(text("DELETE FROM transaction_log WHERE student_id IN (SELECT id FROM students)"))
        connection.execute(text("DELETE FROM students"))
        connection.commit()
        connection.close()
        log_action('INFO', 'All students deleted successfully', method=request.method, url=request.url, status_code=200)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        connection.rollback()
        connection.close()
        log_action('ERROR', f'Error deleting all students: {e}', method=request.method, url=request.url, status_code=500, stack_trace=str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/addteacher', methods=['OPTIONS', 'POST'])
def add_teacher():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for add_teacher', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header

    if not is_admin_user(token):
        log_action('ERROR', 'Unauthorized access to add_teacher', method=request.method, url=request.url, status_code=403)
        return jsonify({"error": "Unauthorized"}), 403

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for add_teacher')
        return jsonify({"error": "Database connection failed"}), 500

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    hashed_password = generate_password_hash(password)

    try:
        connection.execute(text("""
            INSERT INTO users (name, email, password, admin, token)
            VALUES (:name, :email, :password, 0, :token)
        """), {'name': name, 'email': email, 'password': hashed_password, 'token': str(uuid.uuid4())})
        connection.commit()
        connection.close()
        log_action('INFO', 'Teacher added successfully', method=request.method, url=request.url, status_code=201)
        return jsonify({"status": "success"}), 201
    except Exception as e:
        connection.rollback()
        connection.close()
        log_action('ERROR', f'Error adding teacher: {e}', method=request.method, url=request.url, status_code=500, stack_trace=str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/logs', methods=['GET'])
def get_logs():
    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for get_logs')
        return jsonify([]), 500

    result = connection.execute(text("""
        SELECT id, timestamp, log_level as level, message, module, user_id, username, method, url, status_code, stack_trace, ip_address, device
        FROM logs
        ORDER BY timestamp DESC
        LIMIT 500
    """))
    logs = [dict(row._mapping) for row in result]
    connection.close()

    log_action('INFO', 'get_logs executed successfully', method=request.method, url=request.url, status_code=200)
    return jsonify(logs)

@app.route('/api/archive', methods=['OPTIONS', 'POST', "GET"])
def archive():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    auth_header = request.headers.get('Authorization')
    if request.method == 'POST' and not auth_header:
        log_action('ERROR', 'Token is missing for archiving', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401

    connection = get_db_connection()
    if not connection:
        log_action('ERROR', 'Database connection failed for archive')
        return jsonify([]), 500
    
    if request.method == 'POST':
        token = auth_header.split(" ")[-1] if " " in auth_header else auth_header
        data = request.get_json()
        should_reset = data.get('resetstats', False) if data else False

        datajson = []
        try:
            # Get total number of students
            student_count = connection.execute(text("SELECT COUNT(*) FROM students")).fetchone()[0]

            # Get house data
            houses = connection.execute(text("SELECT id, name FROM houses"))
            for house in houses:
                points = connection.execute(text("""
                    SELECT SUM(points) as total_points FROM students WHERE house = :house_id
                """), {'house_id': house[0]})
                house_points = float(points.fetchone()[0] or 0)
                datajson.append({
                    'house_id': house[0],
                    'house_name': house[1],
                    'total_points': house_points
                })
            
            # Store archive with timestamp
            connection.execute(text("""
                INSERT INTO archive (data, studentammount, timestamp) 
                VALUES (:data, :student_count, NOW())
            """), {
                'data': json.dumps(datajson),
                'student_count': student_count
            })
            connection.commit()
            
            # Only reset points if requested and user is admin
            if should_reset and is_admin_user(token):
                connection.execute(text("UPDATE students SET points = 0"))
                connection.commit()
            
            connection.close()
            log_action('INFO', 'Data archived successfully', method=request.method, url=request.url, status_code=201)
            return jsonify({"status": "success", "archived_data": datajson}), 201
            
        except Exception as e:
            connection.rollback()
            connection.close()
            log_action('ERROR', f'Error archiving: {e}', method=request.method, url=request.url, status_code=500, stack_trace=str(e))
            return jsonify({"error": str(e)}), 500
    
    if request.method == 'GET':
        try:
            result = connection.execute(text("""
                SELECT id, timestamp, data, studentammount 
                FROM archive 
                ORDER BY timestamp DESC
            """))
            archives = []
            for row in result:
                try:
                    timestamp_str = row[1]
                    formatted_timestamp = None
                    if timestamp_str:
                        try:
                            if isinstance(timestamp_str, str):
                                
                                timestamp_str = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
                            
                            formatted_timestamp = timestamp_str.strftime("%Y-%m-%d %H:%M:%S")
                        except (ValueError, TypeError):
                            # If timestamp parsing fails, use None
                            formatted_timestamp = None
                            
                    archives.append({
                        'id': row[0],
                        'timestamp': formatted_timestamp,
                        'houses': json.loads(row[2]) if row[2] else [],
                        'student_count': row[3]
                    })
                except (json.JSONDecodeError, TypeError, IndexError) as e:
                    log_action('WARNING', f'Error parsing archive row: {e}', method=request.method, url=request.url)
                    continue
                    
            connection.close()
            return jsonify(archives)
        except Exception as e:
            connection.close()
            log_action('ERROR', f'Error retrieving archives: {e}', method=request.method, url=request.url, status_code=500, stack_trace=str(e))
            return jsonify({"error": str(e)}), 500

@app.route('/api/editstudent', methods=['OPTIONS', 'PUT'])
def editStudent():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for edit_student', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401
    
    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header
    
    connection = get_db_connection()
    
    if not connection:
        log_action('ERROR', 'Database connection failed for edit_student')
        return jsonify({"error": "Database connection failed"}), 500
    
    result = connection.execute(text("SELECT id, name, email, password FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    if not user:
        connection.close()
        log_action('ERROR', 'Invalid token for edit_student', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Invalid token"}), 401
    
    data = request.get_json()
    
    updates = {}
    
    if 'first_name' in data:
        updates['first_name'] = data['first_name']
    if 'last_name' in data:
        updates['last_name'] = data['last_name']
    if 'grad_year' in data:
        updates['grad_year'] = data['grad_year']
    if 'points' in data:
        updates['points'] = data['points']
    if 'teacher' in data:
        updates['teacher'] = data['teacher']
    if 'house' in data:
        updates['house'] = data['house']
        
    if updates:
        try:
            connection.execute(text("UPDATE students SET " + ", ".join(f"{key} = :{key}" for key in updates.keys()) + " WHERE id = :id"), {**updates, 'id': data['id']})
            connection.commit()
            connection.close()
            log_action('INFO', 'Student edited successfully', user_id=user[0], method=request.method, url=request.url, status_code=200)
            return jsonify({"status": "success"}), 200
        except Exception as e:
            connection.rollback()
            connection.close()
            log_action('ERROR', f'Error editing student: {e}', user_id=user[0], method=request.method, url=request.url, status_code=500, stack_trace=str(e))
            return jsonify({"error": str(e)}), 500
        
        
@app.route('/api/editteacher', methods=['OPTIONS', 'PUT'])
def editTeacher():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        log_action('ERROR', 'Token is missing for edit_teacher', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Token is missing"}), 401
    
    token = auth_header.split(" ")[-1] if " " in auth_header else auth_header
    
    connection = get_db_connection()
    
    if not connection:
        log_action('ERROR', 'Database connection failed for edit_teacher')
        return jsonify({"error": "Database connection failed"}), 500
    
    result = connection.execute(text("SELECT id, name, email, password FROM users WHERE token = :token"), {'token': token})
    user = result.fetchone()
    if not user:
        connection.close()
        log_action('ERROR', 'Invalid token for edit_teacher', method=request.method, url=request.url, status_code=401)
        return jsonify({"error": "Invalid token"}), 401
    
    data = request.get_json()
    
    updates = {}
    
    if 'name' in data:
        updates['name'] = data['name']
    if 'email' in data:
        updates['email'] = data['email']
    if 'admin' in data:
        updates['admin'] = data['admin']
    if 'password' in data:
        updates['password'] = generate_password_hash(data['password'])
        
    if updates:
        try:
            connection.execute(text("UPDATE users SET " + ", ".join(f"{key} = :{key}" for key in updates.keys()) + " WHERE id = :id"), {**updates, 'id': data['id']})
            connection.commit()
            connection.close()
            log_action('INFO', 'Teacher edited successfully', user_id=user[0], method=request.method, url=request.url, status_code=200)
            return jsonify({"status": "success"}), 200
        except Exception as e:
            connection.rollback()
            connection.close()
            log_action('ERROR', f'Error editing teacher: {e}', user_id=user[0], method=request.method, url=request.url, status_code=500, stack_trace=str(e))
            return jsonify({"error": str(e)}), 500    
        
                
                
                
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)
