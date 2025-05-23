<?php
session_start();
header('Content-Type: application/json');

$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'automirage';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Ошибка подключения к базе данных']));
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'login':
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        
        $stmt = $conn->prepare("SELECT id, email, name, password FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            if (password_verify($password, $row['password'])) {
                $_SESSION['user_id'] = $row['id'];
                $_SESSION['user_email'] = $row['email'];
                $_SESSION['user_name'] = $row['name'];
                echo json_encode(['success' => true, 'user' => [
                    'id' => $row['id'],
                    'email' => $row['email'],
                    'name' => $row['name']
                ]]);
            } else {
                echo json_encode(['error' => 'Неверный пароль']);
            }
        } else {
            echo json_encode(['error' => 'Пользователь не найден']);
        }
        break;
        
    case 'register':
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $name = $_POST['name'] ?? '';
        $code = $_POST['code'] ?? '';

        if (empty($email) || empty($password) || empty($name)) {
            echo json_encode(['error' => 'Все поля обязательны для заполнения']);
            break;
        }

        // Если не пришёл код, отправляем его на email
        if (empty($code)) {
            $verify_code = random_int(10000000, 99999999);
            $_SESSION['register_code'] = $verify_code;
            $_SESSION['register_email'] = $email;
            $_SESSION['register_password'] = password_hash($password, PASSWORD_DEFAULT);
            $_SESSION['register_name'] = $name;

            $subject = 'Код подтверждения регистрации на AutoMirage';
            $message = "Ваш код подтверждения: $verify_code";
            $headers = "From: no-reply@automirage.local\r\nContent-type: text/plain; charset=utf-8";
            
            if (mail($email, $subject, $message, $headers)) {
                echo json_encode(['need_code' => true]);
            } else {
                echo json_encode(['error' => 'Не удалось отправить письмо. Проверьте email.']);
            }
            break;
        }

        // Проверяем код
        if (!isset($_SESSION['register_code']) || $code != $_SESSION['register_code']) {
            echo json_encode(['error' => 'Неверный код подтверждения']);
            break;
        }

        // Регистрируем пользователя
        $email = $_SESSION['register_email'];
        $hashed_password = $_SESSION['register_password'];
        $name = $_SESSION['register_name'];

        $stmt = $conn->prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $email, $hashed_password, $name);

        if ($stmt->execute()) {
            $_SESSION['user_id'] = $stmt->insert_id;
            $_SESSION['user_email'] = $email;
            $_SESSION['user_name'] = $name;
            unset($_SESSION['register_code'], $_SESSION['register_email'], $_SESSION['register_password'], $_SESSION['register_name']);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Ошибка при регистрации']);
        }
        break;
        
    case 'logout':
        session_destroy();
        echo json_encode(['success' => true]);
        break;
        
    default:
        echo json_encode(['error' => 'Неизвестное действие']);
}

$conn->close();
?> 