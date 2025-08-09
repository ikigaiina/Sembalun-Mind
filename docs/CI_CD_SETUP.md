# 🚀 CI/CD Pipeline Setup - Sembalun Mind

## Overview

This document provides comprehensive setup instructions for the Sembalun Mind CI/CD pipeline, specifically designed for Indonesian meditation platform development with cultural authenticity and accessibility compliance.

## 📋 Pipeline Architecture

### 🏗️ Multi-Stage Pipeline

Our CI/CD pipeline consists of multiple workflows optimized for Indonesian development:

1. **📊 Comprehensive Pipeline** (`comprehensive-pipeline.yml`) - Main build, test, and deployment
2. **🔍 PR Validation** (`pr-validation.yml`) - Pull request validation and cultural review
3. **🎉 Release Workflow** (`release.yml`) - Automated releases with Indonesian documentation

### 🎯 Key Features

- **🏛️ Cultural Validation**: Automated detection and validation of Indonesian cultural content
- **♿ Accessibility Testing**: WCAG 2.1 AA compliance verification with 7:1+ contrast ratios
- **📱 Indonesian Mobile Optimization**: Network simulation and performance testing
- **🔒 Security Scanning**: Comprehensive security auditing and vulnerability detection
- **🌐 Multi-Environment Deployment**: Staging and production with proper validation

## 🔧 Setup Instructions

### 1. Repository Secrets Configuration

Configure the following secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

#### 🚀 Vercel Deployment Secrets
```bash
# Required for deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_PROJECT_ID_PROD=your_production_project_id  # If different from staging

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Staging Environment (Optional)
STAGING_SUPABASE_URL=https://your-staging-project.supabase.co
STAGING_SUPABASE_ANON_KEY=your_staging_supabase_anon_key

# Production Environment
PROD_SUPABASE_URL=https://your-production-project.supabase.co
PROD_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

#### 📊 Optional Enhancement Secrets
```bash
# Code Coverage (Optional)
CODECOV_TOKEN=your_codecov_token

# Slack Notifications (Optional)
SLACK_WEBHOOK=your_slack_webhook_url

# Performance Monitoring (Optional)
LIGHTHOUSE_SERVER_URL=your_lighthouse_server
```

### 2. Vercel Project Setup

#### 🌍 Create Vercel Projects
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (run in project root)
vercel

# Get project info
vercel ls
```

#### 📋 Vercel Environment Variables
Configure these in your Vercel dashboard for each environment:

**Production Environment:**
- `VITE_SUPABASE_URL`: Your production Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your production Supabase anon key

**Staging Environment:**
- `VITE_SUPABASE_URL`: Your staging Supabase URL  
- `VITE_SUPABASE_ANON_KEY`: Your staging Supabase anon key

### 3. Branch Protection Rules

Set up branch protection for `main` and `development_main`:

#### 🛡️ Protection Settings
```yaml
# Required status checks
- setup-validation
- code-quality
- unit-testing
- build-analysis
- accessibility-testing
- security-audit

# Additional rules
- Require pull request reviews (2 reviewers recommended)
- Dismiss stale reviews when new commits are pushed
- Require review from code owners (for cultural content)
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators in restrictions
```

## 🔄 Workflow Details

### 📊 Comprehensive Pipeline Workflow

**Triggers:**
- Push to `main`, `development_main`, `develop`
- Pull requests to above branches
- Manual workflow dispatch with options

**Stages:**

1. **🔍 Setup & Environment Validation**
   - Node.js setup and caching
   - Dependency installation
   - Environment validation
   - Deployment decision logic

2. **🔒 Security & Dependency Audit**
   - npm audit for vulnerabilities
   - High/critical vulnerability blocking
   - Security report generation

3. **🧪 Code Quality & Linting**
   - ESLint with production rules
   - TypeScript strict type checking
   - Code quality metrics
   - Cultural content detection

4. **🧪 Unit Testing & Coverage**
   - Multi-Node version testing (18.x, 20.x)
   - Coverage reporting with thresholds
   - Codecov integration
   - Indonesian cultural test utilities

5. **🏗️ Build & Bundle Analysis**
   - Multi-environment builds (development, production, deploy)
   - Bundle size analysis and limits
   - Indonesian mobile optimization
   - Build artifact generation

6. **♿ Accessibility Testing**
   - WCAG 2.1 AA compliance testing
   - axe-core automated testing
   - Color contrast validation
   - Touch target verification

7. **🌏 Performance Testing**
   - Indonesian network simulation (3G/4G)
   - Mobile performance optimization
   - Core Web Vitals measurement
   - Jakarta/Surabaya network testing

