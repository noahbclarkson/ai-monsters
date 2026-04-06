#!/bin/bash
# AI Monsters - Docker Development Setup
# Run this once to set up the local development environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_DIR/.docker"

echo "=== AI Monsters Docker Setup ==="

# Step 1: Build SpacetimeDB Docker image
echo "[1/5] Building SpacetimeDB Docker image..."
cd "$DOCKER_DIR"
docker build -f Dockerfile.spacetime -t spacetimedb-local .
echo "    Done."

# Step 2: Copy JWT keys from CLI config
echo "[2/5] Setting up JWT keys..."
mkdir -p "$DOCKER_DIR/jwt"
cp ~/.config/spacetime/id_ecdsa "$DOCKER_DIR/jwt/" 2>/dev/null || true
cp ~/.config/spacetime/id_ecdsa.pub "$DOCKER_DIR/jwt/" 2>/dev/null || true
echo "    Done."

# Step 3: Start SpacetimeDB container
echo "[3/5] Starting SpacetimeDB..."
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

# Step 4: Login to local SpacetimeDB and publish module
echo "[4/5] Publishing WASM module to SpacetimeDB..."
cd "$PROJECT_DIR/server"

# Login to local server
spacetime login --server-issued-login localhost:3999 --no-browser 2>/dev/null || true

# Publish module (use --anonymous if not logged in, use proper identity if logged in)
# The --no-config flag bypasses workspace spacetime.json to use CLI defaults
spacetime publish ai-monsters \
    --server localhost:3999 \
    --module-path . \
    --no-config \
    --yes \
    2>/dev/null || echo "    (Module may already be published)"

# Generate TypeScript bindings
echo "[5/5] Generating TypeScript bindings..."
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
