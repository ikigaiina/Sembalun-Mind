# Testing Documentation

This document provides comprehensive documentation for the testing strategy, setup, and practices in the Sembalun meditation app.

## 🧪 Testing Strategy

The application employs a multi-layered testing approach:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Full user workflow testing
- **Visual Regression Tests**: UI consistency testing
- **Accessibility Tests**: WCAG compliance testing
- **Performance Tests**: Load time and responsiveness testing

## 🔧 Testing Setup

### Testing Framework Stack

```json
{
  "devDependencies": {
    "vitest": "^3.2.4",
    "@vitest/coverage-v8": "^3.2.4",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.6.4",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^26.1.0"
  }
}
```

### Vitest Configuration (`vite.config.ts`)

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.js',
        '**/*.config.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Test Setup File (`src/test/setup.ts`)

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('../config/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }))
  }
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock MediaQuery
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock Audio API
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  duration: 100,
  volume: 1,
  paused: true
}));

// Mock Notification API
Object.defineProperty(global, 'Notification', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    close: vi.fn()
  }))
});

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: vi.fn().mockResolvedValue({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })
  }
});
```

### Test Utilities (`src/test/testUtils.ts`)

```typescript
import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseAuthProvider } from '../contexts/SupabaseAuthContext';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { OfflineProvider } from '../contexts/OfflineContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  withAuth?: boolean;
  withOffline?: boolean;
  withOnboarding?: boolean;
}

// Custom render function with providers
function customRender(
  ui: React.ReactElement,
  {
    initialEntries = ['/'],
    withAuth = true,
    withOffline = true,
    withOnboarding = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    let wrapped = (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );

    if (withOffline) {
      wrapped = <OfflineProvider>{wrapped}</OfflineProvider>;
    }

    if (withAuth) {
      wrapped = <SupabaseAuthProvider>{wrapped}</SupabaseAuthProvider>;
    }

    if (withOnboarding) {
      wrapped = <OnboardingProvider>{wrapped}</OnboardingProvider>;
    }

    return wrapped;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

export const mockUserProfile = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  createdAt: new Date('2024-01-01'),
  lastLoginAt: new Date('2024-01-01'),
  isGuest: false,
  preferences: {
    theme: 'auto' as const,
    language: 'en' as const,
    notifications: {
      daily: true,
      reminders: true,
      achievements: true,
      weeklyProgress: true,
      socialUpdates: false,
      push: true,
      email: false,
      sound: true,
      vibration: true
    }
  },
  progress: {
    totalSessions: 5,
    totalMinutes: 50,
    streak: 3,
    longestStreak: 7,
    achievements: ['first_session', 'streak_7'],
    lastSessionDate: new Date('2024-01-01'),
    favoriteCategories: ['breathing', 'mindfulness'],
    completedPrograms: []
  },
  totalMeditationMinutes: 50,
  completedSessions: [],
  completedCourses: [],
  currentStreak: 3
};

// Mock session data
export const mockMeditationSession = {
  id: 'session-1',
  user_id: 'test-user-id',
  type: 'guided' as const,
  duration_minutes: 10,
  completed_at: '2024-01-01T10:00:00.000Z',
  mood_before: 'neutral',
  mood_after: 'good',
  notes: 'Great session',
  created_at: '2024-01-01T10:00:00.000Z',
  updated_at: '2024-01-01T10:00:00.000Z'
};

// Mock Supabase responses
export const createMockSupabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
});

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override the default render function
export { customRender as render };
```

## 🧩 Component Testing

### Button Component Tests (`src/components/ui/Button.test.tsx`)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/testUtils';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('supports full width styling', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
});
```

