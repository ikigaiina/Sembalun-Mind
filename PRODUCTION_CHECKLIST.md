# 🚀 Sembalun Production Deployment Checklist

## Pre-Deployment Requirements

### ✅ Firebase Setup (REQUIRED for Authentication)
- [ ] Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable Authentication (Email/Password + Google)
- [ ] Setup Firestore Database (production mode)
- [ ] Copy Firebase config values
- [ ] Deploy security rules: `firebase deploy --only firestore:rules`

### ✅ Environment Variables (CRITICAL)
Copy these exact variables to Vercel:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ENABLE_AUTH=true
NODE_ENV=production
```

## Quick Test Before Deploy

```bash
# Clean build test
npm run prepare:production

# Local preview test
npm run test:build
```

## Vercel Deployment Options

### Option A: Web Interface (Easiest)
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import from Git or upload folder
3. Framework: **Vite**
4. Add environment variables above
5. Deploy

### Option B: GitHub Integration
1. Push to GitHub
2. Connect Vercel to repo
3. Auto-deploy on each push

### Option C: CLI Deploy
```bash
npm install -g vercel
vercel login
npm run deploy:vercel
```

## Post-Deployment Steps

### ✅ Update Firebase Authorized Domains
1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain:
   - `your-project.vercel.app`
   - Custom domain (if applicable)

### ✅ Test Authentication
- [ ] Google Sign-in works
- [ ] Email/Password signup works
- [ ] Guest mode functions
- [ ] User profiles save/load
- [ ] Settings page accessible

### ✅ Verify Features
- [ ] PWA installs on mobile
- [ ] Offline mode works
- [ ] All routes accessible
- [ ] Meditation sessions load
- [ ] Indonesian content displays correctly

## Success Indicators

✅ **Your deployment is successful when:**
- Authentication fully functional
- No console errors
- PWA installation prompt appears
- Lighthouse PWA score: 100/100
- Fast loading (< 3 seconds)

## Troubleshooting

### Auth Not Working?
- Check environment variables in Vercel
- Verify Firebase authorized domains
- Ensure Firebase project is active

### Build Failing?
- Run `npm run prepare:production` locally first
- Check for TypeScript errors
- Verify all dependencies installed

### PWA Issues?
- Ensure HTTPS (automatic on Vercel)
- Check service worker registration
- Verify manifest.json accessibility

## Ready to Deploy?

**Your Sembalun app is production-ready with:**
- ✅ Complete authentication system
- ✅ Firebase integration
- ✅ PWA capabilities
- ✅ Indonesian cultural authenticity
- ✅ Optimized performance
- ✅ Security best practices

Choose your deployment method and launch! 🚀

---

**Need help?** Check the detailed `VERCEL_DEPLOYMENT.md` guide.