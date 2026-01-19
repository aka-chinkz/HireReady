#!/bin/bash

echo "🔧 Setting up CareerPath Planner Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+ first."
    exit 1
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Install Prisma
echo "📥 Installing Prisma..."
pip install prisma

# Generate Prisma client
echo "🔨 Generating Prisma client..."
prisma generate --schema=prisma/schema.prisma

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your database credentials!"
fi

echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your DATABASE_URL"
echo "2. Run database migrations: prisma migrate dev --schema=prisma/schema.prisma"
echo "3. Seed the database: python prisma/seed.py"
echo "4. Start the server: uvicorn main:app --reload"





