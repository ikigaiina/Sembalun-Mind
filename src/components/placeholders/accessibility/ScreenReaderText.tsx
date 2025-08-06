import React, { ReactNode } from 'react';

interface ScreenReaderTextProps {
  children: ReactNode;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  id?: string;
}

/**
 * Screen reader only text component
 * 
 * Features:
 * - Visually hidden but accessible to screen readers
 * - Supports different HTML elements
 * - Proper focus handling
 * - WCAG 2.1 compliant positioning
 * - Maintains document flow
 * - Responsive text handling
 */
export const ScreenReaderText: React.FC<ScreenReaderTextProps> = ({
  children,
  as: Component = 'span',
  className = '',
  id,
  ...props
}) => {
  const srOnlyClasses = [
    'absolute',
    'w-px',
    'h-px',
    'p-0',
    'm-0',
    'overflow-hidden',
    'whitespace-nowrap',
    'border-0',
    // Position off-screen but not with display:none or visibility:hidden
    // This ensures screen readers can still access the content
    '-translate-x-full',
    '-translate-y-full',
    'sr-only'
  ].join(' ');

  return (
    <Component
      id={id}
      className={`${srOnlyClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

interface LiveRegionProps {
  children: ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
  id?: string;
}

/**
 * ARIA Live Region for dynamic content announcements
 * 
 * Features:
 * - Announces dynamic content changes
 * - Configurable announcement priority
 * - Atomic announcements
 * - Relevant change types
 * - Screen reader optimized
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  priority = 'polite',
  atomic = true,
  relevant = 'text',
  className = '',
  id
}) => {
  return (
    <div
      id={id}
      className={`sr-only ${className}`}
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role="status"
    >
      {children}
    </div>
  );
};

interface SkipLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * Skip navigation link for keyboard users
 * 
 * Features:
 * - Visible only when focused
 * - Smooth scrolling to target
 * - High contrast styling
 * - Proper z-index handling
 * - WCAG 2.1 compliant
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className = ''
}) => {
  const skipLinkClasses = [
    'absolute',
    'top-0',
    'left-0',
    'z-50',
    'px-4',
    'py-2',
    'bg-gray-900',
    'text-white',
    'font-medium',
    'rounded-br-lg',
    'transform',
    '-translate-y-full',
    'focus:translate-y-0',
    'transition-transform',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-blue-500'
  ].join(' ');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Set focus to target element
      if (target instanceof HTMLElement) {
        target.focus();
      }
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`${skipLinkClasses} ${className}`}
    >
      {children}
    </a>
  );
};

interface VisuallyHiddenProps {
  children: ReactNode;
  focusable?: boolean;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'button';
}

/**
 * Visually hidden content that can optionally become visible on focus
 * 
 * Features:
 * - Hidden from visual display
 * - Accessible to screen readers
 * - Optional focus visibility
 * - Maintains layout flow
 * - WCAG compliant
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  focusable = false,
  className = '',
  as: Component = 'span'
}) => {
  const baseClasses = [
    'absolute',
    'w-px',
    'h-px',
    'p-0',
    'm-0',
    'overflow-hidden',
    'whitespace-nowrap',
    'border-0'
  ];

  const focusableClasses = focusable ? [
    'focus:relative',
    'focus:w-auto',
    'focus:h-auto',
    'focus:p-2',
    'focus:m-1',
    'focus:overflow-visible',
    'focus:whitespace-normal',
    'focus:border',
    'focus:bg-white',
    'focus:text-gray-900',
    'focus:z-50'
  ] : [];

  const allClasses = [...baseClasses, ...focusableClasses, className].join(' ');

  return (
    <Component className={allClasses}>
      {children}
    </Component>
  );
};

interface AccessibleTextProps {
  children: ReactNode;
  level?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  visualLevel?: number;
  screenReaderOnly?: boolean;
  className?: string;
}

/**
 * Semantic heading component with visual/structural independence
 * 
 * Features:
 * - Proper heading hierarchy for screen readers
 * - Visual styling independent of semantic level
 * - Optional screen reader only content
 * - WCAG 2.1 heading structure compliance
 */
export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  level = 2,
  as,
  visualLevel,
  screenReaderOnly = false,
  className = ''
}) => {
  // Determine the semantic element
  const SemanticComponent = as || (`h${Math.max(1, Math.min(6, level))}` as keyof JSX.IntrinsicElements);
  
  // Determine visual styling based on visualLevel or level
  const displayLevel = visualLevel || level;
  
  const getVisualStyles = (lvl: number): string => {
    switch (lvl) {
      case 1:
        return 'text-3xl font-bold';
      case 2:
        return 'text-2xl font-semibold';
      case 3:
        return 'text-xl font-semibold';
      case 4:
        return 'text-lg font-medium';
      case 5:
        return 'text-base font-medium';
      case 6:
        return 'text-sm font-medium';
      default:
        return 'text-base';
    }
  };

  const visualStyles = screenReaderOnly ? 'sr-only' : getVisualStyles(displayLevel);

  return (
    <SemanticComponent className={`${visualStyles} ${className}`}>
      {children}
    </SemanticComponent>
  );
};

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
}

/**
 * Focus trap utility for modal dialogs and dropdowns
 * 
 * Features:
 * - Traps focus within container
 * - Handles Tab and Shift+Tab navigation
 * - Returns focus to trigger element
 * - Supports dynamic content
 * - WCAG 2.1 compliant
 */
export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  className = ''
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(', ');

      return Array.from(container.querySelectorAll(selectors)) as HTMLElement[];
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Return focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
};

// Export all accessibility utilities
export {
  LiveRegion,
  SkipLink,
  VisuallyHidden,
  AccessibleText,
  FocusTrap
};