# Enhanced Visual Components for Meditation App

Beautiful, immersive visual components designed to create engaging meditation experiences without audio. All components use Framer Motion for smooth animations and are optimized for performance.

## Components Overview

### 1. BreathingVisualization
Enhanced breathing visualization with smoother animations and multiple themes.

**Features:**
- Multiple breathing patterns (4-7-8, Box breathing, Coherent breathing)
- Breathing-synced animations with inhale/exhale cycles
- Customizable themes (ocean, forest, sunset, moonlight)
- Ripple effects and guide rings
- Real-time phase indicators and progress tracking

**Usage:**
```tsx
import { BreathingVisualization } from '@/components/visual';

<BreathingVisualization
  isActive={true}
  pattern={{ inhale: 4, hold: 4, exhale: 4, pause: 2 }}
  size="medium"
  theme="ocean"
  showGuides={true}
  showRipples={true}
  onPhaseChange={(phase) => console.log('Current phase:', phase)}
/>
```

### 2. ImmersiveBackgrounds
Subtle moving background patterns that create atmosphere without being distracting.

**Variants:**
- `flowing-waves` - Gentle wave patterns
- `floating-orbs` - Floating light orbs
- `gentle-aurora` - Aurora-like gradients
- `breathing-gradients` - Breathing-synced backgrounds
- `zen-particles` - Floating particle effects

**Usage:**
```tsx
import { ImmersiveBackgrounds } from '@/components/visual';

<ImmersiveBackgrounds
  variant="gentle-aurora"
  intensity="medium"
  colorScheme="ocean"
  speed="normal"
  isActive={true}
/>
```

### 3. ProgressAnimation
Satisfying visual feedback for meditation progress with multiple animation styles.

**Variants:**
- `circular` - Circular progress rings
- `wave` - Filling wave animation
- `breathing-ring` - Breathing-synced rings
- `zen-lotus` - Lotus petals opening progressively

**Usage:**
```tsx
import { ProgressAnimation } from '@/components/visual';

<ProgressAnimation
  progress={75}
  variant="circular"
  size="medium"
  theme="forest"
  showPercentage={true}
  showMilestones={true}
  animated={true}
  onMilestone={(milestone) => console.log('Milestone reached:', milestone)}
/>
```

### 4. VisualMeditationEffects
Calming visual effects designed for deep meditation states.

**Effects:**
- `mandala` - Rotating mandala patterns
- `chakra-flow` - Chakra energy visualization
- `energy-field` - Energy field lines and orbs
- `cosmic-breath` - Cosmic breathing universe
- `zen-garden` - Zen sand garden with stones

**Usage:**
```tsx
import { VisualMeditationEffects } from '@/components/visual';

<VisualMeditationEffects
  effect="mandala"
  intensity="moderate"
  colorPalette="cosmic-purple"
  isActive={true}
  breathingSync={true}
  breathingPhase="inhale"
  size="large"
/>
```

## Theme System

All components support consistent theming with these color palettes:

- **Ocean** (`ocean`): Blue tones for tranquility
- **Forest** (`forest`): Green tones for grounding
- **Sunset** (`sunset`): Orange tones for warmth
- **Moonlight** (`moonlight`): Purple tones for spirituality
- **Zen Neutral** (`zen-neutral`): Gray tones for minimalism

## Size Options

- **Small**: 200x200px - For compact displays
- **Medium**: 320x320px - Default balanced size
- **Large**: 480x480px - For immersive experiences
- **Fullscreen**: 100vw x 100vh - Full screen coverage

## Integration Examples

### Combined Meditation Session
```tsx
import { 
  BreathingVisualization, 
  ImmersiveBackgrounds, 
  ProgressAnimation 
} from '@/components/visual';

function MeditationSession() {
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState('inhale');

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background atmosphere */}
      <ImmersiveBackgrounds
        variant="gentle-aurora"
        intensity="subtle"
        colorScheme="ocean"
        isActive={isActive}
        className="absolute inset-0"
      />
      
      {/* Main breathing visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <BreathingVisualization
          isActive={isActive}
          pattern={{ inhale: 4, hold: 4, exhale: 4, pause: 2 }}
          size="large"
          theme="ocean"
          onPhaseChange={setBreathingPhase}
        />
      </div>
      
      {/* Progress indicator */}
      <div className="absolute top-8 right-8">
        <ProgressAnimation
          progress={progress}
          variant="circular"
          size="small"
          theme="ocean"
          showPercentage={true}
        />
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsActive(!isActive)}
          className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-lg"
        >
          {isActive ? 'Pause' : 'Start'} Meditation
        </button>
      </div>
    </div>
  );
}
```

### Meditation with Visual Effects
```tsx
import { VisualMeditationEffects, ImmersiveBackgrounds } from '@/components/visual';

function ImmersiveMeditation() {
  return (
    <div className="relative w-full h-screen">
      {/* Atmospheric background */}
      <ImmersiveBackgrounds
        variant="zen-particles"
        intensity="gentle"
        colorScheme="moonlight"
        className="absolute inset-0"
      />
      
      {/* Main meditation effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <VisualMeditationEffects
          effect="mandala"
          intensity="immersive"
          colorPalette="cosmic-purple"
          size="large"
          isActive={true}
        />
      </div>
    </div>
  );
}
```

## Performance Considerations

- All animations use Framer Motion's optimized rendering
- Components are designed to be lightweight and performant
- Use `intensity="gentle"` for lower-end devices
- Background effects can be disabled by setting `isActive={false}`

## Accessibility

- All animations respect `prefers-reduced-motion` settings
- Color palettes maintain sufficient contrast
- Components work without JavaScript (graceful degradation)
- Screen reader friendly with proper ARIA labels

## Customization

Each component accepts custom className props for additional styling:

```tsx
<BreathingVisualization
  className="custom-breathing-viz"
  // ... other props
/>
```

## Browser Support

- Modern browsers with CSS3 and ES6 support
- Framer Motion handles cross-browser compatibility
- Fallback states for browsers without animation support