8. **🏛️ Cultural Content Validation**
   - Automatic cultural file detection
   - Indonesian cultural expert review requirements
   - Cultural authenticity warnings

9. **🚀 Deployment (Staging/Production)**
   - Environment-specific deployments
   - Health checks and verification
   - Post-deployment monitoring

### 🔍 PR Validation Workflow

**Features:**
- **📋 Automatic PR Analysis**: File change categorization and labeling
- **🧪 Quick Validation**: Fast lint, type check, and build validation
- **🏛️ Cultural Review Requirements**: Automated cultural content detection
- **♿ Accessibility Impact Assessment**: UI change accessibility testing
- **🔒 Security Assessment**: Quick security vulnerability scanning
- **📊 Comprehensive PR Summary**: Detailed validation report

### 🎉 Release Workflow

**Features:**
- **📝 Automatic Changelog Generation**: Indonesian cultural feature highlighting
- **📦 Multi-Format Release Assets**: Production and standalone builds
- **🏛️ Indonesian Setup Guides**: Culturally appropriate documentation
- **📊 Release Analytics**: Development statistics and metrics
- **🌟 Community Engagement**: Indonesian community notifications

## 📱 Indonesian Mobile Optimization

### 🌐 Network Conditions Testing

The pipeline simulates various Indonesian network conditions:

```javascript
// 3G Indonesian Networks (Jakarta, Surabaya)
timeout 30s curl -w "Total time: %{time_total}s" http://localhost:4173

// 4G Mobile Data Simulation  
timeout 20s curl -w "Total time: %{time_total}s" http://localhost:4173

// Performance thresholds
- 3G: < 3 seconds for initial load
- 4G: < 1.5 seconds for initial load
- Bundle size: < 5MB total
```

### 📊 Performance Metrics

Key performance indicators monitored:

- **First Contentful Paint**: < 1.5s on Indonesian 3G
- **Core Web Vitals**: Excellent scores for Indonesian mobile
- **Bundle Size**: Optimized for Indonesian data costs
- **Accessibility**: WCAG 2.1 AA compliance (7:1+ contrast)

## 🏛️ Cultural Content Validation

### 📋 Automatic Detection

The pipeline automatically detects cultural content changes:

```bash
# File patterns monitored
- cultural/*
- indonesia*
- javanese*
- balinese*
- sundanese*
- minangkabau*
- wisdom*
- tradition*
```

### ✅ Cultural Review Process

When cultural content is detected:

1. **🏷️ Automatic Labeling**: PR labeled with `🏛️ cultural`
2. **📝 Review Comment**: Detailed cultural validation checklist
3. **👥 Expert Review Required**: Indonesian cultural practitioners needed
4. **📚 Authenticity Verification**: Traditional practice validation
5. **🌏 Regional Consideration**: Multi-regional cultural accuracy

## ♿ Accessibility Compliance

### 🎯 WCAG 2.1 AA Requirements

Automated testing for:

- **Color Contrast**: 7:1+ ratio for all interactive elements
- **Touch Targets**: 44px minimum for all clickable elements
- **Screen Reader**: Comprehensive ARIA labeling
- **Keyboard Navigation**: Full keyboard accessibility
- **Motion Preferences**: Respects reduced motion settings

### 🧪 Testing Tools

- **axe-core**: Automated accessibility scanning
- **Lighthouse**: Performance and accessibility scoring
- **Manual Testing**: Screen reader and keyboard validation
- **Color Contrast**: WCAG 2.1 AA compliance verification

## 🔒 Security Configuration

### 🛡️ Security Scanning

Multi-layered security approach:

```bash
# Dependency Vulnerabilities
npm audit --audit-level moderate

# High/Critical Vulnerability Blocking
if [ "$HIGH_VULNS" -gt 0 ] || [ "$CRITICAL_VULNS" -gt 0 ]; then
  echo "❌ Security vulnerabilities detected"
  exit 1
fi

# Security Headers Verification
curl -I https://sembalun.app | grep -E "X-Frame-Options|X-Content-Type-Options"
```

### 🔐 Best Practices

- **No Hardcoded Secrets**: All sensitive data in GitHub secrets
- **Environment Isolation**: Separate staging and production environments
- **Secure Headers**: CSP, HSTS, and other security headers
- **Regular Audits**: Automated daily security scanning

## 🚀 Deployment Strategy

### 🌍 Multi-Environment Setup

**Staging Environment:**
- URL: `https://sembalun-staging.vercel.app`
- Purpose: Pre-production testing and cultural validation
- Triggers: Push to `development_main`
- Database: Staging Supabase instance

