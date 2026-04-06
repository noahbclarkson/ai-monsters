#!/bin/bash
# AI Monsters - Docker Development Setup
# Run this once to set up the local development environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_DIR/.docker"

echo "=== AI Monsters Docker Setup ==="

# Step 1: Copy SpacetimeDB standalone binary
# The binary is NOT in the repo (too large). It comes from the SpacetimeDB CLI installation.
echo "[1/6] Copying SpacetimeDB standalone binary..."
SPACETIME_BIN_DIR="$HOME/.local/share/spacetime/bin/2.1.0"
if [ ! -f "$SPACETIME_BIN_DIR/spacetimedb-standalone" ]; then
    echo "ERROR: SpacetimeDB standalone binary not found at $SPACETIME_BIN_DIR"
    echo "This comes from the SpacetimeDB CLI installation."
    echo "Install with: curl -sSf https://install.spacetimedb.com | bash"
    exit 1
fi
mkdir -p "$DOCKER_DIR"
cp "$SPACETIME_BIN_DIR/spacetimedb-standalone" "$DOCKER_DIR/"
echo "    Done."

# Step 2: Build SpacetimeDB Docker image
echo "[2/6] Building SpacetimeDB Docker image..."
cd "$DOCKER_DIR"
docker build -f Dockerfile.spacetime -t spacetimedb-local .
echo "    Done."

# Step 3: Copy JWT keys from CLI config
echo "[3/6] Setting up JWT keys..."
mkdir -p "$DOCKER_DIR/jwt"
cp ~/.config/spacetime/id_ecdsa "$DOCKER_DIR/jwt/" 2>/dev/null || true
cp ~/.config/spacetime/id_ecdsa.pub "$DOCKER_DIR/jwt/" 2>/dev/null || true
echo "    Done."

# Step 4: Start SpacetimeDB container
echo "[4/6] Starting SpacetimeDB..."
cd "$PROJECT_DIR"
docker compose up -d spacetimedb
sleep 5

# Check if SpacetimeDB is running
if ! docker ps | grep -q aimonsters_spacetime; then
    echo "ERROR: SpacetimeDB container failed to start"
    docker logs aimonsters_spacetime | tail -10
    exit 1
fi
echo "    SpacetimeDB running on port 3999"

# Step 5: Login to local SpacetimeDB and publish module
echo "[5/6] Publishing WASM module to SpacetimeDB..."
cd "$PROJECT_DIR/server"

# Login to local server (anonymous - generates a one-time identity)
# For persistent identity, use: spacetime login --server-issued-login localhost:3999 --no-browser
spacetime login --server-issued-login localhost:3999 --no-browser 2>/dev/null || true

# Publish module (--no-config bypasses workspace spacetime.json)
# Use --anonymous flag only if not logged in
spacetime publish ai-monsters \
    --server localhost:3999 \
    --module-path . \
    --no-config \
    --yes \
    2>/dev/null || echo "    (Module may already be published)"

# Generate TypeScript bindings
echo "[6/6] Generating TypeScript bindings..."
cd "$PROJECT_DIR"
spacetime generate ai-monsters \
    --lang typescript \
    --out-dir client/src/generated \
    --module-path server \
    2>/dev/null || true

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To start everything:"
echo "  docker compose up"
echo ""
echo "To publish module changes after editing server/:"
echo "  cd server"
echo "  spacetime publish ai-monsters --server localhost:3999 --module-path . --no-config --yes"
echo ""
echo "Frontend: http://localhost:3000"
echo "SpacetimeDB: ws://localhost:3999"
