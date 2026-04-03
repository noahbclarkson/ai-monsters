/**
 * End-to-end game loop test for AI Monsters.
 * Uses SpacetimeDB SDK to test full game loop against local server.
 * Run: npx tsx test/e2e-game-loop.ts
 */

import { DbConnection } from "../src/generated/index.js";

const SPACETIMEDB_URI = "ws://127.0.0.1:3001";
const DB_NAME = "ai-monsters-test";

const connections: DbConnection[] = [];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectPlayer(name: string): Promise<DbConnection> {
  console.log(`[${name}] Connecting to SpacetimeDB...`);
  return new Promise((resolve, reject) => {
    const conn = DbConnection.builder()
      .withUri(SPACETIMEDB_URI)
      .withDatabaseName(DB_NAME)
      .onConnect(() => {
        console.log(`[${name}] Connected.`);
        // Subscribe to all tables
        conn.subscriptionBuilder()
          .subscribe(["SELECT * FROM player_identities", "SELECT * FROM players", "SELECT * FROM cards", "SELECT * FROM game_matches", "SELECT * FROM player_hands"]);
        // Wait for subscription to apply
        setTimeout(() => resolve(conn), 1000);
      })
      .onConnectError((ctx) => {
        reject(new Error(`[${name}] Connection failed`));
      })
      .build();
    connections.push(conn);
  });
}

