-- Database Schema for URL Shortener with PWA Quiz Integration
-- Run this SQL script to set up your database

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS shortener CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shortener;

-- Links table for storing shortened URLs
CREATE TABLE IF NOT EXISTS links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    quiz_url VARCHAR(255) DEFAULT 'https://quiz.surmahalmusic.com',
    quiz_id VARCHAR(20) DEFAULT '6',
    title VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    clicks INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_by VARCHAR(100) DEFAULT NULL,
    
    -- Indexes for performance
    INDEX idx_slug (slug),
    INDEX idx_active (active),
    INDEX idx_created_at (created_at),
    INDEX idx_clicks (clicks)
);

-- Analytics table for tracking user interactions
CREATE TABLE IF NOT EXISTS analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'click', 'pwa_install', 'quiz_start', 'quiz_complete'
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2) DEFAULT NULL,
    device_type VARCHAR(20) DEFAULT NULL, -- 'mobile', 'desktop', 'tablet'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (slug) REFERENCES links(slug) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_slug_analytics (slug),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
);

-- Quiz sessions table for tracking quiz progress
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    quiz_url VARCHAR(255),
    quiz_id VARCHAR(20),
    status VARCHAR(20) DEFAULT 'started', -- 'started', 'completed', 'abandoned'
    score INT DEFAULT NULL,
    completion_time INT DEFAULT NULL, -- seconds
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Foreign key
    FOREIGN KEY (slug) REFERENCES links(slug) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_slug_sessions (slug),
    INDEX idx_session_id (session_id),
    INDEX idx_status (status)
);

-- Admin users table (optional)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key)
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('default_quiz_url', 'https://quiz.surmahalmusic.com', 'Default quiz website URL'),
('default_quiz_id', '6', 'Default quiz ID'),
('pwa_base_url', 'https://your-app.vercel.app', 'PWA application base URL'),
('analytics_enabled', '1', 'Enable analytics tracking'),
('max_slug_length', '50', 'Maximum allowed slug length'),
('link_expiry_days', '365', 'Default link expiry in days')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Sample data for testing
INSERT INTO links (slug, original_url, title, description) VALUES
('test-slug', 'https://example.com/original-content', 'Test Link', 'This is a test shortened link'),
('demo', 'https://google.com', 'Demo Link', 'Demo link for testing'),
('sample', 'https://github.com', 'Sample Link', 'Sample GitHub link')
ON DUPLICATE KEY UPDATE original_url = VALUES(original_url);

-- Create a view for link statistics
CREATE OR REPLACE VIEW link_stats AS
SELECT 
    l.slug,
    l.original_url,
    l.title,
    l.clicks,
    l.created_at,
    l.last_accessed,
    COUNT(DISTINCT a.id) as total_interactions,
    COUNT(DISTINCT CASE WHEN a.action = 'pwa_install' THEN a.id END) as pwa_installs,
    COUNT(DISTINCT CASE WHEN a.action = 'quiz_complete' THEN a.id END) as quiz_completions,
    AVG(qs.completion_time) as avg_completion_time
FROM links l
LEFT JOIN analytics a ON l.slug = a.slug
LEFT JOIN quiz_sessions qs ON l.slug = qs.slug AND qs.status = 'completed'
GROUP BY l.slug, l.original_url, l.title, l.clicks, l.created_at, l.last_accessed;

-- Create stored procedures for common operations

DELIMITER //

-- Procedure to create a new short link
CREATE PROCEDURE CreateShortLink(
    IN p_slug VARCHAR(50),
    IN p_original_url TEXT,
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_quiz_url VARCHAR(255),
    IN p_quiz_id VARCHAR(20)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    INSERT INTO links (slug, original_url, title, description, quiz_url, quiz_id)
    VALUES (p_slug, p_original_url, p_title, p_description, 
            COALESCE(p_quiz_url, 'https://quiz.surmahalmusic.com'), 
            COALESCE(p_quiz_id, '6'));
    
    COMMIT;
END //

-- Procedure to log analytics
CREATE PROCEDURE LogAnalytics(
    IN p_slug VARCHAR(50),
    IN p_action VARCHAR(50),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_referrer TEXT
)
BEGIN
    INSERT INTO analytics (slug, action, ip_address, user_agent, referrer)
    VALUES (p_slug, p_action, p_ip_address, p_user_agent, p_referrer);
END //

-- Procedure to update click count
CREATE PROCEDURE UpdateClickCount(
    IN p_slug VARCHAR(50)
)
BEGIN
    UPDATE links 
    SET clicks = clicks + 1, last_accessed = CURRENT_TIMESTAMP 
    WHERE slug = p_slug AND active = TRUE;
END //

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_analytics_slug_action ON analytics(slug, action);
CREATE INDEX idx_quiz_sessions_slug_status ON quiz_sessions(slug, status);

-- Grant permissions (adjust username as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON shortener.* TO 'shortener_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Show table structure
SHOW TABLES;
DESCRIBE links;
DESCRIBE analytics;
DESCRIBE quiz_sessions;

-- Display sample data
SELECT * FROM link_stats LIMIT 5;
