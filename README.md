# Sembalun - Indonesian Meditation App

A calm, mindful Indonesian meditation experience with cairn (stone stack) progress tracking.

## Features

- 🧘‍♀️ **Indonesian-themed meditation app** with peaceful, mindful design
- 📱 **Mobile-first responsive design** optimized for all screen sizes
- 🏔️ **Cairn progress tracking** using stone stack metaphor for meditation progress
- 🎨 **Indonesian nature-inspired color palette**:
  - Primary: `#6A8F6F` (hijau-perbukitan - hill green)
  - Accent: `#A9C1D9` (biru-langit - sky blue)
  - Background: `#E1E8F0` (biru-kabut - mist blue)
  - Warm: `#C56C3E` (tanah-terakota - terracotta earth)
- 📚 **Typography**: Lora for headings, Inter for UI text
- ⚡ **PWA capabilities** for offline access and app-like experience
- 🛣️ **React Router** for smooth navigation

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **React Router DOM** for navigation
- **PWA** with service worker support
- **Google Fonts** (Lora & Inter)

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   │   ├── Button.tsx          # Styled button with variants
│   │   ├── Card.tsx            # Container card with blur backdrop
│   │   ├── Cairn.tsx           # 3D stone stack progress component
│   │   ├── CairnIcon.tsx       # Minimalist SVG cairn icon
│   │   ├── BreathingCard.tsx   # Animated card for breathing exercises
│   │   ├── MoodSelector.tsx    # Emoji-based mood tracking
│   │   ├── FloatingButton.tsx  # Floating action button with shadows
│   │   ├── DashboardLayout.tsx # Main app layout with bottom nav
│   │   ├── Header.tsx          # Navigation header
│   │   └── index.tsx           # Component exports
│   └── Layout.tsx
├── pages/            # Page components
│   ├── Dashboard.tsx           # Main dashboard with personalized content
│   ├── Home.tsx               # Original home (moved to /old-home)
│   ├── Meditation.tsx
│   ├── History.tsx
│   ├── Explore.tsx            # Exploration & discovery
│   ├── Journal.tsx            # Mindfulness journal
│   ├── Profile.tsx            # User profile & settings
│   ├── ComponentsDemo.tsx      # UI components showcase
│   └── onboarding/             # Onboarding flow
│       ├── SplashScreen.tsx    # App intro with cairn animation
│       ├── OnboardingSlides.tsx # 3-slide intro with swipe gestures
│       ├── PersonalizationScreen.tsx # Goal selection
│       ├── WelcomeScreen.tsx   # Completion screen
│       └── OnboardingFlow.tsx  # Flow orchestrator
├── contexts/         # React contexts (for future state management)
├── hooks/           # Custom React hooks
└── utils/           # Utility functions
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features Overview

### Home Page
- Welcome interface with cairn progress visualization
- Quick access to meditation sessions
- Navigation to history and settings

### Meditation Page
- Timer display with Indonesian meditation guidance
- Live cairn progress tracking
- Pause/resume functionality

### History Page
- Track meditation streaks and completed sessions
- Visual progress with cairn symbols
- Session details and statistics

### PWA Features
- Installable as mobile app
- Offline functionality
- Indonesian meditation theme colors
- Optimized for mobile devices

## Color Theme

The app uses colors inspired by Indonesian natural landscapes:
- **Hill Green** (`#6A8F6F`): Primary buttons and accents
- **Sky Blue** (`#A9C1D9`): Secondary elements
- **Mist Blue** (`#E1E8F0`): Background and subtle elements
- **Terracotta Earth** (`#C56C3E`): Warm accents and highlights

## Core UI Components

### CairnIcon
Minimalist SVG stone stack icon with progress states (0-100%). Perfect for meditation progress indicators.

### BreathingCard  
Interactive card with subtle breathing animations. Features:
- Gentle scale transitions (inhale/exhale)
- Soft glow effects with primary colors
- Breathing guide circle
- Configurable duration (default 4s cycle)

### MoodSelector
Emoji-based mood tracking component:
- 5 mood states: 😢😔😐😊😄
- Smooth hover animations
- Indonesian labels
- Color-coded selection states

### FloatingButton
Primary action button with soft shadows:  
- 3 variants: primary, secondary, accent
- 3 sizes: small, medium, large
- Positioning: fixed or static
- Breathing glow effect for primary variant

