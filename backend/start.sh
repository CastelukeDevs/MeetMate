#!/bin/bash

cd "$(dirname "$0")"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found. Run setup.sh first."
    exit 1
fi

# Activate venv
source venv/bin/activate

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
