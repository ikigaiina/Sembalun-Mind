#!/bin/bash

# 🚀 Automated Vercel Deployment Script for Sembalun
# This script prepares and deploys the meditation app to Vercel

set -e  # Exit on any error

echo "🚀 Starting Vercel deployment preparation..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Step 1: Installing dependencies..."
npm install

print_status "Step 2: Running TypeScript type checking..."
npm run typecheck
if [ $? -eq 0 ]; then
    print_success "TypeScript compilation passed!"
else
    print_warning "TypeScript warnings detected, but continuing..."
fi

print_status "Step 3: Running linter..."
npm run lint --silent || print_warning "Lint warnings detected, but continuing..."

print_status "Step 4: Building production bundle..."
npm run build:vercel
if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed. Please fix errors before deploying."
    exit 1
fi

print_status "Step 5: Checking build output..."
if [ -d "dist" ]; then
    print_success "Build output directory found: dist/"
    echo "Build size: $(du -sh dist | cut -f1)"
else
    print_error "Build output directory not found!"
    exit 1
fi

print_status "Step 6: Verifying critical files..."
critical_files=("dist/index.html" "dist/assets" "vercel.json" "package.json")
for file in "${critical_files[@]}"; do
    if [ -e "$file" ]; then
        print_success "✓ $file found"
    else
        print_error "✗ $file missing"
        exit 1
    fi
done

print_status "Step 7: Checking environment variables..."
if [ -f ".env.production" ]; then
    print_success "Production environment file found"
    print_warning "Remember to set these variables in Vercel dashboard:"
    grep "^VITE_" .env.production | sed 's/=.*/=***/' || true
else
    print_warning "No .env.production file found"
fi

print_status "Step 8: Preparing deployment..."

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    print_success "Vercel CLI found"
    
    echo ""
    echo "🚀 Ready to deploy! Choose your deployment method:"
    echo "1. Deploy now with Vercel CLI (vercel --prod)"
    echo "2. Just prepare files (manual deploy via dashboard)"
    echo ""
    
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            print_status "Deploying to Vercel..."
            vercel --prod
            print_success "Deployment completed!"
            ;;
        2)
            print_success "Files prepared for manual deployment"
            ;;
        *)
            print_warning "Invalid choice. Files prepared for manual deployment."
            ;;
    esac
else
    print_warning "Vercel CLI not found. You can:"
    echo "  1. Install it: npm i -g vercel"
    echo "  2. Or deploy manually via Vercel dashboard"
fi

echo ""
print_success "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Set environment variables in Vercel dashboard"
echo "  2. Configure Firebase authorized domains"
echo "  3. Test the deployed application"
echo "  4. Set up custom domain (optional)"
echo ""
echo "📖 For detailed instructions, see: README-DEPLOYMENT.md"
echo ""
print_success "Your Sembalun meditation app is ready for production! 🧘‍♀️✨"