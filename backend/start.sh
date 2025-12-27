#!/bin/bash

# GearGuard Backend Setup and Start Script
# This script sets up and starts the backend server

echo "🚀 GearGuard Backend Setup"
echo "=========================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

echo "✓ Python found: $(python3 --version)"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✓ Dependencies installed"
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

# Initialize database if it doesn't exist
if [ ! -f "gearguard.db" ]; then
    echo "🗄️  Initializing database..."
    python init_db.py
    echo "✓ Database initialized"
    echo ""
    
    echo "🌱 Seeding database with sample data..."
    python seed_data.py
    echo "✓ Database seeded"
else
    echo "✓ Database already exists"
fi
echo ""

# Start the server
echo "🚀 Starting backend server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
