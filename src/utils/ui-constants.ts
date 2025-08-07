/**
 * UI Constants and Shared Values
 * Extracted to resolve Fast Refresh warnings
 */

// Button variant options for exports
export const BUTTON_VARIANTS = {
  default: 'default',
  meditation: 'meditation',
  breathing: 'breathing',
  calm: 'calm',
  neomorphic: 'neomorphic',
  ghost: 'ghost',
  destructive: 'destructive'
} as const;

// Card variant options
export const CARD_VARIANTS = {
  default: 'default',
  meditation: 'meditation',
  breathing: 'breathing',
  calm: 'calm',
  neomorphic: 'neomorphic',
  glassmorphic: 'glassmorphic'
} as const;

// Input variant options
export const INPUT_VARIANTS = {
  default: 'default',
  meditation: 'meditation',
  neomorphic: 'neomorphic'
} as const;

// Glassmorphic card enhancement options
export const GLASSMORPHIC_ENHANCEMENTS = {
  blur: 'blur',
  glow: 'glow',
  float: 'float',
  gradient: 'gradient'
} as const;

// Neomorphic card style options
export const NEOMORPHIC_STYLES = {
  convex: 'convex',
  concave: 'concave',
  flat: 'flat'
} as const;