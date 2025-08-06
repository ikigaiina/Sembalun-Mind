# Storybook Setup & Configuration
# Setup dan Konfigurasi Storybook untuk Sembalun Design System

## 🎨 Storybook Overview

Storybook adalah development environment untuk UI components yang memungkinkan kita untuk:
- Mengembangkan components secara isolated
- Dokumentasi component yang interactive
- Testing visual regression
- Design system showcase
- Collaboration antara designer dan developer

## 📦 Installation & Setup

### Dependencies Installation
```bash
# Install Storybook
npx storybook@latest init

# Install additional addons
npm install --save-dev @storybook/addon-essentials @storybook/addon-controls @storybook/addon-docs @storybook/addon-viewport @storybook/addon-a11y @storybook/addon-design-tokens

# Install cultural and design system related packages
npm install --save-dev @storybook/addon-backgrounds @storybook/addon-measure @storybook/addon-outline
```

### Project Structure
```
.storybook/
├── main.ts                 # Main Storybook configuration
├── preview.ts              # Global decorators and parameters
├── theme.ts                # Custom Storybook theme
└── manager.ts              # Manager configuration

src/
├── stories/
│   ├── Introduction.stories.mdx
│   ├── DesignTokens.stories.mdx
│   ├── Colors.stories.mdx
│   ├── Typography.stories.mdx
│   ├── Spacing.stories.mdx
│   ├── Components/
│   │   ├── Button.stories.tsx
│   │   ├── Input.stories.tsx
│   │   ├── Card.stories.tsx
│   │   └── Modal.stories.tsx
│   ├── Cultural/
│   │   ├── IndonesianCard.stories.tsx
│   │   ├── CulturalTimer.stories.tsx
│   │   └── TraditionalButton.stories.tsx
│   ├── Meditation/
│   │   ├── MeditationTimer.stories.tsx
│   │   ├── BreathingGuide.stories.tsx
│   │   └── SessionControls.stories.tsx
│   └── Patterns/
│       ├── Navigation.stories.tsx
│       ├── ContentGrid.stories.tsx
│       └── MeditationSession.stories.tsx
```

## ⚙️ Configuration Files

### Main Configuration (.storybook/main.ts)
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    '@storybook/addon-backgrounds',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
    '@storybook/addon-design-tokens',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  viteFinal: async (config) => {
    // Ensure Vite can handle our design tokens and cultural assets
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': '/src',
        '@/design-tokens': '/src/design-system/tokens',
        '@/components': '/src/components',
      };
    }
    return config;
  },
};

export default config;
```

### Preview Configuration (.storybook/preview.ts)
```typescript
import type { Preview } from '@storybook/react';
import { tokens } from '../src/design-system/tokens';
import '../src/index.css'; // Import global styles

// Custom decorator for cultural themes
const withCulturalTheme = (Story, context) => {
  const { culturalTheme } = context.globals;
  
  return (
    <div 
      className={`cultural-theme-${culturalTheme || 'default'}`}
      style={{
        padding: '2rem',
        backgroundColor: culturalTheme === 'traditional' 
          ? tokens.color.cultural.lotusWhite 
          : 'white',
      }}
    >
      <Story />
    </div>
  );
};

// Responsive viewport configurations
const customViewports = {
  mobile: {
    name: 'Mobile',
    styles: {
      width: '375px',
      height: '667px',
    },
  },
  tablet: {
    name: 'Tablet',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  desktop: {
    name: 'Desktop',
    styles: {
      width: '1280px',
      height: '800px',
    },
  },
  meditationView: {
    name: 'Meditation View',
    styles: {
      width: '390px',
      height: '844px',
    },
  },
};

// Background options for cultural themes
const customBackgrounds = {
  default: { name: 'Default', value: '#ffffff' },
  cultural: { name: 'Cultural', value: tokens.color.cultural.lotusWhite },
  meditation: { name: 'Meditation', value: `linear-gradient(135deg, ${tokens.color.cultural.spiritualPurple}10, ${tokens.color.primary[50]})` },
  dark: { name: 'Dark', value: '#0f172a' },
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      theme: 'light',
      source: {
        type: 'dynamic',
      },
    },
    viewport: {
      viewports: customViewports,
      defaultViewport: 'desktop',
    },
    backgrounds: {
      default: 'default',
      values: Object.values(customBackgrounds),
    },
    layout: 'padded',
    // Design tokens integration
    designToken: {
      defaultTab: 'Colors',
    },
  },
  globalTypes: {
    culturalTheme: {
      name: 'Cultural Theme',
      description: 'Indonesian cultural theme variants',
      defaultValue: 'default',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'default', title: 'Default' },
          { value: 'javanese', title: 'Javanese' },
          { value: 'balinese', title: 'Balinese' },
          { value: 'sundanese', title: 'Sundanese' },
          { value: 'traditional', title: 'Traditional' },
        ],
        showName: true,
      },
    },
    meditationMode: {
      name: 'Meditation Mode',
      description: 'Toggle meditation-specific styling',
      defaultValue: false,
      toolbar: {
        icon: 'heart',
        items: [
          { value: false, title: 'Normal' },
          { value: true, title: 'Meditation' },
        ],
        showName: true,
      },
    },
  },
  decorators: [withCulturalTheme],
};

