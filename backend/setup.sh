#!/bin/bash

cd "$(dirname "$0")"

echo "Setting up MeetMate Backend..."

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate venv
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip -q

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please update .env with your actual API keys."
fi

echo ""
echo "Setup complete!"
echo "Run './start.sh' to start the server."
