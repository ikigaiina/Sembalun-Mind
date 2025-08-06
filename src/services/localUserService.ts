import { db, LocalUser } from './indexedDbService';
import { v4 as uuidv4 } from 'uuid';

export const localUserService = {
  async createGuestUser(): Promise<LocalUser> {
    const newGuest: LocalUser = {
      id: uuidv4(),
      isGuest: true,
      displayName: 'Guest',
      preferences: {},
      progress: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.localUsers.add(newGuest);
    return newGuest;
  },

  async getLocalUser(userId: string): Promise<LocalUser | undefined> {
    return db.localUsers.get(userId);
  },

  async updateLocalUser(userId: string, updates: Partial<LocalUser>): Promise<void> {
    await db.localUsers.update(userId, { ...updates, updatedAt: new Date() });
  },

  async deleteLocalUser(userId: string): Promise<void> {
    await db.localUsers.delete(userId);
  },

  async getAllLocalUsers(): Promise<LocalUser[]> {
    return db.localUsers.toArray();
  },
};
