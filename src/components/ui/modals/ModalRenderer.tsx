import React, { useState, useEffect, useCallback } from 'react';
import { useModal, type ModalConfig, type ModalAnimation } from '../../../contexts/ModalContext';
import { useGestures } from '../../../hooks/useGestures';
import { ModalBackdrop } from './ModalBackdrop';

// Modal component registry
import { MeditationSessionModal } from './MeditationSessionModal';
import { BreathingGuideModal } from './BreathingGuideModal';
import { AchievementCelebrationModal } from './AchievementCelebrationModal';
import { ProgressInsightsModal } from './ProgressInsightsModal';
import { CommunityRoomModal } from './CommunityRoomModal';
import { PersonalizationModal } from './PersonalizationModal';
import { CulturalWisdomModal } from './CulturalWisdomModal';
import { MoodSelectorModal } from './MoodSelectorModal';
import { SessionCompleteModal } from './SessionCompleteModal';
import { SettingsModal } from './SettingsModal';
import { ProfileModal } from './ProfileModal';
import { AuthModal } from '../../auth/AuthModal';

// Animation configurations
const animationConfigs = {
  'slide-up': {
    initial: { transform: 'translateY(100%)', opacity: 0 },
    animate: { transform: 'translateY(0%)', opacity: 1 },
    exit: { transform: 'translateY(100%)', opacity: 0 },
    duration: 300,
  },
  'slide-down': {
    initial: { transform: 'translateY(-100%)', opacity: 0 },
    animate: { transform: 'translateY(0%)', opacity: 1 },
    exit: { transform: 'translateY(-100%)', opacity: 0 },
    duration: 300,
  },
  'slide-left': {
    initial: { transform: 'translateX(-100%)', opacity: 0 },
    animate: { transform: 'translateX(0%)', opacity: 1 },
    exit: { transform: 'translateX(-100%)', opacity: 0 },
    duration: 300,
  },
  'slide-right': {
    initial: { transform: 'translateX(100%)', opacity: 0 },
    animate: { transform: 'translateX(0%)', opacity: 1 },
    exit: { transform: 'translateX(100%)', opacity: 0 },
    duration: 300,
  },
  'fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    duration: 200,
  },
  'zoom': {
    initial: { transform: 'scale(0.8)', opacity: 0 },
    animate: { transform: 'scale(1)', opacity: 1 },
    exit: { transform: 'scale(0.8)', opacity: 0 },
    duration: 250,
  },
  'cultural-expand': {
    initial: { transform: 'scale(0.3) rotate(-5deg)', opacity: 0 },
    animate: { transform: 'scale(1) rotate(0deg)', opacity: 1 },
    exit: { transform: 'scale(0.3) rotate(5deg)', opacity: 0 },
    duration: 400,
  },
  'breathing-rhythm': {
    initial: { transform: 'scale(0.9)', opacity: 0 },
    animate: { transform: 'scale(1)', opacity: 1 },
    exit: { transform: 'scale(1.1)', opacity: 0 },
    duration: 600,
  },
};

// Modal component registry
const modalComponents = {
  'meditation-session': MeditationSessionModal,
  'breathing-guide': BreathingGuideModal,
  'achievement-celebration': AchievementCelebrationModal,
  'progress-insights': ProgressInsightsModal,
  'community-room': CommunityRoomModal,
  'personalization': PersonalizationModal,
  'cultural-wisdom': CulturalWisdomModal,
  'mood-selector': MoodSelectorModal,
  'session-complete': SessionCompleteModal,
  'settings': SettingsModal,
  'profile': ProfileModal,
  'auth': AuthModal,
  'custom': ({ children }: { children: React.ReactNode }) => <>{children}</>,
};

interface ModalContainerProps {
  config: ModalConfig;
  isActive: boolean;
  onClose: () => void;
}

const ModalContainer: React.FC<ModalContainerProps> = ({ config, isActive, onClose }) => {
  const [animationState, setAnimationState] = useState<'initial' | 'animate' | 'exit'>('initial');
  const [isVisible, setIsVisible] = useState(false);
  
  const animation = animationConfigs[config.animation || 'slide-up'];
  const ModalComponent = modalComponents[config.type];

  // Handle gestures for modal
  const { dragProps, swipeProps } = useGestures({
    onSwipeDown: config.gestureEnabled ? onClose : undefined,
    onSwipeLeft: config.gestureEnabled ? () => {
      // Handle gesture navigation if supported
    } : undefined,
    onSwipeRight: config.gestureEnabled ? () => {
      // Handle gesture navigation if supported
    } : undefined,
    threshold: 50,
  });

  // Animation lifecycle
  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      // Start animation after render
      const timer = setTimeout(() => {
        setAnimationState('animate');
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exit');
      // Hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        setAnimationState('initial');
      }, animation.duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, animation.duration]);

  if (!isVisible) return null;

  // Get current animation styles
  const getAnimationStyles = () => {
    const styles = animation[animationState];
    return {
      ...styles,
      transition: `all ${animation.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ zIndex: 1000 + (config.priority || 0) }}
    >
      {/* Backdrop */}
      {config.backdrop && (
        <ModalBackdrop 
          onClick={config.closable ? onClose : undefined}
          opacity={animationState === 'animate' ? 0.5 : 0}
          duration={animation.duration}
        />
      )}

      {/* Modal Content */}
      <div
        className="relative max-w-full max-h-full"
        style={getAnimationStyles()}
        {...(config.gestureEnabled ? { ...dragProps, ...swipeProps } : {})}
      >
        <ModalComponent
          isOpen={isActive}
          onClose={config.closable ? onClose : undefined}
          {...(config.props || {})}
        />
      </div>
    </div>
  );
};

export const ModalRenderer: React.FC = () => {
  const { modals, activeModal, closeModal } = useModal();

  const handleCloseModal = useCallback((id: string) => {
    closeModal(id);
  }, [closeModal]);

  return (
    <>
      {modals.map((modal) => (
        <ModalContainer
          key={modal.id}
          config={modal}
          isActive={modal.id === activeModal?.id}
          onClose={() => handleCloseModal(modal.id)}
        />
      ))}
    </>
  );
};

export default ModalRenderer;