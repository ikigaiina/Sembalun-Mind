import React, { useState } from 'react';
import { designTokens } from '../design-system/foundations';
import { Button } from '../components/ui/Button';
import { IndonesianCard, JavaneseCard, BalineseCard, SacredCard, MeditationCard } from '../components/cultural/IndonesianCard';
import { MeditationTimer } from '../components/meditation/MeditationTimer';

// ============= DEMO PAGE COMPONENT =============

const FrameworkDemo: React.FC = () => {
  const [selectedTradition, setSelectedTradition] = useState<'javanese' | 'balinese' | 'sundanese' | 'minang'>('javanese');
  const [activeDemo, setActiveDemo] = useState<'tokens' | 'buttons' | 'cards' | 'meditation'>('tokens');

  const { colors, typography, spacing, shadows } = designTokens;

  // Sample meditation session
  const sampleSession = {
    id: 'demo-session',
    duration: 300, // 5 minutes
    type: 'cultural' as const,
    tradition: selectedTradition,
    culturalContent: {
      title: 'Meditasi Tradisional Nusantara',
      instructor: 'Guru Spiritual',
      backgroundMusic: 'gamelan-meditation.mp3',
      guidance: ['Duduk dengan tenang', 'Tarik napas dalam-dalam', 'Rasakan ketenangan'],
    },
  };

  // Page styles
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.cultural.lotusWhite}, ${colors.neutral[50]})`,
    fontFamily: typography.fontFamilies.primary.join(', '),
    color: colors.neutral[900],
    padding: spacing[8],
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: spacing[12],
    padding: spacing[6],
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: shadows.lg,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.cultural.earthBrown,
    marginBottom: spacing[6],
    fontFamily: typography.fontFamilies.heading.join(', '),
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.cultural.spiritualPurple,
    marginBottom: spacing[4],
    fontFamily: typography.fontFamilies.cultural.join(', '),
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: spacing[12] }}>
        <h1 
          style={{
            fontSize: typography.fontSizes['5xl'],
            fontWeight: typography.fontWeights.bold,
            color: colors.cultural.earthBrown,
            marginBottom: spacing[4],
            fontFamily: typography.fontFamilies.heading.join(', '),
            textShadow: `0 4px 8px ${colors.cultural.spiritualPurple}20`,
          }}
        >
          🧘‍♀️ Sembalun Framework Demo
        </h1>
        <p 
          style={{
            fontSize: typography.fontSizes.xl,
            color: colors.cultural.spiritualPurple,
            fontFamily: typography.fontFamilies.cultural.join(', '),
            fontStyle: 'italic',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          Comprehensive Indonesian Cultural Design System for Meditation Apps
        </p>
      </header>

      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        gap: spacing[4], 
        marginBottom: spacing[8],
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {[
          { key: 'tokens', label: 'Design Tokens', icon: '🎨' },
          { key: 'buttons', label: 'Cultural Buttons', icon: '🔘' },
          { key: 'cards', label: 'Indonesian Cards', icon: '🏛️' },
          { key: 'meditation', label: 'Meditation Timer', icon: '⏰' },
        ].map(({ key, label, icon }) => (
          <Button
            key={key}
            variant={activeDemo === key ? 'primary' : 'outline'}
            onClick={() => setActiveDemo(key as any)}
            style={{ minWidth: '140px' }}
          >
            {icon} {label}
          </Button>
        ))}
      </nav>

      {/* Tradition Selector */}
      <div style={{ 
        display: 'flex', 
        gap: spacing[3], 
        marginBottom: spacing[8],
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        <span style={{ 
          alignSelf: 'center', 
          fontWeight: typography.fontWeights.medium,
          color: colors.cultural.earthBrown,
        }}>
          Select Tradition:
        </span>
        {[
          { key: 'javanese', label: 'Javanese', emoji: '🏛️' },
          { key: 'balinese', label: 'Balinese', emoji: '🌺' },
          { key: 'sundanese', label: 'Sundanese', emoji: '🎋' },
          { key: 'minang', label: 'Minang', emoji: '🏠' },
        ].map(({ key, label, emoji }) => (
          <Button
            key={key}
            culturalVariant="cultural"
            tradition={key as any}
            size="sm"
            variant={selectedTradition === key ? 'primary' : 'outline'}
            onClick={() => setSelectedTradition(key as any)}
          >
            {emoji} {label}
          </Button>
        ))}
      </div>

      {/* Design Tokens Demo */}
      {activeDemo === 'tokens' && (
        <section style={sectionStyle}>
          <h2 style={headingStyle}>🎨 Design Token System</h2>
          
          {/* Colors */}
          <div style={{ marginBottom: spacing[8] }}>
            <h3 style={subheadingStyle}>Cultural Colors ({selectedTradition})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: spacing[4] }}>
              {Object.entries(colors.regionalColors[selectedTradition]).map(([name, color]) => (
                <div 
                  key={name}
                  style={{
                    padding: spacing[4],
                    borderRadius: '8px',
                    background: color,
                    color: name === 'lotusWhite' ? colors.cultural.earthBrown : colors.cultural.lotusWhite,
                    textAlign: 'center',
                    fontSize: typography.fontSizes.sm,
                    fontWeight: typography.fontWeights.medium,
                    boxShadow: shadows.md,
                  }}
                >
                  <div>{name}</div>
                  <div style={{ opacity: 0.8, fontSize: typography.fontSizes.xs }}>
                    {color}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div style={{ marginBottom: spacing[8] }}>
            <h3 style={subheadingStyle}>Typography Scale</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {Object.entries(typography.scales.cultural).map(([name, scale]) => (
                <div 
                  key={name}
                  style={{
                    fontSize: scale.fontSize,
                    lineHeight: scale.lineHeight,
                    fontWeight: scale.fontWeight,
                    fontFamily: scale.fontFamily?.join(', ') || typography.fontFamilies.cultural.join(', '),
                    color: colors.cultural.earthBrown,
                    letterSpacing: scale.letterSpacing,
                  }}
                >
                  {name} - "Ketenangan batin datang dari dalam"
                </div>
              ))}
            </div>
          </div>

          {/* Shadows */}
          <div>
            <h3 style={subheadingStyle}>Cultural Shadows</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[4] }}>
              {Object.entries(shadows.regional[selectedTradition]).map(([name, shadow]) => (
                <div 
                  key={name}
                  style={{
                    padding: spacing[6],
                    background: colors.cultural.lotusWhite,
                    borderRadius: '12px',
                    boxShadow: shadow,
                    textAlign: 'center',
                    fontSize: typography.fontSizes.sm,
                    fontWeight: typography.fontWeights.medium,
                    color: colors.cultural.earthBrown,
                  }}
                >
                  {name} shadow
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Buttons Demo */}
      {activeDemo === 'buttons' && (
        <section style={sectionStyle}>
          <h2 style={headingStyle}>🔘 Cultural Button System</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing[8] }}>
            {/* Standard Variants */}
            <div>
              <h3 style={subheadingStyle}>Standard Variants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Destructive Button</Button>
              </div>
            </div>

            {/* Cultural Variants */}
            <div>
              <h3 style={subheadingStyle}>Cultural Variants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <CulturalButton tradition={selectedTradition}>Cultural Button</CulturalButton>
                <MeditationButton>Meditation Button</MeditationButton>
                <Button culturalVariant="traditional" tradition={selectedTradition}>
                  Traditional Button
                </Button>
                <Button culturalVariant="spiritual" tradition={selectedTradition}>
                  Spiritual Button
                </Button>
              </div>
            </div>

            {/* Regional Variants */}
            <div>
              <h3 style={subheadingStyle}>Regional Variants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <JavaneseButton>Javanese Style</JavaneseButton>
                <BalineseButton>Balinese Style</BalineseButton>
                <Button culturalVariant="cultural" tradition="sundanese">
                  Sundanese Style
                </Button>
                <Button culturalVariant="cultural" tradition="minang">
                  Minang Style
                </Button>
              </div>
            </div>

            {/* Sizes & States */}
            <div>
              <h3 style={subheadingStyle}>Sizes & States</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <CulturalButton size="xs" tradition={selectedTradition}>Extra Small</CulturalButton>
                <CulturalButton size="sm" tradition={selectedTradition}>Small</CulturalButton>
                <CulturalButton size="md" tradition={selectedTradition}>Medium</CulturalButton>
                <CulturalButton size="lg" tradition={selectedTradition}>Large</CulturalButton>
                <CulturalButton isLoading tradition={selectedTradition}>Loading State</CulturalButton>
                <CulturalButton isDisabled tradition={selectedTradition}>Disabled State</CulturalButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cards Demo */}
      {activeDemo === 'cards' && (
        <section style={sectionStyle}>
          <h2 style={headingStyle}>🏛️ Indonesian Card Components</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: spacing[6] }}>
            {/* Basic Cultural Card */}
            <IndonesianCard
              tradition={selectedTradition}
              title="Meditasi Tradisional"
              subtitle="Praktik spiritual Nusantara"
              culturalContext="Warisan budaya leluhur"
              isHoverable
            >
              <p style={{ margin: 0, lineHeight: '1.6' }}>
                Temukan ketenangan batin melalui praktik meditasi yang telah diwariskan 
                turun temurun dalam budaya Indonesia. Setiap tradisi memiliki keunikan 
                dan kearifan lokalnya sendiri.
              </p>
            </IndonesianCard>

            {/* Sacred Variant */}
            <SacredCard
              tradition={selectedTradition}
              title="Ruang Sakral"
              subtitle="Meditasi mendalam"
              size="md"
              ornamentPosition="all"
            >
              <div style={{ textAlign: 'center', color: colors.cultural.spiritualPurple }}>
                <div style={{ fontSize: '48px', marginBottom: spacing[3] }}>🕉️</div>
                <p style={{ margin: 0, fontStyle: 'italic' }}>
                  "Ketenangan sejati datang dari dalam. Temukan kedamaian 
                  melalui refleksi dan kontemplasi spiritual."
                </p>
              </div>
            </SacredCard>

            {/* Meditation Variant */}
            <MeditationCard
              title="Sesi Meditasi Aktif"
              subtitle="Timer dan panduan"
              size="lg"
              isClickable
              onClick={() => alert('Memulai sesi meditasi...')}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: spacing[3] }}>⏰</div>
                <p style={{ margin: 0, marginBottom: spacing[4] }}>
                  Sesi meditasi terpandu dengan timer dan musik tradisional.
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: typography.fontSizes.sm,
                  color: colors.meditation.focus,
                  fontWeight: typography.fontWeights.medium,
                }}>
                  <span>Durasi: 15 menit</span>
                  <span>Level: Pemula</span>
                </div>
              </div>
            </MeditationCard>

            {/* Regional Showcase */}
            <JavaneseCard
              variant="ornamental"
              title="Tradisi Jawa"
              subtitle="Meditation Lelaku"
              culturalContext="Kebijaksanaan Keraton"
              size="md"
            >
              <div>
                <p style={{ margin: 0, marginBottom: spacing[3] }}>
                  Lelaku adalah praktik spiritual Jawa yang mengutamakan keseimbangan 
                  antara pikiran, perasaan, dan tindakan.
                </p>
                <div style={{ 
                  fontSize: typography.fontSizes.sm, 
                  color: colors.cultural.templeGold,
                  fontWeight: typography.fontWeights.medium,
                }}>
                  ✨ Gamelan • 🎭 Wayang • 🏛️ Candi
                </div>
              </div>
            </JavaneseCard>

            <BalineseCard
              variant="elevated"
              title="Tradisi Bali"
              subtitle="Dharana Meditation"
              culturalContext="Spiritualitas Hindu-Bali"
              showPattern
            >
              <div>
                <p style={{ margin: 0, marginBottom: spacing[3] }}>
                  Dharana adalah praktik konsentrasi mendalam yang berasal dari 
                  tradisi yoga Bali, fokus pada kesatuan dengan alam.
                </p>
                <div style={{ 
                  fontSize: typography.fontSizes.sm, 
                  color: colors.cultural.sunsetOrange,
                  fontWeight: typography.fontWeights.medium,
                }}>
                  🌺 Pura • 🏔️ Gunung • 🌅 Sunrise
                </div>
              </div>
            </BalineseCard>

            {/* Interactive Demo Card */}
            <IndonesianCard
              tradition={selectedTradition}
              variant="default"
              title="Kartu Interaktif"
              subtitle="Klik untuk berinteraksi"
              isClickable
              onClick={() => {
                alert(`Anda memilih tradisi ${selectedTradition}! 
                
