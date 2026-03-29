// AI Monsters Server - Main library with demo functionality
pub mod card_generator;

pub use card_generator::{Card, CardGenerator, CardGenerationRequest, CardGenerationResponse};

fn main() {
    println!("🎮 AI Monsters Card Generation Demo");
    println!("=================================\n");

    // Generate a single card
    println!("🃏 Generating a single card...");
    let single_card = CardGenerator::generate_card(1);
    print_card(&single_card);

    // Generate a pack of cards
    println!("\n📦 Generating a pack of 7 cards...");
    let pack = CardGenerator::generate_pack();
    
    for (i, card) in pack.iter().enumerate() {
        println!("\n--- Card {} ---", i + 1);
        print_card(card);
    }

    // Print pack summary
    let rarity_counts = pack.iter().fold(std::collections::HashMap::new(), |mut map: std::collections::HashMap<String, i32>, card| {
        *map.entry(card.rarity.clone()).or_insert(0) += 1;
        map
    });

    println!("\n📊 Pack Summary:");
    println!("Total cards: {}", pack.len());
    for (rarity, count) in rarity_counts {
        println!("  {}: {}", rarity, count);
    }
}

fn print_card(card: &Card) {
    let rarity_emoji = match card.rarity.as_str() {
        "Common" => "⬜",
        "Rare" => "🔵", 
        "Epic" => "🟣",
        "Legendary" => "🟡",
        _ => "⬜",
    };

    let type_emoji = match card.card_type.as_str() {
        "Unit" => "⚔️",
        "Building" => "🏰",
        "Spell" => "✨",
        _ => "🃏",
    };

    println!("{} {} {} ({} {})", rarity_emoji, card.name, type_emoji, card.rarity, card.card_type);
    println!("   {}", card.description);
    println!("   💥 Attack: {} 🛡️ Defense: {} 🎯 Range: {}", card.attack, card.defense, card.range);
    println!("   🖼️  {}", card.image_url);
    println!("   ⏰ Generated: {}", card.created_at);
}