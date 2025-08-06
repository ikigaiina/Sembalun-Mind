# UI Components Documentation

This document provides comprehensive documentation for all UI components in the Sembalun meditation app.

## 📁 Component Architecture

The component system is organized into several categories:

```
src/components/
├── ui/                     # Base UI components
├── auth/                   # Authentication components
├── admin/                  # Admin panel components
├── analytics/              # Analytics and reporting
├── account/                # User account management
├── meditation/             # Meditation-specific components
├── notifications/          # Notification system
├── personalization/        # User customization
├── tracking/               # Progress tracking
└── placeholders/           # Placeholder components
```

## 🎨 Base UI Components (`src/components/ui/`)

### Button Component
**File**: `src/components/ui/Button.tsx`

Flexible button component with multiple variants and states.

#### Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

#### Usage Examples
```jsx
// Primary button
<Button variant="primary" size="lg">
  Start Meditation
</Button>

// Loading state
<Button loading={isSubmitting}>
  Save Changes
</Button>

// Full width button
<Button fullWidth variant="outline">
  Continue as Guest
</Button>
```

### Card Component
**File**: `src/components/ui/Card.tsx`

Container component for content sections with consistent styling.

#### Props
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
```

### Input Component
**File**: `src/components/ui/Input.tsx`

Form input with validation states and accessibility features.

#### Props
```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}
```

### MeditationTimer Component
**File**: `src/components/ui/MeditationTimer.tsx`

Advanced timer component for meditation sessions with multiple visualization options.

#### Features
- Circular progress indicator
- Time display in minutes:seconds format
- Play/pause controls
- Session completion handling
- Sound alerts and vibration
- Background color transitions

#### Props
```typescript
interface MeditationTimerProps {
  duration: number;              // Duration in minutes
  onComplete: () => void;        // Callback when timer completes
  onProgress?: (progress: number) => void;  // Progress updates (0-1)
  showControls?: boolean;        // Show play/pause buttons
  autoStart?: boolean;           // Start automatically
  soundEnabled?: boolean;        // Enable completion sound
  vibrationEnabled?: boolean;    // Enable vibration
}
```

### BreathingGuide Component
**File**: `src/components/ui/BreathingGuide.tsx`

Animated breathing visualization component for breathing exercises.

#### Features
- Animated circle that expands and contracts
- Customizable breathing patterns
- Visual cues for inhale/exhale phases
- Multiple breathing techniques support
- Smooth animations with CSS transitions

#### Props
```typescript
interface BreathingGuideProps {
  pattern: BreathingPattern;     // Breathing pattern configuration
  isActive: boolean;             // Whether animation is active
  onCycleComplete?: () => void;  // Callback after each cycle
}

interface BreathingPattern {
  name: string;
  inhale: number;    // Inhale duration in seconds
  hold: number;      // Hold duration in seconds
  exhale: number;    // Exhale duration in seconds
  pause: number;     // Pause duration in seconds
}
```

### AudioPlayer Component
**File**: `src/components/ui/AudioPlayer.tsx`

Media player for guided meditation sessions with advanced controls.

#### Features
- Play/pause controls
- Progress bar with scrubbing
- Volume control
- Playback speed adjustment
- Background audio support
- Loading states

#### Props
```typescript
interface AudioPlayerProps {
  src: string;                   // Audio file URL
  title?: string;                // Track title
  onPlay?: () => void;          // Play callback
  onPause?: () => void;         // Pause callback
  onEnded?: () => void;         // End callback
  autoPlay?: boolean;           // Auto-play on load
  showControls?: boolean;       // Show control bar
  volume?: number;              // Initial volume (0-1)
}
```

## 🔐 Authentication Components (`src/components/auth/`)

### AuthModal Component
**File**: `src/components/auth/AuthModal.tsx`

Modal component for authentication flows with multiple sign-in options.

#### Features
- Email/password authentication
- OAuth sign-in (Google, Apple)
- Guest mode option
- Form validation
- Error handling
- Responsive design

### ProtectedRoute Component
**File**: `src/components/auth/ProtectedRoute.tsx`

Route protection component that requires authentication.

#### Props
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;   // Component to show when not authenticated
  requireAuth?: boolean;        // Whether authentication is required
}
```

### SupabaseProtectedRoute Component
**File**: `src/components/auth/SupabaseProtectedRoute.tsx`

Supabase-specific protected route with authentication state management.

## 📊 Analytics Components (`src/components/analytics/`)

### MeditationStatistics Component
**File**: `src/components/analytics/MeditationStatistics.tsx`

Displays comprehensive meditation statistics and trends.

#### Features
- Total sessions and minutes
- Streak information
- Category breakdowns
- Time-based charts
- Goal progress

### ProgressReports Component
**File**: `src/components/analytics/ProgressReports.tsx`

Generate and display detailed progress reports.

#### Features
- Weekly/monthly/yearly views
- Exportable reports
- Comparison with previous periods
- Achievement highlights

### HabitFormationTracker Component
**File**: `src/components/analytics/HabitFormationTracker.tsx`

Track meditation habit formation and consistency.

### EmotionalIntelligenceTracker Component
**File**: `src/components/analytics/EmotionalIntelligenceTracker.tsx`

Monitor emotional intelligence development through meditation practice.

## 👤 Account Management Components (`src/components/account/`)

### ProfileForm Component
**File**: `src/components/account/ProfileForm.tsx`

User profile editing form with validation.

