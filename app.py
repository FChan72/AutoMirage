from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
import requests
from functools import wraps
from dotenv import load_dotenv
from flask_cors import CORS

# Загрузка переменных окружения
load_dotenv()

# Flask приложение
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///automirage.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Конфигурация OAuth
app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID')
app.config['VK_APP_ID'] = os.getenv('VK_APP_ID')
app.config['VK_APP_SECRET'] = os.getenv('VK_APP_SECRET')

db = SQLAlchemy(app)

# Модели данных
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(100))
    avatar = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    subscription_level = db.Column(db.String(20), default='basic')  # basic, middle, senior
    google_id = db.Column(db.String(100), unique=True)
    vk_id = db.Column(db.String(100), unique=True)

    @property
    def is_pro(self):
        return self.subscription_level in ['middle', 'senior']

    @property
    def max_automations(self):
        limits = {
            'basic': 5,
            'middle': 20,
            'senior': float('inf')
        }
        return limits.get(self.subscription_level, 5)

    @property
    def max_templates(self):
        limits = {
            'basic': 3,
            'middle': 15,
            'senior': float('inf')
        }
        return limits.get(self.subscription_level, 3)

class Automation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    code = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_template = db.Column(db.Boolean, default=False)

# Декоратор для проверки авторизации
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Необходима авторизация'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Маршруты
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email уже зарегистрирован'}), 400
    
    user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Регистрация успешна'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        session['user_id'] = user.id
        return jsonify({
            'message': 'Вход выполнен успешно',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'avatar': user.avatar,
                'is_pro': user.is_pro
            }
        })
    
    return jsonify({'error': 'Неверный email или пароль'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Выход выполнен успешно'})

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    data = request.get_json()
    
    # Проверяем, существует ли пользователь с таким Google ID
    user = User.query.filter_by(google_id=data['google_id']).first()
    
    if not user:
        # Проверяем, существует ли пользователь с таким email
        user = User.query.filter_by(email=data['email']).first()
        
        if user:
            # Если пользователь существует, привязываем Google ID
            user.google_id = data['google_id']
        else:
            # Создаем нового пользователя
            user = User(
                email=data['email'],
                name=data['name'],
                google_id=data['google_id']
            )
            db.session.add(user)
    
    db.session.commit()
    session['user_id'] = user.id
    
    return jsonify({
        'success': True,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'avatar': user.avatar,
            'is_pro': user.is_pro
        }
    })

@app.route('/api/auth/vk', methods=['POST'])
def vk_auth():
    data = request.get_json()
    
    # Проверяем, существует ли пользователь с таким VK ID
    user = User.query.filter_by(vk_id=data['vk_id']).first()
    
    if not user:
        # Проверяем, существует ли пользователь с таким email
        user = User.query.filter_by(email=data['email']).first()
        
        if user:
            # Если пользователь существует, привязываем VK ID
            user.vk_id = data['vk_id']
        else:
            # Создаем нового пользователя
            user = User(
                email=data['email'],
                name=data['name'],
                vk_id=data['vk_id']
            )
            db.session.add(user)
    
    db.session.commit()
    session['user_id'] = user.id
    
    return jsonify({
        'success': True,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'avatar': user.avatar,
            'is_pro': user.is_pro
        }
    })

@app.route('/api/user', methods=['GET'])
@login_required
def get_user():
    user = User.query.get(session['user_id'])
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'avatar': user.avatar,
        'subscription_level': user.subscription_level,
        'is_pro': user.is_pro,
        'max_automations': user.max_automations,
        'max_templates': user.max_templates
    })

@app.route('/api/subscription/upgrade', methods=['POST'])
@login_required
def upgrade_subscription():
    data = request.get_json()
    user = User.query.get(session['user_id'])
    
    # Проверяем, что новый уровень подписки выше текущего
    levels = ['basic', 'middle', 'senior']
    current_level_index = levels.index(user.subscription_level)
    new_level_index = levels.index(data['subscription_level'])
    
    if new_level_index <= current_level_index:
        return jsonify({'error': 'Новый уровень подписки должен быть выше текущего'}), 400
    
    # Здесь должна быть логика обработки платежа
    # В данном примере просто обновляем уровень подписки
    user.subscription_level = data['subscription_level']
    db.session.commit()
    
    return jsonify({
        'message': 'Подписка успешно обновлена',
        'subscription_level': user.subscription_level
    })

@app.route('/api/automations', methods=['GET'])
@login_required
def get_automations():
    user = User.query.get(session['user_id'])
    automations = Automation.query.filter_by(user_id=user.id).all()
    
    # Проверяем лимит автоматизаций
    if len(automations) >= user.max_automations:
        return jsonify({
            'error': f'Достигнут лимит автоматизаций для вашего тарифа ({user.max_automations})',
            'automations': [{
                'id': a.id,
                'name': a.name,
                'description': a.description,
                'created_at': a.created_at.isoformat()
            } for a in automations]
        }), 403
    
    return jsonify([{
        'id': a.id,
        'name': a.name,
        'description': a.description,
        'created_at': a.created_at.isoformat()
    } for a in automations])

@app.route('/api/automations', methods=['POST'])
def create_automation():
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима авторизация'}), 401
    
    data = request.get_json()
    automation = Automation(
        user_id=session['user_id'],
        name=data['name'],
        description=data.get('description', ''),
        code=data['code']
    )
    
    db.session.add(automation)
    db.session.commit()
    
    return jsonify({
        'id': automation.id,
        'message': 'Автоматизация создана'
    }), 201

@app.route('/api/templates', methods=['GET'])
@login_required
def get_templates():
    user = User.query.get(session['user_id'])
    templates = Automation.query.filter_by(is_template=True).all()
    
    # Фильтруем шаблоны в зависимости от уровня подписки
    if user.subscription_level == 'basic':
        templates = templates[:user.max_templates]
    
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'description': t.description,
        'available': user.subscription_level != 'basic' or templates.index(t) < user.max_templates
    } for t in templates])

# Создание таблиц базы данных
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5000) 