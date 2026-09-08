#!/usr/bin/env bash
set -e

echo "Starting AI Testing Plugin Project..."

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$ROOT_DIR/.pids"
mkdir -p "$PID_DIR"

if [ ! -f "$ROOT_DIR/backend/.venv/bin/python" ]; then
  echo "Backend virtual environment not found."
  echo "Run the README setup steps first:"
  echo "  cd backend"
  echo "  python3 -m venv .venv"
  echo "  source .venv/bin/activate"
  echo "  pip install -r requirements.txt"
  exit 1
fi

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "Frontend dependencies not found."
  echo "Run the README setup steps first:"
  echo "  cd frontend"
  echo "  npm install"
  echo "  npx playwright install chromium"
  exit 1
fi

cd "$ROOT_DIR/backend"
"$ROOT_DIR/backend/.venv/bin/python" database.py
"$ROOT_DIR/backend/.venv/bin/python" -m flask --app app run --host 127.0.0.1 --port 5000 --no-debugger --no-reload > "$PID_DIR/backend.log" 2>&1 &
echo $! > "$PID_DIR/backend.pid"

cd "$ROOT_DIR/frontend"
npm run dev > "$PID_DIR/frontend.log" 2>&1 &
echo $! > "$PID_DIR/frontend.pid"

echo "Backend starting at http://127.0.0.1:5000"
echo "Frontend starting at http://localhost:5173"
echo "Open http://localhost:5173/generate-tests"

if command -v open >/dev/null 2>&1; then
  open http://localhost:5173/generate-tests
fi
