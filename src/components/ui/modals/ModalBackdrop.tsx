import React from 'react';

interface ModalBackdropProps {
  onClick?: () => void;
  opacity?: number;
  duration?: number;
  blur?: boolean;
  gradient?: boolean;
}

export const ModalBackdrop: React.FC<ModalBackdropProps> = ({
  onClick,
  opacity = 0.5,
  duration = 300,
  blur = false,
  gradient = true,
}) => {
  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: -1,
    opacity,
    transition: `opacity ${duration}ms ease-in-out`,
    cursor: onClick ? 'pointer' : 'default',
  };

  if (gradient) {
    backdropStyles.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(147, 51, 234, 0.2) 100%)';
  } else {
    backdropStyles.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
  }

  if (blur) {
    backdropStyles.backdropFilter = 'blur(8px)';
    backdropStyles.WebkitBackdropFilter = 'blur(8px)';
  }

  return (
    <div
      style={backdropStyles}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? -1 : undefined}
      aria-label={onClick ? 'Close modal' : undefined}
    />
  );
};

export default ModalBackdrop;