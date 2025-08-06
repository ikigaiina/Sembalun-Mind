# Design Patterns & Templates
# Pola Desain dan Template untuk Sembalun

## 🎨 Design Pattern Philosophy

### Pattern Categories
```typescript
interface DesignPatternSystem {
  navigation: NavigationPatterns;
  content: ContentPatterns;
  interaction: InteractionPatterns;
  feedback: FeedbackPatterns;
  cultural: CulturalPatterns;
  meditation: MeditationPatterns;
  responsive: ResponsivePatterns;
}
```

## 🧭 Navigation Patterns

### Bottom Tab Navigation (Mobile)
```typescript
// BottomTabNavigation.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface TabItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  isActive: boolean;
}

interface BottomTabNavigationProps {
  tabs: TabItem[];
  onTabChange: (tabId: string) => void;
}

const TabContainer = styled('nav', {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'white',
  borderTop: `1px solid ${tokens.color.neutral[200]}`,
  paddingBottom: 'env(safe-area-inset-bottom)',
  zIndex: 50,
  
  '&::before': {
    content: '',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, 
      transparent 0%, 
      ${tokens.color.cultural.templeGold} 50%, 
      transparent 100%
    )`,
  },
});

const TabList = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
  maxWidth: '500px',
  margin: '0 auto',
});

const TabButton = styled('button', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: tokens.spacing[1],
  padding: tokens.spacing[2],
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: tokens.border.radius.lg,
  cursor: 'pointer',
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  position: 'relative',
  minWidth: '60px',
  
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary[500]}`,
    outlineOffset: '2px',
  },
  
  variants: {
    isActive: {
      true: {
        color: tokens.color.primary[600],
        
        '& .icon': {
          transform: 'scale(1.1)',
          color: tokens.color.primary[600],
        },
        
        '& .label': {
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.color.primary[600],
        },
        
        '&::before': {
          content: '',
          position: 'absolute',
          top: '-2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24px',
          height: '3px',
          backgroundColor: tokens.color.primary[600],
          borderRadius: tokens.border.radius.full,
        },
      },
      false: {
        color: tokens.color.neutral[500],
        
        '&:hover': {
          color: tokens.color.neutral[700],
          backgroundColor: tokens.color.neutral[50],
        },
      },
    },
  },
});

const TabIcon = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  position: 'relative',
});

const TabLabel = styled('span', {
  fontSize: tokens.typography.fontSize.xs,
  fontWeight: tokens.typography.fontWeight.normal,
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  textAlign: 'center',
});

const TabBadge = styled('div', {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  backgroundColor: tokens.color.semantic.error[500],
  color: 'white',
  fontSize: '10px',
  fontWeight: tokens.typography.fontWeight.bold,
  borderRadius: tokens.border.radius.full,
  minWidth: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px',
  boxShadow: `0 0 0 2px white`,
});

export const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  tabs,
  onTabChange,
}) => {
  return (
    <TabContainer role="navigation" aria-label="Main navigation">
      <TabList>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            isActive={tab.isActive}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
            aria-current={tab.isActive ? 'page' : undefined}
          >
            <TabIcon className="icon">
              {tab.icon}
              {tab.badge && tab.badge > 0 && (
                <TabBadge>{tab.badge > 99 ? '99+' : tab.badge}</TabBadge>
              )}
            </TabIcon>
            <TabLabel className="label">{tab.label}</TabLabel>
          </TabButton>
        ))}
      </TabList>
    </TabContainer>
  );
};

// Usage Example
export const BottomTabExample = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
  const tabs: TabItem[] = [
    { id: 'dashboard', icon: <HomeIcon />, label: 'Beranda', isActive: activeTab === 'dashboard' },
    { id: 'explore', icon: <CompassIcon />, label: 'Jelajah', isActive: activeTab === 'explore' },
    { id: 'meditation', icon: <HeartIcon />, label: 'Meditasi', isActive: activeTab === 'meditation' },
    { id: 'community', icon: <UsersIcon />, label: 'Komunitas', badge: 3, isActive: activeTab === 'community' },
    { id: 'profile', icon: <UserIcon />, label: 'Profil', isActive: activeTab === 'profile' },
  ];
  
  return (
    <BottomTabNavigation
      tabs={tabs}
      onTabChange={setActiveTab}
    />
  );
};
```

### Sidebar Navigation (Desktop)
```typescript
// SidebarNavigation.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface SidebarNavigationProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  currentPath: string;
}

const SidebarContainer = styled('aside', {
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  backgroundColor: 'white',
  borderRight: `1px solid ${tokens.color.neutral[200]}`,
  transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeOut}`,
  zIndex: 40,
  display: 'flex',
  flexDirection: 'column',
  
  variants: {
    isCollapsed: {
      true: {
        width: '80px',
      },
      false: {
        width: '280px',
      },
    },
  },
  
  defaultVariants: {
    isCollapsed: false,
  },
});

