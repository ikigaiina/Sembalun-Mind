# Sembalun - API System & Service Architecture

## 🌐 API Architecture Overview

Sembalun menggunakan arsitektur API yang modular dan scalable dengan Supabase sebagai backend utama, dilengkapi dengan Edge Functions untuk logika bisnis khusus dan integrasi dengan layanan eksternal.

## 🏗️ API Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  React App • TypeScript • Axios/Fetch                      │
│  ├── API Client Configuration                               │
│  ├── Request/Response Interceptors                          │
│  ├── Error Handling & Retry Logic                          │
│  └── Cultural Content Caching                              │
├─────────────────────────────────────────────────────────────┤
│                    API GATEWAY                             │
├─────────────────────────────────────────────────────────────┤
│  Supabase API Gateway                                      │
│  ├── Authentication Middleware                             │
│  ├── Rate Limiting & Throttling                            │
│  ├── Request Validation                                    │
│  └── Response Formatting                                   │
├─────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Supabase Services                                         │
│  ├── PostgreSQL REST API (Auto-generated)                 │
│  ├── Real-time Subscriptions                              │
│  ├── Authentication Service                               │
│  ├── Storage Service (Cultural Media)                     │
│  └── Edge Functions (Custom Logic)                        │
├─────────────────────────────────────────────────────────────┤
│                    DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database with RLS                             │
│  ├── User Data & Preferences                              │
│  ├── Cultural Content & Traditions                        │
│  ├── Meditation Sessions & Progress                       │
│  └── Analytics & Insights                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Core API Services

### API Client Configuration

```typescript
// services/apiClient.ts
import { createClient } from '@supabase/supabase-js';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  culturalCacheEnabled: boolean;
}

class ApiClient {
  private supabase;
  private httpClient: AxiosInstance;
  private culturalCache: Map<string, any> = new Map();
  
  constructor(config: ApiClientConfig) {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL!,
      process.env.REACT_APP_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          headers: {
            'X-Client-Info': 'sembalun-web@1.0.0',
          },
        },
      }
    );

    // Initialize HTTP client for external APIs
    this.httpClient = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.httpClient.interceptors.request.use(
      async (config) => {
        const { data: { session } } = await this.supabase.auth.getSession();
        
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        
        // Add cultural context header
        const culturalPrefs = await this.getCulturalPreferences();
        if (culturalPrefs) {
          config.headers['X-Cultural-Context'] = JSON.stringify(culturalPrefs);
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and cultural caching
    this.httpClient.interceptors.response.use(
      (response: AxiosResponse) => {
        // Cache cultural content responses
        if (response.config.url?.includes('/cultural/') && response.data) {
          this.culturalCache.set(response.config.url, {
            data: response.data,
            timestamp: Date.now(),
            ttl: 30 * 60 * 1000, // 30 minutes
          });
        }
        
        return response;
      },
      async (error) => {
        // Handle token refresh
        if (error.response?.status === 401) {
          try {
            const { error: refreshError } = await this.supabase.auth.refreshSession();
            if (!refreshError) {
              return this.httpClient.request(error.config);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Redirect to login
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private async getCulturalPreferences() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user?.user_metadata?.cultural_preferences) {
        return user.user_metadata.cultural_preferences;
      }
      return null;
    } catch (error) {
      console.error('Error getting cultural preferences:', error);
      return null;
    }
  }

  private formatError(error: any) {
    return {
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || error.code,
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }

  // Public methods for different service types
  get supabaseClient() {
    return this.supabase;
  }

  get httpClient() {
    return this.httpClient;
  }

  getCachedCulturalContent(url: string) {
    const cached = this.culturalCache.get(url);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data;
    }
    return null;
  }
}

// Export singleton instance
export const apiClient = new ApiClient({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://api.sembalun.com',
  timeout: 15000,
  retries: 3,
  culturalCacheEnabled: true,
});
```

### Authentication API Service

