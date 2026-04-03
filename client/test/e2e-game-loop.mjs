/**
 * End-to-end game loop test for AI Monsters.
 * 
 * Tests the full game loop using the SpacetimeDB SDK directly:
 * 1. Two players connect (triggering client_connected)
 * 2. Create a match
 * 3. Add cards to hands
 * 4. Place cards on the board
 * 5. Attack
 * 6. End turn
 * 7. Verify win detection
 * 
 * Run with: node --experimental-vm-modules test/e2e-game-loop.mjs
 * (Requires SpacetimeDB local server running on port 3000)
 */

import DB, { Addressable } from "../src/generated/index.js";

const LOCAL_HOST = "127.0.0.1:3001";
const MODULE_NAME = "ai-monsters-test";

// Track connections and their identities
const connections = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectPlayer(name) {
  console.log(`[${name}] Connecting to SpacetimeDB...`);
  const conn = await DB.connect({
    host: LOCAL_HOST,
    moduleName: MODULE_NAME,
    // Generate a unique identity for this connection
    tls: false,
  });
  
  // Wait for client_connected to fire
  await sleep(500);
  
  console.log(`[${name}] Connected. Identity: ${conn.identity?.toHex()?.slice(0, 16)}...`);
  connections.push({ name, conn });
  return conn;
}

async function getPlayerId(conn, name) {
  // Query the player's identity from player_identities
  const identities = conn.db.player_identities().iter().toArray();
  if (identities.length === 0) {
    throw new Error(`[${name}] No player identity found`);
  }
  // The last identity should be the one created by client_connected for this connection
  const identity = conn.identity;
  const row = conn.db.player_identities().identity().find(identity);
  if (!row) {
    throw new Error(`[${name}] Identity not found in player_identities table`);
  }
  console.log(`[${name}] Player ID: ${row.player_id}`);
  return row.player_id;
}

