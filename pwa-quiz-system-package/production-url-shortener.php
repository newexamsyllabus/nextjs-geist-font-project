<?php
/**
 * Production URL Shortener Integration with PWA Quiz System
 * Enhanced version with proper error handling, logging, and database integration
 */

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Set to 0 in production
ini_set('log_errors', 1);

// Production Configuration - UPDATE THESE VALUES
$CONFIG = [
    'PWA_BASE_URL' => 'https://your-app.vercel.app', // UPDATE: Your PWA domain
    'QUIZ_WEBSITE' => 'https://quiz.surmahalmusic.com',
    'DEFAULT_QUIZ_ID' => '6',
    'ALLOWED_DOMAINS' => ['your-domain.com', 'quiz.surmahalmusic.com'],
    'MAX_SLUG_LENGTH' => 50,
    'LOG_FILE' => 'shortener.log'
];

// Database Configuration - UPDATE THESE VALUES
$DB_CONFIG = [
    'host' => 'localhost',
    'dbname' => 'shortener',
    'username' => 'your_db_username', // UPDATE
    'password' => 'your_db_password', // UPDATE
    'charset' => 'utf8mb4'
];

/**
 * Main execution logic
 */
try {
    // Get and sanitize slug
    $slug = getSlugFromRequest();
    
    if (empty($slug)) {
        throw new Exception('Invalid or missing slug');
    }
    
    // Log the request
    logRequest($slug, $_SERVER['REQUEST_METHOD'], $_SERVER['HTTP_REFERER'] ?? '');
    
    // Handle different request types
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['ref'])) {
        // Quiz completion callback
        handleQuizCompletion($slug);
    } else {
        // GET request - check referrer and route accordingly
        $referrer = $_SERVER['HTTP_REFERER'] ?? '';
        $referrerHost = $referrer ? parse_url($referrer, PHP_URL_HOST) : '';
        
        if ($referrerHost === parse_url($CONFIG['QUIZ_WEBSITE'], PHP_URL_HOST)) {
            // Coming back from quiz - show original content
            redirectToOriginalContent($slug);
        } else {
            // First visit - redirect to PWA
            redirectToPWA($slug);
        }
    }
    
} catch (Exception $e) {
    logError($e->getMessage(), $slug ?? 'unknown');
    showError('Service temporarily unavailable. Please try again later.');
}

/**
 * Extract and sanitize slug from request
 */
function getSlugFromRequest() {
    global $CONFIG;
    
    // Try different methods to get slug
    $slug = $_GET['slug'] ?? $_POST['slug'] ?? basename($_SERVER['REQUEST_URI']);
    
    // Remove query parameters
    $slug = strtok($slug, '?');
    
    // Sanitize slug
    $slug = preg_replace('/[^a-zA-Z0-9\-_]/', '', $slug);
    
    // Validate length
    if (strlen($slug) > $CONFIG['MAX_SLUG_LENGTH']) {
        throw new Exception('Slug too long');
    }
    
    return $slug;
}

/**
 * Redirect to PWA with slug parameter
 */
function redirectToPWA($slug) {
    global $CONFIG;
    
    $pwaUrl = rtrim($CONFIG['PWA_BASE_URL'], '/') . '/' . $slug;
    
    // Add tracking parameters if needed
    $params = [
        'utm_source' => 'shortener',
        'utm_medium' => 'redirect',
        'timestamp' => time()
    ];
    
    $pwaUrl .= '?' . http_build_query($params);
    
    logAction('redirect_to_pwa', $slug, $pwaUrl);
    
    header("Location: $pwaUrl", true, 307); // Temporary redirect
    exit();
}

/**
 * Handle quiz completion and redirect to original content
 */
function handleQuizCompletion($slug) {
    logAction('quiz_completion', $slug);
    redirectToOriginalContent($slug);
}

/**
 * Redirect to original content URL
 */
function redirectToOriginalContent($slug) {
    $originalUrl = getOriginalUrl($slug);
    
    if (!$originalUrl) {
        throw new Exception('Original URL not found for slug: ' . $slug);
    }
    
    // Validate URL
    if (!filter_var($originalUrl, FILTER_VALIDATE_URL)) {
        throw new Exception('Invalid original URL');
    }
    
    logAction('redirect_to_original', $slug, $originalUrl);
    
    header("Location: $originalUrl", true, 302); // Permanent redirect
    exit();
}