export default preview;
```

### Custom Storybook Theme (.storybook/theme.ts)
```typescript
import { create } from '@storybook/theming/create';
import { tokens } from '../src/design-system/tokens';

export default create({
  base: 'light',
  
  // Brand
  brandTitle: 'Sembalun Design System',
  brandUrl: 'https://sembalun.app',
  brandImage: '/logo-full.svg',
  brandTarget: '_self',
  
  // Colors
  colorPrimary: tokens.color.primary[500],
  colorSecondary: tokens.color.cultural.templeGold,
  
  // UI colors
  appBg: '#ffffff',
  appContentBg: tokens.color.neutral[50],
  appBorderColor: tokens.color.neutral[200],
  appBorderRadius: parseInt(tokens.border.radius.lg),
  
  // Typography
  fontBase: tokens.typography.fontFamily.primary.join(', '),
  fontCode: tokens.typography.fontFamily.monospace.join(', '),
  
  // Text colors
  textColor: tokens.color.neutral[900],
  textInverseColor: tokens.color.neutral[50],
  
  // Toolbar default and active colors
  barTextColor: tokens.color.neutral[600],
  barSelectedColor: tokens.color.primary[600],
  barBg: '#ffffff',
  
  // Form colors
  inputBg: '#ffffff',
  inputBorder: tokens.color.neutral[300],
  inputTextColor: tokens.color.neutral[900],
  inputBorderRadius: parseInt(tokens.border.radius.md),
});
```

## 📚 Story Examples

### Design Tokens Story
```typescript
// src/stories/DesignTokens.stories.mdx
import { Meta, ColorPalette, ColorItem, Typeset } from '@storybook/addon-docs';
import { tokens } from '../design-system/tokens';

<Meta title="Design System/Design Tokens" />

# Design Tokens

Design tokens adalah nilai-nilai fundamental dari Sembalun Design System yang memastikan konsistensi visual di seluruh platform.

## Colors

### Primary Colors
<ColorPalette>
  <ColorItem
    title="Primary"
    subtitle="Brand colors untuk actions dan highlights"
    colors={{
      'Primary 50': tokens.color.primary[50],
      'Primary 500': tokens.color.primary[500],
      'Primary 900': tokens.color.primary[900],
    }}
  />
</ColorPalette>

### Cultural Indonesian Colors
<ColorPalette>
  <ColorItem
    title="Cultural"
    subtitle="Warna-warna yang terinspirasi dari budaya Indonesia"
    colors={{
      'Earth Brown': tokens.color.cultural.earthBrown,
      'Temple Gold': tokens.color.cultural.templeGold,
      'Lotus White': tokens.color.cultural.lotusWhite,
      'Spiritual Purple': tokens.color.cultural.spiritualPurple,
    }}
  />
</ColorPalette>

## Typography

### Font Families
<Typeset
  fontSizes={[12, 14, 16, 20, 24, 32, 40, 48]}
  fontWeight={400}
  sampleText="Sembalun - Platform Meditasi Indonesia"
  fontFamily={tokens.typography.fontFamily.primary.join(', ')}
/>

### Cultural Typography
<Typeset
  fontSizes={[16, 20, 24, 32]}
  fontWeight={500}
  sampleText="Meditasi Tradisional Nusantara"
  fontFamily={tokens.typography.fontFamily.cultural.join(', ')}
