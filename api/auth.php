<?php
// Simplified Email Authentication API for EduAI-NanoLez
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include configuration
require_once 'config.php';

try {
    // Initialize database
    initializeDatabase();
    
    // Handle POST request
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate input
    if (!isset($data['action'])) {
        throw new Exception('Missing required field: action');
    }
    
    $action = $data['action'];
    
    switch ($action) {
        case 'save_email':
            handleSaveEmail($data);
            break;
            
        case 'get_user':
            handleGetUser($data);
            break;
            
        default:
            throw new Exception('Unknown action: ' . $action);
    }
    
} catch (Exception $e) {
    error_log("Auth Error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}

function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }
    
    return $pdo;
}

function initializeDatabase() {
    $pdo = getDBConnection();
    
    // Create users table (simplified)
    $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $pdo->exec($sql);
    
    // Create sessions table (simplified)
    $sql = "
        CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_token VARCHAR(255) NOT NULL UNIQUE,
            device_info TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_session_token (session_token),
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $pdo->exec($sql);
}

function handleSaveEmail($data) {
    // Validate required fields
    if (!isset($data['email'])) {
        throw new Exception('Missing required field: email');
    }
    
    $email = filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL);
    
    if (!$email) {
        throw new Exception('Invalid email address');
    }
    
    $name = isset($data['name']) ? trim($data['name']) : null;
    $deviceInfo = isset($data['device_info']) ? $data['device_info'] : null;
    
    $pdo = getDBConnection();
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $existingUser = $stmt->fetch();
    
    if ($existingUser) {
        // User exists, update name if provided
        if ($name) {
            $stmt = $pdo->prepare("UPDATE users SET name = ? WHERE id = ?");
            $stmt->execute([$name, $existingUser['id']]);
        }
        
        $userId = $existingUser['id'];
    } else {
        // Create new user
        $stmt = $pdo->prepare("INSERT INTO users (email, name) VALUES (?, ?)");
        $stmt->execute([$email, $name]);
        $userId = $pdo->lastInsertId();
    }
    
    // Create session
    $sessionToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+365 days')); // 1 year
    
    $stmt = $pdo->prepare("
        INSERT INTO sessions (user_id, session_token, device_info, expires_at) 
        VALUES (?, ?, ?, ?)
    ");
    
    $stmt->execute([$userId, $sessionToken, $deviceInfo, $expiresAt]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Email saved successfully',
        'data' => [
            'user_id' => $userId,
            'email' => $email,
            'name' => $name,
            'session_token' => $sessionToken,
            'expires_at' => $expiresAt
        ]
    ]);
}

function handleGetUser($data) {
    if (!isset($data['session_token'])) {
        throw new Exception('Missing required field: session_token');
    }
    
    $sessionToken = trim($data['session_token']);
    
    $pdo = getDBConnection();
    
    // Get session with user info
    $stmt = $pdo->prepare("
        SELECT s.user_id, s.expires_at, s.device_info, u.email, u.name, u.created_at 
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ? AND s.expires_at > NOW()
    ");
    
    $stmt->execute([$sessionToken]);
    $session = $stmt->fetch();
    
    if (!$session) {
        throw new Exception('Invalid or expired session');
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'user_id' => $session['user_id'],
            'email' => $session['email'],
            'name' => $session['name'],
            'device_info' => $session['device_info'],
            'expires_at' => $session['expires_at'],
            'created_at' => $session['created_at']
        ]
    ]);
}

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
}
?>

