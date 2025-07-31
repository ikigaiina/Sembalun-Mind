# Sembalun Breathing Exercise Feature

## Overview

The breathing exercise feature provides users with guided breathing sessions using proven techniques for relaxation, focus, and mindfulness. Built with React and TypeScript, it offers a beautiful, calming interface with visual animations and progress tracking.

## Features

### ✨ Core Functionality

- **Visual Breathing Guide**: Animated pulsing circle that expands and contracts with breathing rhythms
- **Multiple Breathing Patterns**: 
  - 4-7-8 Technique (Dr. Andrew Weil method)
  - Box Breathing (4-4-4-4 pattern)
  - Triangle Breathing (4-4-4 pattern)
- **Session Management**: Setup, active session, pause/resume, and completion screens
- **Duration Options**: 2, 5, 10 minutes, or continuous sessions
- **Progress Tracking**: Real-time session statistics and cycle counting
- **Indonesian Interface**: Fully localized with "Tarik napas", "Tahan", "Buang napas"

### 🎨 Visual Design

- **Sembalun Color Palette**: Purple-pink gradients throughout
- **Calming Backgrounds**: Nature-inspired backgrounds with subtle animations
- **Floating Particles**: Ambient particle effects during active sessions
- **Responsive Design**: Optimized for mobile and desktop devices
- **Smooth Animations**: CSS-based breathing animations with proper timing

## File Structure

```
src/
├── components/ui/
│   ├── BreathingGuide.tsx          # Main breathing animation component
│   └── BreathingCard.tsx           # Breathing card component
├── pages/
│   └── BreathingSession.tsx        # Main breathing session page
├── utils/
│   └── breathingPatterns.ts        # Breathing pattern configurations
└── index.css                       # Breathing animations CSS
```

## Component Architecture

### `BreathingGuide` Component

**Location**: `src/components/ui/BreathingGuide.tsx`

The core component that handles breathing animation and timing logic.

```typescript
interface BreathingGuideProps {
  pattern: BreathingPattern;
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}
```

**Key Features**:
- Real-time breathing phase tracking (inhale, hold, exhale, pause)
- Customizable animation timing based on selected pattern
- Visual countdown display
- Phase progress indicators
- Floating particle effects during active sessions

### `BreathingSession` Page

**Location**: `src/pages/BreathingSession.tsx`

Main page component managing the complete breathing session lifecycle.

**Session States**:
- `setup`: Pattern and duration selection
- `active`: Active breathing session
- `paused`: Session temporarily paused
- `completed`: Session finished with statistics

**Key Features**:
- Pattern selection interface with descriptions
- Duration selection (2, 5, 10 minutes, continuous)
- Session timer with elapsed and remaining time
- Pause/Resume functionality
- Statistics display on completion

### Breathing Patterns Configuration

**Location**: `src/utils/breathingPatterns.ts`

Centralized configuration for all breathing patterns.

```typescript
export interface BreathingPatternConfig {
  id: BreathingPattern;
  name: string;
  description: string;
  phases: {
    inhale: number;
    hold?: number;
    exhale: number;
    pause?: number;
  };
  icon: string;
}
```

**Available Patterns**:

1. **Box Breathing** (`box`)
   - Pattern: 4-4-4-4 (inhale-hold-exhale-pause)
   - Use case: Focus and concentration
   - Icon: ⬜

2. **Triangle Breathing** (`triangle`)
   - Pattern: 4-4-4 (inhale-hold-exhale)
   - Use case: General relaxation
   - Icon: 🔺

3. **4-7-8 Technique** (`478`)
   - Pattern: 4-7-8 (inhale-hold-exhale)
   - Use case: Deep relaxation and sleep preparation
   - Icon: 🌙

## CSS Animations

**Location**: `src/index.css` (lines 215-261)

Custom CSS animations for breathing guide:

```css
@keyframes breathe-inhale {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.2); opacity: 0.6; }
}

@keyframes breathe-hold {
  0%, 100% { transform: scale(1.2); opacity: 0.6; }
}

@keyframes breathe-exhale {
  0% { transform: scale(1.2); opacity: 0.6; }
  100% { transform: scale(1); opacity: 0.3; }
}

@keyframes breathe-pause {
  0%, 100% { transform: scale(1); opacity: 0.2; }
}

@keyframes floating-particle {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
  50% { transform: translateY(-8px) scale(1.1); opacity: 0.6; }
}
```

## Navigation Integration

The breathing feature is integrated into the main app navigation:

