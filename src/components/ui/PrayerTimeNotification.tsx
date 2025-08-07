import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Pause, Play } from 'lucide-react';
import { Card } from './Card';
import IndonesianCTA from './IndonesianCTA';
import { usePrayerTimeIntegration } from '../../hooks/usePrayerTimeIntegration';

interface PrayerTimeNotificationProps {
  onPauseMeditation?: () => void;
  onResumeMeditation?: () => void;
  onStartDzikr?: () => void;
  className?: string;
}

export const PrayerTimeNotification: React.FC<PrayerTimeNotificationProps> = ({
  onPauseMeditation,
  onResumeMeditation,
  onStartDzikr,
  className = ''
}) => {
  const {
    isEnabled,
    prayerContext,
    getPrayerTimeRecommendation,
    getPostPrayerRecommendation
  } = usePrayerTimeIntegration();

  if (!isEnabled) return null;

  const prayerRecommendation = getPrayerTimeRecommendation();
  const postPrayerRecommendation = getPostPrayerRecommendation();

  // Don't show if no prayer context
  if (!prayerRecommendation && !postPrayerRecommendation) return null;

  const renderCurrentPrayerNotification = () => {
    if (!prayerRecommendation || prayerRecommendation.type !== 'current_prayer') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`${className}`}
      >
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 shadow-lg">
          <div className="flex items-center space-x-4">
            {/* Prayer icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🕌</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-green-800">
                  {prayerRecommendation.title}
                </h3>
              </div>
              
              <p className="text-sm text-green-700 mb-3">
                {prayerRecommendation.message}
              </p>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {onPauseMeditation && (
                  <IndonesianCTA
                    variant="spiritual"
                    style="outline"
                    size="small"
                    onClick={onPauseMeditation}
                    className="!border-green-300 !text-green-700 hover:!bg-green-100"
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Jeda Meditasi
                  </IndonesianCTA>
                )}

                <IndonesianCTA
                  variant="spiritual"
                  style="primary"
                  size="small"
                  className="!bg-green-600 hover:!bg-green-700"
                >
                  Sholat Sekarang
                </IndonesianCTA>
              </div>
            </div>

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 text-green-500 hover:text-green-700 p-1"
            >
              ✕
            </motion.button>
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderUpcomingPrayerNotification = () => {
    if (!prayerRecommendation || prayerRecommendation.type !== 'upcoming_prayer') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`${className}`}
      >
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 shadow-md">
          <div className="flex items-center space-x-4">
            {/* Prayer icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                {prayerRecommendation.title}
              </h3>
              
              <p className="text-xs text-amber-700">
                {prayerRecommendation.message}
              </p>
            </div>

            {/* Reminder toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 text-amber-600 hover:text-amber-800 text-xs"
            >
              Ingatkan
            </motion.button>
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderPostPrayerRecommendation = () => {
    if (!postPrayerRecommendation) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`${className}`}
      >
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-md">
          <div className="flex items-center space-x-4">
            {/* Spiritual icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🤲</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                {postPrayerRecommendation.title}
              </h3>
              
              <p className="text-xs text-blue-700 mb-3">
                {postPrayerRecommendation.message}
              </p>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1">
                {postPrayerRecommendation.suggestions?.slice(0, 2).map((suggestion, index) => (
                  <IndonesianCTA
                    key={index}
                    variant="spiritual"
                    style="outline"
                    size="small"
                    onClick={suggestion === 'Dzikir 5 menit' ? onStartDzikr : undefined}
                    className="!border-blue-300 !text-blue-700 hover:!bg-blue-100 text-xs py-1 px-2"
                  >
                    {suggestion}
                  </IndonesianCTA>
                ))}
              </div>
            </div>

            {/* Resume meditation */}
            {onResumeMeditation && (
              <IndonesianCTA
                variant="gentle"
                style="outline"
                size="small"
                onClick={onResumeMeditation}
                className="flex-shrink-0 !border-blue-300 !text-blue-700 hover:!bg-blue-100"
              >
                <Play className="w-3 h-3 mr-1" />
                Lanjut
              </IndonesianCTA>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {prayerRecommendation?.type === 'current_prayer' && renderCurrentPrayerNotification()}
      {prayerRecommendation?.type === 'upcoming_prayer' && renderUpcomingPrayerNotification()}
      {postPrayerRecommendation && renderPostPrayerRecommendation()}
    </AnimatePresence>
  );
};

// Hook for easy integration with meditation sessions
export const usePrayerTimeAwareMeditation = () => {
  const { 
    shouldMute, 
    shouldAdjustMeditationSchedule,
    getPrayerTimeRecommendation,
    prayerContext
  } = usePrayerTimeIntegration();

  const shouldPauseMeditation = () => {
    return prayerContext.isPrayerTime;
  };

  const shouldLowerVolume = () => {
    return prayerContext.isNearPrayerTime;
  };

  const getMeditationAdjustments = () => {
    const recommendation = getPrayerTimeRecommendation();
    
    if (recommendation?.type === 'current_prayer') {
      return {
        action: 'pause',
        reason: 'Waktu sholat telah tiba',
        suggestion: 'Lanjutkan setelah sholat untuk meditasi yang lebih khusyuk'
      };
    }

    if (recommendation?.type === 'upcoming_prayer') {
      return {
        action: 'shorten',
        reason: `${recommendation.title}`,
        suggestion: 'Sebaiknya selesaikan sesi ini dalam 10 menit'
      };
    }

    return null;
  };

  return {
    shouldMute,
    shouldPauseMeditation,
    shouldLowerVolume,
    shouldAdjustMeditationSchedule,
    getMeditationAdjustments
  };
};

export default PrayerTimeNotification;