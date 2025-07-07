#!/bin/bash

# PWA Quiz System Deployment Script
# This script helps automate the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="PWA Quiz System"
NODE_VERSION="18"
PHP_VERSION="8.0"

echo -e "${BLUE}🚀 $PROJECT_NAME Deployment Script${NC}"
echo "=================================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VER=$(node --version)
        print_status "Node.js found: $NODE_VER"
    else
        print_error "Node.js not found. Please install Node.js $NODE_VERSION or higher."
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VER=$(npm --version)
        print_status "npm found: $NPM_VER"
    else
        print_error "npm not found. Please install npm."
        exit 1
    fi
    
    # Check git
    if command -v git &> /dev/null; then
        print_status "Git found"
    else
        print_warning "Git not found. You may need it for version control."
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_status "Dependencies installed successfully"
    else
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
}

# Build the application
build_application() {
    print_info "Building the application..."
    
    # Clean previous builds
    if [ -d ".next" ]; then
        rm -rf .next
        print_info "Cleaned previous build"
    fi
    
    # Build
    npm run build
    print_status "Application built successfully"
}

# Test the application
test_application() {
    print_info "Testing the application..."
    
    # Run linting
    if npm run lint &> /dev/null; then
        print_status "Linting passed"
    else
        print_warning "Linting issues found. Check with: npm run lint"
    fi
    
    # Test build
    if [ -d ".next" ]; then
        print_status "Build output verified"
    else
        print_error "Build failed - no output directory found"
        exit 1
    fi
}

# Prepare for deployment
prepare_deployment() {
    print_info "Preparing deployment files..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy essential files
    cp -r .next deployment/ 2>/dev/null || true
    cp -r public deployment/ 2>/dev/null || true
    cp package.json deployment/ 2>/dev/null || true
    cp next.config.ts deployment/ 2>/dev/null || true
    cp production-url-shortener.php deployment/ 2>/dev/null || true
    cp database-schema.sql deployment/ 2>/dev/null || true
    cp HOSTING_DEPLOYMENT_GUIDE.md deployment/ 2>/dev/null || true
    
    print_status "Deployment files prepared in ./deployment/"
}

# Generate deployment checklist
generate_checklist() {
    print_info "Generating deployment checklist..."
    
    cat > deployment/DEPLOYMENT_CHECKLIST.md << 'EOF'
# 🚀 Deployment Checklist

## Pre-Deployment
- [ ] ✅ Dependencies installed (`npm install`)
- [ ] ✅ Application built successfully (`npm run build`)
- [ ] ✅ Tests passed
- [ ] ✅ Environment variables configured

## Vercel Deployment
- [ ] 🌐 Vercel account created/logged in
- [ ] 📁 Repository connected to Vercel
- [ ] ⚙️ Build settings configured:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
- [ ] 🚀 Initial deployment successful
- [ ] 🔗 Custom domain configured (optional)
- [ ] 🔒 HTTPS enabled and working

## PHP/Database Setup
- [ ] 🖥️ PHP hosting provider selected
- [ ] 📄 `production-url-shortener.php` uploaded
- [ ] 🗄️ Database created using `database-schema.sql`
- [ ] 🔧 Database credentials configured in PHP file
- [ ] 🔗 URL shortener domain pointing to PHP file

## Configuration Updates
- [ ] 📝 Update `$PWA_BASE_URL` in PHP file with actual Vercel URL
- [ ] 🎯 Update quiz configuration in `src/app/app/page.tsx`
- [ ] 🔐 Update database credentials in PHP file
- [ ] 📊 Configure analytics (optional)

## Testing
- [ ] 🧪 Test PWA installation flow
- [ ] 🔗 Test slug redirection: `your-domain.com/test-slug`
- [ ] 📱 Test on mobile devices
- [ ] 🎮 Test quiz completion flow
- [ ] 🔄 Test full end-to-end flow
- [ ] 🚨 Test error handling

## Post-Deployment
- [ ] 📈 Monitor application performance
- [ ] 📊 Set up analytics tracking
- [ ] 🔍 Monitor error logs
- [ ] 👥 Gather user feedback
- [ ] 🔄 Plan for updates and maintenance

## Quick Test URLs
After deployment, test these URLs:
- Landing page: `https://your-app.vercel.app`
- Slug test: `https://your-app.vercel.app/test-slug`
- Quiz flow: `https://your-app.vercel.app/app?slug=test`
- Health check: `https://your-shortener.com/health`

## Support Resources
- 📚 Vercel Documentation: https://vercel.com/docs
- 🎯 Next.js Documentation: https://nextjs.org/docs
- 💬 PWA Guide: https://web.dev/pwa
- 🔧 Troubleshooting: See HOSTING_DEPLOYMENT_GUIDE.md
EOF

    print_status "Deployment checklist created"
}

