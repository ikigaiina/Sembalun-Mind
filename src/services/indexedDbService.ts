import Dexie, { Table } from 'dexie';

export interface MeditationSession {
  id?: string;
  userId: string;
  type: string;
  durationMinutes: number;
  completedAt: Date;
  moodBefore?: string;
  moodAfter?: string;
  notes?: string;
}

export interface AudioCache {
  id?: string;
  url: string;
  data: Blob;
  timestamp: Date;
}

export interface LocalUser {
  id?: string;
  isGuest: boolean;
  displayName?: string;
  preferences?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  progress?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  createdAt: Date;
  updatedAt: Date;
}

export class SembalunDexie extends Dexie {
  meditationSessions!: Table<MeditationSession>;
  audioCache!: Table<AudioCache>;
  localUsers!: Table<LocalUser>;

  constructor() {
    super('SembalunDatabase');
    this.version(1).stores({
      meditationSessions: '++id, userId, completedAt',
      audioCache: '++id, url',
      localUsers: '++id, isGuest',
    });
  }
}

export const db = new SembalunDexie();

export const cleanupOldData = async () => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  try {
    const oldSessions = await db.meditationSessions
      .where('completedAt')
      .below(oneYearAgo)
      .toArray();

    const sessionIdsToDelete = oldSessions.map(session => session.id);
    if (sessionIdsToDelete.length > 0) {
      await db.meditationSessions.bulkDelete(sessionIdsToDelete as number[]);
      console.log(`Cleaned up ${sessionIdsToDelete.length} old meditation sessions.`);
    }

    // Add similar cleanup logic for audioCache if needed

  } catch (error) {
    console.error('Error during IndexedDB cleanup:', error);
  }
};
