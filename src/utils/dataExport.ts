import { db } from '../services/indexedDbService';
import { getLocalSetting } from './localStorage';
import { encryptData } from './encryption';
import { compressData } from './compression';

export const exportData = async (): Promise<string | null> => {
  try {
    const meditationSessions = await db.meditationSessions.toArray();
    const audioCache = await db.audioCache.toArray();
    const localUsers = await db.localUsers.toArray();

    const localStorageData: { [key: string]: any } = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageData[key] = getLocalSetting(key);
      }
    }

    const data = {
      meditationSessions,
      audioCache,
      localUsers,
      localStorageData,
    };

    const jsonString = JSON.stringify(data);
    const compressedData = compressData(jsonString);
    const encryptedData = encryptData(compressedData);

    return encryptedData;
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};
