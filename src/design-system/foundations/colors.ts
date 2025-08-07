/**
 * Sembalun Design System - Color Foundation
 * Comprehensive color system with Indonesian cultural authenticity
 */

// ============= COLOR SCALES =============

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// Primary Brand Colors (Sembalun Blue - inspired by Mount Sembalun)
export const primary: ColorScale = {
  50: '#f0f9ff',   // Langit pagi (Morning sky)
  100: '#e0f2fe',  // Embun (Dew)
  200: '#bae6fd',  // Air terjun (Waterfall)
  300: '#7dd3fc',  // Danau (Lake)
  400: '#38bdf8',  // Laut (Ocean)
  500: '#0ea5e9',  // Sembalun Blue (Primary)
  600: '#0284c7',  // Laut dalam (Deep ocean)
  700: '#0369a1',  // Malam (Night)
  800: '#075985',  // Langit malam (Night sky)
  900: '#0c4a6e',  // Kedalaman (Depth)
};

// Neutral Grays
export const neutral: ColorScale = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
};

// ============= CULTURAL COLORS =============

export interface CulturalColors {
  // Traditional Indonesian Colors
  earthBrown: string;      // Tanah Indonesia
  templeGold: string;      // Emas candi
  lotusWhite: string;      // Putih teratai
  bambooGreen: string;     // Hijau bambu
  spiritualPurple: string; // Ungu spiritual
  batikIndigo: string;     // Indigo batik
  sunsetOrange: string;    // Jingga senja
  riceField: string;       // Hijau sawah
  
  // Sacred Colors
  sacredRed: string;       // Merah sakral
  holyYellow: string;      // Kuning suci
  mysticalBlack: string;   // Hitam mistis
  purityWhite: string;     // Putih kesucian
}

export const cultural: CulturalColors = {
  // Traditional Indonesian Colors
  earthBrown: '#8B4513',      // Coklat tanah
  templeGold: '#FFD700',      // Emas candi
  lotusWhite: '#FFFAF0',      // Putih teratai
  bambooGreen: '#9ACD32',     // Hijau bambu
  spiritualPurple: '#663399',  // Ungu spiritual
  batikIndigo: '#4B0082',     // Indigo batik
  sunsetOrange: '#FF6B35',    // Jingga senja
  riceField: '#7CB342',       // Hijau sawah
  
  // Sacred Colors
  sacredRed: '#DC143C',       // Merah sakral
  holyYellow: '#FFD700',      // Kuning suci
  mysticalBlack: '#2D2D2D',   // Hitam mistis
  purityWhite: '#FFFFFF',     // Putih kesucian
};

// ============= SEMANTIC COLORS =============

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const semantic: SemanticColors = {
  success: '#22c55e',    // Hijau sukses
  warning: '#f59e0b',    // Kuning peringatan
  error: '#ef4444',      // Merah error
  info: '#3b82f6',       // Biru informasi
};

// ============= MEDITATION COLORS =============

export interface MeditationColors {
  calm: string;           // Tenang
  focus: string;          // Fokus
  energy: string;         // Energi
  balance: string;        // Keseimbangan
  peace: string;          // Kedamaian
  wisdom: string;         // Kebijaksanaan
  compassion: string;     // Kasih sayang
  mindfulness: string;    // Kesadaran
}

export const meditation: MeditationColors = {
  calm: '#E0F2FE',        // Biru muda tenang
  focus: '#663399',       // Ungu fokus
  energy: '#FF6B35',      // Oranye energi
  balance: '#7CB342',     // Hijau keseimbangan
  peace: '#FFFAF0',       // Putih kedamaian
  wisdom: '#FFD700',      // Emas kebijaksanaan
  compassion: '#FFC0CB',  // Pink kasih sayang
  mindfulness: '#DDA0DD', // Lavender kesadaran
};

// ============= DARK THEME COLORS =============

export const darkTheme = {
  background: {
    primary: '#0f172a',     // Dark slate
    secondary: '#1e293b',   // Lighter slate
    tertiary: '#334155',    // Card backgrounds
  },
  text: {
    primary: '#f1f5f9',     // Light text
    secondary: '#cbd5e1',   // Muted text
    tertiary: '#94a3b8',    // Disabled text
  },
  cultural: {
    earthBrown: '#d2691e',    // Lighter brown for dark mode
    templeGold: '#ffd700',    // Same gold (good contrast)
    lotusWhite: '#1e293b',    // Dark background
    spiritualPurple: '#8b5cf6', // Lighter purple
    bambooGreen: '#a3d977',   // Lighter bamboo green
    batikIndigo: '#6366f1',   // Lighter indigo
  },
  meditation: {
    sessionBackground: 'radial-gradient(circle, rgba(139, 92, 246, 0.1), rgba(15, 23, 42, 0.9))',
    timerGlow: '0 0 20px rgba(139, 92, 246, 0.3)',
    controlsBackground: 'rgba(255, 255, 255, 0.05)',
  },
};

