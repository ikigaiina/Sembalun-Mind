
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'medium' 
}) => {
  const paddingClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};