import React from 'react';
import { Card } from './Card';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = 'md',
  animate = true
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  return (
    <div
      className={`
        bg-gray-200 
        ${animate ? 'animate-pulse' : ''}
        ${roundedClasses[rounded]}
        ${className}
      `}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  );
};

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen p-4 max-w-md mx-auto space-y-6">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton height="1.5rem" width="60%" />
      <Skeleton height="1rem" width="80%" />
    </div>

    {/* Mood selector skeleton */}
    <Card>
      <div className="space-y-4">
        <Skeleton height="1rem" width="70%" />
        <div className="flex justify-between">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} width="3rem" height="3rem" rounded="full" />
          ))}
        </div>
      </div>
    </Card>

    {/* Stats card skeleton */}
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton height="1.25rem" width="60%" />
            <Skeleton height="0.875rem" width="80%" />
          </div>
          <Skeleton width="2.5rem" height="2.5rem" rounded="full" />
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton height="1.5rem" width="2rem" className="mx-auto" />
              <Skeleton height="0.75rem" width="100%" />
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* Main session card skeleton */}
    <Card>
      <div className="space-y-4">
        <Skeleton height="1.25rem" width="50%" />
        <Skeleton height="1rem" width="80%" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton width="2.5rem" height="2.5rem" rounded="full" />
            <div className="space-y-2">
              <Skeleton height="0.875rem" width="4rem" />
              <Skeleton height="0.75rem" width="6rem" />
            </div>
          </div>
        </div>
        <Skeleton height="3rem" width="100%" rounded="lg" />
      </div>
    </Card>

    {/* Quick access grid skeleton */}
    <div className="space-y-4">
      <Skeleton height="1.25rem" width="50%" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} padding="medium">
            <div className="text-center space-y-3">
              <Skeleton width="3rem" height="3rem" rounded="lg" className="mx-auto" />
              <div className="space-y-2">
                <Skeleton height="0.875rem" width="60%" className="mx-auto" />
                <Skeleton height="0.75rem" width="80%" className="mx-auto" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Meditation Session Skeleton
export const MeditationSessionSkeleton: React.FC = () => (
  <div className="min-h-screen p-4 max-w-md mx-auto space-y-6">
    <div className="text-center space-y-4">
      <Skeleton height="2rem" width="60%" className="mx-auto" />
      <Skeleton height="1rem" width="80%" className="mx-auto" />
    </div>

    <Card>
      <div className="text-center space-y-6">
        <Skeleton width="8rem" height="8rem" rounded="full" className="mx-auto" />
        <div className="space-y-2">
          <Skeleton height="3rem" width="80%" className="mx-auto" />
          <div className="flex justify-center space-x-4">
            <Skeleton width="3rem" height="1rem" />
            <Skeleton width="3rem" height="1rem" />
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <Skeleton width="4rem" height="4rem" rounded="full" />
          <Skeleton width="4rem" height="4rem" rounded="full" />
          <Skeleton width="4rem" height="4rem" rounded="full" />
        </div>
      </div>
    </Card>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="min-h-screen p-4 max-w-md mx-auto space-y-6">
    {/* Profile header */}
    <Card>
      <div className="text-center space-y-4">
        <Skeleton width="5rem" height="5rem" rounded="full" className="mx-auto" />
        <div className="space-y-2">
          <Skeleton height="1.5rem" width="40%" className="mx-auto" />
          <Skeleton height="1rem" width="60%" className="mx-auto" />
        </div>
      </div>
    </Card>

    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <div className="text-center space-y-2">
            <Skeleton height="2rem" width="3rem" className="mx-auto" />
            <Skeleton height="0.875rem" width="80%" className="mx-auto" />
          </div>
        </Card>
      ))}
    </div>

    {/* Menu items */}
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} padding="medium">
          <div className="flex items-center space-x-3">
            <Skeleton width="2.5rem" height="2.5rem" rounded="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton height="1rem" width="60%" />
              <Skeleton height="0.875rem" width="80%" />
            </div>
            <Skeleton width="1rem" height="1rem" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// Content Library Skeleton
export const ContentLibrarySkeleton: React.FC = () => (
  <div className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
    {/* Header */}
    <div className="space-y-4">
      <Skeleton height="2rem" width="50%" />
      <Skeleton height="1rem" width="70%" />
    </div>

    {/* Search and filters */}
    <div className="space-y-4">
      <Skeleton height="3rem" width="100%" rounded="lg" />
      <div className="flex space-x-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height="2rem" width="5rem" rounded="full" />
        ))}
      </div>
    </div>

    {/* Content grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <Card key={i}>
          <div className="space-y-4">
            <Skeleton height="8rem" width="100%" rounded="lg" />
            <div className="space-y-2">
              <Skeleton height="1.25rem" width="80%" />
              <Skeleton height="1rem" width="100%" />
              <Skeleton height="1rem" width="60%" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton height="0.875rem" width="4rem" />
              <Skeleton height="0.875rem" width="3rem" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-3 p-4">
    <Skeleton width="3rem" height="3rem" rounded="full" />
    <div className="flex-1 space-y-2">
      <Skeleton height="1rem" width="70%" />
      <Skeleton height="0.875rem" width="50%" />
    </div>
    <Skeleton width="1rem" height="1rem" />
  </div>
);

// Card Skeleton
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <Card>
    <div className="space-y-3">
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i} 
          height="1rem" 
          width={i === lines - 1 ? '60%' : '100%'} 
        />
      ))}
    </div>
  </Card>
);

// Text Skeleton
export const TextSkeleton: React.FC<{ 
  lines?: number; 
  className?: string; 
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <Skeleton 
        key={i} 
        height="1rem" 
        width={i === lines - 1 ? '75%' : '100%'} 
      />
    ))}
  </div>
);

// Loading component with message
export const LoadingSpinner: React.FC<{ 
  message?: string; 
  size?: 'sm' | 'md' | 'lg';
}> = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-primary ${sizeClasses[size]}`} />
      <p className="text-gray-600 font-body text-sm">{message}</p>
    </div>
  );
};

export default Skeleton;