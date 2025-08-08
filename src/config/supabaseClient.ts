import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Environment variables with proper Vite prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation with graceful fallback
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env file:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY'
  );
  
  // In development, provide more details
  if (import.meta.env.DEV) {
    console.warn('Supabase client will be null - auth features will be disabled');
  }
}

// Create typed Supabase client with null fallback
export const supabase: SupabaseClient<Database> | null = 
  (supabaseUrl && supabaseAnonKey) ? 
    createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        },
        global: {
          headers: {
            'X-Client-Info': 'sembalun-meditation-app'
          }
        }
      }
    ) : null;

// Error handler for Supabase operations
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  
  if (error?.code === 'PGRST301') {
    throw new Error('Database connection failed. Please check your network connection.');
  }
  
  if (error?.code === '42501') {
    throw new Error('Access denied. Please check your authentication.');
  }
  
  if (error?.message) {
    throw new Error(error.message);
  }
  
  throw new Error('An unexpected database error occurred.');
};

// Health check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!supabase) {
      console.warn('Supabase client not available');
      return false;
    }

    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection check error:', error);
    return false;
  }
};

export default supabase;
