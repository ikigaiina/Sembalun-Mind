import { createClient } from '@supabase/supabase-js'

// Environment detection utilities
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD
const isSSR = typeof window === 'undefined'
const isBuildTime = import.meta.env.SSR || typeof global !== 'undefined'
const isClientSide = !isSSR && !isBuildTime && typeof window !== 'undefined'

// Validate required environment variables only when needed
const validateEnvVars = () => {
  if (isSSR || isBuildTime) return true
  
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  const missing = required.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    console.error('🔥 Missing required Supabase environment variables:', missing)
    if (isDevelopment) {
      throw new Error(`Missing Supabase configuration: ${missing.join(', ')}`)
    }
    return false
  }
  return true
}

// Only validate config in appropriate environments
const isConfigValid = isClientSide ? validateEnvVars() : true

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase client configuration with optimized settings
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    storage: isClientSide ? window.localStorage : undefined
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'sembalun-app'
    }
  }
}

// Singleton pattern for Supabase client with proper error handling
let supabaseClient: ReturnType<typeof createClient> | null = null
let supabaseInitialized = false

const initializeSupabase = () => {
  // Skip initialization during SSR or build
  if (isSSR || isBuildTime || !isConfigValid) {
    console.log('🔥 Supabase initialization skipped:', { isSSR, isBuildTime, isConfigValid })
    return null
  }
  
  // Return existing client if already initialized
  if (supabaseInitialized) {
    return supabaseClient
  }
  
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and anon key are required')
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)
    supabaseInitialized = true
    console.log('✅ Supabase initialized successfully')
    return supabaseClient
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error)
    supabaseInitialized = true // Prevent retry loops
    if (isDevelopment) {
      throw new Error('Supabase configuration is invalid. Please check your environment variables.')
    }
    return null
  }
}

// Initialize the client once
const supabase = initializeSupabase()

// Export the client and utilities
export { supabase }
export default supabase

// Auth helpers
export const getSupabaseAuth = () => supabase?.auth
export const getSupabaseStorage = () => supabase?.storage
export const getSupabaseDatabase = () => supabase

// Database types (to be defined based on your schema)
export type Database = {
  public: {
    Tables: {
      // Define your database schema here
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          display_name?: string
          avatar_url?: string
          preferences?: Record<string, unknown>
        }
        Insert: {
          id?: string
          email: string
          display_name?: string
          avatar_url?: string
          preferences?: Record<string, unknown>
        }
        Update: {
          email?: string
          display_name?: string
          avatar_url?: string
          preferences?: Record<string, unknown>
          updated_at?: string
        }
      }
      // Add more tables as needed
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Typed client
export const typedSupabase = supabase as ReturnType<typeof createClient<Database>>

// Environment info
export const supabaseInfo = {
  isDevelopment,
  isProduction,
  isClientSide,
  isConfigValid,
  url: supabaseUrl,
  hasAuth: !!supabase?.auth,
  hasStorage: !!supabase?.storage
}