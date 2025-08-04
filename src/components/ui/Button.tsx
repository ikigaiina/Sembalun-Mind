
import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  style = {}
}) => {
  const baseClasses = 'rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'text-white shadow-lg',
    secondary: 'text-gray-800 shadow-md',
    outline: 'border-2 text-white',
    destructive: 'text-white shadow-lg'
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: 'var(--color-primary)' };
      case 'secondary':
        return { backgroundColor: 'var(--color-accent)' };
      case 'outline':
        return { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' };
      case 'destructive':
        return { backgroundColor: '#dc2626' }; // red-600
      default:
        return {};
    }
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={{ ...getVariantStyle(), ...style }}
      disabled={disabled}
      onClick={(e) => onClick?.(e)}
    >
      {children}
    </button>
  );
};