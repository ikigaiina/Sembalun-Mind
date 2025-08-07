import { useState, useEffect, useCallback } from 'react';
import { usePersonalization } from '../contexts/PersonalizationContext';

interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
  description: string;
}

interface PrayerSchedule {
  date: string;
  prayers: PrayerTime[];
  location: {
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

interface PrayerTimeContext {
  currentPrayer?: PrayerTime;
  nextPrayer?: PrayerTime;
  timeToNext: number; // minutes
  isNearPrayerTime: boolean; // within 30 minutes
  isPrayerTime: boolean; // within 10 minutes
  shouldMute: boolean; // during prayer time
}

// Default prayer times for major Indonesian cities (approximate)
const defaultPrayerTimes: Record<string, PrayerTime[]> = {
  jakarta: [
    { name: 'Subuh', time: '04:35', arabicName: 'الفجر', description: 'Fajar menyingsing, waktu refleksi diri' },
    { name: 'Dzuhur', time: '12:05', arabicName: 'الظهر', description: 'Tengah hari, jeda untuk berdzikir' },
    { name: 'Ashar', time: '15:20', arabicName: 'العصر', description: 'Sore menjelang, waktu untuk bersyukur' },
    { name: 'Maghrib', time: '18:15', arabicName: 'المغرب', description: 'Matahari terbenam, momen renungan' },
    { name: 'Isya', time: '19:30', arabicName: 'العشاء', description: 'Malam tiba, persiapan istirahat' }
  ],
  surabaya: [
    { name: 'Subuh', time: '04:30', arabicName: 'الفجر', description: 'Fajar menyingsing, waktu refleksi diri' },
    { name: 'Dzuhur', time: '11:55', arabicName: 'الظهر', description: 'Tengah hari, jeda untuk berdzikir' },
    { name: 'Ashar', time: '15:15', arabicName: 'العصر', description: 'Sore menjelang, waktu untuk bersyukur' },
    { name: 'Maghrib', time: '18:10', arabicName: 'المغرب', description: 'Matahari terbenam, momen renungan' },
    { name: 'Isya', time: '19:25', arabicName: 'العشاء', description: 'Malam tiba, persiapan istirahat' }
  ],
  bandung: [
    { name: 'Subuh', time: '04:40', arabicName: 'الفجر', description: 'Fajar menyingsing, waktu refleksi diri' },
    { name: 'Dzuhur', time: '12:10', arabicName: 'الظهر', description: 'Tengah hari, jeda untuk berdzikir' },
    { name: 'Ashar', time: '15:25', arabicName: 'العصر', description: 'Sore menjelang, waktu untuk bersyukur' },
    { name: 'Maghrib', time: '18:20', arabicName: 'المغرب', description: 'Matahari terbenam, momen renungan' },
    { name: 'Isya', time: '19:35', arabicName: 'العشاء', description: 'Malam tiba, persiapan istirahat' }
  ],
  medan: [
    { name: 'Subuh', time: '05:15', arabicName: 'الفجر', description: 'Fajar menyingsing, waktu refleksi diri' },
    { name: 'Dzuhur', time: '12:30', arabicName: 'الظهر', description: 'Tengah hari, jeda untuk berdzikir' },
    { name: 'Ashar', time: '15:45', arabicName: 'العصر', description: 'Sore menjelang, waktu untuk bersyukur' },
    { name: 'Maghrib', time: '18:35', arabicName: 'المغرب', description: 'Matahari terbenam, momen renungan' },
    { name: 'Isya', time: '19:50', arabicName: 'العشاء', description: 'Malam tiba, persiapan istirahat' }
  ]
};

export const usePrayerTimeIntegration = () => {
  const { personalization } = usePersonalization();
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerSchedule | null>(null);
  const [prayerContext, setPrayerContext] = useState<PrayerTimeContext>({
    timeToNext: 0,
    isNearPrayerTime: false,
    isPrayerTime: false,
    shouldMute: false
  });

  const isIslamic = personalization?.culturalData?.spiritualTradition === 'islam';
  const prayerTimeEnabled = personalization?.culturalData?.prayerTimeIntegration;

  // Get user's location for prayer times
  const getUserLocation = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.warn('Could not get user location for prayer times:', error);
      return null;
    }
  }, []);

  // Determine city from cultural data or location
  const getCityForPrayerTimes = useCallback(() => {
    const region = personalization?.culturalData?.region;
    
    if (region === 'jakarta') return 'jakarta';
    if (region === 'jawa-timur') return 'surabaya';
    if (region === 'jawa-barat') return 'bandung';
    if (region === 'sumatra') return 'medan';
    
    // Default to Jakarta if region not specified
    return 'jakarta';
  }, [personalization?.culturalData?.region]);

  // Calculate time difference in minutes
  const getMinutesToTime = useCallback((timeString: string): number => {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);
    
    // If prayer time has passed today, consider tomorrow
    if (prayerTime < now) {
      prayerTime.setDate(prayerTime.getDate() + 1);
    }
    
    return Math.floor((prayerTime.getTime() - now.getTime()) / (1000 * 60));
  }, []);

  // Get current prayer context
  const updatePrayerContext = useCallback(() => {
    if (!prayerSchedule || !isIslamic || !prayerTimeEnabled) {
      setPrayerContext({
        timeToNext: 0,
        isNearPrayerTime: false,
        isPrayerTime: false,
        shouldMute: false
      });
      return;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let currentPrayer: PrayerTime | undefined;
    let nextPrayer: PrayerTime | undefined;
    let timeToNext = 0;

    // Find current and next prayer
    for (let i = 0; i < prayerSchedule.prayers.length; i++) {
      const prayer = prayerSchedule.prayers[i];
      const minutesToPrayer = getMinutesToTime(prayer.time);
      
      if (minutesToPrayer <= 10 && minutesToPrayer >= -15) {
        // Currently in prayer time window (10 min before to 15 min after)
        currentPrayer = prayer;
      }
      
      if (minutesToPrayer > 0) {
        nextPrayer = prayer;
        timeToNext = minutesToPrayer;
        break;
      }
    }

    // If no next prayer found today, next is tomorrow's first prayer
    if (!nextPrayer && prayerSchedule.prayers.length > 0) {
      nextPrayer = prayerSchedule.prayers[0];
      timeToNext = getMinutesToTime(nextPrayer.time);
    }

    const isNearPrayerTime = timeToNext <= 30 && timeToNext > 10;
    const isPrayerTime = timeToNext <= 10 && timeToNext >= -15;
    const shouldMute = isPrayerTime; // Mute meditation sounds during prayer

    setPrayerContext({
      currentPrayer,
      nextPrayer,
      timeToNext,
      isNearPrayerTime,
      isPrayerTime,
      shouldMute
    });
  }, [prayerSchedule, isIslamic, prayerTimeEnabled, getMinutesToTime]);

  // Initialize prayer schedule
  useEffect(() => {
    if (!isIslamic || !prayerTimeEnabled) return;

    const initializePrayerTimes = async () => {
      const city = getCityForPrayerTimes();
      const prayers = defaultPrayerTimes[city] || defaultPrayerTimes.jakarta;
      
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      // Try to get user location for more accurate times
      const location = await getUserLocation();
      
      const schedule: PrayerSchedule = {
        date: dateString,
        prayers,
        location: {
          city: city.charAt(0).toUpperCase() + city.slice(1),
          coordinates: location || { latitude: -6.2088, longitude: 106.8456 } // Jakarta default
        }
      };

      setPrayerSchedule(schedule);
    };

    initializePrayerTimes();
  }, [isIslamic, prayerTimeEnabled, getCityForPrayerTimes, getUserLocation]);

  // Update prayer context every minute
  useEffect(() => {
    if (!isIslamic || !prayerTimeEnabled) return;

    updatePrayerContext();
    
    const interval = setInterval(updatePrayerContext, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [updatePrayerContext, isIslamic, prayerTimeEnabled]);

  // Helper functions
  const getPrayerTimeRecommendation = useCallback(() => {
    if (!prayerContext.nextPrayer) return null;

    const { nextPrayer, timeToNext, isNearPrayerTime, isPrayerTime } = prayerContext;

    if (isPrayerTime) {
      return {
        type: 'current_prayer' as const,
        title: `Waktu ${nextPrayer.name}`,
        message: `Saatnya untuk ${nextPrayer.name}. ${nextPrayer.description}`,
        action: 'pause_meditation',
        priority: 'high' as const
      };
    }

    if (isNearPrayerTime) {
      return {
        type: 'upcoming_prayer' as const,
        title: `${nextPrayer.name} dalam ${timeToNext} menit`,
        message: `Persiapkan diri untuk ${nextPrayer.name}. ${nextPrayer.description}`,
        action: 'gentle_reminder',
        priority: 'medium' as const
      };
    }

    return null;
  }, [prayerContext]);

  const getPostPrayerRecommendation = useCallback(() => {
    if (!prayerContext.currentPrayer) return null;

    const { currentPrayer } = prayerContext;
    
    return {
      type: 'post_prayer' as const,
      title: `Setelah ${currentPrayer.name}`,
      message: 'Waktu yang baik untuk meditasi dzikir atau refleksi spiritual',
      suggestions: [
        'Dzikir 5 menit',
        'Meditasi syukur',
        'Refleksi spiritual',
        'Istighfar mindful'
      ]
    };
  }, [prayerContext]);

  const shouldAdjustMeditationSchedule = useCallback(() => {
    if (!isIslamic || !prayerTimeEnabled) return false;
    
    return prayerContext.isNearPrayerTime || prayerContext.isPrayerTime;
  }, [isIslamic, prayerTimeEnabled, prayerContext]);

  const getPreferredMeditationTimes = useCallback(() => {
    if (!isIslamic || !prayerTimeEnabled || !prayerSchedule) {
      return [
        { time: '06:00', label: 'Pagi' },
        { time: '14:00', label: 'Siang' },
        { time: '19:00', label: 'Malam' }
      ];
    }

    // Recommend meditation times between prayers
    const prayers = prayerSchedule.prayers;
    const recommendations = [];

    // After Subuh (morning reflection)
    const subuhTime = prayers.find(p => p.name === 'Subuh');
    if (subuhTime) {
      const [hour, minute] = subuhTime.time.split(':').map(Number);
      const afterSubuh = `${(hour + 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      recommendations.push({ time: afterSubuh, label: 'Setelah Subuh' });
    }

    // Between Dzuhur and Ashar
    const dzuhurTime = prayers.find(p => p.name === 'Dzuhur');
    if (dzuhurTime) {
      const [hour, minute] = dzuhurTime.time.split(':').map(Number);
      const afterDzuhur = `${(hour + 2).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      recommendations.push({ time: afterDzuhur, label: 'Siang hari' });
    }

    // After Maghrib (evening reflection)
    const maghribTime = prayers.find(p => p.name === 'Maghrib');
    if (maghribTime) {
      const [hour, minute] = maghribTime.time.split(':').map(Number);
      const afterMaghrib = `${(hour + 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      recommendations.push({ time: afterMaghrib, label: 'Setelah Maghrib' });
    }

    return recommendations;
  }, [isIslamic, prayerTimeEnabled, prayerSchedule]);

  return {
    // State
    isEnabled: isIslamic && prayerTimeEnabled,
    prayerSchedule,
    prayerContext,
    
    // Recommendations
    getPrayerTimeRecommendation,
    getPostPrayerRecommendation,
    getPreferredMeditationTimes,
    
    // Helpers
    shouldAdjustMeditationSchedule,
    shouldMute: prayerContext.shouldMute,
    
    // Prayer info
    nextPrayerName: prayerContext.nextPrayer?.name,
    timeToNextPrayer: prayerContext.timeToNext,
    currentPrayerName: prayerContext.currentPrayer?.name
  };
};

export type { PrayerTime, PrayerSchedule, PrayerTimeContext };