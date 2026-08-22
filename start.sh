#!/bin/zsh

cd "$(dirname "$0")"

BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$FRONTEND_DIR" ]; then
  echo "Missing backend or frontend directory."
  exit 1
fi

# Start backend in a new terminal/tab if available
if command -v osascript >/dev/null 2>&1; then
  osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)"'\" && cd backend && npm run dev"' >/dev/null 2>&1 || true
else
  (cd "$BACKEND_DIR" && npm run dev) &
fi

# Start frontend in a new terminal/tab if available
if command -v osascript >/dev/null 2>&1; then
  osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)"'\" && cd frontend && npm run dev -- --host 0.0.0.0 --port 5177"' >/dev/null 2>&1 || true
else
  (cd "$FRONTEND_DIR" && npm run dev -- --host 0.0.0.0 --port 5177) &
fi

echo "Started backend and frontend."
echo "Frontend: http://localhost:5177"
echo "Backend: http://localhost:5001"