# Create environment template
create_env_template() {
    print_info "Creating environment template..."
    
    cat > deployment/.env.example << 'EOF'
# Environment Variables Template
# Copy this to .env.local and update with your values

# PWA Configuration
NEXT_PUBLIC_PWA_NAME="Quiz PWA System"
NEXT_PUBLIC_PWA_SHORT_NAME="QuizPWA"
NEXT_PUBLIC_PWA_DESCRIPTION="Progressive Web App for Quiz Integration"

# Hosting Configuration
NEXT_PUBLIC_PWA_BASE_URL="https://your-app.vercel.app"
NEXT_PUBLIC_SHORTENER_DOMAIN="https://short.ly"

# Quiz Configuration
NEXT_PUBLIC_DEFAULT_QUIZ_URL="https://quiz.surmahalmusic.com"
NEXT_PUBLIC_DEFAULT_QUIZ_ID="6"

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID="your-ga-tracking-id"
VERCEL_ANALYTICS_ID="your-vercel-analytics-id"

# Security
NEXT_PUBLIC_ALLOWED_DOMAINS="quiz.surmahalmusic.com,your-domain.com"

# Database (for PHP integration)
DB_HOST="localhost"
DB_NAME="shortener"
DB_USERNAME="your_db_username"
DB_PASSWORD="your_db_password"
EOF

    print_status "Environment template created"
}

# Display deployment instructions
show_deployment_instructions() {
    print_info "Deployment Instructions:"
    echo ""
    echo "1. 🌐 Deploy to Vercel:"
    echo "   - Go to https://vercel.com"
    echo "   - Import your Git repository"
    echo "   - Deploy with default Next.js settings"
    echo ""
    echo "2. 🖥️ Set up PHP hosting:"
    echo "   - Upload production-url-shortener.php to your server"
    echo "   - Import database-schema.sql to your database"
    echo "   - Update configuration in PHP file"
    echo ""
    echo "3. 🔧 Configure domains:"
    echo "   - Point your PWA domain to Vercel"
    echo "   - Point your shortener domain to PHP server"
    echo ""
    echo "4. 🧪 Test the complete flow:"
    echo "   - Visit your PWA URL"
    echo "   - Test slug redirection"
    echo "   - Verify quiz integration"
    echo ""
    echo "📋 See deployment/DEPLOYMENT_CHECKLIST.md for detailed steps"
    echo "📖 See HOSTING_DEPLOYMENT_GUIDE.md for comprehensive guide"
}

# Main deployment function
main() {
    echo ""
    print_info "Starting deployment preparation..."
    echo ""
    
    check_prerequisites
    echo ""
    
    install_dependencies
    echo ""
    
    build_application
    echo ""
    
    test_application
    echo ""
    
    prepare_deployment
    echo ""
    
    generate_checklist
    echo ""
    
    create_env_template
    echo ""
    
    print_status "Deployment preparation completed!"
    echo ""
    
    show_deployment_instructions
    echo ""
    
    print_status "🎉 Ready for deployment!"
    print_info "Next steps:"
    echo "  1. Review deployment/DEPLOYMENT_CHECKLIST.md"
    echo "  2. Deploy to Vercel or your preferred platform"
    echo "  3. Set up PHP hosting and database"
    echo "  4. Test the complete flow"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    "check")
        check_prerequisites
        ;;
    "build")
        build_application
        ;;
    "test")
        test_application
        ;;
    "prepare")
        prepare_deployment
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check     - Check prerequisites only"
        echo "  build     - Build application only"
        echo "  test      - Test application only"
        echo "  prepare   - Prepare deployment files only"
        echo "  help      - Show this help message"
        echo ""
        echo "Run without arguments to execute full deployment preparation"
        ;;
    *)
        main
        ;;
esac
