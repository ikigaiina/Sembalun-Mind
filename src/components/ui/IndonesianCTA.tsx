import React from 'react';
import { motion } from 'framer-motion';
import type { CulturalData } from '../onboarding/CulturalPersonalizationScreen';

export type CTAVariant = 'respectful' | 'community' | 'spiritual' | 'gentle' | 'urgent' | 'family';
export type CTAStyle = 'primary' | 'secondary' | 'outline' | 'gradient';
export type CTASize = 'small' | 'medium' | 'large' | 'full';

interface IndonesianCTAProps {
  children?: React.ReactNode;
  variant?: CTAVariant;
  style?: CTAStyle;
  size?: CTASize;
  culturalContext?: Partial<CulturalData>;
  urgencyLevel?: 'none' | 'social' | 'time' | 'spiritual';
  localization?: 'formal' | 'casual' | 'regional';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  className?: string;
}

interface CTAContent {
  text: string;
  subtitle?: string;
  icon?: string;
}

const getIndonesianCTAContent = (
  variant: CTAVariant,
  culturalContext?: Partial<CulturalData>,
  urgencyLevel?: string,
  localization: 'formal' | 'casual' | 'regional' = 'casual'
): CTAContent => {
  const isIslamic = culturalContext?.spiritualTradition === 'islam';
  const isJavanese = culturalContext?.region?.includes('jawa') || culturalContext?.spiritualTradition === 'javanese';
  const isBali = culturalContext?.region === 'bali';
  const isCasual = localization === 'casual';

  const baseTexts = {
    respectful: {
      formal: isIslamic ? 'Bismillah, Mari Memulai' : 'Mari Memulai dengan Hormat',
      casual: isIslamic ? 'Bismillah, Yuk Mulai!' : 'Mari Mulai Bersama',
      regional: isJavanese ? 'Mangga Dipun Wiwiti' : isBali ? 'Rahayu, Mari Memulai' : 'Yuk Mulai!'
    },
    community: {
      formal: 'Bergabung dengan Komunitas Sembalun',
      casual: 'Gabung Sama Teman-Teman Lain',
      regional: isJavanese ? 'Nyawiji Kaliyan Kanca' : 'Bergabung dengan Komunitas'
    },
    spiritual: {
      formal: isIslamic ? 'Niatkan untuk Kebaikan' : 'Mulai Perjalanan Spiritual',
      casual: isIslamic ? 'Niat yang Baik, Yuk!' : 'Perjalanan Spiritual Dimulai!',
      regional: isJavanese ? 'Niyat Ingkang Sae' : isBali ? 'Om Swastyastu, Mari Mulai' : 'Perjalanan Spiritual'
    },
    gentle: {
      formal: 'Coba Saja Dulu',
      casual: 'Gak Papa, Coba Aja!',
      regional: isJavanese ? 'Dicoba Riyin Mawon' : 'Coba Aja Dulu'
    },
    urgent: {
      formal: urgencyLevel === 'spiritual' ? 'Momen Spiritual yang Tepat' : 'Kesempatan Terbatas',
      casual: urgencyLevel === 'social' ? 'Teman-Teman Udah Duluan!' : urgencyLevel === 'time' ? 'Jangan Sampai Kehabisan!' : 'Buruan, Terbatas!',
      regional: 'Enggal-Enggal!'
    },
    family: {
      formal: 'Bagikan dengan Keluarga',
      casual: 'Ajak Keluarga Juga Yuk!',
      regional: isJavanese ? 'Kaliyan Kulawarga' : 'Bareng Keluarga'
    }
  };

  const selectedText = baseTexts[variant]?.[localization] || baseTexts[variant]?.casual || baseTexts.respectful.casual;

  // Add urgency subtitles
  const urgencySubtitles = {
    social: culturalContext?.region === 'jakarta' ? 
      `${Math.floor(Math.random() * 50 + 50)}+ orang Jakarta sudah bergabung` :
      `${Math.floor(Math.random() * 100 + 100)}+ orang Indonesia sudah merasakan`,
    time: 'Sesi khusus berakhir dalam 2 jam',
    spiritual: isIslamic ? 'Barakallahu fiik' : 'Berkah untuk perjalananmu',
    none: undefined
  };

  return {
    text: selectedText,
    subtitle: urgencyLevel && urgencyLevel !== 'none' ? urgencySubtitles[urgencyLevel as keyof typeof urgencySubtitles] : undefined,
    icon: getVariantIcon(variant, culturalContext)
  };
};