const SidebarHeader = styled('div', {
  padding: tokens.spacing[6],
  borderBottom: `1px solid ${tokens.color.neutral[100]}`,
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing[3],
  position: 'relative',
  
  '&::after': {
    content: '',
    position: 'absolute',
    bottom: 0,
    left: tokens.spacing[6],
    right: tokens.spacing[6],
    height: '2px',
    background: `linear-gradient(90deg, 
      ${tokens.color.cultural.templeGold} 0%, 
      ${tokens.color.cultural.spiritualPurple} 100%
    )`,
    borderRadius: tokens.border.radius.full,
  },
});

const Logo = styled('div', {
  width: '32px',
  height: '32px',
  backgroundImage: 'url("/logo-icon.svg")',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  flexShrink: 0,
});

const LogoText = styled('h1', {
  fontSize: tokens.typography.fontSize.lg,
  fontWeight: tokens.typography.fontWeight.bold,
  color: tokens.color.cultural.earthBrown,
  margin: 0,
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  
  variants: {
    isVisible: {
      true: {
        opacity: 1,
        transform: 'translateX(0)',
      },
      false: {
        opacity: 0,
        transform: 'translateX(-10px)',
      },
    },
  },
});

const ToggleButton = styled('button', {
  position: 'absolute',
  top: '50%',
  right: '-12px',
  transform: 'translateY(-50%)',
  width: '24px',
  height: '24px',
  backgroundColor: 'white',
  border: `1px solid ${tokens.color.neutral[200]}`,
  borderRadius: tokens.border.radius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  
  '&:hover': {
    backgroundColor: tokens.color.neutral[50],
    borderColor: tokens.color.primary[300],
  },
  
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary[500]}`,
    outlineOffset: '2px',
  },
});

const NavigationList = styled('nav', {
  flex: 1,
  padding: tokens.spacing[4],
  paddingTop: tokens.spacing[6],
});

const NavSection = styled('div', {
  marginBottom: tokens.spacing[6],
  
  '&:last-child': {
    marginBottom: 0,
  },
});

const SectionTitle = styled('h3', {
  fontSize: tokens.typography.fontSize.xs,
  fontWeight: tokens.typography.fontWeight.semibold,
  color: tokens.color.neutral[500],
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: 0,
  marginBottom: tokens.spacing[3],
  paddingLeft: tokens.spacing[3],
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  
  variants: {
    isVisible: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 0,
      },
    },
  },
});

const NavItem = styled('a', {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing[3],
  padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
  borderRadius: tokens.border.radius.lg,
  textDecoration: 'none',
  color: tokens.color.neutral[700],
  fontSize: tokens.typography.fontSize.sm,
  fontWeight: tokens.typography.fontWeight.medium,
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  marginBottom: tokens.spacing[1],
  position: 'relative',
  
  '&:hover': {
    backgroundColor: tokens.color.neutral[50],
    color: tokens.color.neutral[900],
  },
  
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary[500]}`,
    outlineOffset: '2px',
  },
  
  variants: {
    isActive: {
      true: {
        backgroundColor: tokens.color.primary[50],
        color: tokens.color.primary[700],
        
        '&::before': {
          content: '',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '20px',
          backgroundColor: tokens.color.primary[600],
          borderRadius: tokens.border.radius.full,
        },
        
        '& .nav-icon': {
          color: tokens.color.primary[600],
        },
      },
    },
  },
});

const NavIcon = styled('div', {
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
});

const NavLabel = styled('span', {
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  
  variants: {
    isVisible: {
      true: {
        opacity: 1,
        transform: 'translateX(0)',
      },
      false: {
        opacity: 0,
        transform: 'translateX(-10px)',
      },
    },
  },
});

