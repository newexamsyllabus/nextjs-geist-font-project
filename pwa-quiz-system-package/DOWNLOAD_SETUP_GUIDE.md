# 📥 Download & Setup Guide - PWA Quiz System

This guide will help you download and set up the complete PWA Quiz System on your local machine and deploy it to hosting platforms.

## 📋 What You're Getting

A complete PWA Quiz System with:
- ✅ Next.js PWA application with modern UI
- ✅ URL shortener integration (PHP)
- ✅ Database schema with analytics
- ✅ Automated deployment tools
- ✅ Comprehensive documentation

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Download the Code
You can download this project in several ways:

#### Option A: Download as ZIP
1. Click the download button in your IDE/editor
2. Extract the ZIP file to your desired location
3. Open terminal in the extracted folder

#### Option B: Clone Repository (if using Git)
```bash
git clone <your-repository-url>
cd pwa-quiz-system
```

#### Option C: Copy Files Manually
Copy all files from the current workspace to your local directory.

### Step 2: Install Dependencies
```bash
# Navigate to project directory
cd pwa-quiz-system

# Install Node.js dependencies
npm install --legacy-peer-deps

# Make deployment script executable (Linux/Mac)
chmod +x deploy.sh
```

### Step 3: Test Locally
```bash
# Start development server
npm run dev

# Visit in browser
# http://localhost:8000
```

---

## 📁 Project Structure Overview

```
pwa-quiz-system/
├── 📱 PWA Application
│   ├── src/app/page.tsx          # Landing page with PWA installation
│   ├── src/app/[slug]/page.tsx   # Slug handler
│   ├── src/app/app/page.tsx      # Quiz interface
│   ├── src/components/ui/        # UI components (shadcn)
│   └── public/                   # PWA assets, icons, manifest
│
├── 🔧 Backend Integration
│   ├── production-url-shortener.php  # Production PHP handler
│   ├── database-schema.sql       # Complete database setup
│   └── deployment/               # Ready-to-deploy files
│
├── 📚 Documentation
│   ├── QUICK_START.md           # 30-minute setup guide
│   ├── HOSTING_DEPLOYMENT_GUIDE.md  # Comprehensive hosting guide
│   ├── IMPLEMENTATION_GUIDE.md  # Technical details
│   └── README_HOSTING.md        # System overview
│
└── 🛠️ Tools
    ├── deploy.sh                # Automated deployment script
    ├── deployment-config.js     # Configuration template
    └── package.json             # Dependencies and scripts
```

---

## 🔧 Local Development Setup

### Prerequisites
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js)
- **Code editor** (VS Code recommended)

### Installation Steps

1. **Download and Extract**
   ```bash
   # Extract downloaded files
   unzip pwa-quiz-system.zip
   cd pwa-quiz-system
   ```

2. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Visit: `http://localhost:8000`
   - Test PWA installation
   - Test slug redirection: `http://localhost:8000/test-slug`

### Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linting
./deploy.sh      # Prepare for deployment
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - FREE)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub/GitLab

2. **Deploy Project**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Deploy from project directory
   vercel
   ```

   **Or use Web Interface:**
   - Upload project folder to GitHub
   - Import repository in Vercel
   - Auto-deploy with default settings

3. **Get Your PWA URL**
   - Copy deployment URL (e.g., `https://your-app.vercel.app`)
   - Update PHP configuration with this URL

### Option 2: Netlify (Alternative)

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)

2. **Deploy**
   ```bash
   npm run build
   # Drag & drop .next folder to Netlify
   ```

### Option 3: Traditional Hosting

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload built files to your hosting provider
   - Ensure Node.js support or use static export

---

## 🗄️ Database Setup

### Step 1: Create Database
```sql
-- Create database
CREATE DATABASE shortener;
USE shortener;
```

### Step 2: Import Schema
```bash
# Import the provided schema
mysql -u username -p shortener < database-schema.sql
```

### Step 3: Add Test Data
```sql
-- Add a test link
INSERT INTO links (slug, original_url, title) 
VALUES ('test', 'https://google.com', 'Test Link');
```

