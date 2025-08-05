# Deployment Guide - Supabase Version

## Prerequisites

- Supabase project set up with database schema
- Vercel account
- OAuth providers configured (Google, Apple)

## Environment Variables

### Required Environment Variables for Vercel

Set these in your Vercel dashboard under Project Settings > Environment Variables:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration (Required)
VITE_APP_NAME=Sembalun
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Optional: Development/Testing
VITE_USE_LOCAL_SUPABASE=false
```

### How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your:
   - Project URL (VITE_SUPABASE_URL)
   - Anon/Public key (VITE_SUPABASE_ANON_KEY)

## Supabase Configuration

### 1. Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of supabase/schema.sql
-- This will create all necessary tables, indexes, and policies
```

### 2. Authentication Providers

#### Google OAuth Setup
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your OAuth credentials:
   - Client ID: From Google Cloud Console
   - Client Secret: From Google Cloud Console
4. Set authorized redirect URI: 
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Add your domain to authorized domains:
   - `https://yourdomain.vercel.app`

#### Apple OAuth Setup
1. Enable Apple provider in Supabase Dashboard
2. Add your Apple OAuth credentials:
   - Services ID: From Apple Developer Console  
   - Team ID: From Apple Developer Console
   - Key ID: From Apple Developer Console
   - Private Key: From Apple Developer Console
3. Set redirect URI:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`

### 3. Storage Buckets

The application will automatically try to create these buckets:
- `avatars` (public) - User profile pictures
- `audio` (public) - Audio files
- `images` (public) - General images  
- `documents` (private) - User documents

You can also create them manually in Supabase Dashboard > Storage.

### 4. Row Level Security Policies

The schema includes RLS policies, but verify they're active:
1. Go to Supabase Dashboard > Authentication > Policies
2. Ensure all tables have appropriate policies enabled
3. Test with a sample user account

## Vercel Deployment

### 1. Connect Repository
1. Go to Vercel dashboard
2. Click "New Project"
3. Import your Git repository
4. Select the correct branch (usually `main`)

### 2. Build Configuration
Vercel should automatically detect the framework as Vite. If not, set:
- **Framework Preset**: Vite
- **Build Command**: `npm run build:deploy`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables
Add all required environment variables in Vercel dashboard.

### 4. Domain Configuration
1. Add your custom domain in Vercel dashboard
2. Update OAuth redirect URLs in:
   - Supabase Authentication settings
   - Google Cloud Console
   - Apple Developer Console

## Build Commands

Available build commands:
- `npm run build` - Standard production build
- `npm run build:fast` - Fast build with optimizations
- `npm run build:deploy` - Deployment-optimized build
- `npm run build:prod` - Full production build with type checking

## Testing Deployment

### 1. Local Testing with Production Config
```bash
# Set environment variables in .env.local
npm run build:deploy
npm run preview
```

### 2. Staging Environment
Consider setting up a staging environment:
1. Create a separate Supabase project for staging
2. Deploy to a Vercel preview branch
3. Test all functionality before production deployment

## Health Checks

After deployment, verify:

### Authentication
- [ ] Email/password sign up/sign in works
- [ ] Google OAuth works
- [ ] Apple OAuth works (iOS/macOS only)
- [ ] Password reset flow works
- [ ] Guest mode works

### Database
- [ ] User profiles are created on signup
- [ ] Meditation sessions can be saved
- [ ] Journal entries can be created
- [ ] Course progress is tracked

### Storage
- [ ] Avatar uploads work
- [ ] File size limits are enforced
- [ ] Private files require authentication

### Performance
- [ ] Page load times < 3 seconds
- [ ] Images are optimized
- [ ] Service worker caches resources

## Monitoring

### Supabase Monitoring
- Monitor database performance in Supabase Dashboard
- Set up alerts for high resource usage
- Review authentication logs

### Vercel Analytics
- Enable Vercel Analytics for performance insights
- Monitor Core Web Vitals
- Track deployment frequency and success rate

### Error Tracking
Consider adding error tracking:
- Sentry for error monitoring
- LogRocket for session replay
- Custom error boundaries for React errors

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check for TypeScript errors
npm run typecheck

# Check for linting errors  
npm run lint

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variable Issues
- Ensure all required variables are set in Vercel
- Check that variable names match exactly (VITE_ prefix required)
- Redeploy after changing environment variables

#### Authentication Redirect Issues
- Verify OAuth redirect URLs match your domain
- Check that `/auth/callback` route is accessible
- Ensure CORS settings allow your domain

#### Database Connection Issues
- Verify Supabase URL and key are correct
- Check that RLS policies allow the operations
- Test database connection in Supabase dashboard

### Getting Help

1. Check Vercel deployment logs
2. Check Supabase logs in dashboard
3. Use browser developer tools for client-side issues
4. Review this deployment guide

## Security Considerations

### Production Security Checklist
- [ ] RLS policies are active on all tables
- [ ] HTTPS is enforced
- [ ] API keys are properly scoped (anon key only)
- [ ] OAuth redirect URLs are restricted to your domain
- [ ] File upload limits are enforced
- [ ] CORS settings are restrictive

### Regular Maintenance
- Keep Supabase client library updated
- Monitor for security updates
- Review and audit RLS policies
- Rotate API keys periodically

## Performance Optimization

### Recommended Settings
- Enable Vercel Analytics
- Use Vercel Image Optimization
- Enable compression in Vercel
- Set appropriate cache headers (already configured)

### Database Optimization
- Monitor slow queries in Supabase
- Add indexes for frequently queried fields
- Use Supabase connection pooling for high traffic

This completes the deployment guide for the Supabase version of the application.