#!/usr/bin/env bash
# Simulates Render + Vercel production builds locally.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Backend (Render) clean build"
cd backend
rm -rf node_modules dist
npm ci
npm run build
node -e "require('@prisma/client'); console.log('Prisma client: OK')"
cd "$ROOT"

echo "==> Frontend (Vercel) clean build"
cd frontend
rm -rf node_modules .next
npm ci
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:4000/api}" npm run build
cd "$ROOT"

echo ""
echo "All production builds passed."
