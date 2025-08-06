# Component Library Documentation
# Dokumentasi Lengkap Komponen UI Sembalun

## 🧩 Component Architecture Overview

### Component Hierarchy
```typescript
interface ComponentLibrary {
  foundations: DesignTokens;
  primitives: PrimitiveComponents;
  cultural: CulturalComponents;
  meditation: MeditationComponents;
  layout: LayoutComponents;
  patterns: CompositePatterns;
}
```

### Component Categories
```
src/components/
├── primitives/          # Basic UI building blocks
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Modal/
│   └── Badge/
├── cultural/           # Indonesian cultural components
│   ├── IndonesianCard/
│   ├── CulturalTimer/
│   ├── TraditionalButton/
│   └── SpiritualQuote/
├── meditation/         # Meditation-specific components
│   ├── MeditationTimer/
│   ├── BreathingGuide/
│   ├── SessionControls/
│   └── ProgressTracker/
├── layout/             # Layout and structure
│   ├── Header/
│   ├── Sidebar/
│   ├── Container/
│   └── Grid/
└── patterns/           # Complex composite components
    ├── SessionBuilder/
    ├── DashboardStats/
    ├── ContentExplorer/
    └── CommunityFeed/
```

## 🔧 Primitive Components

### Button Component
```typescript
// Button.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'cultural' | 'meditation' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

const StyledButton = styled('button', {
  // Base styles
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing[2],
  fontFamily: tokens.typography.fontFamily.primary,
  fontWeight: tokens.typography.fontWeight.medium,
  borderRadius: tokens.border.radius.lg,
  border: 'none',
  cursor: 'pointer',
  transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
  
  // Focus styles
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary[500]}`,
    outlineOffset: '2px',
  },
  
  // Disabled styles
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none !important',
  },
  
  variants: {
    variant: {
      primary: {
        backgroundColor: tokens.color.primary[500],
        color: 'white',
        boxShadow: tokens.shadow.md,
        '&:hover:not(:disabled)': {
          backgroundColor: tokens.color.primary[600],
          transform: 'translateY(-1px)',
          boxShadow: tokens.shadow.lg,
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: tokens.shadow.base,
        },
      },
      secondary: {
        backgroundColor: 'transparent',
        color: tokens.color.primary[600],
        border: `1px solid ${tokens.color.primary[200]}`,
        '&:hover:not(:disabled)': {
          backgroundColor: tokens.color.primary[50],
          borderColor: tokens.color.primary[300],
        },
      },
      cultural: {
        backgroundColor: tokens.color.cultural.templeGold,
        color: tokens.color.cultural.earthBrown,
        border: `2px solid ${tokens.color.cultural.earthBrown}`,
        fontFamily: tokens.typography.fontFamily.cultural,
        boxShadow: tokens.shadow.cultural.temple,
        '&:hover:not(:disabled)': {
          backgroundColor: tokens.color.cultural.earthBrown,
          color: tokens.color.cultural.lotusWhite,
          transform: 'translateY(-2px)',
        },
      },
      meditation: {
        background: `linear-gradient(135deg, ${tokens.color.cultural.spiritualPurple}, ${tokens.color.primary[500]})`,
        color: 'white',
        boxShadow: tokens.shadow.cultural.meditation,
        '&:hover:not(:disabled)': {
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: tokens.shadow.xl,
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: tokens.color.neutral[700],
        '&:hover:not(:disabled)': {
          backgroundColor: tokens.color.neutral[100],
        },
      },
    },
    size: {
      sm: {
        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        fontSize: tokens.typography.fontSize.sm,
        minHeight: '32px',
      },
      md: {
        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
        fontSize: tokens.typography.fontSize.base,
        minHeight: '40px',
      },
      lg: {
        padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
        fontSize: tokens.typography.fontSize.lg,
        minHeight: '48px',
      },
    },
  },
  
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

const LoadingSpinner = styled('div', {
  width: '16px',
  height: '16px',
  border: '2px solid transparent',
  borderTop: '2px solid currentColor',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  icon,
  children,
  onClick,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </StyledButton>
  );
};

// Usage Examples
export const ButtonExamples = () => (
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
    <Button variant="primary">Primary Button</Button>
    <Button variant="secondary">Secondary Button</Button>
    <Button variant="cultural">Mulai Meditasi</Button>
    <Button variant="meditation">Spiritual Journey</Button>
    <Button variant="ghost" icon={<SettingsIcon />}>Settings</Button>
    <Button variant="primary" size="lg" isLoading>Loading...</Button>
  </div>
);
```

### Input Component
```typescript
// Input.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  variant?: 'default' | 'cultural';
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  label?: string;
  helper?: string;
  error?: string;
  icon?: React.ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const InputContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing[2],
});

