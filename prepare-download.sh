#!/bin/bash

# PWA Quiz System - Download Preparation Script
# This script prepares the project for download and distribution

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📦 Preparing PWA Quiz System for Download${NC}"
echo "=================================================="

# Create download package directory
PACKAGE_DIR="pwa-quiz-system-package"
echo -e "${BLUE}Creating package directory: $PACKAGE_DIR${NC}"
rm -rf $PACKAGE_DIR
mkdir -p $PACKAGE_DIR

# Copy essential project files
echo -e "${BLUE}Copying project files...${NC}"

# Core application files
cp -r src $PACKAGE_DIR/
cp -r public $PACKAGE_DIR/
cp -r src/components $PACKAGE_DIR/src/ 2>/dev/null || true
cp -r src/hooks $PACKAGE_DIR/src/ 2>/dev/null || true
cp -r src/lib $PACKAGE_DIR/src/ 2>/dev/null || true

# Configuration files
cp package.json $PACKAGE_DIR/
cp package-lock.json $PACKAGE_DIR/ 2>/dev/null || true
cp next.config.ts $PACKAGE_DIR/
cp tsconfig.json $PACKAGE_DIR/
cp postcss.config.mjs $PACKAGE_DIR/
cp eslint.config.mjs $PACKAGE_DIR/
cp components.json $PACKAGE_DIR/
cp .gitignore $PACKAGE_DIR/

# Backend and database files
cp production-url-shortener.php $PACKAGE_DIR/
cp database-schema.sql $PACKAGE_DIR/
cp deployment-config.js $PACKAGE_DIR/

# Documentation
cp README.md $PACKAGE_DIR/ 2>/dev/null || true
cp DOWNLOAD_SETUP_GUIDE.md $PACKAGE_DIR/
cp QUICK_START.md $PACKAGE_DIR/
cp HOSTING_DEPLOYMENT_GUIDE.md $PACKAGE_DIR/
cp IMPLEMENTATION_GUIDE.md $PACKAGE_DIR/
cp README_HOSTING.md $PACKAGE_DIR/

# Scripts
cp deploy.sh $PACKAGE_DIR/
chmod +x $PACKAGE_DIR/deploy.sh

# Create a simple README for the package
cat > $PACKAGE_DIR/README.md << 'EOF'
# 🚀 PWA Quiz System

A complete Progressive Web App (PWA) quiz system with URL shortener integration.

## 🚀 Quick Start

1. **Install Dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start Development:**
   ```bash
   npm run dev
   ```

3. **Visit:** `http://localhost:8000`

## 📚 Documentation

- `DOWNLOAD_SETUP_GUIDE.md` - Complete setup instructions
- `QUICK_START.md` - 30-minute deployment guide
- `HOSTING_DEPLOYMENT_GUIDE.md` - Comprehensive hosting guide

## 🔧 Deployment

```bash
# Prepare for deployment
./deploy.sh

# Deploy to Vercel
# 1. Go to vercel.com
# 2. Import this project
# 3. Deploy with default settings
```

## 📱 Features

- ✅ Progressive Web App with offline support
- ✅ Modern UI with Tailwind CSS
- ✅ Quiz integration with iframe embedding
- ✅ URL shortener integration (PHP)
- ✅ Database analytics and tracking
- ✅ Mobile-first responsive design

## 🎯 Use Cases

- Content gating behind quizzes
- Educational platforms
- Marketing campaigns
- Lead generation
- User engagement tracking

Happy coding! 🎉
EOF

# Create package info
cat > $PACKAGE_DIR/PACKAGE_INFO.txt << EOF
PWA Quiz System - Complete Package
==================================

Package Created: $(date)
Version: 1.0.0

Contents:
- Next.js PWA Application
- PHP URL Shortener Integration
- MySQL Database Schema
- Complete Documentation
- Deployment Tools

Quick Setup:
1. npm install --legacy-peer-deps
2. npm run dev
3. Visit http://localhost:8000

For detailed setup instructions, see DOWNLOAD_SETUP_GUIDE.md

Support: See documentation files for troubleshooting and deployment guides.
EOF

echo -e "${GREEN}✅ Package prepared successfully!${NC}"
echo ""
echo -e "${YELLOW}📦 Package Contents:${NC}"
echo "  📁 $PACKAGE_DIR/"
echo "    ├── 📱 src/                    # PWA application source"
echo "    ├── 🎨 public/                # PWA assets and icons"
echo "    ├── 🔧 production-url-shortener.php  # PHP backend"
echo "    ├── 🗄️ database-schema.sql    # Database setup"
echo "    ├── 📚 Documentation files    # Setup and hosting guides"
echo "    ├── ⚙️ Configuration files    # package.json, next.config.ts, etc."
echo "    └── 🛠️ deploy.sh              # Deployment automation"
echo ""
echo -e "${GREEN}📥 Ready for Download!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy the '$PACKAGE_DIR' folder to your desired location"
echo "2. Follow instructions in DOWNLOAD_SETUP_GUIDE.md"
echo "3. Start with: cd $PACKAGE_DIR && npm install --legacy-peer-deps"
echo ""

# Show package size
if command -v du &> /dev/null; then
    PACKAGE_SIZE=$(du -sh $PACKAGE_DIR | cut -f1)
    echo -e "${BLUE}📊 Package size: $PACKAGE_SIZE${NC}"
fi

echo -e "${GREEN}🎉 Package ready for distribution!${NC}"