const navigationSections = [
  {
    title: 'Utama',
    items: [
      { id: 'dashboard', icon: <HomeIcon />, label: 'Beranda', path: '/dashboard' },
      { id: 'explore', icon: <CompassIcon />, label: 'Jelajah', path: '/explore' },
      { id: 'meditation', icon: <HeartIcon />, label: 'Meditasi', path: '/meditation' },
    ],
  },
  {
    title: 'Komunitas',
    items: [
      { id: 'community', icon: <UsersIcon />, label: 'Komunitas', path: '/community' },
      { id: 'courses', icon: <BookIcon />, label: 'Kursus', path: '/courses' },
      { id: 'achievements', icon: <AwardIcon />, label: 'Pencapaian', path: '/achievements' },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { id: 'profile', icon: <UserIcon />, label: 'Profil', path: '/profile' },
      { id: 'settings', icon: <SettingsIcon />, label: 'Pengaturan', path: '/settings' },
    ],
  },
];

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isCollapsed = false,
  onToggle,
  currentPath,
}) => {
  return (
    <SidebarContainer isCollapsed={isCollapsed}>
      <SidebarHeader>
        <Logo />
        <LogoText isVisible={!isCollapsed}>Sembalun</LogoText>
        <ToggleButton onClick={onToggle} aria-label="Toggle sidebar">
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </ToggleButton>
      </SidebarHeader>
      
      <NavigationList>
        {navigationSections.map((section) => (
          <NavSection key={section.title}>
            <SectionTitle isVisible={!isCollapsed}>
              {section.title}
            </SectionTitle>
            {section.items.map((item) => (
              <NavItem
                key={item.id}
                href={item.path}
                isActive={currentPath === item.path}
              >
                <NavIcon className="nav-icon">{item.icon}</NavIcon>
                <NavLabel isVisible={!isCollapsed}>{item.label}</NavLabel>
              </NavItem>
            ))}
          </NavSection>
        ))}
      </NavigationList>
    </SidebarContainer>
  );
};
```

## 📝 Content Patterns

### Content Grid Pattern
```typescript
// ContentGrid.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  type: 'meditation' | 'course' | 'article' | 'cultural';
  duration?: number;
  tradition?: string;
}

interface ContentGridProps {
  items: ContentItem[];
  layout?: 'grid' | 'list' | 'masonry';
  columns?: 1 | 2 | 3 | 4;
  onItemClick?: (item: ContentItem) => void;
}

const GridContainer = styled('div', {
  display: 'grid',
  gap: tokens.spacing[6],
  padding: tokens.spacing[4],
  
  variants: {
    layout: {
      grid: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      },
      list: {
        gridTemplateColumns: '1fr',
        gap: tokens.spacing[4],
      },
      masonry: {
        display: 'block',
        columnCount: 'var(--columns)',
        columnGap: tokens.spacing[6],
      },
    },
    columns: {
      1: {
        '--columns': '1',
        gridTemplateColumns: '1fr',
      },
      2: {
        '--columns': '2',
        gridTemplateColumns: 'repeat(2, 1fr)',
        
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr',
        },
      },
      3: {
        '--columns': '3',
        gridTemplateColumns: 'repeat(3, 1fr)',
        
        '@media (max-width: 1024px)': {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr',
        },
      },
      4: {
        '--columns': '4',
        gridTemplateColumns: 'repeat(4, 1fr)',
        
        '@media (max-width: 1280px)': {
          gridTemplateColumns: 'repeat(3, 1fr)',
        },
        
        '@media (max-width: 1024px)': {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr',
        },
      },
    },
  },
  
  defaultVariants: {
    layout: 'grid',
    columns: 3,
  },
});

const ContentCard = styled('div', {
  backgroundColor: 'white',
  borderRadius: tokens.border.radius.xl,
  overflow: 'hidden',
  boxShadow: tokens.shadow.md,
  transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
  cursor: 'pointer',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: tokens.shadow.lg,
  },
  
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary[500]}`,
    outlineOffset: '2px',
  },
  
  variants: {
    layout: {
      grid: {
        display: 'flex',
        flexDirection: 'column',
      },
      list: {
        display: 'flex',
        flexDirection: 'row',
        
        '@media (max-width: 768px)': {
          flexDirection: 'column',
        },
      },
      masonry: {
        breakInside: 'avoid',
        marginBottom: tokens.spacing[6],
        display: 'block',
      },
    },
    type: {
      meditation: {
        borderLeft: `4px solid ${tokens.color.cultural.spiritualPurple}`,
      },
      course: {
        borderLeft: `4px solid ${tokens.color.primary[500]}`,
      },
      article: {
        borderLeft: `4px solid ${tokens.color.cultural.earthBrown}`,
      },
      cultural: {
        borderLeft: `4px solid ${tokens.color.cultural.templeGold}`,
        
        '&::before': {
          content: '',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, 
            ${tokens.color.cultural.templeGold} 0%, 
            ${tokens.color.cultural.earthBrown} 100%
          )`,
        },
      },
    },
  },
});

const ImageContainer = styled('div', {
  position: 'relative',
  overflow: 'hidden',
  
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: `transform ${tokens.animation.duration.slow} ${tokens.animation.easing.meditation}`,
  },
  
  '&:hover img': {
    transform: 'scale(1.05)',
  },
  
  variants: {
    layout: {
      grid: {
        height: '200px',
      },
      list: {
        width: '200px',
        height: '140px',
        flexShrink: 0,
        
        '@media (max-width: 768px)': {
          width: '100%',
          height: '160px',
        },
      },
      masonry: {
        height: 'auto',
        aspectRatio: '16/9',
      },
    },
  },
});

