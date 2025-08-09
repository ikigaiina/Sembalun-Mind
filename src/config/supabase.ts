import { createClient } from '@supabase/supabase-js'

// Environment detection utilities
const isNode = typeof process !== 'undefined' && process.env
const isDevelopment = isNode ? process.env.NODE_ENV !== 'production' : import.meta.env?.DEV ?? false
const isProduction = isNode ? process.env.NODE_ENV === 'production' : import.meta.env?.PROD ?? false
const isSSR = typeof window === 'undefined'
const isBuildTime = (isNode ? false : import.meta.env?.SSR) || typeof global !== 'undefined'
const isClientSide = !isSSR && !isBuildTime && typeof window !== 'undefined'

// Validate required environment variables only when needed
const validateEnvVars = () => {
  if (isSSR || isBuildTime) return true
  
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  const missing = required.filter(key => {
    const envValue = isNode ? process.env[key] : import.meta.env?.[key]
    return !envValue
  })
  
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

const supabaseUrl = isNode ? process.env.VITE_SUPABASE_URL : import.meta.env?.VITE_SUPABASE_URL
const supabaseAnonKey = isNode ? process.env.VITE_SUPABASE_ANON_KEY : import.meta.env?.VITE_SUPABASE_ANON_KEY

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

// Prevent multiple client instances in the same context
const SUPABASE_CLIENT_KEY = '__supabase_client_instance__'
const getGlobalSupabase = () => {
  if (typeof window !== 'undefined') {
    return (window as any)[SUPABASE_CLIENT_KEY]
  }
  return null
}

const setGlobalSupabase = (client: any) => {
  if (typeof window !== 'undefined') {
    (window as any)[SUPABASE_CLIENT_KEY] = client
  }
}

const initializeSupabase = () => {
  // Skip initialization during SSR or build
  if (isSSR || isBuildTime || !isConfigValid) {
    console.log('🔥 Supabase initialization skipped:', { isSSR, isBuildTime, isConfigValid })
    return null
  }
  
  // Check for existing global instance first
  const existingClient = getGlobalSupabase()
  if (existingClient) {
    console.log('✅ Using existing Supabase client instance')
    supabaseClient = existingClient
    supabaseInitialized = true
    return existingClient
  }
  
  // Return existing client if already initialized
  if (supabaseInitialized && supabaseClient) {
    return supabaseClient
  }
  
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and anon key are required')
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)
    setGlobalSupabase(supabaseClient) // Store in global context
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

// Initialize the client once - use lazy initialization to prevent multiple instances
let _supabase: ReturnType<typeof createClient> | null = null
const getSupabase = () => {
  if (!_supabase) {
    _supabase = initializeSupabase()
  }
  return _supabase
}

const supabase = getSupabase()

// Export the client and utilities
export { supabase }
export default supabase

// Health check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return false
    }

    // Test basic connection with a simple query
    const { error } = await supabase
      .from('courses')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection check failed:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Supabase connection check error:', error)
    return false
  }
}

// Error handler for Supabase operations
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error)
  
  if (error?.code === 'PGRST301') {
    throw new Error('Database connection failed. Please check your network connection.')
  }
  
  if (error?.code === '42501') {
    throw new Error('Access denied. Please check your authentication.')
  }
  
  if (error?.message) {
    throw new Error(error.message)
  }
  
  throw new Error('An unexpected database error occurred.')
}

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