/>
```

### Button Component Story
```typescript
// src/stories/Components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/primitives/Button';
import { HeartIcon, SettingsIcon } from '@heroicons/react/24/outline';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button component dengan berbagai variant termasuk cultural dan meditation themes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'cultural', 'meditation', 'ghost'],
      description: 'Variant visual dari button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Ukuran button',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Status disabled button',
    },
    isLoading: {
      control: 'boolean',
      description: 'Status loading button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

// Variants showcase
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="cultural">Budaya Indonesia</Button>
      <Button variant="meditation">Spiritual Journey</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Berbagai variant button yang tersedia dalam design system.',
      },
    },
  },
};

// Sizes showcase
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button icon={<HeartIcon width={20} height={20} />}>
        Favorit
      </Button>
      <Button variant="secondary" icon={<SettingsIcon width={20} height={20} />}>
        Pengaturan
      </Button>
      <Button variant="cultural" icon="🧘‍♀️">
        Mulai Meditasi
      </Button>
    </div>
  ),
};

// States
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button>Normal</Button>
      <Button isLoading>Loading</Button>
      <Button isDisabled>Disabled</Button>
    </div>
  ),
};

// Cultural theme variations
export const CulturalThemes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div>
        <h3>Javanese Theme</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="cultural">Lelaku Jawa</Button>
          <Button variant="meditation">Meditasi Spiritual</Button>
        </div>
      </div>
      <div>
        <h3>Balinese Theme</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="cultural">Dharana Bali</Button>
          <Button variant="meditation">Spiritual Journey</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'cultural' },
  },
};
```

### Cultural Component Story
```typescript
// src/stories/Cultural/IndonesianCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { IndonesianCard } from '../../components/cultural/IndonesianCard';

const meta: Meta<typeof IndonesianCard> = {
  title: 'Cultural/Indonesian Card',
  component: IndonesianCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card component yang dirancang khusus untuk menampilkan konten budaya Indonesia dengan elemen visual yang authentic.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tradition: {
      control: 'select',
      options: ['javanese', 'balinese', 'sundanese', 'minang'],
      description: 'Tradisi budaya Indonesia',
    },
    isActive: {
      control: 'boolean',
      description: 'Status aktif dari card',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Javanese: Story = {
  args: {
    tradition: 'javanese',
    title: 'Meditasi Lelaku Jawa',
    description: 'Praktik spiritual tradisional Jawa untuk mencapai keseimbangan batin dan kedamaian jiwa melalui kontemplasi dan refleksi diri.',
    culturalContext: {
      origin: 'Jawa Tengah',
      significance: 'Pencarian keseimbangan spiritual',
      practiceType: 'Kontemplasi dan Refleksi',
    },
    image: '/images/javanese-meditation.jpg',
  },
};

export const Balinese: Story = {
  args: {
    tradition: 'balinese',
    title: 'Dharana Bali',
    description: 'Konsentrasi mendalam dalam tradisi Hindu-Bali untuk mencapai kesatuan dengan alam semesta dan harmoni spiritual.',
    culturalContext: {
      origin: 'Bali',
      significance: 'Penyatuan dengan Brahman',
      practiceType: 'Konsentrasi dan Devotion',
    },
    image: '/images/balinese-meditation.jpg',
    isActive: true,
  },
};

export const AllTraditions: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
      gap: '2rem',
      maxWidth: '1200px',
    }}>
      <IndonesianCard
        tradition="javanese"
        title="Meditasi Lelaku Jawa"
        description="Praktik spiritual tradisional Jawa untuk keseimbangan batin."
        culturalContext={{
          origin: 'Jawa Tengah',
          significance: 'Keseimbangan spiritual',
          practiceType: 'Kontemplasi',
        }}
      />
      <IndonesianCard
        tradition="balinese"
        title="Dharana Bali"
        description="Konsentrasi dalam tradisi Hindu-Bali."
        culturalContext={{
          origin: 'Bali',
          significance: 'Penyatuan dengan Brahman',
          practiceType: 'Konsentrasi',
        }}
      />
      <IndonesianCard
        tradition="sundanese"
        title="Kontemplasi Sunda"
        description="Meditasi alam dalam kearifan Sunda."
        culturalContext={{
          origin: 'Jawa Barat',
          significance: 'Harmoni dengan alam',
          practiceType: 'Kontemplasi Alam',
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'cultural' },
  },
};

