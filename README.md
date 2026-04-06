# AI Monsters

A 2D browser card game where every single card is AI-generated and unique. Players collect cards, build decks, and battle on a 6x3 grid.

## 🚀 Quick Start (Docker)

```bash
# One-time setup (builds SpacetimeDB image, starts DB, publishes module)
chmod +x scripts/setup-docker.sh
./scripts/setup-docker.sh

# Start everything
docker compose up

# Frontend: http://localhost:3000
# SpacetimeDB: ws://localhost:3000 (from browser)
```

### First Time Setup Notes

- **SpacetimeDB CLI login**: The setup script handles this automatically with `--server-issued-login`
- **Database**: Module publishes to `ai-monsters` database on the local SpacetimeDB instance
- **If publish fails**: Run `spacetime login --server-issued-login localhost:3999 --no-browser` then retry

## 🛠️ Manual Development Setup

### Prerequisites

- [SpacetimeDB CLI](https://spacetimedb.com/docs/)
- Node.js 24+
- Rust
- Docker (for SpacetimeDB server)

### Backend (Rust + SpacetimeDB)

```bash
cd server

# Start SpacetimeDB locally (Docker)
docker build -f ../.docker/Dockerfile.spacetime -t spacetimedb-local ../.docker
docker run -d --name aimonsters_spacetime -p 3999:3000 \
  -v aimonsters_spacetime_data:/spacetime-data \
  spacetimedb-local

# Login to local server
spacetime login --server-issued-login localhost:3999 --no-browser

# Publish module (from server/ directory)
spacetime publish ai-monsters \
  --server localhost:3999 \
  --module-path . \
  --no-config \
  --yes

# Generate TypeScript bindings
cd ..
spacetime generate ai-monsters \
  --lang typescript \
  --out-dir client/src/generated \
  --module-path server
```

### Frontend (Next.js)

```bash
cd client

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
NEXT_PUBLIC_SPACETIMEDB_URI=ws://localhost:3999 npm run dev
```

## 🔑 API Keys

Edit `client/.env.local`:

```env
# SpacetimeDB connection
NEXT_PUBLIC_SPACETIMEDB_URI=ws://localhost:3990

# OpenAI API key (for card text descriptions + DALL-E 3 image fallback)
OPENAI_API_KEY=sk-...

# MiniMax API key (for MiniMax image generation) - optional, falls back to OpenAI
MINIMAX_API_KEY=sk-...
```

Get keys:
- **OpenAI**: https://platform.openai.com/api-keys
- **MiniMax**: https://platform.minimax.io

## 🐳 Docker Reference

```bash
# Start SpacetimeDB only
docker compose up spacetimedb

# Start frontend only
docker compose up client

# Start everything
docker compose up

# View logs
docker compose logs -f spacetimedb
docker compose logs -f client

# Stop everything
docker compose down

# Rebuild after code changes
docker compose build --no-cache client
```

## 📁 Project Structure

```
ai-monsters/
├── server/              # Rust SpacetimeDB WASM module
│   ├── src/
│   │   ├── lib.rs       # Module entry point
│   │   ├── reducers.rs  # Game logic reducers
│   │   ├── tables.rs    # Database tables
│   │   └── ...
│   └── Cargo.toml
├── client/              # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js app directory
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities (card generator, SpacetimeDB client)
│   │   └── generated/   # Auto-generated SpacetimeDB bindings
│   └── ...
├── .docker/
│   ├── Dockerfile.spacetime  # SpacetimeDB server image
│   └── jwt/             # JWT keys for SpacetimeDB auth
├── scripts/
│   └── setup-docker.sh  # One-time setup script
└── docker-compose.yml
```

## 🎮 The Game

- **Unique AI Cards**: Every card is generated with unique art, name, backstory, and stats
- **Strategic Gameplay**: Battle on a 6x3 grid with attack/defense positioning and face-down bluffing
- **Collectible Cards**: Open packs, build decks, and collect rare cards
- **Real-time Multiplayer**: Powered by SpacetimeDB for real-time gameplay

## 🎨 Tech Stack

- **Backend**: Rust, SpacetimeDB (WASM)
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **AI**: OpenAI (GPT-4o + DALL-E 3), MiniMax (image generation)
- **Database**: SpacetimeDB (real-time, WebSocket-based)
- **Container**: Docker, docker-compose

## 📝 Common Tasks

### Update the WASM module after editing server code

```bash
cd server
spacetime publish ai-monsters \
  --server localhost:3999 \
  --module-path . \
  --no-config \
  --yes
```

### Regenerate TypeScript bindings after schema changes

```bash
spacetime generate ai-monsters \
  --lang typescript \
  --out-dir client/src/generated \
  --module-path server
```

### View SpacetimeDB logs

```bash
docker logs aimonsters_spacetime -f
```

---

_Last updated: 2026-04-06_
