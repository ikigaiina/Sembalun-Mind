import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { getSyncedProgress } from '../utils/progressSync';
import { 
  getScaledProgress, 
  updateScalingConfig, 
  predictFutureMilestones,
  type ScaledProgress,
  type ScalingConfig 
} from '../utils/progressScaling';

/**
 * Hook untuk mengelola progress scaling secara otomatis
 */
export const useProgressScaling = () => {
  const { userProfile } = useAuth();
  const [scalingConfig, setScalingConfig] = useState<ScalingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get base progress
  const baseProgress = useMemo(() => {
    return getSyncedProgress(userProfile);
  }, [userProfile]);
  
  // Get scaled progress
  const scaledProgress = useMemo((): ScaledProgress => {
    if (!scalingConfig) {
      // Return basic scaled progress with default config while loading
      return getScaledProgress(baseProgress);
    }
    return getScaledProgress(baseProgress, scalingConfig);
  }, [baseProgress, scalingConfig]);
  
  // Predict future milestones
  const futureMilestones = useMemo(() => {
    return predictFutureMilestones(baseProgress, 30);
  }, [baseProgress]);
  
  // Load and update scaling configuration
  useEffect(() => {
    const loadScalingConfig = async () => {
      try {
        setIsLoading(true);
        
        // In real app, fetch from API or local storage
        const savedConfig = localStorage.getItem('sembalun-scaling-config');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setScalingConfig(config);
        }
        
        // Simulate fetching user metrics and updating config
        const mockUserMetrics = {
          totalUsers: 1000,
          averageSessionsPerUser: baseProgress.totalSessions || 5,
          retentionRate: 0.75,
          engagementScore: 0.8
        };
        
        const defaultConfig = {
          sessionMultiplier: 1.0,
          timeMultiplier: 1.0,
          streakMultiplier: 1.2,
          beginnerThreshold: 10,
          intermediateThreshold: 50,
          advancedThreshold: 200,
          userGrowthFactor: 1.1,
          engagementBonus: 1.15,
          consistencyReward: 1.25
        };
        
        const updatedConfig = updateScalingConfig(
          savedConfig ? JSON.parse(savedConfig) : defaultConfig,
          mockUserMetrics
        );
        
        setScalingConfig(updatedConfig);
        
        // Save updated config
        localStorage.setItem('sembalun-scaling-config', JSON.stringify(updatedConfig));
        
      } catch (error) {
        console.error('Error loading scaling config:', error);
        // Fallback to default
        const defaultConfig = {
          sessionMultiplier: 1.0,
          timeMultiplier: 1.0,
          streakMultiplier: 1.2,
          beginnerThreshold: 10,
          intermediateThreshold: 50,
          advancedThreshold: 200,
          userGrowthFactor: 1.1,
          engagementBonus: 1.15,
          consistencyReward: 1.25
        };
        setScalingConfig(defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadScalingConfig();
  }, [baseProgress.totalSessions]);
  
  // Function to manually update scaling config
  const updateConfig = (newConfig: Partial<ScalingConfig>) => {
    if (scalingConfig) {
      const updated = { ...scalingConfig, ...newConfig };
      setScalingConfig(updated);
      localStorage.setItem('sembalun-scaling-config', JSON.stringify(updated));
    }
  };
  
  // Get next milestone info for UI display
  const getNextMilestoneInfo = () => {
    const { nextMilestone } = scaledProgress;
    const remaining = nextMilestone.target - nextMilestone.current;
    
    const descriptions = {
      sessions: `${remaining} sessions to go`,
      minutes: `${remaining} minutes to go`,
      streak: `${remaining} days to go`
    };
    
    return {
      ...nextMilestone,
      remaining,
      description: descriptions[nextMilestone.type],
      isCloseToCompletion: nextMilestone.progress >= 80
    };
  };
  
  // Get scaling insights for analytics
  const getScalingInsights = () => {
    const { scalingLevel, level } = scaledProgress;
    
    return {
      currentLevel: level,
      scalingLevel,
      isScaling: scalingLevel > 3,
      performanceCategory: scalingLevel <= 2 ? 'New User' :
                          scalingLevel <= 5 ? 'Regular User' :
                          scalingLevel <= 8 ? 'Power User' : 'Expert User',
      unlockableFeatures: getUnlockableFeatures(scalingLevel),
      personalizedTips: scaledProgress.recommendations
    };
  };
  
  // Get features that can be unlocked at different scaling levels
  const getUnlockableFeatures = (level: number) => {
    const features = [];
    
    if (level >= 3) features.push('Advanced Analytics');
    if (level >= 5) features.push('Custom Meditation Programs');
    if (level >= 7) features.push('Community Features');
    if (level >= 9) features.push('Mentor Program Access');
    if (level >= 12) features.push('Expert-Level Content');
    
    return features;
  };
  
  // Check if user qualifies for advanced features
  const checkFeatureAccess = (featureName: string) => {
    const { scalingLevel } = scaledProgress;
    
    const featureRequirements = {
      'advanced-analytics': 3,
      'custom-programs': 5,
      'community-features': 7,
      'mentor-program': 9,
      'expert-content': 12
    };
    
    const requiredLevel = featureRequirements[featureName.toLowerCase().replace(/\s/g, '-')];
    return scalingLevel >= (requiredLevel || 999);
  };
  
  return {
    // Core data
    baseProgress,
    scaledProgress,
    futureMilestones,
    scalingConfig,
    isLoading,
    
    // Helper functions
    updateConfig,
    getNextMilestoneInfo,
    getScalingInsights,
    checkFeatureAccess,
    
    // Quick access properties
    level: scaledProgress.level,
    scalingLevel: scaledProgress.scalingLevel,
    recommendations: scaledProgress.recommendations,
    adaptiveGoals: scaledProgress.adaptiveGoals,
    nextMilestone: scaledProgress.nextMilestone
  };
};