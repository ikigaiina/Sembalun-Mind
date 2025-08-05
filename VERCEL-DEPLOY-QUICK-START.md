# 🚀 Quick Vercel Deployment Guide

## ⚡ **Instant Deploy - 3 Steps**

### **Step 1: Connect GitHub to Vercel**
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project" → Import from GitHub
3. Select your `sembalun` repository

### **Step 2: Configure Environment Variables**
In Vercel dashboard, go to Settings → Environment Variables and add:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
NODE_ENV=production
VITE_USE_EMULATORS=false
```

### **Step 3: Deploy**
1. Vercel will auto-detect Vite framework
2. Click "Deploy" - it will build and deploy automatically
3. Your app will be live at `https://your-app.vercel.app`

## 🔧 **Build Settings (Auto-Configured)**
- **Framework**: Vite ✅
- **Build Command**: `npm run build` ✅  
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

## 🔥 **Firebase Setup**
Add your Vercel domain to Firebase Auth authorized domains:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add: `your-app.vercel.app`

## ✅ **Deployment Complete!**
Your comprehensive meditation app is now live on Vercel with:
- ✅ **SSL Certificate** (automatic)
- ✅ **Global CDN** (fast worldwide)
- ✅ **Auto-deployments** (on git push)
- ✅ **Performance optimized** (production build)

---

**🎉 That's it! Your Sembalun meditation app is production-ready on Vercel!**