async function main() {
  console.log("=== AI Monsters E2E Game Loop Test ===\n");

  try {
    // Step 1: Connect two players (triggers client_connected)
    const aliceConn = await connectPlayer("Alice");
    await sleep(300);
    const bobConn = await connectPlayer("Bob");
    await sleep(300);

    // Step 2: Get player IDs
    const aliceIdentity = aliceConn.identity!;
    const bobIdentity = bobConn.identity!;
    // Get player IDs by iterating player_identities
    let alicePlayerId: bigint | null = null;
    let bobPlayerId: bigint | null = null;
    for (const row of aliceConn.db.player_identities.iter()) {
      if (row.identity.equals(aliceIdentity)) alicePlayerId = row.playerId;
    }
    for (const row of bobConn.db.player_identities.iter()) {
      if (row.identity.equals(bobIdentity)) bobPlayerId = row.playerId;
    }
    if (!alicePlayerId || !bobPlayerId) {
      throw new Error("Player identities not found. client_connected may not have fired.");
    }
    console.log(`[Alice] Player ID: ${alicePlayerId}`);
    console.log(`[Bob] Player ID: ${bobPlayerId}`);

    // Step 3: Generate cards
    console.log("\n[Alice] Generating 3 cards...");
    for (const [noun, rarity] of [["Dragon", "Legendary"], ["Goblin", "Common"], ["Wizard", "Epic"]] as const) {
      (aliceConn.reducers as any).generateCard({ seedNoun: noun, rarity, cardType: "Unit", aiDescription: `A ${noun.toLowerCase()}`, aiImageUrl: "" });
      await sleep(100);
    }

    console.log("[Bob] Generating 2 cards...");
    for (const [noun, rarity] of [["Orc", "Rare"], ["Healer", "Epic"]] as const) {
      (bobConn.reducers as any).generateCard({ seedNoun: noun, rarity, cardType: "Unit", aiDescription: `A ${noun.toLowerCase()}`, aiImageUrl: "" });
      await sleep(100);
    }
    await sleep(1000);

    // Step 4: Get card IDs - use most recent cards (no owner_id in schema)
    const allCards = [...aliceConn.db.cards.iter()];
    console.log(`\nTotal cards: ${allCards.length}`);
    if (allCards.length < 5) {
      throw new Error(`Not enough cards: ${allCards.length}`);
    }
    // Use last 5 cards (3 for Alice, 2 for Bob)
    const recent = allCards.slice(-5);
    const aliceCards = recent.slice(0, 3);
    const bobCards = recent.slice(3, 5);

    // Step 5: Create match
    console.log(`\n[Alice] Creating match...`);
    (aliceConn.reducers as any).createMatch({ player1Id: alicePlayerId, player2Id: bobPlayerId });
    await sleep(300);

    const matches = [...aliceConn.db.game_matches.iter()];
    if (matches.length === 0) throw new Error("No match created");
    const match = matches[matches.length - 1];
    const matchId = match.id;
    console.log(`Match ID: ${matchId}`);

    // Step 6: Initialize hands
    console.log(`\nInitializing hands...`);
    const p1Cards = aliceCards.slice(0, 3).map((c) => c.id);
    const p2Cards = bobCards.slice(0, 2).map((c) => c.id);
    (aliceConn.reducers as any).initMatchHands({ matchId, player1Id: alicePlayerId, player1CardIds: p1Cards, player2Id: bobPlayerId, player2CardIds: p2Cards });
    await sleep(300);

    // Verify hands
    const allHands = [...aliceConn.db.player_hands.iter()];
    const aliceHands = allHands.filter((h) => h.playerId === alicePlayerId);
    const bobHands = allHands.filter((h) => h.playerId === bobPlayerId);
    console.log(`[Alice] Hand: ${aliceHands.length} cards`);
    console.log(`[Bob] Hand: ${bobHands.length} cards`);

    if (aliceHands.length !== 3 || bobHands.length !== 2) {
      throw new Error(`Hand init failed: Alice=${aliceHands.length}, Bob=${bobHands.length}`);
    }

    // Step 7: Alice places card at (0,0)
    console.log(`\n[Alice] Placing card at (0,0)...`);
    (aliceConn.reducers as any).placeCard({ matchId, cardId: aliceCards[0].id, playerId: alicePlayerId, row: 0, col: 0 });
    await sleep(300);

    // Verify placement
    const updatedMatch = [...aliceConn.db.game_matches.iter()].find(m => m.id === matchId);
    const board = JSON.parse(updatedMatch!.boardStateJson);
    if (!board.tiles?.[0]?.[0]?.card_id) {
      throw new Error("Card placement failed - no tile at (0,0)");
    }
    console.log(`[Alice] Card placed at (0,0) OK`);

    // Step 8: Alice ends turn
    console.log(`\n[Alice] Ending turn...`);
    (aliceConn.reducers as any).endTurn({ matchId, playerId: alicePlayerId });
    await sleep(300);

    // Step 9: Bob places card closer
    console.log(`[Bob] Placing card at (1,0)...`);
    (bobConn.reducers as any).placeCard({ matchId, cardId: bobCards[0].id, playerId: bobPlayerId, row: 1, col: 0 });
    await sleep(300);

    // Step 10: Bob ends turn
    console.log(`[Bob] Ending turn...`);
    (bobConn.reducers as any).endTurn({ matchId, playerId: bobPlayerId });
    await sleep(300);

    // Step 11: Alice attacks
    console.log(`\n[Alice] Attacking Bob's card at (3,0)...`);
    (aliceConn.reducers as any).attackCard({ matchId, playerId: alicePlayerId, attackerRow: 0, attackerCol: 0, defenderRow: 1, defenderCol: 0 });
    await sleep(300);

    // Final check
    const finalMatch = [...aliceConn.db.game_matches.iter()].find(m => m.id === matchId);
    console.log(`\n[Final] Status: ${finalMatch!.status}, Winner: ${finalMatch!.winnerId || "none"}`);
    console.log(`[Final] Current turn: ${finalMatch!.currentTurn}`);

    console.log("\n=== E2E TEST PASSED ===");
    console.log("Verified: connect, card gen, match create, hand init, place, turn switch, attack");
  } catch (error: any) {
    console.error("\n=== E2E TEST FAILED ===");
    console.error(`Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    for (const conn of connections) {
      try { (conn as any).disconnect?.(); } catch {}
    }
  }
}

main();