### Input Component Tests (`src/components/ui/Input.test.tsx`)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/testUtils';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(
      <Input 
        label="Email" 
        value="" 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(
      <Input 
        value="initial" 
        onChange={handleChange} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledWith('new value');
  });

  it('displays error message', () => {
    render(
      <Input 
        value="" 
        onChange={vi.fn()} 
        error="This field is required" 
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('input-error');
  });

  it('supports different input types', () => {
    render(
      <Input 
        type="password" 
        value="" 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');
  });
});
```

### Card Component Tests (`src/components/ui/Card.test.tsx`)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/testUtils';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const { container } = render(
      <Card variant="elevated">Content</Card>
    );
    
    expect(container.firstChild).toHaveClass('card-elevated');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">Content</Card>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

## 🔐 Authentication Testing

### Auth Context Tests (`src/contexts/AuthContextProvider.test.tsx`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/testUtils';
import { SupabaseAuthProvider, useSupabaseAuth } from './SupabaseAuthContext';
import { mockUser, mockUserProfile } from '../test/testUtils';

// Test component to access auth context
function TestComponent() {
  const { user, userProfile, loading, signInWithEmail } = useSupabaseAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="profile">{userProfile ? userProfile.displayName : 'No profile'}</div>
      <button onClick={() => signInWithEmail('test@example.com', 'password')}>
        Sign In
      </button>
    </div>
  );
}

describe('SupabaseAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial loading state', () => {
    render(
      <SupabaseAuthProvider>
        <TestComponent />
      </SupabaseAuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('handles successful sign in', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ 
      data: { user: mockUser, session: null }, 
      error: null 
    });
    
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);
    
    render(
      <SupabaseAuthProvider>
        <TestComponent />
      </SupabaseAuthProvider>
    );
    
    fireEvent.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
    });
  });

  it('handles authentication errors', async () => {
    const mockError = { message: 'Invalid credentials' };
    const mockSignIn = vi.fn().mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: mockError 
    });
    
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);
    
    render(
      <SupabaseAuthProvider>
        <TestComponent />
      </SupabaseAuthProvider>
    );
    
    fireEvent.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
});
```

### useAuth Hook Tests (`src/hooks/useAuth.test.tsx`)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { SupabaseAuthProvider } from '../contexts/SupabaseAuthContext';
import { mockUserProfile } from '../test/testUtils';

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
  );
}

