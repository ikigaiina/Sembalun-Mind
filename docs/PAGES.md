# Pages and Routing Documentation

This document provides comprehensive documentation for all pages and routing in the Sembalun meditation app.

## 🛣️ Routing Structure

The application uses React Router v7 for client-side routing with the following structure:

```typescript
// Main routing in App.tsx
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<SignUp />} />
  
  {/* Protected routes */}
  <Route path="/*" element={<AppContent />} />
</Routes>

// Protected routes in AppContent
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/old-home" element={<Home />} />
  <Route path="/meditation" element={<Meditation />} />
  <Route path="/breathing" element={<BreathingSession />} />
  <Route path="/history" element={<History />} />
  <Route path="/explore" element={<Explore />} />
  <Route path="/journal" element={<Journal />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/settings" element={<Settings />} />
  
  {/* Extended features */}
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/content-library" element={<ContentLibrary />} />
  <Route path="/analytics" element={<Analytics />} />
  <Route path="/account" element={<AccountManagement />} />
  <Route path="/courses" element={<Courses />} />
  <Route path="/community" element={<Community />} />
  <Route path="/personalization" element={<Personalization />} />
  <Route path="/multiagent" element={<MultiagentDashboard />} />
  <Route path="/help" element={<Help />} />
  
  {/* Utility pages */}
  <Route path="/demo" element={<ComponentsDemo />} />
  <Route path="/onboarding" element={<OnboardingFlow />} />
  <Route path="/emotional-awareness" element={<EmotionalAwareness />} />
  
  {/* Catch-all redirect */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

## 🔐 Authentication Pages

### Login Page
**File**: `src/pages/Login.tsx`
**Route**: `/login`

User authentication page with multiple sign-in options.

#### Features
- Email/password authentication
- Google OAuth integration
- Apple Sign-in (iOS/macOS)
- Guest mode access
- Password reset functionality
- Form validation and error handling
- Responsive design

#### Components Used
- `AuthModal` - Authentication form
- `Button` - Action buttons
- `Input` - Form inputs
- `Card` - Layout container

#### State Management
- Form validation states
- Loading states for different auth methods
- Error message handling
- Redirect after authentication

### Sign Up Page
**File**: `src/pages/SignUp.tsx`
**Route**: `/signup`

New user registration page.

#### Features
- Account creation with email/password
- Display name configuration
- Terms of service acceptance
- Email verification process
- OAuth registration options

## 🏠 Core Application Pages

### Dashboard
**File**: `src/pages/Dashboard.tsx`
**Route**: `/` (default)

Main application dashboard providing overview of user's meditation journey.

#### Features
- **Quick Stats**: Session count, total minutes, current streak
- **Today's Progress**: Daily goals and achievements
- **Quick Actions**: Start meditation, breathing exercise, journal entry
- **Recent Sessions**: List of recent meditation sessions
- **Upcoming Reminders**: Scheduled meditation times
- **Motivational Content**: Daily quotes or insights
- **Weather Integration**: Meditation recommendations based on weather

#### Key Components
- Progress cards with animated statistics
- Quick action buttons for common tasks
- Session history timeline
- Achievement notifications
- Personalized recommendations

#### Data Sources
- User progress from `progressService`
- Recent sessions from `supabaseDatabaseService`
- Achievements from `achievementService`
- Weather data for contextual recommendations

### Home (Legacy)
**File**: `src/pages/Home.tsx`
**Route**: `/old-home`

Legacy home page maintained for backward compatibility.

### Meditation Page
**File**: `src/pages/Meditation.tsx`
**Route**: `/meditation`

Main meditation session interface with guided meditations and timer functionality.

#### Features
- **Session Selection**: Browse guided meditation categories
- **Timer Interface**: Customizable meditation timer
- **Audio Player**: Guided meditation playback
- **Background Sounds**: Nature sounds and ambient music
- **Session Notes**: Post-meditation reflection
- **Progress Tracking**: Session completion and statistics

#### Session Types
- Guided meditations with voice instruction
- Silent meditation with timer only
- Breathing exercises with visual guides
- Walking meditation with GPS tracking
- Body scan meditations
- Loving-kindness practices

#### Components
- `MeditationTimer` - Core timer functionality
- `AudioPlayer` - Guided session playback
- `SessionComplete` - Post-session summary
- `MoodSelector` - Pre/post mood tracking

### Breathing Session
**File**: `src/pages/BreathingSession.tsx`
**Route**: `/breathing`

Dedicated breathing exercise interface with visual guidance.

#### Features
- **Breathing Patterns**: 4-7-8, Box breathing, Equal breathing
- **Visual Guide**: Animated breathing circle
- **Custom Patterns**: Create personalized breathing rhythms
- **Background Sounds**: Optional calming audio
- **Session Tracking**: Duration and pattern completion
- **Biometric Integration**: Heart rate monitoring (when available)

#### Breathing Techniques
- **4-7-8 Breathing**: Inhale 4, hold 7, exhale 8
- **Box Breathing**: Equal 4-count intervals
- **Triangle Breathing**: 3-phase breathing cycle
- **Custom Patterns**: User-defined rhythms

#### Components
- `BreathingGuide` - Visual breathing animation
- `BreathingCard` - Pattern selection
- Timer and progress indicators

## 📊 Progress and Analytics Pages

### History Page
**File**: `src/pages/History.tsx`
**Route**: `/history`

Comprehensive meditation history and progress tracking.

#### Features
- **Session Calendar**: Visual calendar of meditation days
- **Detailed Statistics**: Charts and graphs of progress
- **Streak Tracking**: Current and historical streaks
- **Category Analysis**: Time spent in different meditation types
- **Mood Trends**: Correlation between meditation and mood
- **Export Options**: Data export for external analysis

#### Views
- Calendar view with session indicators
- Chart view with progress graphs
- List view with detailed session records
- Statistics dashboard with key metrics

### Analytics Page
**File**: `src/pages/Analytics.tsx`
**Route**: `/analytics`

Advanced analytics and insights dashboard.

#### Features
- **Habit Formation**: Progress toward consistent practice
- **Optimal Times**: Best meditation times analysis
- **Effectiveness Metrics**: Mood improvement tracking
- **Goal Progress**: Progress toward meditation goals
- **Comparative Analysis**: Month-over-month comparisons
- **Personalized Insights**: AI-driven recommendations

#### Components
- `MeditationStatistics` - Core statistics display
- `ProgressReports` - Detailed progress analysis
- `HabitFormationTracker` - Habit development metrics
- Interactive charts and visualizations

## 🌍 Discovery and Content Pages

### Explore Page
**File**: `src/pages/Explore.tsx`
**Route**: `/explore`

Content discovery and meditation program exploration.

#### Features
- **Featured Content**: Curated meditation programs
- **Categories**: Browse by meditation type or theme
- **Search Functionality**: Find specific content
- **Recommendations**: Personalized content suggestions
- **Trending**: Popular meditations among users
- **New Releases**: Recently added content
- **Cultural Content**: Indonesian meditation traditions

#### Content Categories
- Beginner programs
- Advanced techniques
- Stress relief
- Sleep meditations
- Focus and concentration
- Emotional healing
- Spiritual growth
- Cultural practices

### Courses Page
**File**: `src/pages/Courses.tsx`
**Route**: `/courses`

Structured meditation courses and learning paths.

#### Features
- **Course Catalog**: Available meditation courses
- **Progress Tracking**: Course completion status
- **Learning Paths**: Guided progression through topics
- **Certificates**: Achievement certificates for completed courses
- **Instructor Profiles**: Information about meditation teachers
- **Course Reviews**: User ratings and feedback

#### Course Types
- Foundational meditation courses
- Specialized technique training
- Mindfulness in daily life
- Stress management programs
- Sleep improvement courses
- Emotional intelligence development

### Content Library Page
**File**: `src/pages/ContentLibrary.tsx`
**Route**: `/content-library`

Comprehensive content management and library interface.

#### Features
- **Content Organization**: Categorized meditation content
- **Download Management**: Offline content downloads
- **Favorites**: Bookmarked content access
- **Recently Played**: Quick access to recent content
- **Content Rating**: User ratings and reviews
- **Playlist Creation**: Custom meditation playlists

## 📝 Personal Development Pages

### Journal Page
**File**: `src/pages/Journal.tsx`
**Route**: `/journal`

Personal meditation journaling and reflection interface.

#### Features
- **Daily Entries**: Meditation reflections and insights
- **Mood Tracking**: Emotional state before/after meditation
- **Gratitude Practice**: Dedicated gratitude journaling
- **Insight Capture**: Record meditation insights and realizations
- **Progress Notes**: Personal growth observations
- **Search & Filter**: Find specific journal entries
- **Export Options**: Export journal data

#### Entry Types
- Post-meditation reflections
- Daily gratitude lists
- Insight and realization notes
- Goal setting and progress
- Emotional processing entries
- Spiritual experiences

### Emotional Awareness Page
**File**: `src/pages/EmotionalAwareness.tsx`
**Route**: `/emotional-awareness`

Emotional intelligence development through meditation.

#### Features
- **Emotion Tracking**: Pre/post meditation emotional states
- **Emotion Wheel**: Interactive emotion selection
- **Pattern Recognition**: Emotional pattern analysis
- **Guided Exercises**: Emotional regulation techniques
- **Progress Tracking**: Emotional intelligence development
- **Insights**: Personalized emotional awareness insights

## 👤 User Management Pages

### Profile Page
**File**: `src/pages/Profile.tsx`
**Route**: `/profile`

User profile management and personal information.

#### Features
- **Profile Information**: Display name, avatar, email
- **Meditation Stats**: Personal meditation statistics
- **Achievement Display**: Unlocked achievements and badges
- **Streak Information**: Current and longest streaks
- **Goal Setting**: Personal meditation goals
- **Social Features**: Share progress with community (optional)
- **Data Export**: Export personal meditation data

#### Components
- `DefaultProfilePicture` - Avatar display
- `ProfileSyncStatus` - Data synchronization status
- Achievement badges and progress indicators

### Settings Page
**File**: `src/pages/Settings.tsx`
**Route**: `/settings`

Application settings and user preferences.

#### Settings Categories

##### **General Settings**
- Theme selection (light/dark/auto)
- Language preferences
- Time zone configuration
- Default session duration

##### **Notification Settings**
- Daily reminders
- Achievement notifications
- Weekly progress reports
- Email notifications
- Push notification preferences

##### **Audio Settings**
- Default volume levels
- Background sound preferences
- Voice guidance settings
- Audio quality selection

##### **Privacy Settings**
- Data sharing preferences
- Analytics opt-in/out
- Profile visibility
- Social features toggle

##### **Accessibility Settings**
- Font size adjustment
- High contrast mode
- Reduced motion preferences
- Screen reader compatibility

#### Components
- `NotificationSettings` - Notification configuration
- `AudioPreferences` - Audio settings
- `PrivacyControls` - Privacy management

### Account Management Page
**File**: `src/pages/AccountManagement.tsx`
**Route**: `/account`

Comprehensive account management interface.

#### Features
- **Subscription Management**: Premium account features
- **Billing Information**: Payment methods and billing history
- **Data Management**: Export, import, and delete data
- **Account Security**: Password changes and 2FA
- **Connected Accounts**: OAuth provider management
- **Account Deletion**: Permanent account removal

#### Components
- `AccountSummary` - Account overview
- `SubscriptionManagement` - Premium features
- `PrivacyControls` - Data and privacy settings

### Personalization Page
**File**: `src/pages/Personalization.tsx`
**Route**: `/personalization`

Personal meditation experience customization.

#### Features
- **Meditation Preferences**: Preferred styles and durations
- **Goal Configuration**: Personal meditation goals
- **Reminder Setup**: Customized reminder schedules
- **Experience Level**: Skill level and progression tracking
- **Interest Areas**: Focus areas and meditation themes
- **Custom Sessions**: Personalized meditation sessions

## 🤖 Advanced Features Pages

### Multiagent Dashboard
**File**: `src/pages/MultiagentDashboard.tsx`
**Route**: `/multiagent`

AI-powered personalization and multi-agent system interface.

#### Features
- **AI Agents**: Personal meditation AI assistants
- **Task Management**: AI-driven task and goal management
- **Personalization Engine**: Advanced customization algorithms
- **Learning Analytics**: AI-powered progress analysis
- **Recommendation System**: Intelligent content suggestions
- **Adaptive Learning**: System that learns from user behavior

#### Components
- `AgentManagement` - AI agent configuration
- `TaskDashboard` - AI task management
- Advanced analytics and machine learning interfaces

### Admin Dashboard
**File**: `src/pages/AdminDashboard.tsx`
**Route**: `/admin`

Administrative interface for app management (admin users only).

#### Features
- **User Management**: User account administration
- **Content Management**: Add/edit meditation content
- **Analytics Overview**: App usage analytics
- **System Health**: Application performance monitoring
- **Achievement Management**: Create and manage achievements
- **Notification Management**: System-wide notifications

#### Components
- `AdminPanel` - Main admin interface
- `AchievementResetPanel` - Achievement management
- User management and content administration tools

### Community Page
**File**: `src/pages/Community.tsx`
**Route**: `/community`

Social features and community interaction.

#### Features
- **Community Challenges**: Group meditation challenges
- **Progress Sharing**: Share achievements with others
- **Discussion Forums**: Meditation discussion communities
- **Group Sessions**: Virtual group meditation sessions
- **Leaderboards**: Friendly competition and motivation
- **Social Support**: Connect with other meditators

## 🛠️ Utility Pages

### Components Demo
**File**: `src/pages/ComponentsDemo.tsx`
**Route**: `/demo`

Development utility page showcasing all UI components.

#### Features
- Component library showcase
- Interactive component examples
- Design system demonstration
- Development reference guide
- Visual testing interface

### Help Page
**File**: `src/pages/Help.tsx`
**Route**: `/help`

User support and help documentation.

#### Features
- **FAQ**: Frequently asked questions
- **Getting Started**: New user guide
- **Feature Documentation**: How to use app features
- **Troubleshooting**: Common issue solutions
- **Contact Support**: Support contact information
- **Video Tutorials**: Instructional videos

### Password Reset Page
**File**: `src/pages/PasswordReset.tsx` (if exists)
**Route**: `/auth/reset-password`

Password reset interface for authenticated users.

## 📱 Layout and Navigation

### App Layout Structure

The application uses a nested layout system:

```jsx
<SupabaseAuthProvider>
  <OfflineProvider>
    <OnboardingProvider>
      <Router>
        <Routes>
          {/* Public routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected routes with layout */}
          <Route path="/*" element={
            <SupabaseProtectedRoute>
              <DashboardLayout>
                {/* Page content */}
              </DashboardLayout>
            </SupabaseProtectedRoute>
          } />
        </Routes>
      </Router>
    </OnboardingProvider>
  </OfflineProvider>
</SupabaseAuthProvider>
```

### Navigation Features

#### Bottom Navigation (Mobile)
- Home/Dashboard
- Meditation
- History
- Explore
- Profile

#### Top Navigation (Desktop)
- App branding
- Search functionality
- User menu
- Notifications
- Settings access

#### Sidebar Navigation (Desktop)
- Expandable menu
- Feature categories
- Quick actions
- Progress indicators

## 🔄 Route Protection

### Authentication Requirements

#### Public Routes
- `/login` - Login page
- `/signup` - Registration page

#### Protected Routes
- All other routes require authentication
- Guests have limited access with local storage
- Full features require user account

#### Route Guards
- `SupabaseProtectedRoute` - Supabase authentication
- `ProtectedRoute` - General authentication wrapper
- Automatic redirect to login for unauthenticated users

### Navigation Utilities

#### `useScrollToTop` Hook
Automatically scrolls to top on route changes for better UX.

#### Route State Management
- Current route tracking
- Navigation history
- Deep linking support
- URL parameter handling

This comprehensive documentation covers all pages and routing functionality in the Sembalun meditation application.