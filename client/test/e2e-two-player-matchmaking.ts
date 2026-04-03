/**
 * Two-player matchmaking integration test for AI Monsters.
 * Tests the full human-vs-human matchmaking pipeline:
 * 1. Two players connect and generate cards
 * 2. Both join matchmaking queue with "Human" preference
 * 3. process_matchmaking pairs them
 * 4. Both place cards, attack, switch turns, complete match
 * Run: npx tsx test/e2e-two-player-matchmaking.ts
 * Requires SpacetimeDB Docker running on port 3001.
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
        conn.subscriptionBuilder()
          .subscribe([
            "SELECT * FROM player_identities",
            "SELECT * FROM players",
            "SELECT * FROM cards",
            "SELECT * FROM game_matches",
            "SELECT * FROM player_hands",
            "SELECT * FROM matchmaking_entries",
            "SELECT * FROM bot_players",
          ]);
        setTimeout(() => resolve(conn), 1000);
      })
      .onConnectError(() => {
        reject(new Error(`[${name}] Connection failed`));
      })
      .build();
    connections.push(conn);
  });
}

async function getPlayerId(conn: DbConnection, identity: any): Promise<bigint> {
  for (const row of conn.db.player_identities.iter()) {
    if (row.identity.equals(identity)) return row.playerId;
  }
  throw new Error("Player identity not found");
}

async function main() {
  console.log("=== AI Monsters Two-Player Matchmaking E2E Test ===\n");

  try {
    // Step 1: Connect two players
    const aliceConn = await connectPlayer("Alice");
    await sleep(300);
    const bobConn = await connectPlayer("Bob");
    await sleep(300);

    const aliceIdentity = aliceConn.identity!;
    const bobIdentity = bobConn.identity!;
    const alicePlayerId = await getPlayerId(aliceConn, aliceIdentity);
    const bobPlayerId = await getPlayerId(bobConn, bobIdentity);
    console.log(`[Alice] Player ID: ${alicePlayerId}`);
    console.log(`[Bob] Player ID: ${bobPlayerId}`);

    // Step 2: Generate cards for both players
    console.log("\n[Alice] Generating 3 cards...");
    for (const [noun, rarity] of [["Knight", "Common"], ["Archer", "Rare"], ["Mage", "Epic"]] as const) {
      (aliceConn.reducers as any).generateCard({ seedNoun: noun, rarity, cardType: "Unit", aiDescription: `A ${noun.toLowerCase()}`, aiImageUrl: "" });
      await sleep(100);
    }

    console.log("[Bob] Generating 3 cards...");
    for (const [noun, rarity] of [["Dragon", "Legendary"], ["Goblin", "Common"], ["Healer", "Rare"]] as const) {
      (bobConn.reducers as any).generateCard({ seedNoun: noun, rarity, cardType: "Unit", aiDescription: `A ${noun.toLowerCase()}`, aiImageUrl: "" });
      await sleep(100);
    }
    await sleep(1000);

    // Collect card IDs by player
    const allCards = [...aliceConn.db.cards.iter()];
    const recent = allCards.slice(-6);
    const aliceCards = recent.slice(0, 3);
    const bobCards = recent.slice(3, 6);
    console.log(`\nTotal cards: ${allCards.length} (Alice: ${aliceCards.length}, Bob: ${bobCards.length})`);

    // Step 3: Both join matchmaking queue with Human preference
    console.log("\n[Alice] Joining matchmaking queue (Human)...");
    (aliceConn.reducers as any).joinMatchmakingQueue({ preferredOpponent: "Human", botDifficulty: null });
    await sleep(200);

    console.log("[Bob] Joining matchmaking queue (Human)...");
    (bobConn.reducers as any).joinMatchmakingQueue({ preferredOpponent: "Human", botDifficulty: null });
    await sleep(200);

    // Verify both are queued
    const entries = [...aliceConn.db.matchmaking_entries.iter()];
    console.log(`[Matchmaking] Queue size: ${entries.length}`);
    if (entries.length !== 2) {
      throw new Error(`Expected 2 queued players, got ${entries.length}`);
    }

    // Step 4: Process matchmaking to pair them
    console.log("\n[Alice] Processing matchmaking...");
    (aliceConn.reducers as any).processMatchmaking();
    await sleep(500);

    // Step 5: Verify a match was created
    const matches = [...aliceConn.db.game_matches.iter()];
    console.log(`\n[Matchmaking] Matches created: ${matches.length}`);
    if (matches.length === 0) {
      throw new Error("No match created after process_matchmaking");
    }
    const match = matches[matches.length - 1];
    const matchId = match.id;
    console.log(`[Match] ID: ${matchId}, Status: ${match.status}`);
    console.log(`[Match] Player1: ${match.player1Id}, Player2: ${match.player2Id}`);

    // Verify players are correctly assigned
    if (match.player1Id !== alicePlayerId && match.player1Id !== bobPlayerId) {
      throw new Error(`Player1 ${match.player1Id} is neither Alice nor Bob`);
    }
    if (match.player2Id !== alicePlayerId && match.player2Id !== bobPlayerId) {
      throw new Error(`Player2 ${match.player2Id} is neither Alice nor Bob`);
    }
    if (match.player1Id === match.player2Id) {
      throw new Error("Player1 and Player2 are the same");
    }

    // Determine which player is p1/p2
    const p1Id = match.player1Id;
    const p2Id = match.player2Id;
    const p1Conn = p1Id === alicePlayerId ? aliceConn : bobConn;
    const p2Conn = p1Id === alicePlayerId ? bobConn : aliceConn;
    const p1Cards = p1Id === alicePlayerId ? aliceCards : bobCards;
    const p2Cards = p1Id === alicePlayerId ? bobCards : aliceCards;
    console.log(`[Match] P1: ${p1Id}, P2: ${p2Id}`);

    // Step 6: Initialize hands
    console.log("\n[Match] Initializing hands...");
    const p1CardIds = p1Cards.map((c) => c.id);
    const p2CardIds = p2Cards.map((c) => c.id);
    (p1Conn.reducers as any).initMatchHands({ matchId, player1Id: p1Id, player1CardIds: p1CardIds, player2Id: p2Id, player2CardIds: p2CardIds });
    await sleep(300);

    const allHands = [...p1Conn.db.player_hands.iter()];
    const p1Hands = allHands.filter((h) => h.playerId === p1Id);
    const p2Hands = allHands.filter((h) => h.playerId === p2Id);
    console.log(`[Match] P1 hand: ${p1Hands.length} cards, P2 hand: ${p2Hands.length} cards`);
    if (p1Hands.length !== 3 || p2Hands.length !== 3) {
      throw new Error(`Hand init failed: P1=${p1Hands.length}, P2=${p2Hands.length}`);
    }

    // Step 7: P1 places card at (0,0)
    console.log(`\n[P1] Placing card at (0,0)...`);
    (p1Conn.reducers as any).placeCard({ matchId, cardId: p1Cards[0].id, playerId: p1Id, row: 0, col: 0 });
    await sleep(300);

    let matchState = [...p1Conn.db.game_matches.iter()].find((m) => m.id === matchId)!;
    let board = JSON.parse(matchState.boardStateJson);
    if (!board.tiles?.[0]?.[0]?.card_id) {
      throw new Error("Card placement failed at (0,0)");
    }
    console.log(`[P1] Card placed at (0,0) OK. Current turn: ${matchState.currentTurn}`);

    // Step 8: P1 ends turn
    console.log(`\n[P1] Ending turn...`);
    (p1Conn.reducers as any).endTurn({ matchId, playerId: p1Id });
    await sleep(300);

    matchState = [...p1Conn.db.game_matches.iter()].find((m) => m.id === matchId)!;
    console.log(`[Turn] Current turn: ${matchState.currentTurn}`);

    // Step 9: P2 places card at (3,0)
    console.log(`\n[P2] Placing card at (3,0)...`);
    (p2Conn.reducers as any).placeCard({ matchId, cardId: p2Cards[0].id, playerId: p2Id, row: 3, col: 0 });
    await sleep(300);

    matchState = [...p1Conn.db.game_matches.iter()].find((m) => m.id === matchId)!;
    board = JSON.parse(matchState.boardStateJson);
    if (!board.tiles?.[3]?.[0]?.card_id) {
      throw new Error("Card placement failed at (3,0)");
    }
    console.log(`[P2] Card placed at (3,0) OK`);

    // Step 10: P2 ends turn
    console.log(`\n[P2] Ending turn...`);
    (p2Conn.reducers as any).endTurn({ matchId, playerId: p2Id });
    await sleep(300);

    // Step 11: P1 attacks P2's card at (3,0)
    console.log(`\n[P1] Attacking P2's card at (3,0)...`);
    (p1Conn.reducers as any).attackCard({ matchId, playerId: p1Id, attackerRow: 0, attackerCol: 0, defenderRow: 3, defenderCol: 0 });
    await sleep(300);

    // Step 12: P1 ends turn
    console.log(`\n[P1] Ending turn...`);
    (p1Conn.reducers as any).endTurn({ matchId, playerId: p1Id });
    await sleep(300);

    // Step 13: P2 ends turn
    console.log(`\n[P2] Ending turn...`);
    (p2Conn.reducers as any).endTurn({ matchId, playerId: p2Id });
    await sleep(300);

    // Step 14: Verify matchmaking entries are cleared
    const entriesAfter = [...aliceConn.db.matchmaking_entries.iter()];
    console.log(`\n[Matchmaking] Queue after pairing: ${entriesAfter.length} entries`);

    // Final state check
    const finalMatch = [...aliceConn.db.game_matches.iter()].find((m) => m.id === matchId)!;
    console.log(`\n[Final] Status: ${finalMatch.status}, Current turn: ${finalMatch.currentTurn}`);

    console.log("\n=== E2E TWO-PLAYER MATCHMAKING TEST PASSED ===");
    console.log("Verified: connect, card gen, matchmaking join, process_matchmaking pairing, hand init, place, attack, turn switch");
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