---

## 🔧 PHP Setup

### Step 1: Upload PHP File
- Upload `production-url-shortener.php` to your PHP hosting
- Rename to `index.php` or configure as redirect handler

### Step 2: Configure Database
Edit the PHP file:
```php
$DB_CONFIG = [
    'host' => 'localhost',
    'dbname' => 'shortener',        // Your database name
    'username' => 'your_username',  // Your database username
    'password' => 'your_password',  // Your database password
];
```

### Step 3: Update PWA URL
```php
$CONFIG = [
    'PWA_BASE_URL' => 'https://your-app.vercel.app', // Your actual PWA URL
    // ... other settings
];
```

---

## 🧪 Testing Your Setup

### Local Testing
```bash
# Test development server
npm run dev

# Test build
npm run build

# Test deployment preparation
./deploy.sh check
```

### Live Testing
1. **PWA Installation**: Visit your deployed PWA URL
2. **Slug Redirection**: Test `your-pwa-url.com/test-slug`
3. **Full Flow**: Test complete shortened URL flow
4. **Mobile PWA**: Test installation on mobile devices

---

## 📱 Mobile Testing

### iOS (Safari)
1. Visit your PWA URL in Safari
2. Tap Share button → "Add to Home Screen"
3. Test offline functionality

### Android (Chrome)
1. Visit your PWA URL in Chrome
2. Tap "Install" prompt or menu → "Add to Home Screen"
3. Test app-like experience

---

## 🔍 Troubleshooting

### Common Issues

**Dependencies Installation Failed:**
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps

# Or force install
npm install --force
```

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**PWA Not Installing:**
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify service worker loads

**Database Connection Failed:**
- Check database credentials
- Ensure database exists
- Verify PHP extensions (PDO, MySQL)

---

## 📊 Configuration

### PWA Settings
Edit `src/app/app/page.tsx`:
```javascript
const QUIZ_CONFIG = {
  defaultQuizUrl: 'https://your-quiz-website.com',
  defaultQuizId: '6',
  allowUrlChange: true
}
```

### PHP Settings
Edit `production-url-shortener.php`:
```php
$CONFIG = [
    'PWA_BASE_URL' => 'https://your-app.vercel.app',
    'QUIZ_WEBSITE' => 'https://your-quiz-website.com',
    'DEFAULT_QUIZ_ID' => '6'
];
```

---

## 🎯 Next Steps After Setup

1. **Customize Branding**
   - Update PWA name and icons
   - Modify colors and styling
   - Add your logo

2. **Configure Quiz Integration**
   - Set up your quiz website
   - Configure completion messages
   - Test quiz flow

3. **Set Up Analytics**
   - Add Google Analytics
   - Monitor user engagement
   - Track conversion rates

4. **Production Optimization**
   - Set up monitoring
   - Configure backups
   - Optimize performance

---

## 📞 Support Resources

### Documentation
- `QUICK_START.md` - Fast 30-minute setup
- `HOSTING_DEPLOYMENT_GUIDE.md` - Comprehensive hosting guide
- `IMPLEMENTATION_GUIDE.md` - Technical implementation details

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [PWA Best Practices](https://web.dev/pwa)

---

## ✅ Success Checklist

After setup, you should have:
- [ ] ✅ Local development server running
- [ ] ✅ PWA installing correctly
- [ ] ✅ Database connected and populated
- [ ] ✅ PHP redirect handler working
- [ ] ✅ Complete quiz flow functional
- [ ] ✅ Mobile PWA installation working
- [ ] ✅ Production deployment successful

**Congratulations! Your PWA Quiz System is ready! 🎉**

---

## 🚀 Quick Commands Reference

```bash
# Setup
npm install --legacy-peer-deps
npm run dev

# Build & Deploy
npm run build
./deploy.sh

# Test URLs
http://localhost:8000           # Landing page
http://localhost:8000/test      # Slug test
http://localhost:8000/app       # Quiz interface
```

Happy coding! 🎯