**Route**: `/breathing`

**App.tsx Integration**:
```typescript
<Route 
  path="/breathing" 
  element={
    <DashboardLayout showBottomNav={false}>
      <BreathingSession />
    </DashboardLayout>
  } 
/>
```

## Usage Examples

### Basic Implementation

```typescript
import { BreathingGuide } from '../components/ui/BreathingGuide';
import { breathingPatterns } from '../utils/breathingPatterns';

function MyComponent() {
  const [isActive, setIsActive] = useState(false);
  const [pattern, setPattern] = useState('box');

  return (
    <BreathingGuide
      pattern={pattern}
      isActive={isActive}
      className="my-breathing-guide"
    />
  );
}
```

### Adding New Breathing Pattern

```typescript
// In src/utils/breathingPatterns.ts
export const breathingPatterns: BreathingPatternConfig[] = [
  // ... existing patterns
  {
    id: 'custom',
    name: 'Custom Pattern',
    description: 'Your custom breathing technique',
    phases: { inhale: 6, hold: 2, exhale: 8 },
    icon: '✨'
  }
];
```

## Localization

All user-facing text is in Indonesian:

```typescript
const phaseLabels: Record<BreathingPhase, string> = {
  inhale: 'Tarik napas',
  hold: 'Tahan',
  exhale: 'Buang napas',
  pause: 'Istirahat'
};
```

**Common Phrases**:
- "Latihan Pernapasan" - Breathing Exercise
- "Mulai Bernapas" - Start Breathing
- "Sesi Selesai" - Session Complete
- "Napas Teratur!" - Regular Breathing!

## Performance Considerations

### Optimizations

1. **useCallback**: Session completion handlers wrapped in useCallback
2. **Animation Keys**: Force re-render for smooth animation restarts
3. **Timer Management**: Proper cleanup of intervals on component unmount
4. **Lazy Loading**: Components loaded only when needed

### Bundle Impact

- **Component Size**: ~15KB (minified)
- **CSS Animations**: ~2KB additional styles
- **Dependencies**: No external animation libraries required

## Accessibility

### Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus Management**: Proper focus indicators and management
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Color Contrast**: WCAG AA compliant color combinations

### Implementation

```typescript
// Focus management example
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

// Touch optimization
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] Pattern selection works correctly
- [ ] Duration selection updates session timer
- [ ] Breathing animation syncs with selected pattern
- [ ] Pause/Resume functionality works
- [ ] Session completion shows correct statistics
- [ ] Navigation back to dashboard works
- [ ] Mobile responsive design
- [ ] Animations perform smoothly

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

### Planned Features

1. **Audio Integration**: 
   - Soft chime sounds for phase transitions
   - Background ambient sounds (rain, forest, etc.)
   - Voice guidance options

2. **Progress Tracking**:
   - Session history and statistics
   - Weekly/monthly breathing goals
   - Achievement badges

3. **Customization**:
   - Custom breathing patterns
   - Personalized session durations
   - Color theme options

4. **Social Features**:
   - Share session achievements
   - Group breathing sessions
   - Community challenges

### Implementation Notes

For audio integration:
```typescript
// Future audio implementation
const playChime = () => {
  if (audioRef.current) {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Handle audio play failure silently
    });
  }
};
```

## Troubleshooting

### Common Issues

1. **Animation Not Smooth**
   - Check CSS animation performance
   - Verify `transform-gpu` class is applied
   - Test on different devices

2. **Timer Not Working**
   - Verify interval cleanup in useEffect
   - Check browser tab visibility API
   - Test background execution

3. **Pattern Not Updating**
   - Check pattern prop passing
   - Verify state updates in parent component
   - Test pattern configuration

### Debug Tools

```typescript
// Enable debug logging in development
if (import.meta.env?.DEV) {
  console.log('Breathing pattern:', pattern);
  console.log('Current phase:', currentPhase);
  console.log('Countdown:', countdown);
}
```

## Contributing

### Code Style

- Use TypeScript for all components
- Follow existing naming conventions
- Add proper type definitions
- Include JSDoc comments for complex functions

### Pull Request Checklist

- [ ] All TypeScript errors resolved
- [ ] Build passes successfully
- [ ] Manual testing completed
- [ ] Responsive design verified
- [ ] Accessibility requirements met
- [ ] Documentation updated

## License

This breathing exercise feature is part of the Sembalun meditation app and follows the same licensing terms as the main project.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Author**: Sembalun Development Team