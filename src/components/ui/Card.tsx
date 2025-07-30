
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'medium',
  onClick,
  onMouseEnter,
  onMouseLeave,
  style
}) => {
  const paddingClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  return (
    <div 
      className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 transition-all duration-300 transform-gpu ${paddingClasses[padding]} ${className} ${onClick ? 'cursor-pointer hover-lift hover-glow' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
    >
      {children}
    </div>
  );
};