```typescript
// services/api/authApiService.ts
import { apiClient } from '../apiClient';

interface LoginRequest {
  email: string;
  password: string;
}

interface SignUpRequest {
  email: string;
  password: string;
  fullName?: string;
  culturalPreferences?: CulturalPreferences;
}

interface CulturalPreferences {
  preferredTradition: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  meditationLevel: 'beginner' | 'intermediate' | 'advanced';
  sessionPreferences: {
    defaultDuration: number;
    preferredTime: 'morning' | 'afternoon' | 'evening';
    musicPreference: boolean;
    guidanceLanguage: string;
  };
}

export class AuthApiService {
  async signUp(request: SignUpRequest) {
    try {
      const { data, error } = await apiClient.supabaseClient.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          data: {
            full_name: request.fullName,
            cultural_preferences: request.culturalPreferences,
          },
        },
      });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signIn(request: LoginRequest) {
    try {
      const { data, error } = await apiClient.supabaseClient.auth.signInWithPassword({
        email: request.email,
        password: request.password,
      });

      if (error) throw error;
      
      // Initialize user session data
      await this.initializeUserSession(data.user?.id);
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await apiClient.supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await apiClient.supabaseClient.auth.signOut();
      
      // Clear local cultural cache
      localStorage.removeItem('sembalun-cultural-cache');
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async resetPassword(email: string) {
    try {
      const { data, error } = await apiClient.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await apiClient.supabaseClient.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateProfile(updates: Partial<{
    fullName: string;
    culturalPreferences: CulturalPreferences;
    notificationPreferences: any;
  }>) {
    try {
      const { data, error } = await apiClient.supabaseClient.auth.updateUser({
        data: updates,
      });

      if (error) throw error;
      
      // Also update the user_profiles table
      await this.updateUserProfileTable(updates);
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private async initializeUserSession(userId?: string) {
    if (!userId) return;
    
    try {
      // Check if user profile exists, create if not
      const { data: existingProfile, error } = await apiClient.supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        await this.createUserProfile(userId);
      }
    } catch (error) {
      console.error('Error initializing user session:', error);
    }
  }

  private async createUserProfile(userId: string) {
    const { data: { user } } = await apiClient.supabaseClient.auth.getUser();
    
    const profile = {
      id: userId,
      email: user?.email,
      full_name: user?.user_metadata?.full_name,
      cultural_preferences: user?.user_metadata?.cultural_preferences || {
        preferredTradition: 'javanese',
        meditationLevel: 'beginner',
        sessionPreferences: {
          defaultDuration: 10,
          preferredTime: 'morning',
          musicPreference: true,
          guidanceLanguage: 'indonesia',
        },
      },
    };

    const { error } = await apiClient.supabaseClient
      .from('user_profiles')
      .insert([profile]);

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  private async updateUserProfileTable(updates: any) {
    const { data: { user } } = await apiClient.supabaseClient.auth.getUser();
    if (!user) return;

    const { error } = await apiClient.supabaseClient
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export const authApiService = new AuthApiService();
```

### Meditation Sessions API Service

