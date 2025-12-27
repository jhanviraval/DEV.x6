#!/bin/bash

# GearGuard Frontend Setup and Start Script
# This script sets up and starts the frontend development server

echo "🚀 GearGuard Frontend Setup"
echo "==========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo "✓ npm found: $(npm --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp env.example .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi
echo ""

# Start the development server
echo "🚀 Starting frontend development server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Make sure the backend is running on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
