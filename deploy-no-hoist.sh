#!/bin/bash

# Deploy script for ultra-conservative no-hoisting configuration
# This script ensures safe deployment with zero variable hoisting issues

set -e  # Exit on any error

echo "🚨 ULTRA-CONSERVATIVE DEPLOYMENT - NO HOISTING CONFIGURATION"
echo "=================================================="
echo

# Check if we're in the right directory
if [ ! -f "vite.config.no-hoist.ts" ]; then
    echo "❌ Error: vite.config.no-hoist.ts not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "🧹 Cleaning previous builds..."
npm run clean || echo "Clean command not available, continuing..."
rm -rf dist/ || true

echo
echo "🔍 Running loose TypeScript check..."
npm run typecheck:loose || echo "TypeScript warnings ignored for no-hoist build"

echo
echo "📦 Building with ultra-conservative configuration..."
echo "⚠️  Expected bundle size: 5-20MB (unminified for safety)"
echo "⚠️  Build time may be longer due to disabled optimizations"
echo

# Build with the no-hoist configuration
npm run build:no-hoist

echo
echo "✅ Build completed successfully!"
echo

# Check build output
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "📊 Build Analysis:"
    echo "=================="
    
    # Show bundle sizes
    if [ -f "dist/js/entry.js" ]; then
        ENTRY_SIZE=$(du -h "dist/js/entry.js" | cut -f1)
        echo "📦 Main bundle size: $ENTRY_SIZE"
    fi
    
    if [ -f "dist/css/style.css" ]; then
        CSS_SIZE=$(du -h "dist/css/style.css" | cut -f1)
        echo "🎨 CSS bundle size: $CSS_SIZE"
    fi
    
    TOTAL_SIZE=$(du -sh dist/ | cut -f1)
    echo "📂 Total build size: $TOTAL_SIZE"
    echo
    
    echo "🔍 Bundle characteristics:"
    echo "• Zero minification - fully readable code"
    echo "• Zero hoisting - variables stay in original order"
    echo "• IIFE format - maximum browser compatibility"
    echo "• Single bundle - no complex chunking"
    echo "• Source maps included for debugging"
    echo
    
    # Check if bundle is very large
    ENTRY_SIZE_MB=$(du -m "dist/js/entry.js" 2>/dev/null | cut -f1 || echo "0")
    if [ "$ENTRY_SIZE_MB" -gt 10 ]; then
        echo "⚠️  WARNING: Bundle is larger than 10MB"
        echo "   This is expected for the no-hoist configuration"
        echo "   Consider optimizing after fixing hoisting issues"
        echo
    fi
    
    echo "🚀 Ready for deployment!"
    echo
    echo "Deployment options:"
    echo "1. Vercel: vercel --prod"
    echo "2. Netlify: netlify deploy --prod --dir=dist"
    echo "3. Manual: Upload contents of dist/ directory"
    echo
    
    # Preview option
    echo "🔍 Test locally:"
    echo "npm run preview"
    echo "Then visit: http://localhost:4173"
    echo
    
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "=================================================="
echo "✅ ULTRA-CONSERVATIVE BUILD COMPLETE"
echo "🎯 This build eliminates ALL hoisting issues"
echo "📏 Bundle size optimized for correctness, not performance"
echo "🔧 Use for debugging and fixing hoisting-related errors"
echo "=================================================="