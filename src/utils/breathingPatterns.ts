export type BreathingPattern = 'box' | 'triangle' | '478';

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

export const breathingPatterns: BreathingPatternConfig[] = [
  {
    id: 'box',
    name: 'Pernapasan Kotak',
    description: 'Teknik pernapasan 4-4-4-4 untuk ketenangan dan fokus',
    phases: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    icon: '⬜'
  },
  {
    id: 'triangle', 
    name: 'Pernapasan Segitiga',
    description: 'Teknik pernapasan 4-4-4 yang menenangkan',
    phases: { inhale: 4, hold: 4, exhale: 4 },
    icon: '🔺'
  },
  {
    id: '478',
    name: 'Teknik 4-7-8',
    description: 'Teknik Dr. Andrew Weil untuk relaksasi mendalam',
    phases: { inhale: 4, hold: 7, exhale: 8 },
    icon: '🌙'
  }
];

export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export const phaseLabels: Record<BreathingPhase, string> = {
  inhale: 'Tarik napas',
  hold: 'Tahan',
  exhale: 'Buang napas',
  pause: 'Istirahat'
};