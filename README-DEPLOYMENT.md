# 🚀 Vercel Deployment Guide for Sembalun Meditation App

## 📋 Pre-Deployment Checklist

### ✅ **Prerequisites**
- [ ] Vercel account created
- [ ] Firebase project configured
- [ ] GitHub repository connected
- [ ] Environment variables prepared
- [ ] Domain name ready (optional)

## 🔧 **Step 1: Environment Variables Setup**

### **Required Firebase Variables**
Copy these variables to your Vercel dashboard:

```bash
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### **Production Settings**
```bash
NODE_ENV=production
VITE_USE_EMULATORS=false
VITE_ENABLE_ANALYTICS=true
```

## 🚀 **Step 2: Deploy to Vercel**

### **Option A: GitHub Integration (Recommended)**
1. Connect your GitHub repository to Vercel
2. Import the project in Vercel dashboard
3. Configure environment variables
4. Deploy automatically on push

### **Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel --prod
```

### **Option C: Manual Deploy**
```bash
# Build the project
npm run build:vercel

# Upload dist folder to Vercel
# (Use Vercel dashboard drag & drop)
```

## ⚙️ **Step 3: Vercel Configuration**

### **Build Settings**
- **Framework Preset**: Vite
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### **Environment Variables in Vercel Dashboard**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all variables from `.env.production`
4. Set environment to "Production"

## 🔥 **Step 4: Firebase Configuration**

### **Update Firebase Project Settings**
1. Add your Vercel domain to Firebase Auth:
   - Go to Firebase Console → Authentication → Settings
   - Add `https://your-app.vercel.app` to authorized domains

2. Update Firestore Security Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Add your production domain
       match /{document=**} {
         allow read, write: if request.auth != null 
         && request.auth.token.firebase.host == 'your-project.firebaseapp.com';
       }
     }
   }
   ```

## 🌐 **Step 5: Domain Configuration (Optional)**

### **Custom Domain Setup**
1. In Vercel dashboard, go to "Domains"
2. Add your custom domain
3. Configure DNS settings with your domain provider
4. Update Firebase authorized domains

### **SSL Certificate**
- Vercel automatically provides SSL certificates
- Custom domains get certificates within minutes

## 📊 **Step 6: Performance Optimization**

### **Vercel Analytics** (Optional)
```bash
npm install @vercel/analytics
```

Add to your main App component:
```tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your app content */}
      <Analytics />
    </>
  );
}
```

### **Speed Insights** (Optional)
```bash
npm install @vercel/speed-insights
```

## 🧪 **Step 7: Testing Deployment**

### **Post-Deployment Checklist**
- [ ] App loads correctly
- [ ] Authentication works (Google, Apple, Email)
- [ ] Firebase connection established
- [ ] Offline functionality works
- [ ] PWA installation available
- [ ] Performance metrics acceptable
- [ ] Error tracking functional

### **Testing Commands**
```bash
# Test production build locally
npm run build:vercel
npm run preview

# Run tests
npm test

# Check bundle size
npm run build -- --analyze
```

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **Firebase Connection Issues**
- Verify all environment variables are set
- Check Firebase project settings
- Ensure authorized domains include Vercel URL

#### **Build Failures**
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Run `npm run build:vercel` locally first

#### **Authentication Problems**
- Update Firebase Auth authorized domains
- Check OAuth provider configurations
- Verify API keys and project IDs

#### **Performance Issues**
- Enable compression in vercel.json
- Optimize images and assets
- Check bundle analysis for large dependencies

## 📈 **Monitoring & Maintenance**

### **Vercel Dashboard Features**
- **Deployments**: View deployment history
- **Functions**: Monitor serverless functions
- **Analytics**: Track user engagement
- **Speed Insights**: Monitor Core Web Vitals

### **Firebase Monitoring**
- **Authentication**: Monitor sign-in methods
- **Firestore**: Track database usage
- **Performance**: Monitor app performance
- **Crashlytics**: Track errors and crashes

## 🎉 **Success Metrics**

### **Deployment Success Indicators**
- ✅ Build completes without errors
- ✅ All pages load correctly
- ✅ Authentication flows work
- ✅ Database reads/writes function
- ✅ PWA installation available
- ✅ Core Web Vitals scores good
- ✅ Offline functionality works

## 📞 **Support Resources**

- **Vercel Documentation**: https://vercel.com/docs
- **Firebase Documentation**: https://firebase.google.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/
- **PWA Guide**: https://web.dev/progressive-web-apps/

---

**🚀 Your Sembalun meditation app is now ready for production deployment on Vercel!**