export const InteractiveStates: Story = {
  render: () => {
    const [activeCard, setActiveCard] = React.useState('javanese');
    
    return (
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <IndonesianCard
          tradition="javanese"
          title="Meditasi Lelaku Jawa"
          description="Praktik spiritual tradisional Jawa."
          isActive={activeCard === 'javanese'}
          onClick={() => setActiveCard('javanese')}
        />
        <IndonesianCard
          tradition="balinese"
          title="Dharana Bali"
          description="Konsentrasi dalam tradisi Hindu-Bali."
          isActive={activeCard === 'balinese'}
          onClick={() => setActiveCard('balinese')}
        />
      </div>
    );
  },
};
```

### Meditation Component Story
```typescript
// src/stories/Meditation/MeditationTimer.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MeditationTimer } from '../../components/meditation/MeditationTimer';

const meta: Meta<typeof MeditationTimer> = {
  title: 'Meditation/Meditation Timer',
  component: MeditationTimer,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'meditation' },
    docs: {
      description: {
        component: 'Timer component untuk sesi meditasi dengan animasi breathing dan cultural theming.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    duration: {
      control: { type: 'number', min: 60, max: 3600, step: 60 },
      description: 'Durasi meditasi dalam detik',
    },
    isRunning: {
      control: 'boolean',
      description: 'Status timer (running/paused)',
    },
    tradition: {
      control: 'select',
      options: ['javanese', 'balinese', 'sundanese'],
      description: 'Tradisi meditasi yang dipilih',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    duration: 300, // 5 minutes
    isRunning: false,
    tradition: 'javanese',
  },
};

export const Running: Story = {
  args: {
    duration: 600, // 10 minutes
    isRunning: true,
    tradition: 'javanese',
  },
};

export const CulturalTraditions: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
      gap: '3rem',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h3>Tradisi Jawa</h3>
        <MeditationTimer
          duration={300}
          isRunning={true}
          tradition="javanese"
          onComplete={() => console.log('Javanese meditation completed')}
        />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3>Tradisi Bali</h3>
        <MeditationTimer
          duration={300}
          isRunning={true}
          tradition="balinese"
          onComplete={() => console.log('Balinese meditation completed')}
        />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3>Tradisi Sunda</h3>
        <MeditationTimer
          duration={300}
          isRunning={false}
          tradition="sundanese"
          onComplete={() => console.log('Sundanese meditation completed')}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const Interactive: Story = {
  render: () => {
    const [isRunning, setIsRunning] = React.useState(false);
    const [duration, setDuration] = React.useState(300);
    const [tradition, setTradition] = React.useState('javanese');
    
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <select 
            value={tradition} 
            onChange={(e) => setTradition(e.target.value)}
            style={{ marginRight: '1rem', padding: '0.5rem' }}
          >
            <option value="javanese">Tradisi Jawa</option>
            <option value="balinese">Tradisi Bali</option>
            <option value="sundanese">Tradisi Sunda</option>
          </select>
          
          <select 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{ padding: '0.5rem' }}
          >
            <option value={300}>5 menit</option>
            <option value={600}>10 menit</option>
            <option value={900}>15 menit</option>
            <option value={1200}>20 menit</option>
          </select>
        </div>
        
        <MeditationTimer
          duration={duration}
          isRunning={isRunning}
          tradition={tradition}
          onComplete={() => {
            setIsRunning(false);
            alert('Meditation completed!');
          }}
          onTick={(remaining) => console.log(`${remaining} seconds remaining`)}
        />
        
        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => setIsRunning(!isRunning)}
            style={{ 
              padding: '1rem 2rem', 
              fontSize: '1rem',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {isRunning ? 'Pause' : 'Start'} Meditation
          </button>
        </div>
      </div>
    );
  },
};
```

## 🚀 Build & Deployment Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build",
    "storybook:serve": "npx http-server storybook-static -p 6007",
    "storybook:test": "test-storybook",
    "storybook:test:ci": "concurrently -k -s first -n \"SB,TEST\" -c \"magenta,blue\" \"npm run storybook:serve -- --silent\" \"wait-on http://127.0.0.1:6007 && npm run storybook:test\"",
    "chromatic": "npx chromatic --project-token=YOUR_PROJECT_TOKEN",
    "storybook:deploy": "npm run storybook:build && npm run chromatic"
  }
}
```