const getVariantIcon = (variant: CTAVariant, culturalContext?: Partial<CulturalData>): string => {
  const isIslamic = culturalContext?.spiritualTradition === 'islam';
  const isBali = culturalContext?.region === 'bali';
  
  const icons = {
    respectful: isIslamic ? '☪️' : isBali ? '🕉️' : '🙏',
    community: '👥',
    spiritual: isIslamic ? '🤲' : isBali ? '🪷' : '🌟',
    gentle: '😊',
    urgent: '⚡',
    family: '👨‍👩‍👧‍👦'
  };
  
  return icons[variant] || '🌟';
};

const getStyleClasses = (style: CTAStyle, size: CTASize): string => {
  const sizeClasses = {
    small: 'py-2 px-4 text-sm',
    medium: 'py-3 px-6 text-base',
    large: 'py-4 px-8 text-lg',
    full: 'py-4 px-6 text-base w-full'
  };

  const baseClasses = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2';

  const styleClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-accent-600 text-white hover:bg-accent-700 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700',
    gradient: 'bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 text-white hover:from-primary-700 hover:to-accent-700 shadow-lg hover:shadow-xl'
  };

  return `${baseClasses} ${sizeClasses[size]} ${styleClasses[style]}`;
};

const IndonesianCTA: React.FC<IndonesianCTAProps> = ({
  children,
  variant = 'respectful',
  style = 'primary',
  size = 'medium',
  culturalContext,
  urgencyLevel = 'none',
  localization = 'casual',
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = ''
}) => {
  const ctaContent = getIndonesianCTAContent(variant, culturalContext, urgencyLevel, localization);
  const displayIcon = icon || ctaContent.icon;
  const displayText = children || ctaContent.text;

  return (
    <div className="space-y-2">
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          ${getStyleClasses(style, size)}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
        ) : (
          <>
            {displayIcon && <span className="text-lg">{displayIcon}</span>}
            <span>{displayText}</span>
          </>
        )}
      </motion.button>

      {ctaContent.subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-gray-600 text-center"
        >
          {ctaContent.subtitle}
        </motion.p>
      )}
    </div>
  );
};

// Predefined common Indonesian CTAs
export const IndonesianCTAVariants = {
  StartJourney: (props: Partial<IndonesianCTAProps>) => (
    <IndonesianCTA variant="spiritual" style="gradient" size="large" {...props}>
      Mulai Perjalanan Spiritual Saya
    </IndonesianCTA>
  ),

  TryFirst: (props: Partial<IndonesianCTAProps>) => (
    <IndonesianCTA variant="gentle" style="outline" size="medium" {...props}>
      Rasakan 5 Menit Pertama
    </IndonesianCTA>
  ),

  JoinCommunity: (props: Partial<IndonesianCTAProps>) => (
    <IndonesianCTA variant="community" style="secondary" size="medium" {...props}>
      Gabung Komunitas Indonesia
    </IndonesianCTA>
  ),

  ShareBlessing: (props: Partial<IndonesianCTAProps>) => (
    <IndonesianCTA variant="family" style="outline" size="small" {...props}>
      Bagikan Keberkahan Ini
    </IndonesianCTA>
  ),

  LimitedOffer: (props: Partial<IndonesianCTAProps>) => (
    <IndonesianCTA 
      variant="urgent" 
      style="gradient" 
      size="large" 
      urgencyLevel="social"
      {...props}
    >
      Bergabung Sekarang!
    </IndonesianCTA>
  ),

  GentleSkip: (props: Partial<IndonesianCTAProps>) => (
    <IndonesianCTA variant="gentle" style="outline" size="small" {...props}>
      Nanti Saja
    </IndonesianCTA>
  )
};

// Hook for cultural CTA optimization
export const useCulturalCTA = (culturalContext?: Partial<CulturalData>) => {
  const getOptimalVariant = (action: 'start' | 'try' | 'join' | 'share'): CTAVariant => {
    const isIslamic = culturalContext?.spiritualTradition === 'islam';
    const familyOriented = culturalContext?.familyContext === 'family-supportive';

    switch (action) {
      case 'start':
        return isIslamic ? 'spiritual' : 'respectful';
      case 'try':
        return 'gentle';
      case 'join':
        return 'community';
      case 'share':
        return familyOriented ? 'family' : 'community';
      default:
        return 'respectful';
    }
  };

  const getOptimalLocalization = (): 'formal' | 'casual' | 'regional' => {
    if (culturalContext?.region?.includes('jawa')) return 'regional';
    if (culturalContext?.spiritualTradition === 'islam') return 'formal';
    return 'casual';
  };

  return {
    getOptimalVariant,
    getOptimalLocalization,
    culturalContext
  };
};

export default IndonesianCTA;