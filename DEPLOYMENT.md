# Sembalun - Deployment Guide 🌸

> **Sembalun** - Indonesian Meditation App with Cultural Authenticity

## 🚀 Production Deployment Checklist

### ✅ Pre-Deployment Verification
- [x] **Production Build** - `npm run build` successful
- [x] **Type Checking** - `npm run typecheck` passes
- [x] **PWA Ready** - Service worker and manifest configured
- [x] **Responsive Design** - Mobile-first approach implemented
- [x] **Offline Capabilities** - Full offline mode functional
- [x] **Bundle Optimization** - Code splitting and efficient caching
- [x] **Cultural Content** - Indonesian regional practices integrated

## 📦 Build Configuration

### Production Build
```bash
npm run build
# Generates optimized build in /dist directory
# Bundle size: ~3MB with code splitting
# PWA service worker included
```

### Bundle Analysis
```bash
npm run build:analyze
# Opens bundle analyzer at /dist/stats.html
# Check for optimization opportunities
```

## 🌐 Deployment Platforms

### 1. **Vercel** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Auto-deployment from Git
vercel --github
```

**Configuration:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: 18.x

### 2. **Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
netlify build
netlify deploy --prod
```

**netlify.toml:**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. **Firebase Hosting**
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Initialize and deploy
firebase login
firebase init hosting
firebase deploy
```

**firebase.json:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
# API Configuration
VITE_API_BASE_URL=https://api.sembalun.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Analytics (Optional)
VITE_GA_TRACKING_ID=your_ga_id
VITE_SENTRY_DSN=your_sentry_dsn

# Feature Flags
VITE_ENABLE_COMMUNITY=true
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_EXPORT=true
```

## 📱 PWA Configuration

### Service Worker Features
- **Offline Caching** - Complete app functionality offline
- **Background Sync** - Data synchronization when online
- **Push Notifications** - Meditation reminders (optional)
- **App Shortcuts** - Quick access to meditation and breathing

### PWA Requirements Met
- [x] **Manifest** - App metadata and icons
- [x] **Service Worker** - Offline functionality
- [x] **HTTPS** - Required for PWA features
- [x] **Responsive** - Mobile-first design
- [x] **Performance** - Lighthouse score >90

## 🌍 CDN and Performance

### Static Asset Optimization
- **Images** - SVG icons, optimized PNGs
- **Fonts** - Google Fonts with display=swap
- **Bundle Splitting** - Vendor and UI code separated
- **Caching Strategy** - Aggressive caching for static assets

### Performance Targets
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Time to Interactive** < 3s
- **Cumulative Layout Shift** < 0.1

## 🔒 Security Configuration

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline' fonts.googleapis.com;
               font-src 'self' fonts.gstatic.com;
               img-src 'self' data: blob:;">
```

### Security Headers
- **HTTPS Only** - Force secure connections
- **X-Frame-Options** - Prevent clickjacking
- **X-Content-Type-Options** - Prevent MIME sniffing
- **Referrer-Policy** - Control referrer information

## 📊 Monitoring and Analytics

### Error Tracking
```typescript
// Optional: Sentry integration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE
});
```

### Performance Monitoring
- **Lighthouse CI** - Automated performance testing
- **Web Vitals** - Core performance metrics
- **User Analytics** - Usage patterns and engagement

## 🧪 Testing Strategy

### Pre-Deployment Testing
```bash
# Unit Tests
npm test

# E2E Tests (if configured)
npm run test:e2e

# Performance Testing
npm run lighthouse

# PWA Testing
npm run pwa-test
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy Sembalun
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy
        uses: vercel/action@v1
```

## 📱 Mobile App Deployment

### PWA Installation
Users can install the app directly from browser:
- **Chrome** - "Add to Home Screen"
- **Safari** - "Add to Home Screen" 
- **Edge** - "Install App"

### App Store Submission (Optional)
For native app stores, consider:
- **Capacitor** - Convert to native iOS/Android
- **PWA Builder** - Microsoft Store submission

## 🌸 Cultural Content Management

### Indonesian Content Updates
- **Regional Practices** - Regular updates to meditation techniques
- **Wisdom Quotes** - Seasonal Indonesian wisdom additions
- **Cultural Events** - Integration with Indonesian calendar

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures** - Check Node.js version (18+)
2. **PWA Not Working** - Verify HTTPS deployment
3. **Offline Issues** - Check service worker registration
4. **Performance Issues** - Analyze bundle size

### Support Resources
- **Documentation** - `/docs` directory
- **Issue Tracking** - GitHub Issues
- **Community** - Indonesian meditation community

## 🎯 Success Metrics

### Key Performance Indicators
- **User Engagement** - Daily/weekly active users
- **Session Completion** - Meditation session rates
- **Cultural Adoption** - Regional practice usage
- **Offline Usage** - Offline session statistics
- **Community Activity** - Posts and interactions

---

**Ready for Production Deployment** ✅

The Sembalun meditation app is fully optimized, tested, and ready for production deployment with comprehensive PWA capabilities and authentic Indonesian cultural integration.