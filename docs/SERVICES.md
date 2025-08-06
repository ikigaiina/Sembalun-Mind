# Services Documentation

This document provides comprehensive documentation for all services and business logic in the Sembalun meditation app.

## 📁 Service Architecture

The service layer is organized into several categories:

```
src/services/
├── supabase*                   # Supabase integration services
├── auth*                       # Authentication services
├── user*                       # User management services
├── *Content*                   # Content and course services
├── *Service.ts                 # Domain-specific services
├── api/                        # API integration services
└── local*                      # Local storage services
```

## 🔐 Authentication Services

### SupabaseAuthService
**File**: `src/services/supabaseAuthService.ts`

Core authentication service handling all Supabase auth operations.

#### Methods

##### `signUp(data: SignUpData): Promise<AuthResponse>`
Creates a new user account with email and password.

```typescript
const result = await SupabaseAuthService.signUp({
  email: 'user@example.com',
  password: 'securePassword',
  displayName: 'John Doe'
});
```

##### `signIn(data: SignInData): Promise<AuthResponse>`
Authenticates existing user with credentials.

##### `signInWithGoogle(): Promise<{error: AuthError | null}>`
Initiates Google OAuth authentication flow.

##### `signOut(): Promise<{error: AuthError | null}>`
Signs out the current user and clears session.

##### `resetPassword(data: ResetPasswordData): Promise<{error: AuthError | null}>`
Sends password reset email to user.

##### `getCurrentUser(): Promise<User | null>`
Retrieves current authenticated user.

##### `getCurrentSession(): Promise<Session | null>`
Gets current authentication session.

##### `refreshSession(): Promise<{session: Session | null; error: AuthError | null}>`
Refreshes the current authentication session.

### AuthService (Local)
**File**: `src/services/authService.ts`

Local authentication utilities and helpers.

## 👤 User Management Services

### UserService
**File**: `src/services/userService.ts`

Comprehensive user management and profile operations.

#### Key Features
- User profile CRUD operations
- Preference management
- Progress tracking
- Data synchronization

#### Methods

##### `createUser(userData: UserData): Promise<User>`
Creates a new user profile in the database.

##### `getUser(userId: string): Promise<User | null>`
Retrieves user profile by ID.

##### `updateUser(userId: string, updates: Partial<User>): Promise<User>`
Updates user profile information.

##### `deleteUser(userId: string): Promise<void>`
Permanently deletes user account and data.

### LocalUserService
**File**: `src/services/localUserService.ts`

Manages local user data for guest mode and offline functionality.

#### Features
- Guest session management
- Offline data persistence
- Data migration utilities
- Local storage optimization

### AvatarService
**File**: `src/services/avatarService.ts`

Handles user avatar uploads and management.

#### Methods
- `uploadAvatar(file: File, userId: string): Promise<string>`
- `deleteAvatar(userId: string): Promise<void>`
- `generateAvatarUrl(userId: string): string`

## 🗄️ Database Services

### SupabaseDatabaseService
**File**: `src/services/supabaseDatabaseService.ts`

Core database operations with Supabase integration.

#### User Operations
```typescript
class SupabaseDatabaseService {
  // User management
  static async getUser(userId: string): Promise<UserProfile | null>
  static async updateUser(userId: string, updates: UserUpdate): Promise<{error: any}>
  static async deleteUser(userId: string): Promise<{error: any}>
  
  // Session management
  static async getMeditationSessions(userId: string): Promise<MeditationSession[]>
  static async createMeditationSession(session: MeditationSessionInsert): Promise<{error: any}>
  static async updateMeditationSession(sessionId: string, updates: Partial<MeditationSession>): Promise<{error: any}>
  
  // Course management
  static async getCourses(): Promise<Course[]>
  static async getCourse(courseId: string): Promise<Course | null>
  static async getUserCourseProgress(userId: string): Promise<UserCourseProgress[]>
  
  // Journal operations
  static async getJournalEntries(userId: string): Promise<JournalEntry[]>
  static async createJournalEntry(entry: JournalEntryInsert): Promise<{error: any}>
  static async updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<{error: any}>
}
```

### SupabaseStorageService
**File**: `src/services/supabaseStorageService.ts`

File storage operations using Supabase Storage.

#### Features
- File upload/download
- Image optimization
- Access control
- CDN integration

## 🧘‍♀️ Meditation Services

### ContentDatabase
**File**: `src/services/contentDatabase.ts`

Manages meditation content, courses, and sessions.

#### Features
- Content categorization
- Difficulty levels
- Progress tracking
- Bookmarking system

### CourseService
**File**: `src/services/courseService.ts`

Handles meditation course operations and progress tracking.

