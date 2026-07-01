#!/usr/bin/env bash
# Rebuild the site and (re)start the production server on port 3000.
set -euo pipefail
cd "$(dirname "$0")"

umask 002
mkdir -p .run

# Use npm instead of bun due to bun tempdir issues in sandbox
DATABASE_URL="file:./data/careconnect.db" npm run build
echo "Build complete."

# Kill any existing server on port 3000
sudo sh -c 'lsof -t -iTCP:3000 -sTCP:LISTEN | xargs -r kill -9' 2>/dev/null || true
sleep 0.5

# Start the server
DATABASE_URL="file:./data/careconnect.db" nohup bun run serve.ts > .run/server.log 2>&1 &
echo "Server starting..."

# Wait for it to respond
for _ in $(seq 1 50); do
  if curl -sf -o /dev/null http://localhost:3000; then
    echo "site published; serving on port 3000"
    exit 0
  fi
  sleep 0.2
done
echo "warning: published, but the server isn't responding — check .run/server.log" >&2
exit 1