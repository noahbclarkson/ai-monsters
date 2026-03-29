# AI Monsters

A 2D card game where every single card is AI-generated and unique. Players collect cards, build decks, and battle on a 6x3 grid.

## 🎮 The Game

- **Unique AI Cards**: Every card is generated with unique art, name, backstory, and stats
- **Strategic Gameplay**: Battle on a 6x3 grid with attack/defense positioning and face-down bluffing
- **Collectible Cards**: Open packs, build decks, and collect rare cards
- **Real-time Multiplayer**: Powered by SpacetimeDB for real-time gameplay

## 🏗️ Architecture

### Backend (Rust + SpacetimeDB)
- `server/`: Rust SpacetimeDB module handling game state, matchmaking, and card generation
- Real-time WebSocket subscriptions for live gameplay
- Tables for players, cards, decks, matches, and board state

### Frontend (Next.js + TypeScript)
- `client/`: Next.js application with TypeScript and Tailwind CSS
- SpacetimeDB TypeScript SDK for real-time game state
- Responsive design with card collection UI and gameplay interface

## 🚀 Getting Started

### Prerequisites
- Rust (for server)
- Node.js (for client)
- SpacetimeDB CLI

### Installation

1. **Clone and setup**:
   ```bash
   git clone https://github.com/noahbclarkson/ai-monsters.git
   cd ai-monsters
   ```

2. **Install SpacetimeDB CLI**:
   ```bash
   curl -sSf https://install.spacetimedb.com | bash
   spacetime login
   ```

3. **Server setup**:
   ```bash
   cd server
   cargo build
   ```

4. **Client setup**:
   ```bash
   cd client
   npm install
   ```

### Development

1. **Start SpacetimeDB locally**:
   ```bash
   spacetime start
   ```

2. **Start the frontend**:
   ```bash
   cd client
   npm run dev
   ```

3. **Generate client bindings**:
   ```bash
   spacetime generate --lang typescript --out-dir client/src/generated --project-path server
   ```

## 🎯 Core Features

### Card Generation
- AI-generated unique card art using MiniMax API
- Dynamic card stats and descriptions based on continuity
- Rarity system: Common, Rare, Epic, Legendary

### Gameplay
- 6x3 grid battlefield
- Attack/Defense positioning mechanics
- Range and movement systems
- Face-down bluffing strategies

### Multiplayer
- Real-time multiplayer matches
- Player matchmaking
- Deck building and collection management

## 📁 Project Structure

```
ai-monsters/
├── server/              # Rust SpacetimeDB module
│   ├── src/
│   │   └── main.rs    # Main module with tables and reducers
│   └── Cargo.toml
├── client/             # Next.js frontend
│   ├── src/
│   │   ├── app/       # Next.js app directory
│   │   ├── components/ # React components
│   │   └── lib/       # Utility functions
│   ├── package.json
│   └── ...            # Config files
└── README.md
```

## 🎨 Tech Stack

- **Backend**: Rust, SpacetimeDB
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **AI**: MiniMax image generation, AI text models
- **Database**: SpacetimeDB (real-time, WebSocket-based)

## 🚀 Roadmap

- [x] Phase 1: Foundation - SpacetimeDB setup, basic UI
- [ ] Phase 2: Card Generation Pipeline
- [ ] Phase 3: Game Board & Core Gameplay
- [ ] Phase 4: UI & Polish
- [ ] Phase 5: Matchmaking & Bot AI
- [ ] Phase 6: Launch & Polish

## 📝 License

This project is open source and available under the MIT License.
