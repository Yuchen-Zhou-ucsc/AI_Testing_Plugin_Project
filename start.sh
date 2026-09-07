#!/bin/bash

echo "Starting AI Testing Plugin Project..."

cd backend
python3 app.py &

cd ../frontend
npm run dev &

open http://localhost:5173/