const ContentInfo = styled('div', {
  padding: tokens.spacing[5],
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const TypeBadge = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing[1],
  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
  borderRadius: tokens.border.radius.full,
  fontSize: tokens.typography.fontSize.xs,
  fontWeight: tokens.typography.fontWeight.medium,
  marginBottom: tokens.spacing[2],
  width: 'fit-content',
  
  variants: {
    type: {
      meditation: {
        backgroundColor: `${tokens.color.cultural.spiritualPurple}10`,
        color: tokens.color.cultural.spiritualPurple,
      },
      course: {
        backgroundColor: `${tokens.color.primary[500]}10`,
        color: tokens.color.primary[600],
      },
      article: {
        backgroundColor: `${tokens.color.cultural.earthBrown}10`,
        color: tokens.color.cultural.earthBrown,
      },
      cultural: {
        backgroundColor: `${tokens.color.cultural.templeGold}20`,
        color: tokens.color.cultural.earthBrown,
      },
    },
  },
});

const Title = styled('h3', {
  margin: 0,
  marginBottom: tokens.spacing[2],
  fontSize: tokens.typography.fontSize.lg,
  fontWeight: tokens.typography.fontWeight.semibold,
  color: tokens.color.neutral[900],
  lineHeight: tokens.typography.lineHeight.snug,
  
  // Truncate after 2 lines
  display: '-webkit-box',
  '-webkit-line-clamp': '2',
  '-webkit-box-orient': 'vertical',
  overflow: 'hidden',
});

const Description = styled('p', {
  margin: 0,
  color: tokens.color.neutral[600],
  fontSize: tokens.typography.fontSize.sm,
  lineHeight: tokens.typography.lineHeight.relaxed,
  flex: 1,
  
  // Truncate after 3 lines
  display: '-webkit-box',
  '-webkit-line-clamp': '3',
  '-webkit-box-orient': 'vertical',
  overflow: 'hidden',
});

const MetaInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: tokens.spacing[3],
  fontSize: tokens.typography.fontSize.xs,
  color: tokens.color.neutral[500],
});

const Duration = styled('span', {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing[1],
});

const Tradition = styled('span', {
  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
  backgroundColor: tokens.color.cultural.lotusWhite,
  color: tokens.color.cultural.earthBrown,
  borderRadius: tokens.border.radius.base,
  fontFamily: tokens.typography.fontFamily.cultural,
});

const typeIcons = {
  meditation: '🧘‍♀️',
  course: '📚',
  article: '📖',
  cultural: '🏛️',
};

const typeLabels = {
  meditation: 'Meditasi',
  course: 'Kursus',
  article: 'Artikel',
  cultural: 'Budaya',
};

export const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  layout = 'grid',
  columns = 3,
  onItemClick,
}) => {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}j ${remainingMinutes}m`;
  };
  
  return (
    <GridContainer layout={layout} columns={columns}>
      {items.map((item) => (
        <ContentCard
          key={item.id}
          layout={layout}
          type={item.type}
          onClick={() => onItemClick?.(item)}
          tabIndex={0}
          role="button"
          aria-label={`${item.title} - ${typeLabels[item.type]}`}
        >
          {item.image && (
            <ImageContainer layout={layout}>
              <img src={item.image} alt={item.title} />
            </ImageContainer>
          )}
          
          <ContentInfo>
            <TypeBadge type={item.type}>
              <span>{typeIcons[item.type]}</span>
              <span>{typeLabels[item.type]}</span>
            </TypeBadge>
            
            <Title>{item.title}</Title>
            <Description>{item.description}</Description>
            
            {(item.duration || item.tradition) && (
              <MetaInfo>
                {item.duration && (
                  <Duration>
                    <ClockIcon width="12" height="12" />
                    {formatDuration(item.duration)}
                  </Duration>
                )}
                {item.tradition && (
                  <Tradition>{item.tradition}</Tradition>
                )}
              </MetaInfo>
            )}
          </ContentInfo>
        </ContentCard>
      ))}
    </GridContainer>
  );
};

// Usage Example
export const ContentGridExample = () => {
  const sampleItems: ContentItem[] = [
    {
      id: '1',
      title: 'Meditasi Pagi untuk Ketenangan',
      description: 'Mulai hari dengan meditasi mindfulness untuk mencapai ketenangan dan fokus sepanjang hari.',
      image: '/images/morning-meditation.jpg',
      type: 'meditation',
      duration: 15,
      tradition: 'Mindfulness',
    },
    {
      id: '2',
      title: 'Kursus Meditasi Lelaku Jawa',
      description: 'Pelajari teknik meditasi tradisional Jawa dengan panduan langkah demi langkah dari ahli spiritual.',
      image: '/images/javanese-course.jpg',
      type: 'course',
      duration: 180,
      tradition: 'Jawa',
    },
    {
      id: '3',
      title: 'Sejarah Meditasi di Indonesia',
      description: 'Jelajahi kekayaan tradisi meditasi Nusantara dari masa ke masa.',
      image: '/images/indonesian-history.jpg',
      type: 'article',
      tradition: 'Nusantara',
    },
  ];
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Content Grid Examples</h2>
      
      <h3>Grid Layout (3 columns)</h3>
      <ContentGrid
        items={sampleItems}
        layout="grid"
        columns={3}
        onItemClick={(item) => console.log('Clicked:', item.title)}
      />
      
      <h3>List Layout</h3>
      <ContentGrid
        items={sampleItems}
        layout="list"
        onItemClick={(item) => console.log('Clicked:', item.title)}
      />
    </div>
  );
};
```

