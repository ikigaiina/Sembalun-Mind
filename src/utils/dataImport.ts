import { db } from '../services/indexedDbService';
import { setLocalSetting } from './localStorage';
import { decryptData } from './encryption';
import { decompressData } from './compression';

export const importData = async (encryptedData: string): Promise<boolean> => {
  try {
    const decryptedData = decryptData(encryptedData);
    const decompressedData = decompressData(decryptedData);
    const data = JSON.parse(decompressedData);

    // Clear existing data before import (optional, depending on desired behavior)
    await db.meditationSessions.clear();
    await db.audioCache.clear();
    await db.localUsers.clear();
    localStorage.clear();

    // Populate IndexedDB
    await db.meditationSessions.bulkAdd(data.meditationSessions);
    await db.audioCache.bulkAdd(data.audioCache);
    await db.localUsers.bulkAdd(data.localUsers);

    // Populate LocalStorage
    for (const key in data.localStorageData) {
      if (Object.prototype.hasOwnProperty.call(data.localStorageData, key)) {
        setLocalSetting(key, data.localStorageData[key]);
      }
    }

    console.log('Data imported successfully!');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
