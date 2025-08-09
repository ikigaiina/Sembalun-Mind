# 🚀 Sembalun Mind - Production Deployment Guide

## Quick Deployment to Vercel

### Prerequisites
- Vercel account (free tier available)
- GitHub repository (optional but recommended)
- Supabase project configured

### Option 1: Automated Deployment (Recommended)

1. **Connect GitHub Repository**
   ```bash
   # Push your code to GitHub if not already done
   git add .
   git commit -m "feat: ready for production deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `your-username/sembalun`
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Set Environment Variables**
   In Vercel dashboard → Settings → Environment Variables, add:
   ```
   VITE_SUPABASE_URL=https://rmombyjyhbneukkvkddr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb21ieWp5aGJuZXVra3ZrZGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MTc4NjUsImV4cCI6MjA3MDI5Mzg2NX0.64GZhxOw6pyPw_pO0VbFxQ80JNIZqR6B6tzMUK-tGn4
   VITE_APP_NAME=Sembalun Mind
   VITE_APP_VERSION=1.0.0
   VITE_APP_DESCRIPTION=Indonesian Meditation App with Cultural Wisdom
   VITE_PWA_THEME_COLOR=#6A8F6F
   VITE_PWA_BACKGROUND_COLOR=#E1E8F0
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_NOTIFICATIONS=true
   VITE_ENABLE_OFFLINE_MODE=true
   VITE_ENABLE_AUTH=true
   VITE_ENVIRONMENT=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at: `https://sembalun-mind.vercel.app` (or custom domain)

### Option 2: CLI Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   # Build the project
   npm run build

   # Deploy to production
   vercel --prod
   ```

3. **Set environment variables via CLI**
   ```bash
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   # ... add all other variables
   ```

### Option 3: Manual Deployment

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload dist folder**
   - Go to Vercel dashboard
   - Drag and drop the `dist` folder
   - Set environment variables in settings

## Post-Deployment Checklist

### ✅ Essential Checks
- [ ] App loads without errors
- [ ] Authentication works (register/login)
- [ ] Supabase connection established
- [ ] Meditation sessions load
- [ ] PWA features work (install prompt)
- [ ] Mobile responsiveness
- [ ] Indonesian localization working

### 🔧 Configuration Verification
- [ ] Environment variables set correctly
- [ ] CORS configured in Supabase for your domain
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Cache headers configured
- [ ] Service worker registered

### 📊 Performance Optimization
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size optimized

## Domain Configuration (Optional)

### Custom Domain Setup
1. **In Vercel Dashboard**
   - Go to Settings → Domains
   - Add your custom domain: `sembalun.app`

2. **DNS Configuration**
   Point your domain to Vercel:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

## Supabase Production Configuration

### Required Supabase Settings
1. **Authentication**
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/auth/callback`

2. **CORS Policy**
   ```sql
   -- Add to Supabase SQL Editor
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
   ```

3. **Storage Buckets**
   - Ensure all buckets are public for media files
   - Configure appropriate RLS policies

## Monitoring & Analytics

### Built-in Monitoring
- Vercel Analytics (automatic)
- Vercel Speed Insights
- Error tracking via console

### External Monitoring (Optional)
- Google Analytics 4
- Sentry for error tracking
- LogRocket for user sessions

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Check build locally first
npm run build
npm run preview
```

**Environment Variables Not Loading**
- Ensure variables start with `VITE_`
- Check they're set for "Production" environment
- Redeploy after setting variables

**Supabase Connection Issues**
```bash
# Test connection
npm run test:supabase
```

**PWA Not Working**
- Check `manifest.json` is accessible
- Verify service worker registration
- Test on mobile device

### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze
```

## Security Considerations

### Production Security
- [x] HTTPS enabled (automatic with Vercel)
- [x] Security headers configured in `vercel.json`
- [x] Supabase RLS policies enabled
- [x] No sensitive data in client-side code
- [x] API keys are environment-specific

### Best Practices
- Use Supabase anon key (not service role) in frontend
- Enable Row Level Security on all tables
- Regular security updates via npm audit
- Monitor for unusual access patterns

## Deployment Automation

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Support

### Getting Help
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Project Issues: Create issue in repository

### Performance Monitoring
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard

---

🎉 **Your Sembalun Mind meditation app is now ready for production!**

Access your live app at: **https://sembalun-mind.vercel.app**