#### Methods
```typescript
interface CourseService {
  getCourses(): Promise<Course[]>
  getCourse(id: string): Promise<Course>
  getUserProgress(userId: string, courseId: string): Promise<CourseProgress>
  updateProgress(userId: string, courseId: string, progress: number): Promise<void>
  markCourseComplete(userId: string, courseId: string): Promise<void>
}
```

### ProgressService
**File**: `src/services/progressService.ts`

Tracks and manages user meditation progress.

#### Features
- Session tracking
- Streak calculation
- Statistics generation
- Goal monitoring

### AchievementService
**File**: `src/services/achievementService.ts`

Manages user achievements and milestones.

#### Achievement Types
- Streak achievements
- Session count milestones
- Duration achievements
- Category completions
- Consistency rewards

#### Methods
```typescript
interface AchievementService {
  checkAchievements(userId: string): Promise<Achievement[]>
  unlockAchievement(userId: string, achievementId: string): Promise<void>
  getUserAchievements(userId: string): Promise<Achievement[]>
}
```

## 🎵 Audio Services

### AudioService
**File**: `src/services/audioService.ts`

Core audio playback and management service.

#### Features
- Audio playback control
- Background audio support
- Volume management
- Playback speed control
- Audio format support

#### Methods
```typescript
interface AudioService {
  play(src: string): Promise<void>
  pause(): void
  stop(): void
  setVolume(volume: number): void
  setPlaybackRate(rate: number): void
  getCurrentTime(): number
  getDuration(): number
  onTimeUpdate(callback: (time: number) => void): void
}
```

### AudioCacheService
**File**: `src/services/audioCacheService.ts`

Manages audio file caching for offline playback.

### AudioPerformanceService
**File**: `src/services/audioPerformanceService.ts`

Optimizes audio performance and reduces latency.

### TextToSpeechService
**File**: `src/services/textToSpeechService.ts`

Converts text content to speech for guided meditations.

## 📊 Analytics Services

### SupabaseAnalyticsService
**File**: `src/services/supabaseAnalyticsService.ts`

Analytics and tracking using Supabase.

#### Features
- User behavior tracking
- Session analytics
- Performance metrics
- Custom event tracking

### HabitAnalyticsService
**File**: `src/services/habitAnalyticsService.ts`

Analyzes meditation habits and patterns.

#### Metrics
- Consistency scores
- Preferred times
- Session duration trends
- Category preferences

### ProgressReportsService
**File**: `src/services/progressReportsService.ts`

Generates comprehensive progress reports.

## 🤖 AI and Intelligence Services

### AdaptiveLearningService
**File**: `src/services/adaptiveLearningService.ts`

Provides personalized meditation recommendations.

#### Features
- Learning path adaptation
- Difficulty adjustment
- Content recommendation
- Progress optimization

### RecommendationEngine
**File**: `src/services/recommendationEngine.ts`

Content recommendation system based on user preferences and behavior.

### EmotionalIntelligenceService
**File**: `src/services/emotionalIntelligenceService.ts`

Tracks and develops emotional intelligence through meditation.

## 📱 Notification Services

### SupabaseNotificationService
**File**: `src/services/supabaseNotificationService.ts`

Push notification system using Supabase.

### SmartNotificationService
**File**: `src/services/smartNotificationService.ts`

Intelligent notification scheduling and management.

#### Features
- Optimal timing detection
- Personalized reminders
- Habit-based scheduling
- Context-aware notifications

## 📝 Content Services

### JournalingService
**File**: `src/services/journalingService.ts`

Meditation journaling and reflection management.

### GratitudeJournalService
**File**: `src/services/gratitudeJournalService.ts`

Specialized gratitude practice tracking.

### ReflectionPromptsService
**File**: `src/services/reflectionPromptsService.ts`

Provides guided reflection prompts and questions.

### NotesService
**File**: `src/services/notesService.ts`

General note-taking functionality for meditation insights.

## 🔄 Offline Services

### OfflineStorageService
**File**: `src/services/offlineStorageService.ts`

Manages offline data storage and synchronization.

#### Features
- Data persistence
- Sync queue management
- Conflict resolution
- Storage optimization

### IndexedDbService
**File**: `src/services/indexedDbService.ts`

Low-level IndexedDB operations for complex offline data.

### EnhancedOfflineService
**File**: `src/services/enhancedOfflineService.ts`

Advanced offline capabilities with intelligent syncing.

### OfflineSyncService
**File**: `src/services/offlineSyncService.ts`

Handles data synchronization between offline and online states.

## 🎯 Goal and Tracking Services

### GoalTrackingService
**File**: `src/services/goalTrackingService.ts`

