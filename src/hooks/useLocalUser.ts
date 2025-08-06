import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { localUserService } from '../services/localUserService';
import { userService } from '../services/userService';
import { User } from '../types/user';
import { LocalUser } from '../services/indexedDbService';

export const useLocalUser = () => {
  const { user: supabaseUser, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      if (supabaseUser) {
        // Fetch profile from Supabase for authenticated user
        const profile = await userService.getProfile(supabaseUser.id);
        setCurrentUser(profile);
      } else {
        // Check for existing guest user in IndexedDB
        const allLocalUsers = await localUserService.getAllLocalUsers();
        let guestUser = allLocalUsers.find(u => u.isGuest);

        if (!guestUser) {
          // Create a new guest user if none exists
          guestUser = await localUserService.createGuestUser();
        }
        setCurrentUser(guestUser);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchUser();
    }
  }, [supabaseUser, authLoading]);

  const updateLocalUserProfile = async (updates: Partial<LocalUser>) => {
    if (currentUser && currentUser.id) {
      await localUserService.updateLocalUser(currentUser.id, updates);
      setCurrentUser(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  return { currentUser, loading, updateLocalUserProfile };
};