#### Features
- Display name and avatar upload
- Email management
- Profile picture handling
- Validation and error handling

### PreferencesForm Component
**File**: `src/components/account/PreferencesForm.tsx`

Comprehensive preferences configuration form.

#### Preference Categories
- Theme and appearance
- Notification settings
- Audio preferences
- Privacy controls
- Accessibility options

### SubscriptionManagement Component
**File**: `src/components/account/SubscriptionManagement.tsx`

Manage subscription plans and billing.

### PrivacyControls Component
**File**: `src/components/account/PrivacyControls.tsx`

Privacy settings and data management controls.

## 🧘‍♀️ Meditation Components (`src/components/meditation/`)

### SessionBuilder Component
**File**: `src/components/meditation/SessionBuilder.tsx`

Build custom meditation sessions with various options.

#### Features
- Duration selection
- Session type selection
- Background music options
- Guidance level adjustment

### SessionControls Component
**File**: `src/components/placeholders/meditation/SessionControls.tsx`

Control panel for active meditation sessions.

### SessionTimer Component
**File**: `src/components/placeholders/meditation/SessionTimer.tsx`

Timer display for meditation sessions.

## 📈 Tracking Components (`src/components/tracking/`)

### StreakManager Component
**File**: `src/components/tracking/StreakManager.tsx`

Manage and display meditation streaks.

#### Features
- Current streak display
- Streak history
- Milestone celebrations
- Streak recovery options

### MoodTracker Component
**File**: `src/components/tracking/MoodTracker.tsx`

Track mood before and after meditation sessions.

### PersonalInsightsDashboard Component
**File**: `src/components/tracking/PersonalInsightsDashboard.tsx`

Display personalized insights based on meditation data.

### CertificateDisplay Component
**File**: `src/components/tracking/CertificateDisplay.tsx`

Display achievement certificates and milestones.

## 🎨 Specialized UI Components

### Cairn Components
**File**: `src/components/ui/Cairn.tsx`, `src/components/ui/CairnIcon.tsx`, `src/components/ui/AnimatedCairn.tsx`

Stone cairn components representing meditation progress and mindfulness.

#### Features
- Static cairn display
- Animated cairn for active states
- Progress visualization through stone stacking
- Cultural significance representation

### EmotionWheel Component
**File**: `src/components/ui/EmotionWheel.tsx`

Interactive emotion selection wheel for mood tracking.

### MoodSelector Component
**File**: `src/components/ui/MoodSelector.tsx`

Simple mood selection interface with emoji or text options.

### NotificationSettings Component
**File**: `src/components/ui/NotificationSettings.tsx`

Comprehensive notification preferences management.

## 🔄 Layout Components

### DashboardLayout Component
**File**: `src/components/ui/DashboardLayout.tsx`

Main application layout with navigation and responsive design.

#### Features
- Top navigation bar
- Bottom navigation for mobile
- Sidebar for desktop
- Responsive breakpoints
- Route-based active states

### Header Component
**File**: `src/components/ui/Header.tsx`

Application header with branding, navigation, and user controls.

## 📱 Progressive Web App Components

### InstallPrompt Component
**File**: `src/components/ui/InstallPrompt.tsx`

PWA installation prompt for supported devices.

### OfflineToast Component
**File**: `src/components/ui/OfflineToast.tsx`

Notification component for offline status changes.

### SplashScreen Component
**File**: `src/components/ui/SplashScreen.tsx`

Application splash screen with branding and loading states.

## 🛠️ Utility Components

### SkeletonLoader Component
**File**: `src/components/ui/SkeletonLoader.tsx`

Loading placeholder components for improved perceived performance.

### ErrorBoundary Component
**File**: `src/components/ui/ErrorBoundary.tsx`

Error boundary component for graceful error handling.

### FloatingButton Component
**File**: `src/components/ui/FloatingButton.tsx`

Floating action button for quick access to primary actions.

## 📚 Component Usage Guidelines

### Best Practices

1. **Prop Types**: Always define TypeScript interfaces for component props
2. **Default Props**: Use default parameters for optional props
3. **Error Handling**: Implement proper error states and fallbacks
4. **Accessibility**: Include ARIA labels and keyboard navigation
5. **Performance**: Use React.memo for expensive components
6. **Testing**: Write unit tests for component functionality

### Example Component Structure

```tsx
import React, { useState, useCallback } from 'react';

interface ComponentProps {
  title: string;
  onAction?: (data: any) => void;
  disabled?: boolean;
}

export const ExampleComponent: React.FC<ComponentProps> = ({
  title,
  onAction,
  disabled = false
}) => {
  const [state, setState] = useState<ComponentState>(initialState);

  const handleAction = useCallback(() => {
    if (!disabled && onAction) {
      onAction(state);
    }
  }, [disabled, onAction, state]);

  return (
    <div className="example-component" aria-label={title}>
      <h2>{title}</h2>
      <button 
        onClick={handleAction}
        disabled={disabled}
        aria-disabled={disabled}
      >
        Action
      </button>
    </div>
  );
};

export default ExampleComponent;
```

## 🎯 Component Testing

### Testing Strategy
- **Unit Tests**: Test component logic and prop handling
- **Integration Tests**: Test component interactions
- **Visual Tests**: Test component rendering and styles
- **Accessibility Tests**: Test ARIA compliance and keyboard navigation

### Example Test
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

This documentation provides a comprehensive overview of all UI components in the Sembalun application, their usage, and development guidelines.