const Label = styled('label', {
  fontSize: tokens.typography.fontSize.sm,
  fontWeight: tokens.typography.fontWeight.medium,
  color: tokens.color.neutral[700],
  
  variants: {
    variant: {
      default: {
        color: tokens.color.neutral[700],
      },
      cultural: {
        color: tokens.color.cultural.earthBrown,
        fontFamily: tokens.typography.fontFamily.cultural,
      },
    },
    required: {
      true: {
        '&::after': {
          content: ' *',
          color: tokens.color.semantic.error[500],
        },
      },
    },
  },
});

const InputWrapper = styled('div', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

const StyledInput = styled('input', {
  width: '100%',
  fontFamily: tokens.typography.fontFamily.primary,
  fontSize: tokens.typography.fontSize.base,
  lineHeight: tokens.typography.lineHeight.normal,
  border: `1px solid ${tokens.color.neutral[300]}`,
  borderRadius: tokens.border.radius.lg,
  backgroundColor: 'white',
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  
  '&::placeholder': {
    color: tokens.color.neutral[400],
  },
  
  '&:focus': {
    outline: 'none',
    borderColor: tokens.color.primary[500],
    boxShadow: `0 0 0 3px ${tokens.color.primary[500]}10`,
  },
  
  '&:disabled': {
    backgroundColor: tokens.color.neutral[50],
    color: tokens.color.neutral[500],
    cursor: 'not-allowed',
  },
  
  variants: {
    variant: {
      default: {
        borderColor: tokens.color.neutral[300],
        '&:focus': {
          borderColor: tokens.color.primary[500],
          boxShadow: `0 0 0 3px ${tokens.color.primary[500]}10`,
        },
      },
      cultural: {
        borderColor: tokens.color.cultural.templeGold,
        backgroundColor: tokens.color.cultural.lotusWhite,
        fontFamily: tokens.typography.fontFamily.cultural,
        '&:focus': {
          borderColor: tokens.color.cultural.earthBrown,
          boxShadow: `0 0 0 3px ${tokens.color.cultural.templeGold}20`,
        },
      },
    },
    size: {
      sm: {
        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        fontSize: tokens.typography.fontSize.sm,
      },
      md: {
        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
        fontSize: tokens.typography.fontSize.base,
      },
      lg: {
        padding: `${tokens.spacing[4]} ${tokens.spacing[5]}`,
        fontSize: tokens.typography.fontSize.lg,
      },
    },
    hasIcon: {
      true: {
        paddingLeft: tokens.spacing[10],
      },
    },
    hasError: {
      true: {
        borderColor: tokens.color.semantic.error[500],
        '&:focus': {
          borderColor: tokens.color.semantic.error[500],
          boxShadow: `0 0 0 3px ${tokens.color.semantic.error[500]}10`,
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const IconContainer = styled('div', {
  position: 'absolute',
  left: tokens.spacing[3],
  top: '50%',
  transform: 'translateY(-50%)',
  color: tokens.color.neutral[400],
  pointerEvents: 'none',
  
  variants: {
    variant: {
      default: {
        color: tokens.color.neutral[400],
      },
      cultural: {
        color: tokens.color.cultural.earthBrown,
      },
    },
  },
});

const HelperText = styled('p', {
  fontSize: tokens.typography.fontSize.sm,
  margin: 0,
  
  variants: {
    type: {
      helper: {
        color: tokens.color.neutral[600],
      },
      error: {
        color: tokens.color.semantic.error[500],
      },
    },
  },
});

export const Input: React.FC<InputProps> = ({
  type = 'text',
  variant = 'default',
  size = 'md',
  placeholder,
  label,
  helper,
  error,
  icon,
  isRequired = false,
  isDisabled = false,
  value,
  onChange,
  ...props
}) => {
  return (
    <InputContainer>
      {label && (
        <Label variant={variant} required={isRequired}>
          {label}
        </Label>
      )}
      <InputWrapper>
        {icon && (
          <IconContainer variant={variant}>
            {icon}
          </IconContainer>
        )}
        <StyledInput
          type={type}
          variant={variant}
          size={size}
          hasIcon={!!icon}
          hasError={!!error}
          placeholder={placeholder}
          disabled={isDisabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        />
      </InputWrapper>
      {(helper || error) && (
        <HelperText type={error ? 'error' : 'helper'}>
          {error || helper}
        </HelperText>
      )}
    </InputContainer>
  );
};

// Usage Examples
export const InputExamples = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
    <Input
      label="Email Address"
      type="email"
      placeholder="Enter your email"
      icon={<EmailIcon />}
      isRequired
    />
    <Input
      variant="cultural"
      label="Nama Lengkap"
      placeholder="Masukkan nama lengkap Anda"
      helper="Nama akan digunakan dalam sertifikat meditasi"
    />
    <Input
      label="Password"
      type="password"
      placeholder="Enter password"
      error="Password must be at least 8 characters"
      icon={<LockIcon />}
    />
  </div>
);
```

### Card Component
```typescript
// Card.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface CardProps {
  variant?: 'default' | 'cultural' | 'meditation' | 'elevated';
  culturalTheme?: 'javanese' | 'balinese' | 'sundanese';
  padding?: 'sm' | 'md' | 'lg';
  isHoverable?: boolean;
  isClickable?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const StyledCard = styled('div', {
  backgroundColor: 'white',
  borderRadius: tokens.border.radius.xl,
  border: `1px solid ${tokens.color.neutral[100]}`,
  transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
  
  variants: {
    variant: {
      default: {
        backgroundColor: 'white',
        boxShadow: tokens.shadow.md,
        border: `1px solid ${tokens.color.neutral[100]}`,
      },
      cultural: {
        backgroundColor: tokens.color.cultural.lotusWhite,
        border: `2px solid ${tokens.color.cultural.templeGold}`,
        boxShadow: tokens.shadow.cultural.temple,
        position: 'relative',
        
        '&::before': {
          content: '',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${tokens.color.cultural.templeGold} 0%, ${tokens.color.cultural.earthBrown} 50%, ${tokens.color.cultural.templeGold} 100%)`,
          borderRadius: `${tokens.border.radius.lg} ${tokens.border.radius.lg} 0 0`,
        },
      },
      meditation: {
        background: `radial-gradient(circle at top, ${tokens.color.cultural.spiritualPurple}10 0%, ${tokens.color.primary[50]} 100%)`,
        border: `1px solid ${tokens.color.cultural.spiritualPurple}20`,
        boxShadow: tokens.shadow.cultural.meditation,
      },
      elevated: {
        backgroundColor: 'white',
        boxShadow: tokens.shadow.xl,
        border: 'none',
      },
    },
    padding: {
      sm: {
        padding: tokens.spacing[4],
      },
      md: {
        padding: tokens.spacing[6],
      },
      lg: {
        padding: tokens.spacing[8],
      },
    },
    isHoverable: {
      true: {
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: tokens.shadow.lg,
        },
      },
    },
    isClickable: {
      true: {
        cursor: 'pointer',
        '&:focus-visible': {
          outline: `2px solid ${tokens.color.primary[500]}`,
          outlineOffset: '2px',
        },
      },
    },
    culturalTheme: {
      javanese: {
        '&::after': {
          content: '',
          position: 'absolute',
          bottom: tokens.spacing[4],
          right: tokens.spacing[4],
          width: '32px',
          height: '32px',
          backgroundImage: 'url("/patterns/batik-kawung.svg")',
          backgroundSize: 'contain',
          opacity: 0.3,
        },
      },
      balinese: {
        '&::after': {
          content: '',
          position: 'absolute',
          bottom: tokens.spacing[4],
          right: tokens.spacing[4],
          width: '32px',
          height: '32px',
          backgroundImage: 'url("/patterns/temple-ornament.svg")',
          backgroundSize: 'contain',
          opacity: 0.3,
        },
      },
      sundanese: {
        '&::after': {
          content: '',
          position: 'absolute',
          bottom: tokens.spacing[4],
          right: tokens.spacing[4],
          width: '32px',
          height: '32px',
          backgroundImage: 'url("/patterns/sundanese-pattern.svg")',
          backgroundSize: 'contain',
          opacity: 0.3,
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
});

const CardHeader = styled('div', {
  marginBottom: tokens.spacing[4],
  paddingBottom: tokens.spacing[4],
  borderBottom: `1px solid ${tokens.color.neutral[100]}`,
  
  variants: {
    variant: {
      default: {
        borderBottomColor: tokens.color.neutral[100],
      },
      cultural: {
        borderBottomColor: tokens.color.cultural.templeGold,
        color: tokens.color.cultural.earthBrown,
      },
      meditation: {
        borderBottomColor: `${tokens.color.cultural.spiritualPurple}20`,
        color: tokens.color.cultural.spiritualPurple,
      },
    },
  },
});

const CardTitle = styled('h3', {
  margin: 0,
  fontSize: tokens.typography.fontSize.lg,
  fontWeight: tokens.typography.fontWeight.semibold,
  lineHeight: tokens.typography.lineHeight.snug,
  
  variants: {
    variant: {
      default: {
        color: tokens.color.neutral[900],
      },
      cultural: {
        color: tokens.color.cultural.earthBrown,
        fontFamily: tokens.typography.fontFamily.cultural,
      },
      meditation: {
        color: tokens.color.cultural.spiritualPurple,
      },
    },
  },
});

const CardContent = styled('div', {
  color: tokens.color.neutral[700],
  lineHeight: tokens.typography.lineHeight.relaxed,
});

const CardFooter = styled('div', {
  marginTop: tokens.spacing[4],
  paddingTop: tokens.spacing[4],
  borderTop: `1px solid ${tokens.color.neutral[100]}`,
  
  variants: {
    variant: {
      default: {
        borderTopColor: tokens.color.neutral[100],
      },
      cultural: {
        borderTopColor: tokens.color.cultural.templeGold,
      },
      meditation: {
        borderTopColor: `${tokens.color.cultural.spiritualPurple}20`,
      },
    },
  },
});

export interface CardComponent extends React.FC<CardProps> {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
}

export const Card: CardComponent = ({
  variant = 'default',
  culturalTheme,
  padding = 'md',
  isHoverable = false,
  isClickable = false,
  children,
  onClick,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      culturalTheme={culturalTheme}
      padding={padding}
      isHoverable={isHoverable}
      isClickable={isClickable}
      onClick={onClick}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

// Usage Examples
export const CardExamples = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
    <Card variant="default" isHoverable>
      <Card.Header>
        <Card.Title>Default Card</Card.Title>
      </Card.Header>
      <Card.Content>
        This is a standard card component with default styling.
      </Card.Content>
      <Card.Footer>
        <Button size="sm">Action</Button>
      </Card.Footer>
    </Card>
    
    <Card variant="cultural" culturalTheme="javanese" isHoverable>
      <Card.Header variant="cultural">
        <Card.Title variant="cultural">Meditasi Lelaku Jawa</Card.Title>
      </Card.Header>
      <Card.Content>
        Praktik spiritual tradisional Jawa untuk mencapai keseimbangan batin.
      </Card.Content>
      <Card.Footer variant="cultural">
        <Button variant="cultural" size="sm">Mulai Meditasi</Button>
      </Card.Footer>
    </Card>
    
    <Card variant="meditation" isHoverable>
      <Card.Header variant="meditation">
        <Card.Title variant="meditation">Spiritual Journey</Card.Title>
      </Card.Header>
      <Card.Content>
        Deep meditation session with guided breathing techniques.
      </Card.Content>
      <Card.Footer variant="meditation">
        <Button variant="meditation" size="sm">Begin Journey</Button>
      </Card.Footer>
    </Card>
  </div>
);
```

## 🏛️ Cultural Components

### Indonesian Card Component
```typescript
// IndonesianCard.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface IndonesianCardProps {
  tradition: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  title: string;
  description: string;
  culturalContext?: {
    origin: string;
    significance: string;
    practiceType: string;
  };
  image?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const CulturalContainer = styled('div', {
  position: 'relative',
  backgroundColor: tokens.color.cultural.lotusWhite,
  borderRadius: tokens.border.radius.xl,
  border: `2px solid ${tokens.color.cultural.templeGold}`,
  overflow: 'hidden',
  transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
  cursor: 'pointer',
  
  '&::before': {
    content: '',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: `linear-gradient(90deg, 
      ${tokens.color.cultural.templeGold} 0%, 
      ${tokens.color.cultural.earthBrown} 25%,
      ${tokens.color.cultural.spiritualPurple} 50%,
      ${tokens.color.cultural.earthBrown} 75%,
      ${tokens.color.cultural.templeGold} 100%
    )`,
  },
  
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: tokens.shadow.cultural.temple,
    
    '& .cultural-pattern': {
      opacity: 0.6,
      transform: 'scale(1.1)',
    },
  },
  
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.cultural.spiritualPurple}`,
    outlineOffset: '2px',
  },
  
  variants: {
    tradition: {
      javanese: {
        '&::after': {
          content: '',
          position: 'absolute',
          top: tokens.spacing[4],
          right: tokens.spacing[4],
          width: '40px',
          height: '40px',
          backgroundImage: 'url("/patterns/batik-kawung.svg")',
          backgroundSize: 'contain',
          opacity: 0.2,
        },
      },
      balinese: {
        '&::after': {
          content: '',
          position: 'absolute',
          top: tokens.spacing[4],
          right: tokens.spacing[4],
          width: '40px',
          height: '40px',
          backgroundImage: 'url("/patterns/temple-ornament.svg")',
          backgroundSize: 'contain',
          opacity: 0.2,
        },
      },
      sundanese: {
        background: `linear-gradient(135deg, ${tokens.color.cultural.lotusWhite} 0%, #FFF8E7 100%)`,
      },
      minang: {
        '&::after': {
          content: '',
          position: 'absolute',
          top: tokens.spacing[4],
          right: tokens.spacing[4],
          width: '40px',
          height: '40px',
          backgroundImage: 'url("/patterns/minang-ornament.svg")',
          backgroundSize: 'contain',
          opacity: 0.2,
        },
      },
    },
    isActive: {
      true: {
        borderColor: tokens.color.cultural.spiritualPurple,
        boxShadow: `0 0 0 3px ${tokens.color.cultural.spiritualPurple}20`,
      },
    },
  },
});

const ImageContainer = styled('div', {
  position: 'relative',
  height: '160px',
  overflow: 'hidden',
  
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: `transform ${tokens.animation.duration.slow} ${tokens.animation.easing.meditation}`,
  },
});

const ContentContainer = styled('div', {
  padding: tokens.spacing[6],
});

const TraditionBadge = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing[2],
  padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
  backgroundColor: tokens.color.cultural.templeGold,
  color: tokens.color.cultural.earthBrown,
  borderRadius: tokens.border.radius.full,
  fontSize: tokens.typography.fontSize.sm,
  fontWeight: tokens.typography.fontWeight.medium,
  fontFamily: tokens.typography.fontFamily.cultural,
  marginBottom: tokens.spacing[3],
});

const Title = styled('h3', {
  margin: 0,
  marginBottom: tokens.spacing[2],
  fontSize: tokens.typography.fontSize.xl,
  fontWeight: tokens.typography.fontWeight.semibold,
  color: tokens.color.cultural.earthBrown,
  fontFamily: tokens.typography.fontFamily.cultural,
  lineHeight: tokens.typography.lineHeight.snug,
});

const Description = styled('p', {
  margin: 0,
  marginBottom: tokens.spacing[4],
  color: tokens.color.neutral[700],
  lineHeight: tokens.typography.lineHeight.relaxed,
  fontFamily: tokens.typography.fontFamily.cultural,
});

const CulturalContext = styled('div', {
  marginTop: tokens.spacing[4],
  padding: tokens.spacing[4],
  backgroundColor: `${tokens.color.cultural.templeGold}10`,
  borderRadius: tokens.border.radius.lg,
  border: `1px solid ${tokens.color.cultural.templeGold}30`,
});

const ContextItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing[2],
  marginBottom: tokens.spacing[2],
  fontSize: tokens.typography.fontSize.sm,
  color: tokens.color.cultural.earthBrown,
  
  '&:last-child': {
    marginBottom: 0,
  },
  
  '& .label': {
    fontWeight: tokens.typography.fontWeight.medium,
    minWidth: '80px',
  },
});

const CulturalPattern = styled('div', {
  position: 'absolute',
  bottom: tokens.spacing[4],
  right: tokens.spacing[4],
  width: '60px',
  height: '60px',
  opacity: 0.1,
  transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
});

const traditionLabels = {
  javanese: 'Jawa',
  balinese: 'Bali',
  sundanese: 'Sunda',
  minang: 'Minang',
};

const traditionIcons = {
  javanese: '🏛️',
  balinese: '🕉️',
  sundanese: '🌸',
  minang: '🌺',
};

export const IndonesianCard: React.FC<IndonesianCardProps> = ({
  tradition,
  title,
  description,
  culturalContext,
  image,
  isActive = false,
  onClick,
}) => {
  return (
    <CulturalContainer
      tradition={tradition}
      isActive={isActive}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Meditasi tradisi ${traditionLabels[tradition]}: ${title}`}
    >
      {image && (
        <ImageContainer>
          <img src={image} alt={title} />
        </ImageContainer>
      )}
      
      <ContentContainer>
        <TraditionBadge>
          <span>{traditionIcons[tradition]}</span>
          <span>Tradisi {traditionLabels[tradition]}</span>
        </TraditionBadge>
        
        <Title>{title}</Title>
        <Description>{description}</Description>
        
        {culturalContext && (
          <CulturalContext>
            <ContextItem>
              <span className="label">Asal:</span>
              <span>{culturalContext.origin}</span>
            </ContextItem>
            <ContextItem>
              <span className="label">Makna:</span>
              <span>{culturalContext.significance}</span>
            </ContextItem>
            <ContextItem>
              <span className="label">Jenis:</span>
              <span>{culturalContext.practiceType}</span>
            </ContextItem>
          </CulturalContext>
        )}
      </ContentContainer>
      
      <CulturalPattern className="cultural-pattern" />
    </CulturalContainer>
  );
};

// Usage Example
export const IndonesianCardExample = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
    <IndonesianCard
      tradition="javanese"
      title="Meditasi Lelaku Jawa"
      description="Praktik spiritual tradisional Jawa untuk mencapai keseimbangan batin dan kedamaian jiwa melalui kontemplasi dan refleksi diri."
      culturalContext={{
        origin: "Jawa Tengah",
        significance: "Pencarian keseimbangan spiritual",
        practiceType: "Kontemplasi dan Refleksi"
      }}
      image="/images/javanese-meditation.jpg"
    />
    
    <IndonesianCard
      tradition="balinese"
      title="Dharana Bali"
      description="Konsentrasi mendalam dalam tradisi Hindu-Bali untuk mencapai kesatuan dengan alam semesta dan harmoni spiritual."
      culturalContext={{
        origin: "Bali",
        significance: "Penyatuan dengan Brahman",
        practiceType: "Konsentrasi dan Devotion"
      }}
      image="/images/balinese-meditation.jpg"
      isActive
    />
  </div>
);
```

## 🧘‍♀️ Meditation Components

### Meditation Timer Component
```typescript
// MeditationTimer.tsx
import React, { useEffect, useState } from 'react';
import { styled } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface MeditationTimerProps {
  duration: number; // in seconds
  isRunning: boolean;
  tradition?: 'javanese' | 'balinese' | 'sundanese';
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

const TimerContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.spacing[8],
  background: `radial-gradient(circle at center, 
    ${tokens.color.cultural.spiritualPurple}10 0%, 
    ${tokens.color.primary[50]} 70%,
    transparent 100%
  )`,
  borderRadius: tokens.border.radius['2xl'],
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/patterns/meditation-mandala.svg") center/contain no-repeat',
    opacity: 0.05,
    animation: 'rotate 60s linear infinite',
  },
  
  '@keyframes rotate': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

const TimerDisplay = styled('div', {
  fontSize: '4rem',
  fontWeight: tokens.typography.fontWeight.light,
  color: tokens.color.cultural.spiritualPurple,
  fontFamily: tokens.typography.fontFamily.primary,
  textShadow: `0 2px 8px ${tokens.color.cultural.spiritualPurple}20`,
  marginBottom: tokens.spacing[6],
  position: 'relative',
  zIndex: 1,
  
  '@media (max-width: 480px)': {
    fontSize: '2.5rem',
  },
  
  variants: {
    isRunning: {
      true: {
        animation: 'breathe 4s ease-in-out infinite alternate',
      },
    },
  },
  
  '@keyframes breathe': {
    '0%': { 
      transform: 'scale(1)', 
      opacity: 0.8,
      textShadow: `0 2px 8px ${tokens.color.cultural.spiritualPurple}20`,
    },
    '100%': { 
      transform: 'scale(1.05)', 
      opacity: 1,
      textShadow: `0 4px 16px ${tokens.color.cultural.spiritualPurple}40`,
    },
  },
});

const ProgressRing = styled('svg', {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) rotate(-90deg)',
  width: '300px',
  height: '300px',
  
  '@media (max-width: 480px)': {
    width: '250px',
    height: '250px',
  },
});

const ProgressCircle = styled('circle', {
  fill: 'none',
  stroke: tokens.color.cultural.templeGold,
  strokeWidth: '3',
  strokeLinecap: 'round',
  opacity: 0.6,
  filter: `drop-shadow(0 0 6px ${tokens.color.cultural.templeGold}40)`,
  transition: `stroke-dashoffset ${tokens.animation.duration.fast} ease-out`,
});

const BackgroundCircle = styled('circle', {
  fill: 'none',
  stroke: `${tokens.color.cultural.spiritualPurple}20`,
  strokeWidth: '3',
});

const StatusText = styled('div', {
  fontSize: tokens.typography.fontSize.lg,
  color: tokens.color.cultural.earthBrown,
  fontFamily: tokens.typography.fontFamily.cultural,
  textAlign: 'center',
  marginTop: tokens.spacing[4],
  fontStyle: 'italic',
  position: 'relative',
  zIndex: 1,
});

const TraditionSymbol = styled('div', {
  position: 'absolute',
  top: tokens.spacing[4],
  right: tokens.spacing[4],
  width: '32px',
  height: '32px',
  opacity: 0.3,
  
  variants: {
    tradition: {
      javanese: {
        backgroundImage: 'url("/symbols/javanese-symbol.svg")',
      },
      balinese: {
        backgroundImage: 'url("/symbols/balinese-symbol.svg")',
      },
      sundanese: {
        backgroundImage: 'url("/symbols/sundanese-symbol.svg")',
      },
    },
  },
});

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getStatusText = (remaining: number, isRunning: boolean, tradition?: string): string => {
  if (!isRunning && remaining > 0) {
    return 'Siap untuk memulai meditasi';
  }
  
  if (remaining === 0) {
    return 'Meditasi selesai dengan sempurna';
  }
  
  const texts = {
    javanese: [
      'Rasakan kedamaian dalam diri',
      'Temukan keseimbangan batin',
      'Biarkan pikiran mengalir tenang'
    ],
    balinese: [
      'Harmoni dengan alam semesta',
      'Penyatuan jiwa dan raga',
      'Ketenangan dalam kesatuan'
    ],
    sundanese: [
      'Ketenangan hati yang sejuk',
      'Kedamaian dalam keheningan',
      'Sinergi dengan alam'
    ]
  };
  
  const traditionTexts = texts[tradition as keyof typeof texts] || texts.javanese;
  const index = Math.floor((Date.now() / 10000) % traditionTexts.length);
  return traditionTexts[index];
};

export const MeditationTimer: React.FC<MeditationTimerProps> = ({
  duration,
  isRunning,
  tradition = 'javanese',
  onComplete,
  onTick,
}) => {
  const [remaining, setRemaining] = useState(duration);
  
  useEffect(() => {
    setRemaining(duration);
  }, [duration]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && remaining > 0) {
      interval = setInterval(() => {
        setRemaining((prev) => {
          const newRemaining = prev - 1;
          onTick?.(newRemaining);
          
          if (newRemaining === 0) {
            onComplete?.();
          }
          
          return newRemaining;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, remaining, onComplete, onTick]);
  
  const progress = ((duration - remaining) / duration) * 100;
  const circumference = 2 * Math.PI * 140; // radius = 140
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <TimerContainer>
      <ProgressRing>
        <BackgroundCircle
          cx="150"
          cy="150"
          r="140"
        />
        <ProgressCircle
          cx="150"
          cy="150"
          r="140"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </ProgressRing>
      
      <TimerDisplay isRunning={isRunning}>
        {formatTime(remaining)}
      </TimerDisplay>
      
      <StatusText>
        {getStatusText(remaining, isRunning, tradition)}
      </StatusText>
      
      {tradition && (
        <TraditionSymbol tradition={tradition} />
      )}
    </TimerContainer>
  );
};

// Usage Example
export const MeditationTimerExample = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [duration] = useState(300); // 5 minutes
  
  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <MeditationTimer
        duration={duration}
        isRunning={isRunning}
        tradition="javanese"
        onComplete={() => {
          setIsRunning(false);
          alert('Meditation completed!');
        }}
        onTick={(remaining) => console.log(`${remaining} seconds remaining`)}
      />
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Button
          variant="meditation"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Pause' : 'Start'} Meditation
        </Button>
      </div>
    </div>
  );
};
```

---

**Component Library ini menyediakan building blocks yang komprehensif untuk membangun interface Sembalun yang beautiful, accessible, dan culturally-authentic. Setiap komponen dirancang dengan perhatian detail terhadap cultural elements, accessibility standards, dan user experience yang optimal.** 🧩✨