Dalam tradisi ini, Anda akan menemukan:
- Praktik meditasi unik
- Musik dan suara tradisional  
- Panduan spiritual kontekstual
- Ornamen budaya autentik`);
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: spacing[2] }}>
                  {selectedTradition === 'javanese' ? '🏛️' : 
                   selectedTradition === 'balinese' ? '🌺' :
                   selectedTradition === 'sundanese' ? '🎋' : '🏠'}
                </div>
                <p style={{ margin: 0, fontStyle: 'italic' }}>
                  Klik kartu ini untuk menjelajahi tradisi {selectedTradition} lebih dalam
                </p>
              </div>
            </IndonesianCard>
          </div>
        </section>
      )}

      {/* Meditation Timer Demo */}
      {activeDemo === 'meditation' && (
        <section style={sectionStyle}>
          <h2 style={headingStyle}>⏰ Meditation Timer System</h2>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: spacing[8],
          }}>
            {/* Main Timer */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={subheadingStyle}>Advanced Cultural Timer</h3>
              <MeditationTimer
                session={sampleSession}
                variant="cultural"
                size="lg"
                tradition={selectedTradition}
                showProgress
                progressType="circular"
                enableAudio
                onStart={() => console.log('Meditation started')}
                onComplete={(session, duration) => {
                  console.log('Meditation completed:', { session, duration });
                  alert(`Selamat! Anda telah menyelesaikan meditasi ${selectedTradition} selama ${Math.round(duration/60)} menit.`);
                }}
              />
            </div>

            {/* Timer Variants */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: spacing[6],
              width: '100%',
            }}>
              {/* Compact Timer */}
              <div style={{ textAlign: 'center' }}>
                <h4 style={{
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.medium,
                  color: colors.cultural.earthBrown,
                  marginBottom: spacing[3],
                }}>
                  Compact Size
                </h4>
                <MeditationTimer
                  session={{ ...sampleSession, duration: 60 }}
                  size="sm"
                  tradition={selectedTradition}
                  showProgress
                />
              </div>

              {/* Modern Timer */}
              <div style={{ textAlign: 'center' }}>
                <h4 style={{
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.medium,
                  color: colors.cultural.earthBrown,
                  marginBottom: spacing[3],
                }}>
                  Modern Variant
                </h4>
                <MeditationTimer
                  session={{ ...sampleSession, duration: 120 }}
                  variant="modern"
                  size="md"
                  showProgress={false}
                />
              </div>

              {/* Minimal Timer */}
              <div style={{ textAlign: 'center' }}>
                <h4 style={{
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.medium,
                  color: colors.cultural.earthBrown,
                  marginBottom: spacing[3],
                }}>
                  Minimal Style
                </h4>
                <MeditationTimer
                  session={{ ...sampleSession, duration: 180 }}
                  variant="minimal"
                  size="md"
                  showProgress
                  showMilliseconds
                />
              </div>
            </div>

            {/* Timer Features */}
            <div style={{ 
              background: colors.cultural.lotusWhite,
              padding: spacing[6],
              borderRadius: '16px',
              border: `2px solid ${colors.cultural.templeGold}`,
              maxWidth: '600px',
            }}>
              <h4 style={{
                fontSize: typography.fontSizes.xl,
                fontWeight: typography.fontWeights.semibold,
                color: colors.cultural.earthBrown,
                marginBottom: spacing[4],
                textAlign: 'center',
              }}>
                Timer Features
              </h4>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                fontSize: typography.fontSizes.base,
                lineHeight: '1.6',
              }}>
                {[
                  '🎵 Traditional chimes and sounds',
                  '🌸 Cultural breathing animations',
                  '⭕ Circular progress indicators',
                  '🎨 Regional color customization',
                  '⏯️ Play, pause, and reset controls',
                  '📊 Session progress tracking',
                  '🔊 Adjustable audio volume',
                  '♿ Full accessibility support',
                ].map((feature, index) => (
                  <li key={index} style={{ 
                    marginBottom: spacing[2],
                    color: colors.cultural.earthBrown,
                  }}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        marginTop: spacing[12],
        padding: spacing[8],
        borderTop: `1px solid ${colors.cultural.templeGold}`,
        background: colors.cultural.lotusWhite,
        borderRadius: '16px',
      }}>
        <h3 style={{
          fontSize: typography.fontSizes.xl,
          fontWeight: typography.fontWeights.semibold,
          color: colors.cultural.earthBrown,
          marginBottom: spacing[3],
        }}>
          🧘‍♀️ Sembalun Framework
        </h3>
        <p style={{
          fontSize: typography.fontSizes.base,
          color: colors.cultural.spiritualPurple,
          fontFamily: typography.fontFamilies.cultural.join(', '),
          fontStyle: 'italic',
          margin: 0,
        }}>
          "Menghubungkan teknologi modern dengan kearifan tradisional Indonesia"
        </p>
        <div style={{
          marginTop: spacing[4],
          display: 'flex',
          gap: spacing[4],
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <CulturalButton size="sm" tradition="javanese">🏛️ Javanese</CulturalButton>
          <CulturalButton size="sm" tradition="balinese">🌺 Balinese</CulturalButton>
          <CulturalButton size="sm" tradition="sundanese">🎋 Sundanese</CulturalButton>
          <CulturalButton size="sm" tradition="minang">🏠 Minang</CulturalButton>
        </div>
      </footer>
    </div>
  );
};

export default FrameworkDemo;