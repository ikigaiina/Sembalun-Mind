# Sembalun - Indonesian Meditation App

A modern meditation and mindfulness application built with React, TypeScript, Vite, and Supabase.

## ✨ Features

- **Authentication**: Email/password, Google OAuth, Apple OAuth, and guest mode
- **Meditation Sessions**: Guided meditation, breathing exercises, and mindfulness practices
- **Progress Tracking**: Personal statistics, streaks, and achievement system
- **Journal**: Digital journaling with mood tracking
- **Courses**: Structured meditation programs with progress tracking
- **Offline Support**: Works offline with data synchronization
- **PWA**: Install as a native app on mobile and desktop
- **Indonesian Language**: Full localization for Indonesian users

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Routing**: React Router v7
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sembalun.git
   cd sembalun
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_NAME=Sembalun
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENV=development
   ```

4. **Set up Supabase database**
   - Copy the contents of `supabase/schema.sql`
   - Run it in your Supabase SQL Editor

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── ui/             # UI components
│   └── ...
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and business logic
│   ├── supabaseAuthService.ts
│   ├── supabaseDatabaseService.ts
│   └── supabaseStorageService.ts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── config/             # Configuration files
│   └── supabase.ts     # Supabase configuration
└── ...

supabase/
└── schema.sql          # Database schema and seed data
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript type checking

### Testing
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report

### Build Variants
- `npm run build:fast` - Fast production build
- `npm run build:deploy` - Deployment-optimized build
- `npm run build:analyze` - Build with bundle analyzer

## 🗄️ Database Schema

### Main Tables
- **users** - User profiles and preferences
- **meditation_sessions** - Session records and progress
- **journal_entries** - User journal entries
- **achievements** - User achievements and milestones
- **courses** - Meditation courses and content
- **user_course_progress** - Individual course progress

### Key Features
- Row Level Security (RLS) enabled
- Automatic timestamp management
- User profile creation triggers
- Comprehensive indexing for performance

## 🔐 Authentication

### Supported Methods
- **Email/Password** - Traditional authentication
- **Google OAuth** - Google account integration
- **Apple OAuth** - Apple ID authentication
- **Guest Mode** - Anonymous usage with data migration

### Security Features
- Row Level Security policies
- JWT token management
- Automatic session refresh
- Secure password reset flow

## 📱 Progressive Web App (PWA)

The app includes full PWA support:
- **Offline functionality** - Works without internet
- **Install prompt** - Add to home screen
- **Background sync** - Sync data when online
- **Push notifications** - Meditation reminders (planned)

## 🌍 Internationalization

Currently supports:
- **Indonesian (ID)** - Primary language
- **English (EN)** - Secondary support

Easy to extend for additional languages through the localization system.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build:deploy
# Upload dist/ folder to your hosting provider
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🧪 Testing

### Test Setup
- **Unit Tests** - Component and utility testing
- **Integration Tests** - User flow testing
- **E2E Tests** - Full application testing (planned)

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- components/auth
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use semantic commit messages
- Update documentation as needed

## 📋 API Documentation

### Authentication Service
```typescript
import { SupabaseAuthService } from './services/supabaseAuthService'

// Sign in with email
await SupabaseAuthService.signIn(email, password)

// Sign up new user
await SupabaseAuthService.signUp(email, password, metadata)

// OAuth sign in
await SupabaseAuthService.signInWithGoogle()
```

### Database Service
```typescript
import { SupabaseDatabaseService } from './services/supabaseDatabaseService'

// Create meditation session
await SupabaseDatabaseService.createMeditationSession(sessionData)

// Get user statistics
await SupabaseDatabaseService.getUserStats(userId)
```

### Storage Service
```typescript
import { SupabaseStorageService } from './services/supabaseStorageService'

// Upload avatar
await SupabaseStorageService.uploadAvatar(userId, file)

// Get file URL
const url = SupabaseStorageService.getImageUrl(filePath)
```

## 🔧 Configuration

### Environment Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Current version
- `VITE_APP_ENV` - Environment (development/production)

### Build Configuration
See `vite.config.ts` for build customization options.

## 📊 Performance

### Optimization Features
- **Code splitting** - Lazy loading of routes
- **Tree shaking** - Remove unused code
- **Asset optimization** - Compressed images and fonts
- **Caching** - Aggressive caching strategy
- **Bundle analysis** - Monitor bundle size

### Performance Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s  
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.5s

## 🐛 Troubleshooting

### Common Issues

#### Environment Variables Not Loading
```bash
# Restart dev server after changes
npm run dev
```

#### Build Failures
```bash
# Check TypeScript errors
npm run typecheck

# Check lint errors
npm run lint

# Clear cache
rm -rf node_modules .vite
npm install
```

#### Authentication Issues
- Verify Supabase credentials
- Check OAuth provider configuration
- Ensure RLS policies are correct

## 📜 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **Tailwind CSS** - Styling system
- **Lucide React** - Icon library
- **Recharts** - Charts and analytics
- **Vite** - Build tool and development server

## 📞 Support

- **Documentation**: Check `SUPABASE-MIGRATION.md` and `DEPLOYMENT.md`
- **Issues**: Open an issue on GitHub
- **Email**: support@sembalun.app (if available)

---

Made with ❤️ for the Indonesian meditation community