# Sembalun API Documentation

## Overview

The Sembalun Indonesian Meditation Platform provides a comprehensive REST API built on Supabase with enterprise-grade security, performance, and scalability features.

**Base URL**: `https://api.sembalun.com`  
**Version**: `v1`  
**Authentication**: Supabase JWT tokens  
**Rate Limiting**: Tiered based on authentication  

## Table of Contents

- [Authentication](#authentication)
- [Core Resources](#core-resources)
- [Meditation API](#meditation-api)
- [User Management](#user-management)
- [Progress Tracking](#progress-tracking)
- [Cultural Content](#cultural-content)
- [Real-time Features](#real-time-features)
- [Analytics API](#analytics-api)
- [Admin API](#admin-api)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [SDKs and Libraries](#sdks-and-libraries)

## Authentication

### Overview
Sembalun uses Supabase Auth with JWT tokens for secure authentication. All API requests must include a valid bearer token.

### Authentication Flow

#### 1. Sign Up
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!",
  "data": {
    "display_name": "John Doe",
    "preferred_language": "id",
    "meditation_experience": "beginner"
  }
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "email_confirmed_at": "2025-01-06T10:00:00Z",
    "user_metadata": {
      "display_name": "John Doe",
      "preferred_language": "id"
    }
  }
}
```

#### 2. Sign In
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

#### 3. Google OAuth
```http
GET /auth/v1/authorize?provider=google&redirect_to=https://sembalun.com/auth/callback
```

#### 4. Token Refresh
```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

### Using Authentication
Include the token in all API requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Core Resources

### User Profile

#### Get Current User
```http
GET /api/v1/user/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "display_name": "John Doe",
  "avatar_url": "https://storage.sembalun.com/avatars/uuid.jpg",
  "meditation_experience": "intermediate",
  "preferred_language": "id",
  "cultural_tradition": "javanese",
  "preferences": {
    "session_duration": 600,
    "reminder_notifications": true,
    "background_sounds": true,
    "guided_meditation": true
  },
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-06T10:00:00Z"
}
```

#### Update User Profile
```http
PUT /api/v1/user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "display_name": "Jane Doe",
  "meditation_experience": "advanced",
  "cultural_tradition": "balinese",
  "preferences": {
    "session_duration": 900,
    "reminder_notifications": false
  }
}
```

## Meditation API

### Meditation Sessions

#### Start Meditation Session
```http
POST /api/v1/meditation/sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "meditation_type": "mindfulness",
  "duration": 600,
  "cultural_variant": "javanese",
  "background_audio": "forest_sounds",
  "guided": true,
  "difficulty": "intermediate"
}
```

**Response:**
```json
{
  "session_id": "session-uuid",
  "meditation_type": "mindfulness",
  "duration": 600,
  "cultural_variant": "javanese",
  "audio_urls": {
    "guidance": "https://cdn.sembalun.com/audio/javanese-mindfulness-guide.mp3",
    "background": "https://cdn.sembalun.com/audio/forest-sounds.mp3",
    "bell": "https://cdn.sembalun.com/audio/tibetan-bell.mp3"
  },
  "instructions": {
    "preparation": "Duduk dengan nyaman, tutup mata perlahan...",
    "breathing": "Tarik nafas dalam-dalam melalui hidung...",
    "focus_points": [
      "Perhatikan napas masuk dan keluar",
      "Rasakan ketenangan dalam diri",
      "Lepaskan pikiran yang mengganggu"
    ]
  },
  "started_at": "2025-01-06T10:30:00Z"
}
```

#### Complete Meditation Session
```http
POST /api/v1/meditation/sessions/{session_id}/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "actual_duration": 580,
  "completion_rate": 0.97,
  "mood_before": 3,
  "mood_after": 8,
  "focus_level": 7,
  "interruptions": 1,
  "notes": "Sesi yang sangat menenangkan, merasa lebih fokus."
}
```

#### Get Meditation History
```http
GET /api/v1/meditation/sessions?limit=20&offset=0&start_date=2025-01-01&end_date=2025-01-06
Authorization: Bearer {token}
```

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "session-uuid",
      "meditation_type": "mindfulness",
      "duration": 600,
      "actual_duration": 580,
      "completion_rate": 0.97,
      "cultural_variant": "javanese",
      "mood_before": 3,
      "mood_after": 8,
      "focus_level": 7,
      "started_at": "2025-01-06T10:30:00Z",
      "completed_at": "2025-01-06T10:39:40Z"
    }
  ],
  "total_count": 45,
  "has_more": true
}
```

### Meditation Content

#### Get Available Content
```http
GET /api/v1/meditation/content?type=guided&tradition=javanese&difficulty=beginner
Authorization: Bearer {token}
```

**Response:**
```json
{
  "content": [
    {
      "content_id": "content-uuid",
      "title": "Meditasi Pernapasan Jawa",
      "description": "Teknik pernapasan tradisional Jawa untuk ketenangan jiwa",
      "type": "guided",
      "tradition": "javanese",
      "difficulty": "beginner",
      "duration": 600,
      "instructor": "Romo Sastro Wijaya",
      "audio_url": "https://cdn.sembalun.com/content/javanese-breathing.mp3",
      "thumbnail": "https://cdn.sembalun.com/thumbs/javanese-breathing.jpg",
      "tags": ["pernapasan", "tradisional", "ketenangan"],
      "rating": 4.8,
      "plays_count": 2847,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total_count": 120,
  "filters": {
    "types": ["guided", "music", "sounds", "silence"],
    "traditions": ["javanese", "balinese", "sundanese", "minang"],
    "difficulties": ["beginner", "intermediate", "advanced"]
  }
}
```

#### Download Content for Offline
```http
POST /api/v1/meditation/content/{content_id}/download
Authorization: Bearer {token}
```

**Response:**
```json
{
  "download_url": "https://secure-cdn.sembalun.com/downloads/content-uuid.mp3?token=...",
  "expires_at": "2025-01-06T11:30:00Z",
  "file_size": 15728640,
  "format": "mp3",
  "quality": "192kbps"
}
```

## User Management

### Achievements and Progress

#### Get User Achievements
```http
GET /api/v1/user/achievements
Authorization: Bearer {token}
```

**Response:**
```json
{
  "achievements": [
    {
      "achievement_id": "first_session",
      "title": "Langkah Pertama",
      "description": "Menyelesaikan sesi meditasi pertama",
      "icon": "lotus",
      "cultural_variant": "javanese",
      "earned_at": "2025-01-01T10:30:00Z",
      "rarity": "common"
    },
    {
      "achievement_id": "week_streak",
      "title": "Semangat Bermeditasi",
      "description": "Bermeditasi 7 hari berturut-turut",
      "icon": "flame",
      "cultural_variant": "javanese",
      "earned_at": "2025-01-07T09:15:00Z",
      "rarity": "uncommon"
    }
  ],
  "progress": {
    "total_earned": 15,
    "total_available": 48,
    "next_milestone": {
      "achievement_id": "month_streak",
      "progress": 7,
      "required": 30
    }
  }
}
```

#### Get Meditation Statistics
```http
GET /api/v1/user/statistics?period=month&year=2025&month=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "period": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  },
  "summary": {
    "total_sessions": 28,
    "total_minutes": 4200,
    "average_session_length": 150,
    "completion_rate": 0.93,
    "current_streak": 7,
    "longest_streak": 14
  },
  "daily_breakdown": [
    {
      "date": "2025-01-01",
      "sessions": 1,
      "minutes": 150,
      "completion_rate": 1.0,
      "mood_improvement": 5
    }
  ],
  "mood_trends": {
    "average_before": 4.2,
    "average_after": 7.8,
    "improvement": 3.6
  },
  "meditation_types": {
    "mindfulness": 45,
    "breathing": 30,
    "loving_kindness": 15,
    "body_scan": 10
  }
}
```

## Progress Tracking

### Mood and Wellness

#### Log Mood Entry
```http
POST /api/v1/user/mood
Authorization: Bearer {token}
Content-Type: application/json

{
  "mood_score": 7,
  "energy_level": 6,
  "stress_level": 3,
  "sleep_quality": 8,
  "notes": "Merasa tenang setelah meditasi pagi",
  "tags": ["tenang", "fokus", "energik"],
  "logged_at": "2025-01-06T10:45:00Z"
}
```

#### Get Mood History
```http
GET /api/v1/user/mood?start_date=2025-01-01&end_date=2025-01-06
Authorization: Bearer {token}
```

**Response:**
```json
{
  "entries": [
    {
      "mood_id": "mood-uuid",
      "mood_score": 7,
      "energy_level": 6,
      "stress_level": 3,
      "sleep_quality": 8,
      "notes": "Merasa tenang setelah meditasi pagi",
      "tags": ["tenang", "fokus", "energik"],
      "logged_at": "2025-01-06T10:45:00Z"
    }
  ],
  "trends": {
    "mood_trend": "improving",
    "average_mood": 6.8,
    "mood_volatility": "low"
  }
}
```

### Goal Setting

#### Create Meditation Goal
```http
POST /api/v1/user/goals
Authorization: Bearer {token}
Content-Type: application/json

{
  "goal_type": "consistency",
  "target_value": 30,
  "target_unit": "days",
  "description": "Bermeditasi setiap hari selama 30 hari",
  "start_date": "2025-01-06",
  "end_date": "2025-02-05"
}
```

#### Get Goal Progress
```http
GET /api/v1/user/goals
Authorization: Bearer {token}
```

**Response:**
```json
{
  "goals": [
    {
      "goal_id": "goal-uuid",
      "goal_type": "consistency",
      "target_value": 30,
      "current_value": 7,
      "target_unit": "days",
      "progress_percentage": 23.3,
      "description": "Bermeditasi setiap hari selama 30 hari",
      "start_date": "2025-01-06",
      "end_date": "2025-02-05",
      "status": "active",
      "created_at": "2025-01-06T00:00:00Z"
    }
  ]
}
```

## Cultural Content

### Indonesian Traditions

#### Get Traditional Practices
```http
GET /api/v1/culture/practices?tradition=javanese
Authorization: Bearer {token}
```

**Response:**
```json
{
  "practices": [
    {
      "practice_id": "semedi-javanese",
      "name": "Semedi",
      "tradition": "javanese",
      "description": "Praktik meditasi tradisional Jawa untuk mencapai ketenangan batin",
      "instructions": [
        "Duduk bersila dengan punggung tegak",
        "Letakkan tangan di atas lutut",
        "Tutup mata dan fokus pada pernapasan",
        "Kosongkan pikiran dari segala kekhawatiran"
      ],
      "benefits": [
        "Meningkatkan konsentrasi",
        "Mengurangi stress",
        "Mencapai kedamaian batin"
      ],
      "duration_range": {
        "min": 300,
        "max": 3600,
        "recommended": 900
      },
      "difficulty": "intermediate",
      "audio_guide": "https://cdn.sembalun.com/culture/semedi-guide.mp3"
    }
  ]
}
```

#### Get Wisdom Quotes
```http
GET /api/v1/culture/quotes?tradition=javanese&category=mindfulness
Authorization: Bearer {token}
```

**Response:**
```json
{
  "quotes": [
    {
      "quote_id": "javanese-001",
      "text": "Urip iku urup, dadi manungsa kudu bisa madangi liyan",
      "translation": "Hidup itu menerangi, menjadi manusia harus bisa menerangi orang lain",
      "tradition": "javanese",
      "category": "mindfulness",
      "source": "Filosofi Jawa",
      "context": "Tentang berbagi kebaikan dan pencerahan kepada sesama"
    }
  ]
}
```

## Real-time Features

### Live Sessions

#### Join Community Session
```http
POST /api/v1/community/sessions/{session_id}/join
Authorization: Bearer {token}
```

**Response:**
```json
{
  "session_id": "community-uuid",
  "session_name": "Meditasi Bersama Sore",
  "host": "Guru Meditation",
  "participants_count": 23,
  "max_participants": 50,
  "start_time": "2025-01-06T17:00:00Z",
  "duration": 1800,
  "websocket_url": "wss://realtime.sembalun.com/sessions/community-uuid",
  "auth_token": "ws-token-here"
}
```

### WebSocket Events

#### Connection
```javascript
const ws = new WebSocket('wss://realtime.sembalun.com/sessions/community-uuid');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));
```

#### Session Events
```javascript
// Incoming events
{
  "type": "session_started",
  "timestamp": "2025-01-06T17:00:00Z"
}

{
  "type": "participant_joined",
  "user_id": "user-uuid",
  "display_name": "John Doe"
}

{
  "type": "guidance_cue",
  "instruction": "Tarik nafas dalam-dalam",
  "duration": 5000
}

{
  "type": "session_ended",
  "summary": {
    "duration": 1800,
    "participants": 45
  }
}
```

## Analytics API

### Session Analytics

#### Get Performance Metrics
```http
GET /api/v1/analytics/performance?start_date=2025-01-01&end_date=2025-01-06
Authorization: Bearer {token}
```

**Response:**
```json
{
  "metrics": {
    "core_web_vitals": {
      "lcp": 1850,
      "fid": 45,
      "cls": 0.08,
      "fcp": 1200,
      "ttfb": 120
    },
    "user_engagement": {
      "session_duration": 12.5,
      "meditation_completion_rate": 0.89,
      "feature_utilization": {
        "timer": 0.95,
        "guided_sessions": 0.78,
        "background_sounds": 0.67
      }
    },
    "technical": {
      "memory_usage": 85.2,
      "load_time": 2.1,
      "error_rate": 0.005
    }
  }
}
```

### User Behavior Analytics

#### Get Usage Patterns
```http
GET /api/v1/analytics/usage?period=week
Authorization: Bearer {token}
```

**Response:**
```json
{
  "usage_patterns": {
    "peak_hours": [6, 7, 8, 19, 20, 21],
    "preferred_session_length": 600,
    "popular_meditation_types": [
      {
        "type": "mindfulness",
        "percentage": 45
      },
      {
        "type": "breathing",
        "percentage": 30
      }
    ],
    "cultural_preferences": {
      "javanese": 40,
      "balinese": 25,
      "sundanese": 20,
      "general": 15
    }
  }
}
```

## Admin API

### User Management

#### Get User List (Admin Only)
```http
GET /api/v1/admin/users?limit=50&offset=0&role=user
Authorization: Bearer {admin-token}
```

**Response:**
```json
{
  "users": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "display_name": "John Doe",
      "role": "user",
      "status": "active",
      "last_login": "2025-01-06T10:00:00Z",
      "meditation_stats": {
        "total_sessions": 45,
        "total_minutes": 6750,
        "current_streak": 7
      },
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total_count": 10847,
  "has_more": true
}
```

### Content Management

#### Upload Meditation Content (Admin Only)
```http
POST /api/v1/admin/content
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data

{
  "title": "Meditasi Ketenangan Batin",
  "description": "Panduan meditasi untuk mencapai ketenangan dalam",
  "type": "guided",
  "tradition": "javanese",
  "difficulty": "intermediate",
  "duration": 900,
  "instructor": "Guru Meditation",
  "audio_file": <file>,
  "thumbnail": <file>,
  "tags": ["ketenangan", "batin", "javanese"]
}
```

## Error Handling

### Error Response Format
All API errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format",
      "provided_value": "invalid-email"
    },
    "timestamp": "2025-01-06T10:30:00Z",
    "request_id": "req-uuid-here"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Valid authentication token required |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist |
| `VALIDATION_ERROR` | 422 | Request data validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Request rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error occurred |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Error Handling Best Practices

```javascript
// Example error handling
async function startMeditation(sessionData) {
  try {
    const response = await fetch('/api/v1/meditation/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
      const error = await response.json();
      
      switch (error.error.code) {
        case 'AUTHENTICATION_REQUIRED':
          // Redirect to login
          window.location.href = '/login';
          break;
        case 'RATE_LIMIT_EXCEEDED':
          // Show rate limit message
          showMessage('Too many requests. Please try again later.');
          break;
        case 'VALIDATION_ERROR':
          // Show validation errors
          showValidationErrors(error.error.details);
          break;
        default:
          // Generic error handling
          showMessage('An unexpected error occurred. Please try again.');
      }
      
      throw new Error(error.error.message);
    }

    return await response.json();
  } catch (networkError) {
    // Handle network errors
    showMessage('Network error. Please check your connection.');
    throw networkError;
  }
}
```

## Rate Limits

### Rate Limit Tiers

| User Type | Requests/Hour | Burst Limit |
|-----------|---------------|-------------|
| **Unauthenticated** | 100 | 10/minute |
| **Authenticated** | 1,000 | 50/minute |
| **Premium** | 5,000 | 200/minute |
| **Admin** | 10,000 | 500/minute |

### Rate Limit Headers
All responses include rate limit headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641484800
X-RateLimit-Tier: authenticated
```

### Handling Rate Limits

```javascript
function checkRateLimit(response) {
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'));
  const reset = parseInt(response.headers.get('X-RateLimit-Reset'));
  
  if (remaining < 10) {
    const resetTime = new Date(reset * 1000);
    console.warn(`Rate limit low. Resets at ${resetTime}`);
  }
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript SDK
```bash
npm install @sembalun/sdk
```

```javascript
import { SembalunClient } from '@sembalun/sdk';

const client = new SembalunClient({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Start meditation session
const session = await client.meditation.startSession({
  type: 'mindfulness',
  duration: 600,
  cultural_variant: 'javanese'
});

// Get user stats
const stats = await client.user.getStatistics();
```

### React Hooks
```javascript
import { useMeditation, useUserStats } from '@sembalun/react-hooks';

function MeditationComponent() {
  const { startSession, currentSession, isLoading } = useMeditation();
  const { stats, achievements } = useUserStats();

  const handleStartMeditation = () => {
    startSession({
      type: 'mindfulness',
      duration: 600
    });
  };

  return (
    <div>
      <button onClick={handleStartMeditation} disabled={isLoading}>
        Start Meditation
      </button>
      {currentSession && <MeditationPlayer session={currentSession} />}
    </div>
  );
}
```

### Python SDK
```bash
pip install sembalun-python
```

```python
from sembalun import SembalunClient

client = SembalunClient(api_key='your-api-key')

# Get user meditation history
history = client.meditation.get_history(
    start_date='2025-01-01',
    end_date='2025-01-06'
)

# Analyze user patterns
patterns = client.analytics.get_usage_patterns(period='month')
```

## Webhooks

### Event Types
- `meditation.session.started`
- `meditation.session.completed`
- `user.achievement.earned`
- `user.goal.completed`
- `community.session.joined`

### Webhook Configuration
```http
POST /api/v1/webhooks
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/sembalun",
  "events": [
    "meditation.session.completed",
    "user.achievement.earned"
  ],
  "secret": "webhook-secret-key"
}
```

### Webhook Payload Example
```json
{
  "event": "meditation.session.completed",
  "timestamp": "2025-01-06T10:45:00Z",
  "data": {
    "user_id": "user-uuid",
    "session_id": "session-uuid",
    "meditation_type": "mindfulness",
    "duration": 600,
    "completion_rate": 0.97,
    "mood_improvement": 5
  },
  "signature": "sha256=..."
}
```

---

## Support

For API support and questions:

- **Documentation**: [https://docs.sembalun.com](https://docs.sembalun.com)
- **Developer Support**: dev-support@sembalun.com
- **Status Page**: [https://status.sembalun.com](https://status.sembalun.com)
- **Community**: [https://community.sembalun.com](https://community.sembalun.com)

---

*API Documentation v1.0 - Last updated: January 6, 2025*