### DashboardLayout
Main app layout with bottom navigation:
- Frosted glass navigation bar
- Smooth page transitions  
- Safe area support for mobile devices
- Active state indicators

Visit `/demo` route to see all components in action!

## Onboarding Experience

### 🌟 **Complete User Journey**
1. **SplashScreen**: Animated cairn building with tagline "Perjalanan ke Dalam Diri"
2. **Three Swipeable Slides**:
   - "Temukan Jeda di Dunia yang Riuh" with misty hills illustration
   - "Pahami Emosi, Kenali Diri" with heart/journal imagery  
   - "Tumbuh Setiap Hari, Selangkah Demi Selangkah" with cairn visual
3. **Personalization**: Goal selection (Stress, Focus, Sleep, Curiosity)
4. **Welcome Screen**: Personalized completion with tailored suggestions

### 🎯 **Features**
- **Touch Gestures**: Swipe navigation for mobile optimization
- **Progress Indicators**: Dots showing current slide position
- **Skip Options**: Allow users to bypass steps
- **State Persistence**: Remember completion status in localStorage
- **Gentle Transitions**: 300ms animations with cubic-bezier easing
- **Indonesian Content**: Culturally appropriate language and imagery

## Dashboard Experience

### 🏠 **Main Dashboard Features**
1. **Personal Greeting**: Dynamic time-based greetings (pagi/siang/sore/malam)
2. **Daily Mood Check-in**: Integrated MoodSelector for emotional tracking
3. **Jeda Hari Ini Card**: 
   - Time-aware meditation recommendations
   - Personalized based on onboarding goals
   - Breathing animation hints on CTA button
4. **Streak Counter**: Cairn visualization growing with consistency
5. **Quick Access Cards**: Meditasi, Napas, Jelajah, Profil
6. **Cultural Touches**: Indonesian quotes, warm language, peaceful imagery

### 🎯 **Smart Recommendations**
- **Morning**: Pernapasan Pagi (5 min breathing)
- **Midday**: Jeda Siang (10 min mindfulness)  
- **Evening**: Refleksi Sore (15 min reflection)
- **Night**: Ketenangan Malam (20 min sleep prep)

### 📊 **Progress Tracking**
- **Streak visualization** with cairn stones
- **Session statistics** (days, sessions, minutes)
- **Achievement celebrations** for completed goals
- **Motivational content** with Indonesian wisdom

### 🗂️ **Navigation Structure**
- **Home**: Main dashboard with personalized content
- **Jelajah**: Exploration and discovery of techniques
- **Jurnal**: Mindfulness journal and reflections
- **Profil**: Settings, statistics, and preferences

## Design System

All components follow the Sembalun design principles:
- **Rounded corners**: 12px (rounded-xl in Tailwind)
- **Gentle animations**: 300ms cubic-bezier easing
- **Mobile-first**: Optimized for touch interactions
- **Accessibility**: Proper focus states and ARIA support

## Deployment

### Production Build
```bash
# Build optimized production version
npm run build:prod

# Analyze bundle size
npm run build:analyze

# Preview production build locally
npm run serve
```

### Hosting Options

#### Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
npm run deploy:netlify
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
npm run deploy:vercel
```

### Environment Variables
Copy `.env.example` to `.env.production` and configure:
- `VITE_ENABLE_ANALYTICS`: Enable Google Analytics tracking
- `VITE_GTM_ID`: Google Tag Manager ID for analytics
- `VITE_APP_VERSION`: App version for PWA manifest

### Domain & SSL
Both Netlify and Vercel provide:
- Free SSL certificates
- Custom domain support
- CDN distribution
- Automatic deployments from Git

### PWA Features
The app includes complete PWA functionality:
- Service worker for offline access
- App manifest for mobile installation
- Optimized icons for all platforms
- Background sync capabilities

## Performance Optimizations

- **Code splitting**: Vendor and router chunks separated
- **Bundle optimization**: Terser minification enabled
- **Cache strategies**: Long-term caching for static assets
- **Image optimization**: SVG icons for scalability
- **Font loading**: Google Fonts with display swap

## Contributing

This meditation app embodies the peaceful, mindful spirit of Indonesian culture. When contributing, please maintain the calm, centered aesthetic and ensure all new features align with the meditation and mindfulness theme.

## License

MIT License - Feel free to use this for your own meditation app projects.