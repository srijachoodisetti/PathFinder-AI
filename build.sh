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

# ── Step 1: Ensure Node.js and npm are installed and in PATH ──
echo "▶ Step 1/4 — Checking Node.js and npm..."
if ! command -v node &> /dev/null; then
    echo "▶ Node.js not found in PATH. Installing Node.js dynamically for Render Python environment..."
    NODE_VERSION=v20.11.0
    
    # Download the Node.js Linux x64 binary archive
    echo "  Downloading Node.js ${NODE_VERSION}..."
    curl -fsSL "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz" -o node.tar.xz
    
    # Extract the archive
    echo "  Extracting Node.js package..."
    tar -xf node.tar.xz
    
    # Add Node.js binary directory to the active PATH
    export PATH="$PWD/node-${NODE_VERSION}-linux-x64/bin:$PATH"
    
    # Clean up the archive file to save space
    rm node.tar.xz
    
    echo "✓ Node.js installed dynamically at $(which node)"
else
    echo "✓ Node.js is already available: $(which node)"
fi

# Print versions for confirmation
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