## 💬 Interaction Patterns

### Modal Pattern
```typescript
// Modal.tsx
import React, { useEffect } from 'react';
import { styled, keyframes } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  variant?: 'default' | 'cultural' | 'meditation';
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const slideIn = keyframes({
  '0%': { 
    opacity: 0,
    transform: 'translate(-50%, -50%) scale(0.9)',
  },
  '100%': { 
    opacity: 1,
    transform: 'translate(-50% -50%) scale(1)',
  },
});

const culturalSlideIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate(-50%, -50%) scale(0.8) rotateY(10deg)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1) rotateY(0deg)',
  },
});

const meditationFloat = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate(-50%, -60%) scale(0.9)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1)',
  },
});

const Overlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 100,
  animation: `${fadeIn} ${tokens.animation.duration.normal} ${tokens.animation.easing.easeOut}`,
  
  variants: {
    variant: {
      default: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      cultural: {
        backgroundColor: 'rgba(139, 69, 19, 0.3)',
        backdropFilter: 'blur(4px)',
      },
      meditation: {
        background: `radial-gradient(circle at center, 
          rgba(102, 51, 153, 0.2) 0%, 
          rgba(0, 0, 0, 0.6) 100%
        )`,
        backdropFilter: 'blur(8px)',
      },
    },
  },
});

const ModalContainer = styled('div', {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  borderRadius: tokens.border.radius.xl,
  boxShadow: tokens.shadow['2xl'],
  zIndex: 101,
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary[500]}`,
    outlineOffset: '2px',
  },
  
  variants: {
    size: {
      sm: {
        width: '90vw',
        maxWidth: '400px',
        animation: `${slideIn} ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
      },
      md: {
        width: '90vw',
        maxWidth: '500px',
        animation: `${slideIn} ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
      },
      lg: {
        width: '90vw',
        maxWidth: '700px',
        animation: `${slideIn} ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
      },
      xl: {
        width: '90vw',
        maxWidth: '900px',
        animation: `${slideIn} ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
      },
      fullscreen: {
        width: '100vw',
        height: '100vh',
        maxWidth: 'none',
        maxHeight: 'none',
        borderRadius: 0,
        animation: `${fadeIn} ${tokens.animation.duration.normal} ${tokens.animation.easing.easeOut}`,
      },
    },
    variant: {
      default: {
        backgroundColor: 'white',
      },
      cultural: {
        backgroundColor: tokens.color.cultural.lotusWhite,
        border: `2px solid ${tokens.color.cultural.templeGold}`,
        animation: `${culturalSlideIn} ${tokens.animation.duration.slow} ${tokens.animation.easing.meditation}`,
        
        '&::before': {
          content: '',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, 
            ${tokens.color.cultural.templeGold} 0%, 
            ${tokens.color.cultural.earthBrown} 50%, 
            ${tokens.color.cultural.templeGold} 100%
          )`,
          zIndex: 1,
        },
      },
      meditation: {
        background: `linear-gradient(135deg, 
          ${tokens.color.cultural.lotusWhite} 0%, 
          ${tokens.color.primary[50]} 100%
        )`,
        border: `1px solid ${tokens.color.cultural.spiritualPurple}30`,
        animation: `${meditationFloat} ${tokens.animation.duration.slow} ${tokens.animation.easing.meditation}`,
        boxShadow: `${tokens.shadow.xl}, 0 0 40px ${tokens.color.cultural.spiritualPurple}20`,
      },
    },
  },
  
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

const ModalHeader = styled('div', {
  padding: tokens.spacing[6],
  borderBottom: `1px solid ${tokens.color.neutral[100]}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  
  variants: {
    variant: {
      default: {
        borderBottomColor: tokens.color.neutral[100],
      },
      cultural: {
        borderBottomColor: tokens.color.cultural.templeGold,
        backgroundColor: `${tokens.color.cultural.templeGold}05`,
      },
      meditation: {
        borderBottomColor: `${tokens.color.cultural.spiritualPurple}20`,
        background: `linear-gradient(90deg, 
          transparent 0%, 
          ${tokens.color.cultural.spiritualPurple}05 50%, 
          transparent 100%
        )`,
      },
    },
  },
});

const ModalTitle = styled('h2', {
  margin: 0,
  fontSize: tokens.typography.fontSize['2xl'],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: tokens.color.neutral[900],
  
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

const CloseButton = styled('button', {
  width: '40px',
  height: '40px',
  borderRadius: tokens.border.radius.full,
  border: 'none',
  backgroundColor: 'transparent',
  color: tokens.color.neutral[500],
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
  
  '&:hover': {
    backgroundColor: tokens.color.neutral[100],
    color: tokens.color.neutral[700],
  },
  
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary[500]}`,
    outlineOffset: '2px',
  },
  
  variants: {
    variant: {
      default: {
        '&:hover': {
          backgroundColor: tokens.color.neutral[100],
        },
      },
      cultural: {
        color: tokens.color.cultural.earthBrown,
        '&:hover': {
          backgroundColor: `${tokens.color.cultural.templeGold}20`,
          color: tokens.color.cultural.earthBrown,
        },
      },
      meditation: {
        color: tokens.color.cultural.spiritualPurple,
        '&:hover': {
          backgroundColor: `${tokens.color.cultural.spiritualPurple}10`,
          color: tokens.color.cultural.spiritualPurple,
        },
      },
    },
  },
});

const ModalContent = styled('div', {
  flex: 1,
  padding: tokens.spacing[6],
  overflow: 'auto',
  
  // Custom scrollbar styling
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  
  '&::-webkit-scrollbar-track': {
    backgroundColor: tokens.color.neutral[100],
  },
  
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: tokens.color.neutral[300],
    borderRadius: tokens.border.radius.full,
    
    '&:hover': {
      backgroundColor: tokens.color.neutral[400],
    },
  },
});

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  variant = 'default',
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <>
      <Overlay
        variant={variant}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <ModalContainer
        size={size}
        variant={variant}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        {title && (
          <ModalHeader variant={variant}>
            <ModalTitle id="modal-title" variant={variant}>
              {title}
            </ModalTitle>
            <CloseButton
              variant={variant}
              onClick={onClose}
              aria-label="Close modal"
            >
              <XIcon width="20" height="20" />
            </CloseButton>
          </ModalHeader>
        )}
        
        <ModalContent>
          {children}
        </ModalContent>
      </ModalContainer>
    </>
  );
};

// Usage Examples
export const ModalExamples = () => {
  const [isDefaultOpen, setIsDefaultOpen] = React.useState(false);
  const [isCulturalOpen, setIsCulturalOpen] = React.useState(false);
  const [isMeditationOpen, setIsMeditationOpen] = React.useState(false);
  
  return (
    <div style={{ padding: '2rem', display: 'flex', gap: '1rem' }}>
      <Button onClick={() => setIsDefaultOpen(true)}>
        Default Modal
      </Button>
      
      <Button variant="cultural" onClick={() => setIsCulturalOpen(true)}>
        Cultural Modal
      </Button>
      
      <Button variant="meditation" onClick={() => setIsMeditationOpen(true)}>
        Meditation Modal
      </Button>
      
      <Modal
        isOpen={isDefaultOpen}
        onClose={() => setIsDefaultOpen(false)}
        title="Default Modal"
        size="md"
      >
        <p>This is a standard modal with default styling.</p>
        <Button onClick={() => setIsDefaultOpen(false)}>Close</Button>
      </Modal>
      
      <Modal
        isOpen={isCulturalOpen}
        onClose={() => setIsCulturalOpen(false)}
        title="Meditasi Tradisional Indonesia"
        size="lg"
        variant="cultural"
      >
        <div>
          <p>Selamat datang di sesi meditasi tradisional Indonesia. Mari kita mulai perjalanan spiritual dengan kearifan leluhur Nusantara.</p>
          <div style={{ marginTop: '2rem' }}>
            <Button variant="cultural" onClick={() => setIsCulturalOpen(false)}>
              Mulai Meditasi
            </Button>
          </div>
        </div>
      </Modal>
      
      <Modal
        isOpen={isMeditationOpen}
        onClose={() => setIsMeditationOpen(false)}
        title="Spiritual Journey"
        size="md"
        variant="meditation"
      >
        <div style={{ textAlign: 'center' }}>
          <p>Prepare yourself for a deep meditation experience. Find a comfortable position and let your mind settle into peace.</p>
          <div style={{ marginTop: '2rem' }}>
            <Button variant="meditation" onClick={() => setIsMeditationOpen(false)}>
              Begin Journey
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
```

## 🎯 Cultural Pattern Templates

### Meditation Session Template
```typescript
// MeditationSessionTemplate.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { tokens } from '@/design-tokens';

interface MeditationSessionTemplateProps {
  tradition: 'javanese' | 'balinese' | 'sundanese';
  title: string;
  duration: number;
  instructor?: string;
  background?: string;
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

const SessionContainer = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  
  '&::before': {
    content: '',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.3,
    zIndex: 0,
  },
  
  variants: {
    tradition: {
      javanese: {
        background: `radial-gradient(circle at center, 
          ${tokens.color.cultural.earthBrown}10 0%, 
          ${tokens.color.cultural.spiritualPurple}05 70%,
          transparent 100%
        )`,
        
        '&::before': {
          backgroundImage: 'url("/backgrounds/javanese-temple.jpg")',
        },
      },
      balinese: {
        background: `radial-gradient(circle at center, 
          ${tokens.color.cultural.templeGold}10 0%, 
          ${tokens.color.primary[50]} 70%,
          transparent 100%
        )`,
        
        '&::before': {
          backgroundImage: 'url("/backgrounds/balinese-temple.jpg")',
        },
      },
      sundanese: {
        background: `radial-gradient(circle at center, 
          ${tokens.color.cultural.bambooGreen}10 0%, 
          ${tokens.color.cultural.lotusWhite} 70%,
          transparent 100%
        )`,
        
        '&::before': {
          backgroundImage: 'url("/backgrounds/sundanese-nature.jpg")',
        },
      },
    },
  },
});

const ContentOverlay = styled('div', {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: tokens.spacing[8],
  padding: tokens.spacing[8],
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: tokens.border.radius['2xl'],
  backdropFilter: 'blur(10px)',
  boxShadow: tokens.shadow.xl,
  maxWidth: '600px',
  textAlign: 'center',
  
  variants: {
    tradition: {
      javanese: {
        border: `2px solid ${tokens.color.cultural.earthBrown}30`,
      },
      balinese: {
        border: `2px solid ${tokens.color.cultural.templeGold}40`,
      },
      sundanese: {
        border: `2px solid ${tokens.color.cultural.bambooGreen}30`,
      },
    },
  },
});

const TraditionIcon = styled('div', {
  width: '80px',
  height: '80px',
  borderRadius: tokens.border.radius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  marginBottom: tokens.spacing[4],
  
  variants: {
    tradition: {
      javanese: {
        backgroundColor: `${tokens.color.cultural.earthBrown}20`,
        color: tokens.color.cultural.earthBrown,
      },
      balinese: {
        backgroundColor: `${tokens.color.cultural.templeGold}30`,
        color: tokens.color.cultural.earthBrown,
      },
      sundanese: {
        backgroundColor: `${tokens.color.cultural.bambooGreen}20`,
        color: tokens.color.cultural.bambooGreen,
      },
    },
  },
});

const SessionTitle = styled('h1', {
  fontSize: tokens.typography.fontSize['3xl'],
  fontWeight: tokens.typography.fontWeight.bold,
  margin: 0,
  fontFamily: tokens.typography.fontFamily.cultural,
  lineHeight: tokens.typography.lineHeight.tight,
  
  variants: {
    tradition: {
      javanese: {
        color: tokens.color.cultural.earthBrown,
      },
      balinese: {
        color: tokens.color.cultural.earthBrown,
      },
      sundanese: {
        color: tokens.color.cultural.bambooGreen,
      },
    },
  },
});

const SessionInfo = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing[2],
  marginBottom: tokens.spacing[6],
});

const InfoItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing[2],
  fontSize: tokens.typography.fontSize.base,
  color: tokens.color.neutral[600],
});

const ControlsContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing[4],
});

const ControlButton = styled('button', {
  width: '60px',
  height: '60px',
  borderRadius: tokens.border.radius.full,
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.meditation}`,
  fontSize: '1.5rem',
  
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary[500]}`,
    outlineOffset: '2px',
  },
  
  '&:hover': {
    transform: 'scale(1.1)',
  },
  
  '&:active': {
    transform: 'scale(0.95)',
  },
  
  variants: {
    variant: {
      primary: {
        backgroundColor: tokens.color.primary[500],
        color: 'white',
        boxShadow: tokens.shadow.lg,
        
        '&:hover': {
          backgroundColor: tokens.color.primary[600],
          boxShadow: tokens.shadow.xl,
        },
      },
      secondary: {
        backgroundColor: 'white',
        color: tokens.color.neutral[600],
        border: `2px solid ${tokens.color.neutral[200]}`,
        
        '&:hover': {
          backgroundColor: tokens.color.neutral[50],
          borderColor: tokens.color.neutral[300],
        },
      },
    },
    tradition: {
      javanese: {
        '&[data-variant="primary"]': {
          backgroundColor: tokens.color.cultural.earthBrown,
          '&:hover': {
            backgroundColor: tokens.color.cultural.spiritualPurple,
          },
        },
      },
      balinese: {
        '&[data-variant="primary"]': {
          background: `linear-gradient(135deg, ${tokens.color.cultural.templeGold}, ${tokens.color.cultural.earthBrown})`,
        },
      },
      sundanese: {
        '&[data-variant="primary"]': {
          backgroundColor: tokens.color.cultural.bambooGreen,
        },
      },
    },
  },
});

const traditionData = {
  javanese: {
    icon: '🏛️',
    greeting: 'Sugeng rawuh ing lelaku spiritual',
    description: 'Meditasi dalam tradisi Jawa untuk mencapai keseimbangan jiwa',
  },
  balinese: {
    icon: '🕉️',
    greeting: 'Om Swastiastu, selamat bermeditasi',
    description: 'Dharana dalam tradisi Hindu-Bali untuk kesatuan dengan Brahman',
  },
  sundanese: {
    icon: '🌸',
    greeting: 'Wilujeng sumping ka meditasi Sunda',
    description: 'Kontemplasi alam dalam kearifan budaya Sunda',
  },
};

export const MeditationSessionTemplate: React.FC<MeditationSessionTemplateProps> = ({
  tradition,
  title,
  duration,
  instructor,
  isActive,
  onStart,
  onPause,
  onStop,
}) => {
  const traditionInfo = traditionData[tradition];
  
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}j ${remainingMinutes}m`;
  };
  
  return (
    <SessionContainer tradition={tradition}>
      <ContentOverlay tradition={tradition}>
        <TraditionIcon tradition={tradition}>
          {traditionInfo.icon}
        </TraditionIcon>
        
        <div>
          <SessionTitle tradition={tradition}>
            {title}
          </SessionTitle>
          <p style={{ 
            fontSize: tokens.typography.fontSize.lg, 
            color: tokens.color.neutral[600],
            fontStyle: 'italic',
            margin: `${tokens.spacing[2]} 0`,
            fontFamily: tokens.typography.fontFamily.cultural,
          }}>
            {traditionInfo.greeting}
          </p>
        </div>
        
        <SessionInfo>
          <InfoItem>
            <ClockIcon width="20" height="20" />
            <span>Durasi: {formatDuration(duration)}</span>
          </InfoItem>
          
          {instructor && (
            <InfoItem>
              <UserIcon width="20" height="20" />
              <span>Pembimbing: {instructor}</span>
            </InfoItem>
          )}
          
          <InfoItem>
            <HeartIcon width="20" height="20" />
            <span>{traditionInfo.description}</span>
          </InfoItem>
        </SessionInfo>
        
        <ControlsContainer>
          <ControlButton
            variant="secondary"
            tradition={tradition}
            onClick={onStop}
            aria-label="Stop meditation"
            data-variant="secondary"
          >
            <StopIcon />
          </ControlButton>
          
          <ControlButton
            variant="primary"
            tradition={tradition}
            onClick={isActive ? onPause : onStart}
            aria-label={isActive ? 'Pause meditation' : 'Start meditation'}
            data-variant="primary"
            style={{ 
              width: '80px', 
              height: '80px',
              fontSize: '2rem',
            }}
          >
            {isActive ? <PauseIcon /> : <PlayIcon />}
          </ControlButton>
          
          <ControlButton
            variant="secondary"
            tradition={tradition}
            onClick={() => {/* Settings */}}
            aria-label="Settings"
            data-variant="secondary"
          >
            <SettingsIcon />
          </ControlButton>
        </ControlsContainer>
      </ContentOverlay>
    </SessionContainer>
  );
};

// Usage Example
export const MeditationSessionExample = () => {
  const [isActive, setIsActive] = React.useState(false);
  
  return (
    <MeditationSessionTemplate
      tradition="javanese"
      title="Meditasi Lelaku Pagi"
      duration={20}
      instructor="Romo Suryanto"
      isActive={isActive}
      onStart={() => setIsActive(true)}
      onPause={() => setIsActive(false)}
      onStop={() => {
        setIsActive(false);
        // Navigate back or show completion
      }}
    />
  );
};
```

---

**Design Patterns ini menyediakan template yang konsisten dan reusable untuk berbagai scenario dalam aplikasi Sembalun. Setiap pattern dirancang dengan mempertimbangkan user experience, accessibility, dan cultural authenticity yang menjadi core value platform.** 🎨✨