describe('useAuth Hook', () => {
  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates user state on authentication', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });
    
    await act(async () => {
      // Simulate user authentication
      result.current.setUser(mockUserProfile);
    });
    
    expect(result.current.user).toEqual(mockUserProfile);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

## 🧘‍♀️ Feature Testing

### Meditation Timer Tests (`src/components/ui/MeditationTimer.test.tsx`)

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '../../test/testUtils';
import { MeditationTimer } from './MeditationTimer';

describe('MeditationTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders timer with correct duration', () => {
    render(
      <MeditationTimer 
        duration={10} 
        onComplete={vi.fn()} 
      />
    );
    
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('starts timer when play button is clicked', () => {
    const onProgress = vi.fn();
    render(
      <MeditationTimer 
        duration={1} 
        onComplete={vi.fn()} 
        onProgress={onProgress}
        showControls 
      />
    );
    
    fireEvent.click(screen.getByText('Start'));
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(onProgress).toHaveBeenCalled();
  });

  it('calls onComplete when timer finishes', () => {
    const onComplete = vi.fn();
    render(
      <MeditationTimer 
        duration={1} 
        onComplete={onComplete} 
        autoStart 
      />
    );
    
    act(() => {
      vi.advanceTimersByTime(60000); // 1 minute
    });
    
    expect(onComplete).toHaveBeenCalled();
  });

  it('pauses and resumes correctly', () => {
    render(
      <MeditationTimer 
        duration={5} 
        onComplete={vi.fn()} 
        showControls 
      />
    );
    
    fireEvent.click(screen.getByText('Start'));
    fireEvent.click(screen.getByText('Pause'));
    
    expect(screen.getByText('Resume')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Resume'));
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });
});
```

### Breathing Guide Tests (`src/components/ui/BreathingGuide.test.tsx`)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/testUtils';
import { BreathingGuide } from './BreathingGuide';

const mockPattern = {
  name: '4-7-8 Breathing',
  inhale: 4,
  hold: 7,
  exhale: 8,
  pause: 2
};

describe('BreathingGuide Component', () => {
  it('renders breathing pattern name', () => {
    render(
      <BreathingGuide 
        pattern={mockPattern} 
        isActive={false} 
      />
    );
    
    expect(screen.getByText('4-7-8 Breathing')).toBeInTheDocument();
  });

  it('shows breathing instructions', () => {
    render(
      <BreathingGuide 
        pattern={mockPattern} 
        isActive={true} 
      />
    );
    
    expect(screen.getByText(/Inhale/)).toBeInTheDocument();
  });

  it('animates when active', () => {
    const { container } = render(
      <BreathingGuide 
        pattern={mockPattern} 
        isActive={true} 
      />
    );
    
    const circle = container.querySelector('.breathing-circle');
    expect(circle).toHaveClass('animate');
  });

  it('calls onCycleComplete after full cycle', async () => {
    const onCycleComplete = vi.fn();
    render(
      <BreathingGuide 
        pattern={mockPattern} 
        isActive={true} 
        onCycleComplete={onCycleComplete} 
      />
    );
    
    // Test cycle completion (would need to mock timers)
    vi.useFakeTimers();
    
    act(() => {
      vi.advanceTimersByTime(21000); // Full cycle duration
    });
    
    expect(onCycleComplete).toHaveBeenCalled();
    
    vi.useRealTimers();
  });
});
```

## 📊 Utility Testing

### Analytics Utilities Tests (`src/utils/analytics.test.ts`)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { trackEvent, trackPageView, calculateSessionStats } from './analytics';

// Mock gtag
global.gtag = vi.fn();

describe('Analytics Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tracks events with correct parameters', () => {
    trackEvent('meditation_start', {
      session_type: 'guided',
      duration: 10
    });
    
    expect(global.gtag).toHaveBeenCalledWith('event', 'meditation_start', {
      session_type: 'guided',
      duration: 10
    });
  });

  it('tracks page views', () => {
    trackPageView('/meditation');
    
    expect(global.gtag).toHaveBeenCalledWith('config', expect.any(String), {
      page_path: '/meditation'
    });
  });

  it('calculates session statistics correctly', () => {
    const sessions = [
      { duration: 10, type: 'guided' },
      { duration: 15, type: 'breathing' },
      { duration: 20, type: 'guided' }
    ];
    
    const stats = calculateSessionStats(sessions);
    
    expect(stats.totalSessions).toBe(3);
    expect(stats.totalMinutes).toBe(45);
    expect(stats.averageDuration).toBe(15);
    expect(stats.typeDistribution.guided).toBe(2);
    expect(stats.typeDistribution.breathing).toBe(1);
  });
});
```

### Auth Error Utilities Tests (`src/utils/auth-error.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { parseAuthError, getErrorMessage } from './auth-error';

describe('Auth Error Utilities', () => {
  it('parses common auth errors correctly', () => {
    const error = { message: 'Invalid login credentials' };
    const parsed = parseAuthError(error);
    
    expect(parsed.type).toBe('invalid_credentials');
    expect(parsed.userMessage).toBe('Invalid email or password');
  });

  it('handles network errors', () => {
    const error = { message: 'Network request failed' };
    const parsed = parseAuthError(error);
    
    expect(parsed.type).toBe('network_error');
    expect(parsed.userMessage).toContain('network');
  });

  it('returns generic message for unknown errors', () => {
    const error = { message: 'Unknown error occurred' };
    const message = getErrorMessage(error);
    
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });
});
```

## 🔧 Integration Testing

### Session Flow Integration Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/testUtils';
import { App } from '../App';
import { mockUserProfile, mockMeditationSession } from '../test/testUtils';

describe('Meditation Session Flow', () => {
  it('completes full meditation session flow', async () => {
    // Mock authenticated user
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null
    });
    
    render(<App />);
    
    // Navigate to meditation page
    fireEvent.click(screen.getByText('Start Meditation'));
    
    // Select session type
    fireEvent.click(screen.getByText('Guided Meditation'));
    
    // Set duration
    fireEvent.click(screen.getByText('10 minutes'));
    
    // Start session
    fireEvent.click(screen.getByText('Begin'));
    
    // Verify timer is running
    expect(screen.getByText('9:59')).toBeInTheDocument();
    
    // Complete session (mock timer)
    vi.useFakeTimers();
    act(() => {
      vi.advanceTimersByTime(600000); // 10 minutes
    });
    
    // Verify completion screen
    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    });
    
    // Add notes
    fireEvent.change(screen.getByPlaceholderText('How was your session?'), {
      target: { value: 'Great session!' }
    });
    
    // Save session
    fireEvent.click(screen.getByText('Save'));
    
    // Verify session saved
    await waitFor(() => {
      expect(screen.getByText('Session saved successfully')).toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });
});
```

### User Registration Flow Tests

```typescript
describe('User Registration Flow', () => {
  it('handles complete registration process', async () => {
    render(<App />);
    
    // Navigate to sign up
    fireEvent.click(screen.getByText('Sign Up'));
    
    // Fill registration form
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'securePassword123' }
    });
    
    // Mock successful registration
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Create Account'));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });
});
```

## 🎯 Performance Testing

### Component Performance Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/testUtils';
import { performance } from 'perf_hooks';

describe('Component Performance', () => {
  it('renders large lists efficiently', () => {
    const startTime = performance.now();
    
    const largeSessionList = Array.from({ length: 1000 }, (_, i) => ({
      id: `session-${i}`,
      type: 'guided',
      duration: 10,
      date: new Date()
    }));
    
    render(<SessionHistory sessions={largeSessionList} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(renderTime).toBeLessThan(100);
  });

  it('handles rapid state updates', async () => {
    const { rerender } = render(<MeditationTimer duration={10} onComplete={vi.fn()} />);
    
    const startTime = performance.now();
    
    // Simulate rapid updates
    for (let i = 0; i < 100; i++) {
      rerender(<MeditationTimer duration={10 - i * 0.1} onComplete={vi.fn()} />);
    }
    
    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    expect(updateTime).toBeLessThan(50);
  });
});
```

## 📱 Accessibility Testing

### Accessibility Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '../test/testUtils';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <main>
        <h1>Meditation Dashboard</h1>
        <button>Start Meditation</button>
        <nav aria-label="Main navigation">
          <a href="/profile">Profile</a>
          <a href="/history">History</a>
        </nav>
      </main>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', () => {
    render(<Button onClick={vi.fn()}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    // Verify action was triggered
  });

  it('provides proper ARIA labels', () => {
    render(
      <MeditationTimer 
        duration={10} 
        onComplete={vi.fn()} 
        aria-label="Meditation timer for 10 minutes"
      />
    );
    
    expect(screen.getByLabelText('Meditation timer for 10 minutes')).toBeInTheDocument();
  });
});
```

## 📋 Test Scripts

### Package.json Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:accessibility": "vitest run --grep accessibility",
    "test:integration": "vitest run --grep integration",
    "test:performance": "vitest run --grep performance"
  }
}
```

## 🔄 Continuous Integration Testing

### GitHub Actions Test Workflow

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run typecheck
    
    - name: Run unit tests
      run: npm run test:run
    
    - name: Run coverage
      run: npm run test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
    
    - name: Run accessibility tests
      run: npm run test:accessibility
    
    - name: Run integration tests
      run: npm run test:integration
```

## 📊 Test Coverage Requirements

### Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Stricter requirements for critical components
        'src/components/ui/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/services/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  }
});
```

## 🎯 Testing Best Practices

### General Guidelines

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
3. **Keep Tests Independent**: Each test should be able to run in isolation
4. **Mock External Dependencies**: Mock API calls, timers, and browser APIs
5. **Test Error States**: Include tests for error conditions and edge cases
6. **Use User-Centric Queries**: Prefer queries that match how users interact with the app

### Example Test Structure

```typescript
describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    // Common setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      // Test default rendering
    });

    it('renders correctly with custom props', () => {
      // Test with different props
    });
  });

  describe('User Interactions', () => {
    it('handles click events', () => {
      // Test user interactions
    });

    it('handles keyboard navigation', () => {
      // Test accessibility
    });
  });

  describe('Error Handling', () => {
    it('handles error states gracefully', () => {
      // Test error conditions
    });
  });
});
```

This comprehensive testing documentation covers all aspects of testing strategy, setup, and implementation for the Sembalun meditation application.