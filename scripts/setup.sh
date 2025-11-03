#!/bin/bash

# AI Commerce Platform - Quick Setup Script
# This script will set up your development environment

set -e  # Exit on error

echo "🚀 AI Commerce Platform - Setup Script"
echo "======================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Setup environment variables
if [ ! -f .env.local ]; then
    echo "⚙️  Setting up environment variables..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local with your credentials:"
    echo "   - Supabase URL and keys"
    echo "   - Anthropic API key"
    echo ""
    
    # Open .env.local in default editor
    if command -v code &> /dev/null; then
        code .env.local
    elif command -v nano &> /dev/null; then
        nano .env.local
    else
        echo "📝 Please edit .env.local manually"
    fi
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🗄️  Database Setup"
echo "=================="
echo ""
echo "Please complete these steps:"
echo ""
echo "1. Go to https://supabase.com"
echo "2. Create a new project"
echo "3. Copy your connection details to .env.local"
echo "4. Run the database schema:"
echo "   - Open Supabase SQL Editor"
echo "   - Run migrations/001_initial_schema.sql"
echo "   - Run scripts/seed.sql (for test data)"
echo ""

read -p "Have you completed database setup? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Please complete database setup first"
    exit 1
fi

echo "✅ Database setup confirmed"
echo ""

# Build project
echo "🔨 Building project..."
npm run build
echo "✅ Build successful"
echo ""

echo "✨ Setup Complete!"
echo "================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start development server:"
echo "   npm run dev"
echo ""
echo "2. Open http://localhost:3000"
echo ""
echo "3. Test the following:"
echo "   - Sign up / Login"
echo "   - Add a product URL"
echo "   - View AI insights"
echo ""
echo "📚 Documentation: /docs"
echo "🐛 Issues: https://github.com/yourusername/ai-commerce/issues"
echo ""
echo "Happy coding! 🎉"