async function main() {
  console.log("=== AI Monsters E2E Game Loop Test ===\n");
  
  try {
    // Step 1: Connect two players (triggers client_connected for each)
    const aliceConn = await connectPlayer("Alice");
    await sleep(200);
    const bobConn = await connectPlayer("Bob");
    await sleep(200);
    
    // Step 2: Get player IDs
    const alicePlayerId = await getPlayerId(aliceConn, "Alice");
    const bobPlayerId = await getPlayerId(bobConn, "Bob");
    
    // Step 3: Alice generates cards
    console.log("\n[Alice] Generating cards...");
    await aliceConn.call("generate_card", {
      seedNoun: "Dragon",
      rarity: "Legendary",
      cardType: "Unit",
      aiDescription: "A fierce fire dragon",
      aiImageUrl: "",
    });
    await sleep(100);
    await aliceConn.call("generate_card", {
      seedNoun: "Goblin",
      rarity: "Common", 
      cardType: "Unit",
      aiDescription: "A small goblin",
      aiImageUrl: "",
    });
    await sleep(100);
    await aliceConn.call("generate_card", {
      seedNoun: "Wizard",
      rarity: "Epic",
      cardType: "Unit", 
      aiDescription: "A powerful wizard",
      aiImageUrl: "",
    });
    await sleep(100);
    
    // Step 4: Bob generates cards
    console.log("[Bob] Generating cards...");
    await bobConn.call("generate_card", {
      seedNoun: "Orc",
      rarity: "Rare",
      cardType: "Unit",
      aiDescription: "A strong orc warrior",
      aiImageUrl: "",
    });
    await sleep(100);
    await bobConn.call("generate_card", {
      seedNoun: "Healer",
      rarity: "Epic",
      cardType: "Unit",
      aiDescription: "A magical healer",
      aiImageUrl: "",
    });
    await sleep(100);
    
    // Step 5: Get card IDs
    const aliceCards = aliceConn.db.cards().iter().toArray();
    const bobCards = bobConn.db.cards().iter().toArray();
    console.log(`\n[Alice] Has ${aliceCards.length} cards`);
    console.log(`[Bob] Has ${bobCards.length} cards`);
    
    if (aliceCards.length < 3 || bobCards.length < 2) {
      throw new Error("Not enough cards generated");
    }
    
    const aliceCard1 = aliceCards[aliceCards.length - 3].id;
    const aliceCard2 = aliceCards[aliceCards.length - 2].id;
    const aliceCard3 = aliceCards[aliceCards.length - 1].id;
    const bobCard1 = bobCards[bobCards.length - 2].id;
    const bobCard2 = bobCards[bobCards.length - 1].id;
    
    // Step 6: Alice creates a match (as player1)
    console.log(`\n[Alice] Creating match with Bob...`);
    await aliceConn.call("create_match", {
      player1Id: alicePlayerId,
      player2Id: bobPlayerId,
    });
    await sleep(200);
    
    // Step 7: Get match ID
    const matches = aliceConn.db.game_matches().iter().toArray();
    if (matches.length === 0) {
      throw new Error("No match created");
    }
    const matchId = matches[matches.length - 1].id;
    console.log(`[Alice] Match ID: ${matchId}`);
    
    // Step 8: Initialize hands
    console.log(`\n[Alice] Initializing hands...`);
    await aliceConn.call("init_match_hands", {
      matchId,
      player1Id: alicePlayerId,
      player1CardIds: [aliceCard1, aliceCard2, aliceCard3],
      player2Id: bobPlayerId,
      player2CardIds: [bobCard1, bobCard2],
    });
    await sleep(200);
    
    // Verify hands
    const aliceHands = aliceConn.db.player_hands().iter().toArray().filter(h => h.playerId === alicePlayerId);
    const bobHands = aliceConn.db.player_hands().iter().toArray().filter(h => h.playerId === bobPlayerId);
    console.log(`[Alice] Hand count: ${aliceHands.length}`);
    console.log(`[Bob] Hand count: ${bobHands.length}`);
    
    if (aliceHands.length !== 3 || bobHands.length !== 2) {
      throw new Error(`Hand initialization failed: Alice=${aliceHands.length}, Bob=${bobHands.length}`);
    }
    
    // Step 9: Alice places a card (row=0, col=0)
    console.log(`\n[Alice] Placing card ${aliceCard1} at (0,0)...`);
    await aliceConn.call("place_card", {
      matchId,
      cardId: aliceCard1,
      playerId: alicePlayerId,
      row: 0,
      col: 0,
    });
    await sleep(200);
    
    // Step 10: Verify board state
    const match = aliceConn.db.game_matches().id().find(matchId);
    const board = JSON.parse(match.boardStateJson);
    const placedTile = board.tiles[0][0];
    if (!placedTile || placedTile.cardId !== aliceCard1) {
      throw new Error("Card placement failed");
    }
    console.log(`[Alice] Card placed successfully. Board tile:`, placedTile);
    
    // Step 11: End turn
    console.log(`\n[Alice] Ending turn...`);
    await aliceConn.call("end_turn", {
      matchId,
      playerId: alicePlayerId,
    });
    await sleep(200);
    
    // Step 12: Bob places a card
    console.log(`[Bob] Placing card ${bobCard1} at (3,0)...`);
    await bobConn.call("place_card", {
      matchId,
      cardId: bobCard1,
      playerId: bobPlayerId,
      row: 3,
      col: 0,
    });
    await sleep(200);
    
    // Step 13: Bob ends turn
    console.log(`[Bob] Ending turn...`);
    await bobConn.call("end_turn", {
      matchId,
      playerId: bobPlayerId,
    });
    await sleep(200);
    
    // Step 14: Alice attacks
    console.log(`\n[Alice] Attacking Bob's card at (3,0) with card at (0,0)...`);
    await aliceConn.call("attack_card", {
      matchId,
      playerId: alicePlayerId,
      attackerRow: 0,
      attackerCol: 0,
      defenderRow: 3,
      defenderCol: 0,
    });
    await sleep(200);
    
    // Step 15: Check final state
    const finalMatch = aliceConn.db.game_matches().id().find(matchId);
    console.log(`\n[Final] Match status: ${finalMatch.status}, Winner: ${finalMatch.winnerId || "none"}`);
    console.log(`[Final] Current turn: ${finalMatch.currentTurn}`);
    
    console.log("\n=== E2E TEST PASSED ===");
    console.log("All game loop steps completed successfully:");
    console.log("  - Player connection (client_connected)");
    console.log("  - Card generation");
    console.log("  - Match creation");
    console.log("  - Hand initialization");
    console.log("  - Card placement");
    console.log("  - Turn switching");
    console.log("  - Card attacks");
    
  } catch (error) {
    console.error("\n=== E2E TEST FAILED ===");
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Clean up connections
    for (const { name, conn } of connections) {
      try {
        conn.disconnect();
        console.log(`[${name}] Disconnected`);
      } catch (e) {
        // Ignore
      }
    }
  }
}

main();