/**
 * Get original URL from database
 */
function getOriginalUrl($slug) {
    global $DB_CONFIG;
    
    try {
        $dsn = "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['dbname']};charset={$DB_CONFIG['charset']}";
        $pdo = new PDO($dsn, $DB_CONFIG['username'], $DB_CONFIG['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        
        $stmt = $pdo->prepare('SELECT original_url, clicks FROM links WHERE slug = ? AND active = 1');
        $stmt->execute([$slug]);
        $result = $stmt->fetch();
        
        if ($result) {
            // Update click count
            updateClickCount($pdo, $slug);
            return $result['original_url'];
        }
        
        return null;
        
    } catch (PDOException $e) {
        logError('Database error: ' . $e->getMessage(), $slug);
        return null;
    }
}

/**
 * Update click count for analytics
 */
function updateClickCount($pdo, $slug) {
    try {
        $stmt = $pdo->prepare('UPDATE links SET clicks = clicks + 1, last_accessed = NOW() WHERE slug = ?');
        $stmt->execute([$slug]);
    } catch (PDOException $e) {
        logError('Failed to update click count: ' . $e->getMessage(), $slug);
    }
}

/**
 * Show error page
 */
function showError($message, $code = 404) {
    http_response_code($code);
    
    // Simple error page
    echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error-container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        h1 { color: #e74c3c; margin-bottom: 20px; }
        p { color: #666; margin-bottom: 30px; }
        .btn { background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>🔗 Link Not Found</h1>
        <p>' . htmlspecialchars($message) . '</p>
        <a href="/" class="btn">Go Home</a>
    </div>
</body>
</html>';
    exit();
}

/**
 * Log requests for analytics
 */
function logRequest($slug, $method, $referrer) {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'slug' => $slug,
        'method' => $method,
        'referrer' => $referrer,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    logToFile('REQUEST', $logData);
}

/**
 * Log actions for debugging
 */
function logAction($action, $slug, $url = '') {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'action' => $action,
        'slug' => $slug,
        'url' => $url,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    logToFile('ACTION', $logData);
}

/**
 * Log errors
 */
function logError($message, $slug = '') {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'error' => $message,
        'slug' => $slug,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
    ];
    
    logToFile('ERROR', $logData);
    error_log("Shortener Error: $message");
}

/**
 * Write to log file
 */
function logToFile($type, $data) {
    global $CONFIG;
    
    $logLine = $type . ': ' . json_encode($data) . PHP_EOL;
    file_put_contents($CONFIG['LOG_FILE'], $logLine, FILE_APPEND | LOCK_EX);
}

/**
 * Validate domain against allowed list
 */
function validateDomain($url) {
    global $CONFIG;
    
    $domain = parse_url($url, PHP_URL_HOST);
    return in_array($domain, $CONFIG['ALLOWED_DOMAINS']);
}

/**
 * Get quiz configuration for specific slug (optional advanced feature)
 */
function getQuizConfig($slug) {
    global $DB_CONFIG, $CONFIG;
    
    try {
        $dsn = "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['dbname']};charset={$DB_CONFIG['charset']}";
        $pdo = new PDO($dsn, $DB_CONFIG['username'], $DB_CONFIG['password']);
        
        $stmt = $pdo->prepare('SELECT quiz_url, quiz_id FROM links WHERE slug = ?');
        $stmt->execute([$slug]);
        $result = $stmt->fetch();
        
        return [
            'quiz_url' => $result['quiz_url'] ?? $CONFIG['QUIZ_WEBSITE'],
            'quiz_id' => $result['quiz_id'] ?? $CONFIG['DEFAULT_QUIZ_ID']
        ];
        
    } catch (PDOException $e) {
        logError('Failed to get quiz config: ' . $e->getMessage(), $slug);
        return [
            'quiz_url' => $CONFIG['QUIZ_WEBSITE'],
            'quiz_id' => $CONFIG['DEFAULT_QUIZ_ID']
        ];
    }
}

/**
 * Health check endpoint
 */
if (isset($_GET['health'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ok',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0'
    ]);
    exit();
}
?>
