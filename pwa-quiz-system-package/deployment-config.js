/**
 * Production Deployment Configuration
 * Update these values for your production environment
 */

const DEPLOYMENT_CONFIG = {
  // PWA Configuration
  pwa: {
    name: "Quiz PWA System",
    shortName: "QuizPWA",
    description: "Progressive Web App for Quiz Integration",
    themeColor: "#3b82f6",
    backgroundColor: "#ffffff"
  },

  // Hosting Configuration
  hosting: {
    // Update this with your actual PWA domain after deployment
    pwaBaseUrl: "https://your-app.vercel.app",
    
    // Your URL shortener domain
    shortenerDomain: "https://short.ly",
    
    // Quiz website configuration
    defaultQuizUrl: "https://quiz.surmahalmusic.com",
    defaultQuizId: "6"
  },

  // Database Configuration (for PHP integration)
  database: {
    host: "localhost",
    dbname: "shortener",
    // Note: Add actual credentials in your PHP file, not here
    username: "your_db_username",
    password: "your_db_password"
  },

  // Security Configuration
  security: {
    allowedDomains: [
      "quiz.surmahalmusic.com",
      "your-domain.com"
    ],
    corsOrigins: ["*"], // Update for production
    maxSlugLength: 50
  },

  // Analytics Configuration
  analytics: {
    enabled: true,
    trackingId: "your-tracking-id", // Google Analytics, etc.
    vercelAnalytics: true
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEPLOYMENT_CONFIG;
}

// For browser usage
if (typeof window !== 'undefined') {
  window.DEPLOYMENT_CONFIG = DEPLOYMENT_CONFIG;
}
