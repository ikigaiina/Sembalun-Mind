# 🔐 Firebase Rules Deployment Guide

## Prerequisites
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not done)
firebase init
```

## Deploy Rules Commands

### Deploy All Rules
```bash
# Deploy both Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules
```

### Deploy Individual Rules
```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules  
firebase deploy --only storage:rules
```

### Validate Rules Before Deploy
```bash
# Test Firestore rules
firebase firestore:rules:get

# Validate rules syntax
firebase firestore:rules:validate firestore.rules
```

## Manual Deployment (via Console)

### Firestore Rules
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `sembalun-82030`
3. Go to **Firestore Database** → **Rules**
4. Copy content from `firestore.rules`
5. Click **Publish**

### Storage Rules
1. In Firebase Console
2. Go to **Storage** → **Rules**
3. Copy content from `storage.rules`
4. Click **Publish**

## Testing Rules

### Local Testing
```bash
# Install Firebase emulator
firebase init emulators

# Start emulator with rules
firebase emulators:start --only firestore,storage

# Test rules in emulator UI
# Visit: http://localhost:4000
```

### Production Testing
```bash
# Test specific rule
firebase firestore:rules:test --test-suite=test-suite.js
```

## Rule Files Created
- `firestore.rules` - Database security rules
- `storage.rules` - File storage security rules  
- `firebase.json` - Updated with storage rules config

## Key Security Features

### 🔒 Firestore Rules
- Users can only access their own data
- Validates data structure on writes
- Public content is read-only
- Analytics data is write-only

### 📁 Storage Rules  
- Profile pictures: user-owned, 5MB limit
- Private files: user-owned only
- Public content: read-only
- File type validation (images/audio)

## Quick Deploy
```bash
firebase deploy --only firestore:rules,storage:rules
```