```typescript
// services/api/meditationApiService.ts
interface MeditationSessionRequest {
  traditionId?: string;
  sessionType: 'guided_meditation' | 'breathing_exercise' | 'mindfulness_practice' | 'cultural_meditation' | 'free_meditation';
  plannedDuration: number;
  sessionConfig?: {
    musicEnabled: boolean;
    guidanceEnabled: boolean;
    backgroundSounds: boolean;
    customInstructions: string;
  };
  culturalElements?: {
    music: string;
    guidance: string;
    visualTheme: string;
    traditionalElements: string[];
  };
}

interface MeditationSessionUpdate {
  actualDuration?: number;
  completionStatus: 'started' | 'paused' | 'completed' | 'abandoned';
  completionPercentage?: number;
  moodBefore?: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  moodAfter?: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  sessionRating?: number; // 1-5
  sessionNotes?: string;
  keyInsights?: string[];
  challengesFaced?: string[];
  positiveAspects?: string[];
  interruptionsCount?: number;
  pauseDuration?: number;
}

export class MeditationApiService {
  async createSession(request: MeditationSessionRequest) {
    try {
      const { data, error } = await apiClient.supabaseClient
        .from('meditation_sessions')
        .insert([{
          ...request,
          tradition_id: request.traditionId,
          session_type: request.sessionType,
          planned_duration: request.plannedDuration,
          session_config: request.sessionConfig,
          cultural_elements: request.culturalElements,
          completion_status: 'started',
          device_type: this.getDeviceType(),
        }])
        .select()
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateSession(sessionId: string, updates: MeditationSessionUpdate) {
    try {
      const updateData = {
        ...updates,
        completion_status: updates.completionStatus,
        actual_duration: updates.actualDuration,
        completion_percentage: updates.completionPercentage,
        mood_before: updates.moodBefore,
        mood_after: updates.moodAfter,
        session_rating: updates.sessionRating,
        session_notes: updates.sessionNotes,
        key_insights: updates.keyInsights,
        challenges_faced: updates.challengesFaced,
        positive_aspects: updates.positiveAspects,
        interruptions_count: updates.interruptionsCount,
        pause_duration: updates.pauseDuration,
      };

      // Set completed_at timestamp if session is completed
      if (updates.completionStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await apiClient.supabaseClient
        .from('meditation_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getSession(sessionId: string) {
    try {
      const { data, error } = await apiClient.supabaseClient
        .from('meditation_sessions')
        .select(`
          *,
          cultural_traditions (
            name,
            display_name,
            color_palette
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getUserSessions(limit: number = 20, offset: number = 0) {
    try {
      const { data, error } = await apiClient.supabaseClient
        .from('meditation_sessions')
        .select(`
          *,
          cultural_traditions (
            name,
            display_name,
            color_palette
          )
        `)
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getSessionAnalytics(timeRange: 'week' | 'month' | 'year' = 'month') {
    try {
      const startDate = this.getStartDate(timeRange);
      
      const { data, error } = await apiClient.supabaseClient
        .from('session_analytics')
        .select('*')
        .gte('session_date', startDate.toISOString().split('T')[0]);

      if (error) throw error;
      
      // Process analytics data
      const analytics = this.processSessionAnalytics(data);
      
      return { data: analytics, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private processSessionAnalytics(rawData: any[]) {
    return {
      totalSessions: rawData.length,
      completedSessions: rawData.filter(s => s.completion_status === 'completed').length,
      averageDuration: rawData.reduce((sum, s) => sum + (s.actual_duration || 0), 0) / rawData.length,
      moodImprovement: rawData
        .filter(s => s.mood_improvement !== null)
        .reduce((sum, s) => sum + s.mood_improvement, 0) / rawData.length,
      popularTraditions: this.getMostPopularTraditions(rawData),
      bestPerformingTimes: this.getBestPerformingTimes(rawData),
      weeklyProgress: this.getWeeklyProgress(rawData),
    };
  }

  private getMostPopularTraditions(sessions: any[]) {
    const traditionCounts = sessions.reduce((acc, session) => {
      if (session.tradition_used) {
        acc[session.tradition_used] = (acc[session.tradition_used] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(traditionCounts)
      .map(([tradition, count]) => ({ tradition, count }))
      .sort((a: any, b: any) => b.count - a.count);
  }

  private getBestPerformingTimes(sessions: any[]) {
    const hourlyStats = sessions.reduce((acc, session) => {
      const hour = session.session_hour;
      if (!acc[hour]) {
        acc[hour] = { totalSessions: 0, completedSessions: 0, totalRating: 0, ratedSessions: 0 };
      }
      
      acc[hour].totalSessions++;
      if (session.completion_status === 'completed') {
        acc[hour].completedSessions++;
      }
      if (session.session_rating) {
        acc[hour].totalRating += session.session_rating;
        acc[hour].ratedSessions++;
      }
      
      return acc;
    }, {});

    return Object.entries(hourlyStats)
      .map(([hour, stats]: [string, any]) => ({
        hour: parseInt(hour),
        completionRate: stats.completedSessions / stats.totalSessions,
        averageRating: stats.ratedSessions > 0 ? stats.totalRating / stats.ratedSessions : 0,
        totalSessions: stats.totalSessions,
      }))
      .filter(stat => stat.totalSessions > 0)
      .sort((a, b) => b.completionRate - a.completionRate);
  }

  private getWeeklyProgress(sessions: any[]) {
    const weeklyData = sessions.reduce((acc, session) => {
      const date = new Date(session.session_date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = { sessions: 0, minutes: 0, completedSessions: 0 };
      }
      
      acc[weekKey].sessions++;
      acc[weekKey].minutes += session.actual_duration || 0;
      if (session.completion_status === 'completed') {
        acc[weekKey].completedSessions++;
      }
      
      return acc;
    }, {});

    return Object.entries(weeklyData)
      .map(([week, data]: [string, any]) => ({
        week,
        ...data,
        completionRate: data.sessions > 0 ? data.completedSessions / data.sessions : 0,
      }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
  }
}

export const meditationApiService = new MeditationApiService();
```

### Cultural Content API Service

```typescript
// services/api/culturalApiService.ts
interface CulturalContentFilter {
  traditionId?: string;
  contentType?: 'guided_meditation' | 'breathing_exercise' | 'cultural_story' | 'philosophical_teaching' | 'traditional_music';
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
}

export class CulturalApiService {
  async getCulturalTraditions() {
    try {
      // Check cache first
      const cacheKey = '/cultural/traditions';
      const cached = apiClient.getCachedCulturalContent(cacheKey);
      if (cached) {
        return { data: cached, error: null };
      }

      const { data, error } = await apiClient.supabaseClient
        .from('cultural_traditions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCulturalTradition(traditionId: string) {
    try {
      const { data, error } = await apiClient.supabaseClient
        .from('cultural_traditions')
        .select('*')
        .eq('id', traditionId)
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCulturalContent(filter: CulturalContentFilter = {}) {
    try {
      let query = apiClient.supabaseClient
        .from('cultural_content')
        .select(`
          *,
          cultural_traditions (
            name,
            display_name,
            color_palette
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (filter.traditionId) {
        query = query.eq('tradition_id', filter.traditionId);
      }
      
      if (filter.contentType) {
        query = query.eq('content_type', filter.contentType);
      }
      
      if (filter.difficultyLevel) {
        query = query.eq('difficulty_level', filter.difficultyLevel);
      }

      query = query.order('average_rating', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      // Process content based on user's cultural preferences
      const processedData = await this.processContentForUser(data);
      
      return { data: processedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getContentById(contentId: string) {
    try {
      const { data, error } = await apiClient.supabaseClient
        .from('cultural_content')
        .select(`
          *,
          cultural_traditions (
            name,
            display_name,
            color_palette,
            description
          )
        `)
        .eq('id', contentId)
        .single();

      if (error) throw error;
      
      // Increment usage count
      await this.incrementUsageCount(contentId);
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async rateContent(contentId: string, rating: number) {
    try {
      // First, get current rating stats
      const { data: content, error: fetchError } = await apiClient.supabaseClient
        .from('cultural_content')
        .select('average_rating, total_ratings')
        .eq('id', contentId)
        .single();

      if (fetchError) throw fetchError;
      
      // Calculate new average
      const currentTotal = (content.average_rating || 0) * (content.total_ratings || 0);
      const newTotal = currentTotal + rating;
      const newCount = (content.total_ratings || 0) + 1;
      const newAverage = newTotal / newCount;

      // Update content rating
      const { error: updateError } = await apiClient.supabaseClient
        .from('cultural_content')
        .update({
          average_rating: newAverage,
          total_ratings: newCount,
        })
        .eq('id', contentId);

      if (updateError) throw updateError;
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async getRecommendedContent(limit: number = 10) {
    try {
      // Get user's cultural preferences and session history
      const userPreferences = await this.getUserCulturalPreferences();
      const sessionHistory = await this.getUserSessionHistory();
      
      // Build recommendation query based on preferences
      let query = apiClient.supabaseClient
        .from('cultural_content')
        .select(`
          *,
          cultural_traditions (
            name,
            display_name,
            color_palette
          )
        `)
        .eq('is_active', true);

      // Filter by preferred tradition if set
      if (userPreferences?.preferredTradition) {
        const { data: tradition } = await apiClient.supabaseClient
          .from('cultural_traditions')
          .select('id')
          .eq('name', userPreferences.preferredTradition)
          .single();
        
        if (tradition) {
          query = query.eq('tradition_id', tradition.id);
        }
      }

      // Filter by user's meditation level
      if (userPreferences?.meditationLevel) {
        query = query.eq('difficulty_level', userPreferences.meditationLevel);
      }

      const { data, error } = await query
        .order('average_rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Apply recommendation algorithm
      const recommendations = this.applyRecommendationAlgorithm(data, sessionHistory);
      
      return { data: recommendations, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private async processContentForUser(content: any[]) {
    const userPreferences = await this.getUserCulturalPreferences();
    const preferredLanguage = userPreferences?.sessionPreferences?.guidanceLanguage || 'indonesia';
    
    return content.map(item => ({
      ...item,
      // Use appropriate language variant
      title: item.language_variants?.[preferredLanguage]?.title || item.title,
      description: item.language_variants?.[preferredLanguage]?.description || item.description,
      // Add cultural context if needed
      culturalContext: item.requires_cultural_intro ? item.cultural_significance : null,
    }));
  }

  private async incrementUsageCount(contentId: string) {
    try {
      await apiClient.supabaseClient
        .from('cultural_content')
        .update({
          usage_count: apiClient.supabaseClient.raw('usage_count + 1'),
        })
        .eq('id', contentId);
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  }

  private async getUserCulturalPreferences() {
    try {
      const { data: { user } } = await apiClient.supabaseClient.auth.getUser();
      return user?.user_metadata?.cultural_preferences || null;
    } catch (error) {
      console.error('Error getting cultural preferences:', error);
      return null;
    }
  }

  private async getUserSessionHistory() {
    try {
      const { data, error } = await apiClient.supabaseClient
        .from('meditation_sessions')
        .select('tradition_id, session_type, session_rating')
        .eq('completion_status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(50);

      return data || [];
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }

  private applyRecommendationAlgorithm(content: any[], sessionHistory: any[]) {
    // Simple recommendation algorithm based on:
    // 1. User's historical ratings
    // 2. Content similarity to liked content
    // 3. Popular content among similar users
    // 4. Cultural tradition preferences
    
    return content
      .map(item => ({
        ...item,
        recommendationScore: this.calculateRecommendationScore(item, sessionHistory),
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  private calculateRecommendationScore(content: any, sessionHistory: any[]): number {
    let score = content.average_rating || 0;
    
    // Boost score if user has completed sessions with this tradition
    const traditionSessions = sessionHistory.filter(s => s.tradition_id === content.tradition_id);
    const avgTraditionRating = traditionSessions.reduce((sum, s) => sum + (s.session_rating || 0), 0) / (traditionSessions.length || 1);
    
    if (traditionSessions.length > 0) {
      score += avgTraditionRating * 0.5;
    }
    
    // Boost newer, less-used content for variety
    const usageBoost = Math.max(0, (100 - (content.usage_count || 0)) / 100);
    score += usageBoost * 0.3;
    
    return score;
  }
}

export const culturalApiService = new CulturalApiService();
```

## 🔄 Real-time API Features

### Real-time Subscriptions

```typescript
// services/realtimeService.ts
import { apiClient } from './apiClient';

export class RealtimeService {
  private subscriptions: Map<string, any> = new Map();

  subscribeToUserProgress(userId: string, callback: (payload: any) => void) {
    const channelName = `user-progress-${userId}`;
    
    const subscription = apiClient.supabaseClient
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${userId}`,
      }, callback)
      .subscribe();

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  subscribeToAchievements(userId: string, callback: (payload: any) => void) {
    const channelName = `user-achievements-${userId}`;
    
    const subscription = apiClient.supabaseClient
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`,
      }, callback)
      .subscribe();

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  subscribeToCulturalUpdates(callback: (payload: any) => void) {
    const channelName = 'cultural-updates';
    
    const subscription = apiClient.supabaseClient
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cultural_content',
        filter: 'is_active=eq.true',
      }, callback)
      .subscribe();

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription, channelName) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

export const realtimeService = new RealtimeService();
```

## 🚨 Error Handling & Recovery

### API Error Handler

```typescript
// utils/apiErrorHandler.ts
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CULTURAL_CONTENT_ERROR = 'CULTURAL_CONTENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  code?: string;
  status?: number;
  details?: any;
  culturalContext?: boolean;
}

export class ApiErrorHandler {
  static handle(error: any): ApiError {
    // Network errors
    if (!navigator.onLine) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        message: 'Tidak ada koneksi internet. Periksa koneksi Anda.',
      };
    }

    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        message: 'Masalah jaringan. Silakan coba lagi.',
      };
    }

    // Authentication errors
    if (error.status === 401 || error.code === 'INVALID_JWT') {
      return {
        type: ApiErrorType.AUTHENTICATION_ERROR,
        message: 'Sesi telah berakhir. Silakan masuk kembali.',
      };
    }

    // Authorization errors
    if (error.status === 403) {
      return {
        type: ApiErrorType.AUTHORIZATION_ERROR,
        message: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
      };
    }

    // Validation errors
    if (error.status === 400 || error.status === 422) {
      return {
        type: ApiErrorType.VALIDATION_ERROR,
        message: error.details?.message || 'Data yang diberikan tidak valid.',
        details: error.details,
      };
    }

    // Rate limiting
    if (error.status === 429) {
      return {
        type: ApiErrorType.RATE_LIMIT_ERROR,
        message: 'Terlalu banyak permintaan. Silakan tunggu sebentar.',
      };
    }

    // Cultural content specific errors
    if (error.message?.includes('cultural') || error.code?.includes('CULTURAL')) {
      return {
        type: ApiErrorType.CULTURAL_CONTENT_ERROR,
        message: 'Konten budaya tidak dapat dimuat. Silakan coba lagi.',
        culturalContext: true,
      };
    }

    // Server errors
    if (error.status >= 500) {
      return {
        type: ApiErrorType.SERVER_ERROR,
        message: 'Terjadi masalah server. Tim kami sedang memperbaikinya.',
        status: error.status,
      };
    }

    // Unknown errors
    return {
      type: ApiErrorType.UNKNOWN_ERROR,
      message: error.message || 'Terjadi kesalahan yang tidak diketahui.',
      code: error.code,
      status: error.status,
    };
  }

  static getRetryStrategy(error: ApiError): { shouldRetry: boolean; delay: number; maxAttempts: number } {
    switch (error.type) {
      case ApiErrorType.NETWORK_ERROR:
        return { shouldRetry: true, delay: 2000, maxAttempts: 3 };
      case ApiErrorType.SERVER_ERROR:
        return { shouldRetry: true, delay: 5000, maxAttempts: 2 };
      case ApiErrorType.RATE_LIMIT_ERROR:
        return { shouldRetry: true, delay: 10000, maxAttempts: 1 };
      case ApiErrorType.CULTURAL_CONTENT_ERROR:
        return { shouldRetry: true, delay: 3000, maxAttempts: 2 };
      default:
        return { shouldRetry: false, delay: 0, maxAttempts: 0 };
    }
  }
}
```

### Retry Logic Implementation

```typescript
// utils/retryLogic.ts
interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  const { maxAttempts, delay, backoffMultiplier = 1.5 } = config;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      const apiError = ApiErrorHandler.handle(error);
      const retryStrategy = ApiErrorHandler.getRetryStrategy(apiError);
      
      if (!retryStrategy.shouldRetry) {
        throw error;
      }

      console.warn(`API call failed (attempt ${attempt}/${maxAttempts}):`, apiError.message);
      
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }

  throw new Error('Max retry attempts exceeded');
}

// Usage example
export const apiWithRetry = {
  async getCulturalContent(filter: any) {
    return withRetry(
      () => culturalApiService.getCulturalContent(filter),
      { maxAttempts: 3, delay: 1000 }
    );
  },
  
  async createMeditationSession(request: any) {
    return withRetry(
      () => meditationApiService.createSession(request),
      { maxAttempts: 2, delay: 2000 }
    );
  },
};
```

## 🎯 Performance Optimization

### API Response Caching

```typescript
// utils/apiCache.ts
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheItem<any>>();
  private culturalContentTTL = 30 * 60 * 1000; // 30 minutes
  private userDataTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const defaultTTL = key.includes('cultural') ? this.culturalContentTTL : this.userDataTTL;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  invalidate(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
  }

  // Preload cultural content for better UX
  async preloadCulturalContent(): Promise<void> {
    try {
      // Preload traditions
      const traditions = await culturalApiService.getCulturalTraditions();
      if (traditions.data) {
        this.set('cultural/traditions', traditions.data);
      }

      // Preload recommended content
      const recommended = await culturalApiService.getRecommendedContent(20);
      if (recommended.data) {
        this.set('cultural/recommended', recommended.data);
      }
    } catch (error) {
      console.warn('Failed to preload cultural content:', error);
    }
  }
}

export const apiCache = new ApiCache();
```

### Request Deduplication

```typescript
// utils/requestDeduplicator.ts
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already in progress, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Start new request
    const promise = requestFn()
      .finally(() => {
        // Clean up when done
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  cancel(key: string): void {
    this.pendingRequests.delete(key);
  }

  cancelAll(): void {
    this.pendingRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();
```

## 📊 API Monitoring & Analytics

### Performance Monitoring

```typescript
// utils/apiMonitoring.ts
interface ApiMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  culturalContext?: boolean;
  timestamp: number;
}

class ApiMonitoring {
  private metrics: ApiMetrics[] = [];
  private maxMetrics = 1000;

  recordMetric(metric: ApiMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(filter?: { endpoint?: string; timeRange?: number }): ApiMetrics[] {
    let filtered = this.metrics;
    
    if (filter?.endpoint) {
      filtered = filtered.filter(m => m.endpoint.includes(filter.endpoint!));
    }
    
    if (filter?.timeRange) {
      const cutoff = Date.now() - filter.timeRange;
      filtered = filtered.filter(m => m.timestamp > cutoff);
    }
    
    return filtered;
  }

  getPerformanceStats() {
    const recentMetrics = this.getMetrics({ timeRange: 5 * 60 * 1000 }); // Last 5 minutes
    
    return {
      totalRequests: recentMetrics.length,
      averageResponseTime: recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length,
      errorRate: recentMetrics.filter(m => m.status >= 400).length / recentMetrics.length,
      culturalRequestsPercentage: recentMetrics.filter(m => m.culturalContext).length / recentMetrics.length,
      slowRequests: recentMetrics.filter(m => m.duration > 2000).length,
    };
  }
}

export const apiMonitoring = new ApiMonitoring();
```

---

## 🚀 Implementation Checklist

- [x] API client configuration with Supabase
- [x] Authentication service with JWT handling
- [x] Meditation session CRUD operations
- [x] Cultural content API with caching
- [x] Real-time subscriptions for progress
- [x] Comprehensive error handling
- [x] Retry logic and recovery
- [x] Performance optimization (caching, deduplication)
- [x] API monitoring and analytics
- [ ] Rate limiting configuration
- [ ] API documentation generation
- [ ] Integration testing suite
- [ ] Production monitoring dashboard

---

*Sistem API ini dirancang untuk memberikan pengalaman yang responsif dan dapat diandalkan sambil menghormati konteks budaya Indonesia dalam setiap interaksi.*