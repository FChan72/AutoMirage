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

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.nav-links'); // Используем .nav-links как мобильное меню
    const mobileControls = document.querySelector('.mobile-controls');
    const mobileLoginBtn = document.querySelector('.mobile-login');
    const desktopLoginBtn = document.querySelector('.auth-buttons .btn-login');

    if (menuToggle && mobileMenu) { // Проверяем, что оба элемента найдены
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('active'); // Добавляем/удаляем класс 'active' для показа/скрытия
        });
    }

    document.addEventListener('click', (e) => {
        if (mobileMenu && !e.target.closest('.nav-links') && !e.target.closest('.mobile-controls') && menuToggle && !e.target.closest('.mobile-menu-toggle')) {
            mobileMenu.classList.remove('active');
        }
    });

    function handleLogin() {
        console.log('Login button clicked');
    }

    if (desktopLoginBtn) {
        desktopLoginBtn.addEventListener('click', handleLogin);
    }

    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', handleLogin);
    }

    window.addEventListener('resize', () => {
        if (mobileMenu && window.innerWidth > 768) {
            mobileMenu.classList.remove('active');
        }
    });

    // Модальные окна
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-primary');
    const closeBtns = document.querySelectorAll('.close');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // Открытие модальных окон
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
    });

    // Закрытие модальных окон
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    // Переключение между формами
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Закрытие по клику вне модального окна
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Обработка формы входа
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            });

            const data = await response.json();
            if (data.success) {
                loginModal.style.display = 'none';
                location.reload();
            } else {
                alert(data.error || 'Ошибка при входе');
            }
        } catch (error) {
            alert('Ошибка при отправке запроса');
        }
    });

    // --- Модальное окно подтверждения кода ---
    const codeModal = document.getElementById('codeModal');
    const codeForm = document.getElementById('codeForm');
    const codeCloseBtn = codeModal ? codeModal.querySelector('.close') : null;
    let lastRegisterData = {};

    // Открытие/закрытие окна кода
    if (codeCloseBtn && codeModal) {
        codeCloseBtn.addEventListener('click', () => {
            codeModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (codeModal && e.target === codeModal) {
            codeModal.style.display = 'none';
        }
    });

    // Обработка формы регистрации
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        lastRegisterData = { name, email, password };

        try {
            const response = await fetch('auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=register&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            });

            const data = await response.json();
            if (data.success) {
                registerModal.style.display = 'none';
                location.reload();
            } else if (data.need_code) {
                registerModal.style.display = 'none';
                codeModal.style.display = 'block';
            } else {
                alert(data.error || 'Ошибка при регистрации');
            }
        } catch (error) {
            alert('Ошибка при отправке запроса');
        }
    });

    // Обработка формы кода
    if (codeForm) {
        codeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = document.getElementById('registerCode').value;
            if (!lastRegisterData.email || !lastRegisterData.password || !lastRegisterData.name) {
                alert('Данные регистрации не найдены. Попробуйте снова.');
                codeModal.style.display = 'none';
                return;
            }
            try {
                const response = await fetch('auth.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `action=register&name=${encodeURIComponent(lastRegisterData.name)}&email=${encodeURIComponent(lastRegisterData.email)}&password=${encodeURIComponent(lastRegisterData.password)}&code=${encodeURIComponent(code)}`
                });
                const data = await response.json();
                if (data.success) {
                    codeModal.style.display = 'none';
                    location.reload();
                } else {
                    alert(data.error || 'Ошибка подтверждения');
                }
            } catch (error) {
                alert('Ошибка при отправке запроса');
            }
        });
    }

    // --- Личный кабинет ---
    const userProfileBtn = document.getElementById('userProfileBtn');
    const profileModal = document.getElementById('profileModal');
    const logoutBtn = document.getElementById('logoutBtn');
    // Крестик в модалке профиля
    const profileCloseBtn = profileModal ? profileModal.querySelector('.close') : null;

    if (userProfileBtn && profileModal) {
        userProfileBtn.addEventListener('click', () => {
            profileModal.style.display = 'block';
        });
    }
    if (profileCloseBtn && profileModal) {
        profileCloseBtn.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (profileModal && e.target === profileModal) {
            profileModal.style.display = 'none';
        }
    });
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=logout'
                });
                const data = await response.json();
                if (data.success) {
                    location.reload();
                } else {
                    alert(data.error || 'Ошибка выхода');
                }
            } catch (error) {
                alert('Ошибка при отправке запроса');
            }
        });
    }
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

