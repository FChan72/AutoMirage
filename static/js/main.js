// Анимация появления элементов при скролле
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .template-card, .pricing-card').forEach(el => {
    observer.observe(el);
});

// Плавная прокрутка к секциям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Анимация кнопок
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
});

// Таймер экономии времени
let savedMinutes = 0;

function updateTime(saved) {
    savedMinutes += saved;
    const timeElement = document.querySelector('#saved-time');
    if (timeElement) {
        timeElement.innerHTML = `
            <div class="magic-effect">
                ✨ Вы сэкономили: ${savedMinutes} минут!
            </div>
        `;
    }
}

// Модальное окно для входа
const loginButton = document.querySelector('.btn-login');
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Вход в систему</h2>
        <form id="login-form">
            <input type="email" name="email-login" placeholder="Email" required>
            <input type="password" name="password-login" placeholder="Пароль" required>
            <button type="submit" class="btn btn-primary">Войти</button>
        </form>
        <div class="social-login">
            <p>Войти через:</p>
            <div class="social-buttons">
                <button class="btn btn-social google" onclick="loginWithGoogle()">
                    <i class="fab fa-google"></i> Google
                </button>
                <button class="btn btn-social vk" onclick="loginWithVK()">
                    <i class="fab fa-vk"></i> VK
                </button>
            </div>
        </div>
        <div class="register-link">
            <p>У вас нет аккаунта? <a href="#" id="show-register">Зарегистрироваться</a></p>
        </div>
    </div>
`;

// Модальное окно для регистрации
const registerModal = document.createElement('div');
registerModal.className = 'modal';
registerModal.innerHTML = `
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Регистрация</h2>
        <form id="register-form">
            <input type="email" name="email-reg" placeholder="Email" required>
            <input type="password" name="password-reg" placeholder="Пароль" required>
            <input type="password" name="password2-reg" placeholder="Подтвердите пароль" required>
            <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
        </form>
        <div class="social-login">
            <p>Зарегистрироваться через:</p>
            <div class="social-buttons">
                <button class="btn btn-social google" onclick="registerWithGoogle()">
                    <i class="fab fa-google"></i> Google
                </button>
                <button class="btn btn-social vk" onclick="registerWithVK()">
                    <i class="fab fa-vk"></i> VK
                </button>
            </div>
        </div>
        <div class="login-link">
            <p>Уже есть аккаунт? <a href="#" id="show-login">Войти</a></p>
        </div>
    </div>
`;

// Функции для входа через социальные сети
function loginWithGoogle() {
    // Инициализация Google Sign-In
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: 'YOUR_GOOGLE_CLIENT_ID'
        }).then(function(auth2) {
            auth2.signIn().then(function(googleUser) {
                const profile = googleUser.getBasicProfile();
                // Отправка данных на сервер
                fetch('/api/auth/google', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: profile.getEmail(),
                        name: profile.getName(),
                        google_id: profile.getId()
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateUIAfterLogin(data.user);
                        modal.style.display = 'none';
                    }
                });
            });
        });
    });
}

function loginWithVK() {
    VK.Auth.login(function(response) {
        if (response.session) {
            VK.Api.call('users.get', {fields: 'email'}, function(data) {
                if (data.response) {
                    const user = data.response[0];
                    // Отправка данных на сервер
                    fetch('/api/auth/vk', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            vk_id: user.id,
                            name: `${user.first_name} ${user.last_name}`,
                            email: user.email
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            updateUIAfterLogin(data.user);
                            modal.style.display = 'none';
                        }
                    });
                }
            });
        }
    });
}

// Обработка закрытия модальных окон
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }
});

// Обработка форм
if (loginButton) {
    loginButton.addEventListener('click', () => {
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    });
}

// Показать форму регистрации
document.addEventListener('click', (e) => {
    if (e.target.id === 'show-register') {
        e.preventDefault();
        modal.style.display = 'none';
        document.body.appendChild(registerModal);
        registerModal.style.display = 'flex';
    }
});

// Показать форму входа
document.addEventListener('click', (e) => {
    if (e.target.id === 'show-login') {
        e.preventDefault();
        registerModal.style.display = 'none';
        modal.style.display = 'flex';
    }
});

// Обработка формы входа
document.addEventListener('submit', (e) => {
    if (e.target.id === 'login-form') {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else {
                updateUIAfterLogin(data);
                modal.style.display = 'none';
            }
        });
    }
});

// Обработка формы регистрации
document.addEventListener('submit', (e) => {
    if (e.target.id === 'register-form') {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const password = formData.get('password');
        const passwordConfirm = formData.get('password_confirm');
        
        if (password !== passwordConfirm) {
            showError('Пароли не совпадают');
            return;
        }
        
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            showSuccess('Регистрация успешна! Теперь вы можете войти.');
            registerModal.style.display = 'none';
            modal.style.display = 'flex';
        })
        .catch(error => {
            showError(error.error || 'Ошибка регистрации');
        });
    }
});

// Обновление UI после входа
function updateUIAfterLogin(user) {
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <div class="user-profile">
            <img src="${user.avatar || 'static/images/default-avatar.png'}" alt="Avatar" class="avatar">
            <span>${user.name || user.email}</span>
            <button class="btn btn-logout" onclick="logout()">Выйти</button>
        </div>
    `;
}

// Выход из системы
function logout() {
    fetch('/api/logout', {
        method: 'POST'
    })
    .then(() => {
        location.reload();
    });
}

// Показать ошибку
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.modal-content').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Показать успешное сообщение
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.modal-content').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Добавление стилей для модального окна
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 10px;
        position: relative;
        width: 90%;
        max-width: 400px;
    }

    .close {
        position: absolute;
        right: 1rem;
        top: 1rem;
        font-size: 1.5rem;
        cursor: pointer;
    }

    #login-form, #register-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
    }

    #login-form input, #register-form input {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .social-login {
        margin-top: 1.5rem;
        text-align: center;
    }

    .social-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 0.5rem;
    }

    .btn-social {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        color: var(--text-color);
    }

    .btn-social.google:hover {
        background: #DB4437;
        color: white;
    }

    .btn-social.vk:hover {
        background: #4C75A3;
        color: white;
    }

    .register-link, .login-link {
        margin-top: 1rem;
        text-align: center;
    }

    .error-message {
        background-color: #ffebee;
        color: #c62828;
        padding: 0.5rem;
        border-radius: 5px;
        margin-bottom: 1rem;
    }

    .success-message {
        background-color: #e8f5e9;
        color: #2e7d32;
        padding: 0.5rem;
        border-radius: 5px;
        margin-bottom: 1rem;
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }

    .btn-logout {
        margin-left: auto;
        background: none;
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
    }

    .btn-logout:hover {
        background: var(--primary-color);
        color: white;
    }
`;

document.head.appendChild(modalStyles);

// Добавление анимации для карточек
document.querySelectorAll('.feature-card, .template-card, .pricing-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// Добавление класса visible для анимации
document.querySelectorAll('.feature-card, .template-card, .pricing-card').forEach(card => {
    card.classList.add('visible');
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
}); 