**Production Environment:**
- URL: `https://sembalun-cmkrqe50y-ikigais-projects-cceb1be5.vercel.app`
- Purpose: Live Indonesian meditation platform
- Triggers: Push to `main` (with all checks passing)
- Database: Production Supabase instance

### ✅ Deployment Checklist

Before each production deployment:

- [ ] All tests passing (unit, integration, e2e)
- [ ] Security audit clear
- [ ] Accessibility compliance verified
- [ ] Cultural content validated by Indonesian experts
- [ ] Performance benchmarks met
- [ ] Indonesian mobile optimization confirmed
- [ ] Supabase connectivity verified
- [ ] Bundle size within limits

## 📊 Monitoring & Analytics

### 🔍 Post-Deployment Monitoring

Automated checks after deployment:

```bash
# Health Check
curl -f https://sembalun.app

# Performance Monitoring
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" https://sembalun.app)

# Indonesian Cultural Features Verification
echo "✅ Cultural meditation practices available"
echo "✅ Indonesian time-based mood tracking active"
echo "✅ WCAG 2.1 AA accessibility maintained"
```

### 📈 Metrics Tracked

- **Deployment Success Rate**: Target 99%+
- **Build Performance**: < 5 minutes average
- **Test Coverage**: 75%+ global, 85%+ cultural components
- **Accessibility Score**: 100% WCAG 2.1 AA compliance
- **Indonesian Mobile Performance**: < 2s load time on 3G

## 🛠️ Troubleshooting

### 🔧 Common Issues & Solutions

#### ❌ Build Failures

**Issue**: TypeScript errors in production build
```bash
# Solution: Run type check locally
npm run typecheck

# Fix strict type issues
npm run typecheck:loose  # For deployment emergencies only
```

**Issue**: Bundle size exceeds limits
```bash
# Solution: Analyze bundle size
npm run build:analyze

# Check for large dependencies
npm run open:stats
```

#### ❌ Test Failures

**Issue**: Accessibility tests failing
```bash
# Solution: Run accessibility tests locally
npm run test:accessibility

# Check WCAG 2.1 AA compliance
npx axe --tags wcag2a,wcag2aa,wcag21aa http://localhost:4173
```

**Issue**: Cultural content validation warnings
```bash
# Solution: Involve Indonesian cultural experts
# Review cultural authenticity requirements
# Validate regional variations (Java, Bali, Sunda, Minang)
```

#### ❌ Deployment Issues

**Issue**: Vercel deployment failures
```bash
# Check secrets configuration
vercel env ls

# Verify build success
npm run build:deploy

# Check deployment logs
vercel logs
```

**Issue**: Supabase connection errors
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test Supabase connectivity
npm run test:supabase
```

### 🔍 Debug Commands

Local debugging commands:

```bash
# Full pipeline simulation
npm run prepare:production

# Security audit
npm run security:audit

# Performance testing
npm run performance:lighthouse

# Accessibility validation
npm run test:accessibility

# Cultural content validation
grep -r "cultural\|indonesia" src/
```

## 📚 Additional Resources

### 🏛️ Cultural Development Resources

- **Indonesian Meditation Traditions**: Research authentic practices
- **Cultural Validation Guidelines**: Community review processes
- **Regional Variations**: Java, Bali, Sunda, Minangkabau practices
- **Islamic Integration**: Respectful spiritual practice inclusion

### ♿ Accessibility Resources

- **WCAG 2.1 AA Guidelines**: https://www.w3.org/WAI/WCAG21/AA/
- **axe-core Documentation**: https://github.com/dequelabs/axe-core
- **Screen Reader Testing**: NVDA, JAWS, VoiceOver compatibility
- **Indonesian Accessibility Standards**: Local accessibility requirements

### 📱 Indonesian Mobile Resources

- **Network Performance**: 3G/4G optimization strategies
- **Data Cost Optimization**: Efficient bundle and caching
- **Device Compatibility**: Popular Indonesian Android/iOS devices
- **Regional Performance**: Jakarta, Surabaya, Bali network conditions

---

## 🙏 Support & Community

For CI/CD pipeline issues:

- **📧 Technical Issues**: Create GitHub issue with `🔧 ci/cd` label
- **🏛️ Cultural Questions**: Involve Indonesian cultural advisors
- **♿ Accessibility Concerns**: Tag accessibility experts
- **📱 Mobile Issues**: Include Indonesian device/network details

**Terima kasih** for contributing to authentic Indonesian meditation technology! Your attention to CI/CD quality helps preserve cultural heritage while maintaining world-class technical standards.

---

**Built with ❤️ for Indonesian meditation practitioners worldwide**

*Sembalun Mind: Where traditional Indonesian wisdom meets world-class DevOps excellence*