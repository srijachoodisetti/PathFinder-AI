#!/usr/bin/env bash
# ============================================================
# PathFinder AI — Render Build Script
# Runs as ONE Render Web Service build command
# ============================================================
set -e  # Exit immediately on any error

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   PathFinder AI — Render Build Script   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

echo "▶ Debug Info (Prior to build):"
echo "Current directory (pwd):"
pwd
echo "Root directory contents:"
ls -la
echo ""

# ── Step 1: Install Node.js (Render has Node available, but ensure npm) ──
echo "▶ Step 1/4 — Checking Node.js and npm..."
node --version
npm --version
echo "✓ Node.js and npm ready."
echo ""

# ── Step 2: Build React Frontend ────────────────────────────────────────
echo "▶ Debug Info: listing frontend/ directory before build:"
ls -la frontend/
echo ""

cd frontend
npm ci --prefer-offline --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps
echo "✓ Frontend dependencies installed."
echo ""

echo "▶ Step 3/4 — Building React/Vite frontend..."
npm run build
echo "✓ React build complete."
echo ""

# Check if dist/ exists and contains index.html
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
  echo "❌ Error: React build failed. dist/ or dist/index.html not found!"
  exit 1
fi

# List dist contents for verification
echo "▶ Debug Info: listing frontend/dist contents:"
ls -la dist/
echo ""

# ── Step 3: Go back to root, install Python deps ─────────────────────────
cd ..

echo "▶ Debug Info: listing root directory contents after build:"
ls -la
echo "▶ Debug Info: listing frontend/dist from root:"
ls -la frontend/dist
echo ""

echo "▶ Step 4/4 — Installing Python backend dependencies..."
pip install -r backend/requirements.txt --upgrade
echo "✓ Python dependencies installed."
echo ""

echo "╔══════════════════════════════════════════╗"
echo "║   ✅ Build Complete! Ready to start.    ║"
echo "╚══════════════════════════════════════════╝"
echo ""
