# Sembalun Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### Option 1: Vercel Web Interface (Recommended)

1. **Visit Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub, Google, or email

2. **Import Sembalun Project**
   - Click "New Project"
   - Import from Git Repository or upload folder
   - Select the `sembalun` directory

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion (~2-3 minutes)
   - Get your live URL!

### Option 2: Vercel CLI

```bash
# Navigate to project
cd "D:\pengembangan siy\4\sembalun"

# Login to Vercel (follow prompts)
vercel login

# Deploy to production
vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? sembalun
# - Directory? ./
# - Override settings? No
```

### Option 3: GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial Sembalun release"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Connect Vercel to GitHub**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import from GitHub
   - Select your Sembalun repository

3. **Automatic Deployments**
   - Every push to main branch triggers deployment
   - Preview deployments for pull requests

## ⚙️ Pre-Configured Settings

✅ **vercel.json Configuration**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}],
  "headers": [
    // PWA-optimized headers for manifest, service worker, caching
  ]
}
```

✅ **Build Optimization**
- Bundle size: ~428KB (under limits)
- Code splitting: vendor, router, main chunks
- PWA assets: manifest.webmanifest, sw.js
- Security headers configured

✅ **Environment Variables** (if needed)
- `VITE_ENABLE_ANALYTICS=true`
- `VITE_GTM_ID=GTM-XXXXXXX`
- Set in Vercel dashboard → Project → Settings → Environment Variables

## 🎯 Expected Results

### Build Output
```
✓ 91 modules transformed.
dist/registerSW.js              0.13 kB
dist/manifest.webmanifest       0.93 kB  
dist/index.html                 0.97 kB
dist/assets/index-WeVwjETA.css  64.14 kB
dist/assets/vendor-CEjTMBxM.js  11.10 kB
dist/assets/router-DlHuaCGx.js  31.67 kB
dist/assets/index-DuTt8O0x.js   325.66 kB
✓ built in ~17s

PWA v1.0.2
precache 13 entries (429.14 KiB)
```

### Live URLs Structure
- **Main**: `https://sembalun-[hash].vercel.app`
- **Custom Domain**: Configure in Vercel dashboard
- **Preview**: Automatic for each deployment

## 📱 Post-Deployment Testing

### 1. PWA Installation Test
- Open site on mobile browser
- Look for "Add to Home Screen" prompt
- Install and test offline functionality

### 2. Core Functionality Verification
- [ ] Landing page loads correctly
- [ ] Indonesian content displays properly
- [ ] Onboarding flow works on mobile
- [ ] PWA manifest serves correctly
- [ ] Service worker registers successfully
- [ ] Offline mode functions

### 3. Performance Checks
- [ ] Page load speed < 3 seconds
- [ ] Lighthouse PWA score = 100
- [ ] All routes accessible
- [ ] Indonesian characters render correctly

## 🔧 Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Verify all dependencies installed
- Run `npm run build` locally first

### PWA Not Installing
- Verify HTTPS (automatic on Vercel)
- Check manifest.webmanifest accessibility
- Ensure service worker registers properly

### Fonts/Styling Issues
- Verify Google Fonts loading
- Check Tailwind CSS compilation
- Confirm asset paths are correct

### Indonesian Text Issues
- Ensure UTF-8 encoding
- Verify meta charset in HTML
- Check font support for Indonesian characters

## 🌟 Production Checklist

✅ **Technical**
- [x] Production build successful
- [x] PWA manifest configured
- [x] Service worker generated
- [x] Security headers set
- [x] Caching strategies implemented

✅ **Content**
- [x] Indonesian descriptions updated
- [x] Brand voice compliance verified
- [x] Cultural authenticity validated
- [x] All features functional

✅ **Performance**
- [x] Bundle size optimized (428KB)
- [x] Code splitting implemented
- [x] Asset compression enabled
- [x] Cache headers configured

## 🎉 Success Indicators

When deployment is successful, you'll have:

1. **Live Indonesian meditation PWA** at your Vercel URL
2. **Perfect Lighthouse PWA score** (100/100)
3. **Mobile installation** working seamlessly
4. **Offline functionality** for core meditation features
5. **Indonesian cultural authenticity** preserved
6. **Fast loading** under 3 seconds globally

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify build locally with `npm run build`
3. Test PWA features on HTTPS (required)
4. Review browser console for errors

---

**Next Step**: Choose your preferred deployment method and get Sembalun live! 🚀

*Selamat bermeditasi! Your Indonesian meditation app is ready to bring peace to the world.*