// Enhanced Visual Components for Meditation App
// All components use Framer Motion for smooth animations and beautiful visual effects

export { 
  BreathingVisualization, 
  type BreathingVisualizationProps 
} from './BreathingVisualization';

export { 
  ImmersiveBackgrounds, 
  type ImmersiveBackgroundsProps 
} from './ImmersiveBackgrounds';

export { 
  ProgressAnimation, 
  type ProgressAnimationProps 
} from './ProgressAnimation';

export { 
  VisualMeditationEffects, 
  type VisualMeditationEffectsProps 
} from './VisualMeditationEffects';

// Re-export default exports for convenience
export { default as BreathingVisualizationComponent } from './BreathingVisualization';
export { default as ImmersiveBackgroundsComponent } from './ImmersiveBackgrounds';
export { default as ProgressAnimationComponent } from './ProgressAnimation';
export { default as VisualMeditationEffectsComponent } from './VisualMeditationEffects';

// Common theme and size configurations used across components
export const VISUAL_THEMES = {
  ocean: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#DBEAFE',
    name: 'Ocean Blue'
  },
  forest: {
    primary: '#22C55E',
    secondary: '#86EFAC', 
    accent: '#BBFCD8',
    name: 'Forest Green'
  },
  sunset: {
    primary: '#FB923C',
    secondary: '#FED7AA',
    accent: '#FFEDD5',
    name: 'Sunset Orange'
  },
  moonlight: {
    primary: '#A855F7',
    secondary: '#C4B5FD',
    accent: '#DDD6FE',
    name: 'Moonlight Purple'
  },
  neutral: {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    accent: '#F3F4F6', 
    name: 'Zen Neutral'
  }
} as const;

export const VISUAL_SIZES = {
  small: { width: 200, height: 200 },
  medium: { width: 320, height: 320 },
  large: { width: 480, height: 480 },
  fullscreen: { width: '100vw', height: '100vh' }
} as const;

export type VisualTheme = keyof typeof VISUAL_THEMES;
export type VisualSize = keyof typeof VISUAL_SIZES;