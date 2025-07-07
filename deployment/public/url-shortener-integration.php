<?php
/**
 * URL Shortener Integration with PWA Quiz System
 * 
 * This file shows how to integrate the PWA with your existing URL shortener
 * Place this code in your URL shortener's redirect handler
 */

// Configuration - Change these according to your setup
$PWA_BASE_URL = 'https://your-pwa-domain.com'; // Replace with your PWA domain
$QUIZ_WEBSITE = 'https://quiz.surmahalmusic.com';
$DEFAULT_QUIZ_ID = '6';

// Get the slug from URL (e.g., yoursite.com/abc123 -> abc123)
$slug = $_GET['slug'] ?? basename($_SERVER['REQUEST_URI']);

// Check if this is a completion callback from quiz
if (!empty($_POST['ref'])) {
    // Handle POST request (quiz completion)
    handleQuizCompletion($slug);
} else {
    // Handle GET request (initial click)
    $ref = $_SERVER['HTTP_REFERER'] ?? '';
    $do = parse_url($ref);
    $refer = $do['host'] ?? '';
    
    if ($refer === parse_url($QUIZ_WEBSITE, PHP_URL_HOST)) {
        // User is coming back from quiz - show final content
        showFinalContent($slug);
    } else {
        // First visit - redirect to PWA
        redirectToPWA($slug);
    }
}

function redirectToPWA($slug) {
    global $PWA_BASE_URL;
    
    // Redirect to PWA with slug parameter
    $pwaUrl = $PWA_BASE_URL . '/' . $slug;
    
    header("Location: $pwaUrl", true, 307);
    exit();
}

function handleQuizCompletion($slug) {
    // Handle quiz completion
    // You can add your logic here (logging, analytics, etc.)
    
    // Get the original URL for this slug from your database
    $originalUrl = getOriginalUrl($slug);
    
    if ($originalUrl) {
        // Redirect to the original URL
        header("Location: $originalUrl", true, 302);
        exit();
    } else {
        // Fallback if original URL not found
        showError("Link not found");
    }
}

function showFinalContent($slug) {
    // Show the final content or redirect to original URL
    $originalUrl = getOriginalUrl($slug);
    
    if ($originalUrl) {
        header("Location: $originalUrl", true, 302);
        exit();
    } else {
        showError("Link not found");
    }
}

function getOriginalUrl($slug) {
    // Replace this with your database query
    // Example:
    /*
    $pdo = new PDO('mysql:host=localhost;dbname=shortener', $username, $password);
    $stmt = $pdo->prepare('SELECT original_url FROM links WHERE slug = ?');
    $stmt->execute([$slug]);
    $result = $stmt->fetch();
    return $result ? $result['original_url'] : null;
    */
    
    // For demo purposes, return a dummy URL
    return 'https://example.com/original-content';
}

function showError($message) {
    http_response_code(404);
    echo "<h1>Error</h1><p>$message</p>";
    exit();
}

// Alternative approach: Database-driven configuration
function getQuizConfig($slug) {
    // You can store quiz configuration per slug in database
    /*
    $pdo = new PDO('mysql:host=localhost;dbname=shortener', $username, $password);
    $stmt = $pdo->prepare('SELECT quiz_url, quiz_id FROM links WHERE slug = ?');
    $stmt->execute([$slug]);
    $result = $stmt->fetch();
    
    return [
        'quiz_url' => $result['quiz_url'] ?? 'https://quiz.surmahalmusic.com',
        'quiz_id' => $result['quiz_id'] ?? '6'
    ];
    */
    
    return [
        'quiz_url' => 'https://quiz.surmahalmusic.com',
        'quiz_id' => '6'
    ];
}
?>
