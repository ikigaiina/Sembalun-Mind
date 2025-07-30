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
│   ├── Home.tsx
│   ├── Meditation.tsx
│   ├── History.tsx
│   └── ComponentsDemo.tsx      # UI components showcase
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

## Design System

All components follow the Sembalun design principles:
- **Rounded corners**: 12px (rounded-xl in Tailwind)
- **Gentle animations**: 300ms cubic-bezier easing
- **Mobile-first**: Optimized for touch interactions
- **Accessibility**: Proper focus states and ARIA support

## Contributing

This meditation app embodies the peaceful, mindful spirit of Indonesian culture. When contributing, please maintain the calm, centered aesthetic and ensure all new features align with the meditation and mindfulness theme.