### GitHub Actions for Storybook
```yaml
# .github/workflows/storybook.yml
name: Storybook

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-storybook:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Storybook
        run: npm run storybook:build
      
      - name: Serve Storybook and run tests
        run: npm run storybook:test:ci
      
      - name: Publish to Chromatic
        if: github.ref == 'refs/heads/main'
        run: npm run chromatic
        env:
          CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
      
      - name: Deploy Storybook to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./storybook-static
```

## 📖 Documentation Integration

### Custom MDX Templates
```mdx
<!-- src/stories/Introduction.stories.mdx -->
import { Meta } from '@storybook/addon-docs';

<Meta title="Introduction" />

# Sembalun Design System

Selamat datang di Sembalun Design System - sebuah system desain yang menggabungkan modernitas teknologi dengan kearifan budaya Indonesia.

## 🎯 Filosofi Desain

Design system ini dibangun dengan prinsip-prinsip:

1. **🧘‍♀️ Ketenangan** - Design yang menenangkan dan mendukung mindfulness
2. **🏛️ Keaslian Budaya** - Menghormati dan melestarikan tradisi Indonesia
3. **♿ Aksesibilitas** - Inklusif untuk semua pengguna
4. **📱 Responsivitas** - Optimal di semua perangkat

## 🎨 Komponen Utama

- **Primitives**: Button, Input, Card, Modal
- **Cultural**: Indonesian Card, Cultural Timer, Traditional Elements
- **Meditation**: Meditation Timer, Breathing Guide, Session Controls
- **Patterns**: Navigation, Content Grid, Meditation Sessions

## 🌍 Tema Budaya

Design system ini mendukung berbagai tradisi meditasi Indonesia:

- **Jawa**: Lelaku spiritual dengan elemen batik dan candi
- **Bali**: Dharana Hindu-Bali dengan ornamen pura
- **Sunda**: Kontemplasi alam dengan motif bambu dan pegunungan
- **Minang**: Spiritual practices dengan ukiran khas Minangkabau

## 🚀 Cara Penggunaan

1. Lihat komponen di sidebar kiri
2. Gunakan Controls untuk berinteraksi dengan komponen
3. Periksa Docs untuk panduan implementasi
4. Test accessibility dengan addon A11y
5. Gunakan design tokens untuk konsistensi

## 📚 Resources

- [Design Tokens](/?path=/docs/design-system-design-tokens--docs)
- [Colors](/?path=/docs/design-system-colors--docs)
- [Typography](/?path=/docs/design-system-typography--docs)
- [Cultural Guidelines](/?path=/docs/cultural-guidelines--docs)
```

## 🧪 Testing Integration

### Visual Regression Testing
```typescript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  setup() {
    // Setup code for visual testing
  },
  async preRender(page, context) {
    // Wait for cultural fonts and assets to load
    await page.waitForLoadState('networkidle');
    
    // Handle cultural theme switching
    if (context.parameters?.culturalTheme) {
      await page.evaluate((theme) => {
        document.body.className = `cultural-theme-${theme}`;
      }, context.parameters.culturalTheme);
    }
  },
  async postRender(page, context) {
    // Add custom accessibility tests for meditation components
    if (context.title.includes('Meditation')) {
      const meditationTimer = await page.locator('[data-testid="meditation-timer"]');
      if (await meditationTimer.isVisible()) {
        // Test breathing animation
        await expect(meditationTimer).toHaveCSS('animation-name', 'breathe');
      }
    }
  },
};

export default config;
```

## 📊 Performance Monitoring

### Bundle Analysis Integration
```typescript
// .storybook/webpack-bundle-analyzer.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpackFinal: async (config) => {
    if (process.env.ANALYZE_BUNDLE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'storybook-bundle-report.html',
        })
      );
    }
    return config;
  },
};
```

---

**Storybook Setup ini menyediakan environment yang komprehensif untuk developing, testing, dan documenting Sembalun Design System. Dengan integration yang proper, tim dapat dengan mudah collaborate, maintain consistency, dan ensure quality dari semua UI components.** 📚✨