Personal meditation goal setting and tracking.

#### Goal Types
- Daily meditation goals
- Weekly targets
- Monthly challenges
- Long-term aspirations

### SmartSchedulingService
**File**: `src/services/smartSchedulingService.ts`

Intelligent meditation session scheduling.

### SleepTimerService
**File**: `src/services/sleepTimerService.ts`

Sleep meditation and bedtime routine management.

## 🏆 Community Services

### CommunityProgressService
**File**: `src/services/communityProgressService.ts`

Community features and social progress sharing.

### CelebrationService
**File**: `src/services/celebrationService.ts`

Achievement celebrations and milestone recognition.

### EncouragementService
**File**: `src/services/encouragementService.ts`

Motivational messaging and support system.

## 🛠️ Utility Services

### BookmarkService
**File**: `src/services/bookmarkService.ts`

Content bookmarking and favorites management.

### CairnService
**File**: `src/services/cairnService.ts`

Manages the cairn (stone stack) progress visualization system.

### ContextualMonitoringService
**File**: `src/services/contextualMonitoringService.ts`

Monitors user context for adaptive app behavior.

### UserProgressService
**File**: `src/services/userProgressService.ts`

Comprehensive user progress calculation and management.

### WeeklyReflectionService
**File**: `src/services/weeklyReflectionService.ts`

Weekly progress reflection and insights.

## 📱 Mobile Optimization Services

### MobileDataOptimizationService
**File**: `src/services/mobileDataOptimizationService.ts`

Optimizes data usage for mobile networks.

#### Features
- Data compression
- Lazy loading
- Bandwidth detection
- Quality adjustment

### SessionDownloadService
**File**: `src/services/sessionDownloadService.ts`

Downloads and caches meditation sessions for offline use.

## 🤖 Multi-Agent Services

### MultiagentAgentService & MultiagentTaskService
**Files**: `src/services/multiagentAgentService.ts`, `src/services/multiagentTaskService.ts`

Advanced AI agent coordination for personalized meditation experiences.

#### Features
- Task orchestration
- Agent communication
- Personalization algorithms
- Adaptive responses

### LocalMultiagentServices
**Files**: `src/services/localMultiagentAgentService.ts`, `src/services/localMultiagentTaskService.ts`

Local versions of multi-agent services for offline operation.

## 💰 Payment Services

### PaymentProcessingService
**File**: `src/services/paymentProcessingService.ts`

Subscription and payment processing integration.

## 📁 API Services (`src/services/api/`)

### UserApiService
**File**: `src/services/api/userApiService.ts`

RESTful API client for user operations.

## 🧪 Development Services

### SampleContentGenerator
**File**: `src/services/sampleContentGenerator.ts`

Generates sample content for development and testing.

## 📚 Service Usage Guidelines

### Best Practices

1. **Error Handling**: Always include proper error handling and logging
2. **Type Safety**: Use TypeScript interfaces for all service methods
3. **Async Operations**: Use async/await for database and API calls
4. **Caching**: Implement appropriate caching strategies
5. **Testing**: Write unit tests for service methods
6. **Documentation**: Document complex business logic

### Example Service Structure

```typescript
import { supabase } from '../config/supabaseClient';
import type { DatabaseError, ServiceResponse } from '../types';

export class ExampleService {
  /**
   * Get example data with error handling
   */
  static async getData(id: string): Promise<ServiceResponse<ExampleData>> {
    try {
      const { data, error } = await supabase
        .from('examples')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('ExampleService.getData:', error);
      return { 
        data: null, 
        error: error as DatabaseError 
      };
    }
  }

  /**
   * Create new example with validation
   */
  static async createData(
    input: ExampleInput
  ): Promise<ServiceResponse<ExampleData>> {
    try {
      // Validation
      if (!input.name || input.name.trim().length === 0) {
        throw new Error('Name is required');
      }

      const { data, error } = await supabase
        .from('examples')
        .insert(input)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('ExampleService.createData:', error);
      return { 
        data: null, 
        error: error as DatabaseError 
      };
    }
  }
}
```

### Service Testing

```typescript
import { ExampleService } from '../ExampleService';
import { createMockSupabaseClient } from '../../test/mocks';

// Mock Supabase client
jest.mock('../config/supabaseClient');

describe('ExampleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getData', () => {
    it('should return data when successful', async () => {
      const mockData = { id: '1', name: 'Test' };
      createMockSupabaseClient({ data: mockData, error: null });

      const result = await ExampleService.getData('1');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Database error');
      createMockSupabaseClient({ data: null, error: mockError });

      const result = await ExampleService.getData('1');

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
});
```

This comprehensive service documentation covers all business logic and data management in the Sembalun meditation application.