// ============= REGIONAL VARIATIONS =============

export interface RegionalColors {
  javanese: CulturalColors;
  balinese: CulturalColors;
  sundanese: CulturalColors;
  minang: CulturalColors;
}

export const regionalColors: RegionalColors = {
  javanese: {
    earthBrown: '#8B4513',      // Coklat tradisional Jawa
    templeGold: '#FFD700',      // Emas Borobudur
    lotusWhite: '#FFFAF0',      // Putih kebaya
    bambooGreen: '#9ACD32',     // Hijau gamelan
    spiritualPurple: '#663399',  // Ungu keraton
    batikIndigo: '#4B0082',     // Indigo batik
    sunsetOrange: '#FF6B35',    // Oranye senja Yogya
    riceField: '#7CB342',       // Hijau sawah
    sacredRed: '#DC143C',       // Merah bata Majapahit
    holyYellow: '#FFD700',      // Kuning kerajaan
    mysticalBlack: '#2D2D2D',   // Hitam wayang
    purityWhite: '#FFFFFF',     // Putih jasmine
  },
  balinese: {
    earthBrown: '#A0522D',      // Coklat tanah Bali
    templeGold: '#FFD700',      // Emas pura
    lotusWhite: '#FFFAF0',      // Putih frangipani
    bambooGreen: '#90EE90',     // Hijau subak
    spiritualPurple: '#9370DB', // Ungu upacara
    batikIndigo: '#4169E1',     // Biru laut Bali
    sunsetOrange: '#FF7F50',    // Oranye sunset Tanah Lot
    riceField: '#ADFF2F',       // Hijau terasering
    sacredRed: '#FF4500',       // Merah kembang sepatu
    holyYellow: '#FFFF00',      // Kuning canang
    mysticalBlack: '#36454F',   // Abu hitam vulkanik
    purityWhite: '#F8F8FF',     // Putih pantai
  },
  sundanese: {
    earthBrown: '#8B7355',      // Coklat Sundanese
    templeGold: '#DAA520',      // Emas Sunda
    lotusWhite: '#FFF8DC',      // Krim tradisional
    bambooGreen: '#8FBC8F',     // Hijau pegunungan
    spiritualPurple: '#8A2BE2',  // Ungu spiritual Sunda
    batikIndigo: '#483D8B',     // Biru tradisional
    sunsetOrange: '#FF8C69',    // Oranye senja Bandung
    riceField: '#9ACD32',       // Hijau padi
    sacredRed: '#B22222',       // Merah batik Sundanese
    holyYellow: '#F0E68C',      // Kuning khaki
    mysticalBlack: '#2F4F4F',   // Abu gelap
    purityWhite: '#FFFAFA',     // Putih snow
  },
  minang: {
    earthBrown: '#A0522D',      // Coklat Minang
    templeGold: '#B8860B',      // Emas songket
    lotusWhite: '#FFF5EE',      // Putih seashell
    bambooGreen: '#6B8E23',     // Hijau olive
    spiritualPurple: '#9932CC',  // Ungu dark orchid
    batikIndigo: '#191970',     // Midnight blue
    sunsetOrange: '#FF6347',    // Tomato orange
    riceField: '#6B8E23',       // Olive drab
    sacredRed: '#8B0000',       // Dark red
    holyYellow: '#DAA520',      // Goldenrod
    mysticalBlack: '#2F2F2F',   // Dark gray
    purityWhite: '#FFFFF0',     // Ivory
  },
};

// ============= COLOR UTILITIES =============

export const colorUtilities = {
  /**
   * Get color with opacity
   */
  withOpacity: (color: string, opacity: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  /**
   * Create gradient from cultural colors
   */
  createCulturalGradient: (startColor: string, endColor: string, direction = '135deg'): string => {
    return `linear-gradient(${direction}, ${startColor}, ${endColor})`;
  },

  /**
   * Get meditation color based on practice type
   */
  getMeditationColor: (practiceType: 'calm' | 'focus' | 'energy' | 'balance' | 'peace' | 'wisdom' | 'compassion' | 'mindfulness'): string => {
    return meditation[practiceType];
  },

  /**
   * Get regional cultural colors
   */
  getRegionalColors: (region: keyof RegionalColors): CulturalColors => {
    return regionalColors[region];
  },
};

// ============= COLOR TOKENS EXPORT =============

export const colorTokens = {
  primary,
  neutral,
  cultural,
  semantic,
  meditation,
  darkTheme,
  regionalColors,
  utilities: colorUtilities,
};

export default colorTokens;