#!/bin/bash

# 🚀 Set Vercel Environment Variables Script
# This script sets all required environment variables for Sembalun Mind production

echo "🔧 Setting Vercel Environment Variables for Sembalun Mind..."

# Function to set environment variable
set_env_var() {
    local key=$1
    local value=$2
    echo "Setting $key..."
    echo "$value" | npx vercel env add "$key" production
    if [ $? -eq 0 ]; then
        echo "✅ $key set successfully"
    else
        echo "❌ Failed to set $key"
    fi
    echo ""
}

# Supabase Configuration
echo "📡 Setting Supabase configuration..."
set_env_var "VITE_SUPABASE_URL" "https://rmombyjyhbneukkvkddr.supabase.co"
set_env_var "VITE_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb21ieWp5aGJuZXVra3ZrZGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MTc4NjUsImV4cCI6MjA3MDI5Mzg2NX0.64GZhxOw6pyPw_pO0VbFxQ80JNIZqR6B6tzMUK-tGn4"

# App Configuration
echo "📱 Setting app configuration..."
set_env_var "VITE_APP_NAME" "Sembalun Mind"
set_env_var "VITE_APP_VERSION" "1.0.0"
set_env_var "VITE_APP_DESCRIPTION" "Indonesian Meditation App with Cultural Wisdom"

# PWA Configuration
echo "📲 Setting PWA configuration..."
set_env_var "VITE_PWA_THEME_COLOR" "#6A8F6F"
set_env_var "VITE_PWA_BACKGROUND_COLOR" "#E1E8F0"

# Feature Flags
echo "🎛️ Setting feature flags..."
set_env_var "VITE_ENABLE_ANALYTICS" "true"
set_env_var "VITE_ENABLE_NOTIFICATIONS" "true"
set_env_var "VITE_ENABLE_OFFLINE_MODE" "true"
set_env_var "VITE_ENABLE_AUTH" "true"

# Environment
echo "🌍 Setting environment..."
set_env_var "VITE_ENVIRONMENT" "production"

echo "🎉 All environment variables set! Redeploying to production..."
npx vercel --prod

echo ""
echo "✅ Environment variables configured and deployed!"
echo "🌐 Your app: https://sembalun-f1b9b4vnp-ikigais-projects-cceb1be5.vercel.app"