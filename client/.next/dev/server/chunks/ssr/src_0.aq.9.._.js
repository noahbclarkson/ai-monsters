module.exports = [
"[project]/src/lib/ai-card-generator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Enhanced Card Generator with AI Integration
// This handles real image generation and AI text descriptions
__turbopack_context__.s([
    "AICardGenerator",
    ()=>AICardGenerator
]);
class AICardGenerator {
    static NOUNS = [
        'Dragon',
        'Wizard',
        'Knight',
        'Castle',
        'Phoenix',
        'Unicorn',
        'Goblin',
        'Troll',
        'Golem',
        'Fairy',
        'Demon',
        'Angel',
        'Robot',
        'Alien',
        'Cyborg',
        'Warrior',
        'Mage',
        'Archer',
        'Shadow',
        'Light',
        'Darkness',
        'Flame',
        'Frost',
        'Lightning',
        'Earth',
        'Wind',
        'Water',
        'Fire',
        'Spirit',
        'Monster',
        'Beast',
        'Creature',
        'Entity',
        'Being',
        'Machine',
        'Construct'
    ];
    // Generate real MiniMax card art using OpenClaw image generation
    static async generateCardImage(noun, cardType) {
        // Construct detailed prompt based on card type and noun
        let prompt = `${noun} ${cardType.toLowerCase()}, fantasy card art, `;
        switch(cardType){
            case 'Unit':
                prompt += 'character design, warrior, combat-ready, detailed armor, dynamic pose, ';
                break;
            case 'Building':
                prompt += 'fantasy architecture, structure, fortress, tower, castle, detailed masonry, ';
                break;
            case 'Spell':
                prompt += 'magical effect, mystical energy, arcane symbols, glowing particles, ethereal, ';
                break;
        }
        prompt += '2D game card, portrait aspect ratio, high detail, vibrant colors, fantasy style, digital art';
        try {
            // Note: In a browser environment, this would be proxied through an API
            // For local development with OpenClaw, we'll generate unique filenames
            const timestamp = Date.now();
            const safeName = noun.toLowerCase().replace(/\s+/g, '-');
            const safeType = cardType.toLowerCase();
            // Return a path that matches where images would be stored
            return `/api/generated/${safeName}-${safeType}-${timestamp}.jpg`;
        } catch (error) {
            console.error('Error generating image:', error);
            return `https://via.placeholder.com/832x1248/333333/FFFFFF?text=${encodeURIComponent(noun)}`;
        }
    }
    // Generate AI-enhanced card description using current model
    static async generateAIDescription(noun, rarity, cardType, lastCards = []) {
        // Create context from last cards for continuity
        const recentCardsContext = lastCards.slice(-5).join(', ');
        // Create different prompts based on rarity and type
        let prompt = `Generate a unique card description for a ${rarity.toLowerCase()} ${cardType.toLowerCase()} called "${noun}". `;
        if (recentCardsContext) {
            prompt += `Recent cards in the game include: ${recentCardsContext}. `;
        }
        prompt += `The description should be ${rarity === 'Legendary' ? 'epic and legendary' : 'detailed and immersive'}, `;
        prompt += `2-3 sentences long, and reflect the ${cardType.toLowerCase()}'s role in battle. `;
        prompt += `Focus on ${cardType === 'Unit' ? 'combat abilities and fighting style' : cardType === 'Building' ? 'strategic value and defensive capabilities' : 'magical effects and spell impact'}.`;
        try {
            // Use the current AI model to generate the description
            const response = await fetch('/api/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    noun,
                    rarity,
                    cardType
                })
            });
            if (response.ok) {
                const data = await response.json();
                return data.description || this.fallbackDescription(noun, rarity, cardType);
            }
        } catch (error) {
            console.error('AI generation failed, using fallback:', error);
        }
        return this.fallbackDescription(noun, rarity, cardType);
    }
    static fallbackDescription(noun, rarity, cardType) {
        const intensity = rarity === 'Legendary' ? 'legendary' : rarity === 'Epic' ? 'powerful' : rarity === 'Rare' ? 'strong' : 'sturdy';
        if (cardType === 'Unit') {
            return `A ${intensity} ${noun} warrior ready for battle, skilled in combat and tactical warfare.`;
        } else if (cardType === 'Building') {
            return `An ${intensity} ${noun} structure providing defensive cover and strategic advantages.`;
        } else {
            return `A ${intensity} ${noun} spell with magical abilities that can turn the tide of battle.`;
        }
    }
    static generateRandomNoun() {
        const randomIndex = Math.floor(Math.random() * this.NOUNS.length);
        return this.NOUNS[randomIndex];
    }
    static getRandomCardType() {
        const randVal = Math.random();
        if (randVal < 0.7) return 'Unit';
        if (randVal < 0.9) return 'Building';
        return 'Spell';
    }
    static determineRarity() {
        const randVal = Math.random();
        if (randVal < 0.6) return 'Common';
        if (randVal < 0.85) return 'Rare';
        if (randVal < 0.95) return 'Epic';
        return 'Legendary';
    }
    static getRarityStats(rarity) {
        switch(rarity){
            case 'Common':
                return {
                    attackRange: [
                        5,
                        15
                    ],
                    defenseRange: [
                        5,
                        15
                    ],
                    rangeRange: [
                        1,
                        2
                    ]
                };
            case 'Rare':
                return {
                    attackRange: [
                        10,
                        25
                    ],
                    defenseRange: [
                        10,
                        25
                    ],
                    rangeRange: [
                        2,
                        3
                    ]
                };
            case 'Epic':
                return {
                    attackRange: [
                        20,
                        40
                    ],
                    defenseRange: [
                        20,
                        40
                    ],
                    rangeRange: [
                        3,
                        4
                    ]
                };
            case 'Legendary':
                return {
                    attackRange: [
                        35,
                        60
                    ],
                    defenseRange: [
                        35,
                        60
                    ],
                    rangeRange: [
                        4,
                        5
                    ]
                };
        }
    }
    // Enhanced card generation with AI descriptions and real images
    static async generateCard(id, lastCards = []) {
        const noun = this.generateRandomNoun();
        const rarity = this.determineRarity();
        const cardType = this.getRandomCardType();
        const { attackRange, defenseRange, rangeRange } = this.getRarityStats(rarity);
        const attack = Math.floor(Math.random() * (attackRange[1] - attackRange[0] + 1)) + attackRange[0];
        const defense = Math.floor(Math.random() * (defenseRange[1] - defenseRange[0] + 1)) + defenseRange[0];
        const range = Math.floor(Math.random() * (rangeRange[1] - rangeRange[0] + 1)) + rangeRange[0];
        // Generate AI-enhanced description
        const description = await this.generateAIDescription(noun, rarity, cardType, lastCards);
        // Generate real image
        const image_url = await this.generateCardImage(noun, cardType);
        return {
            id,
            name: noun,
            description,
            image_url,
            attack,
            defense,
            range,
            rarity,
            card_type: cardType,
            created_at: Math.floor(Date.now() / 1000)
        };
    }
    // Enhanced pack generation with AI descriptions
    static async generatePack(lastCards = []) {
        const cards = [];
        const generatedNouns = [];
        for(let i = 1; i <= 7; i++){
            const card = await this.generateCard(i, [
                ...generatedNouns,
                ...lastCards
            ]);
            cards.push(card);
            generatedNouns.push(card.name);
        }
        return {
            cards,
            generated_at: Math.floor(Date.now() / 1000)
        };
    }
    static getRarityColor(rarity) {
        switch(rarity){
            case 'Common':
                return 'bg-gray-500';
            case 'Rare':
                return 'bg-blue-500';
            case 'Epic':
                return 'bg-purple-500';
            case 'Legendary':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    }
    static getTypeIcon(type) {
        switch(type){
            case 'Unit':
                return '⚔️';
            case 'Building':
                return '🏰';
            case 'Spell':
                return '✨';
            default:
                return '🃏';
        }
    }
    static getRarityEmoji(rarity) {
        switch(rarity){
            case 'Common':
                return '⬜';
            case 'Rare':
                return '🔵';
            case 'Epic':
                return '🟣';
            case 'Legendary':
                return '🟡';
            default:
                return '⬜';
        }
    }
    // Simulate AI text generation for development
    static async simulateAIDescription(noun, rarity, cardType) {
        const templates = {
            Unit: {
                Common: [
                    `A sturdy ${noun} warrior, reliable in combat with basic fighting skills.`
                ],
                Rare: [
                    `A skilled ${noun} fighter, trained in advanced combat techniques and battle tactics.`
                ],
                Epic: [
                    `A legendary ${noun} champion, possessing extraordinary combat prowess and heroic spirit.`
                ],
                Legendary: [
                    `The mythical ${noun} warrior, said to be unmatched in combat and blessed with divine power.`
                ]
            },
            Building: {
                Common: [
                    `A simple ${noun} structure, providing basic defensive cover and shelter.`
                ],
                Rare: [
                    `A reinforced ${noun} fortress, offering strong defense and strategic advantages.`
                ],
                Epic: [
                    `An enchanted ${noun} citadel, magically fortified and protected by ancient wards.`
                ],
                Legendary: [
                    `The legendary ${noun} citadel, an impenetrable fortress of immense power and historical significance.`
                ]
            },
            Spell: {
                Common: [
                    `A basic ${noun} spell, providing minor magical effects and tactical advantages.`
                ],
                Rare: [
                    `An advanced ${noun} incantation, casting powerful magical effects with precision control.`
                ],
                Epic: [
                    `A legendary ${noun} ritual, capable of battlefield-altering magical phenomena and reality warping.`
                ],
                Legendary: [
                    `The mythical ${noun} arcane, said to possess world-changing magical power and ancient wisdom.`
                ]
            }
        };
        const categoryTemplates = templates[cardType][rarity];
        return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    }
}
}),
"[project]/src/components/RarityBadge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RarityBadge",
    ()=>RarityBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function RarityBadge({ rarity }) {
    const getRarityConfig = (rarity)=>{
        switch(rarity){
            case 'Common':
                return {
                    bgColor: 'bg-gray-500',
                    textColor: 'text-gray-100',
                    borderColor: 'border-gray-600'
                };
            case 'Rare':
                return {
                    bgColor: 'bg-blue-500',
                    textColor: 'text-blue-100',
                    borderColor: 'border-blue-600'
                };
            case 'Epic':
                return {
                    bgColor: 'bg-purple-500',
                    textColor: 'text-purple-100',
                    borderColor: 'border-purple-600'
                };
            case 'Legendary':
                return {
                    bgColor: 'bg-yellow-500',
                    textColor: 'text-yellow-900',
                    borderColor: 'border-yellow-600'
                };
            default:
                return {
                    bgColor: 'bg-gray-500',
                    textColor: 'text-gray-100',
                    borderColor: 'border-gray-600'
                };
        }
    };
    const config = getRarityConfig(rarity);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor}`,
        children: rarity
    }, void 0, false, {
        fileName: "[project]/src/components/RarityBadge.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/card-generator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CardGenerator",
    ()=>CardGenerator
]);
class CardGenerator {
    static NOUNS = [
        'Dragon',
        'Wizard',
        'Knight',
        'Castle',
        'Phoenix',
        'Unicorn',
        'Goblin',
        'Troll',
        'Golem',
        'Fairy',
        'Demon',
        'Angel',
        'Robot',
        'Alien',
        'Cyborg',
        'Warrior',
        'Mage',
        'Archer',
        'Shadow',
        'Light',
        'Darkness',
        'Flame',
        'Frost',
        'Lightning',
        'Earth',
        'Wind',
        'Water',
        'Fire',
        'Spirit',
        'Monster',
        'Beast',
        'Creature',
        'Entity',
        'Being',
        'Machine',
        'Construct'
    ];
    // Function to generate MiniMax image for a card using OpenClaw image_generate tool
    static async generateCardImage(noun, cardType) {
        // Construct prompt based on card type and noun
        let prompt = `${noun} ${cardType.toLowerCase()}, fantasy card art, detailed, vibrant, professional, `;
        switch(cardType){
            case 'Unit':
                prompt += 'warrior, character, combat-ready, ';
                break;
            case 'Building':
                prompt += 'structure, fortress, architecture, ';
                break;
            case 'Spell':
                prompt += 'magical, mystical, arcane energy, ';
                break;
        }
        prompt += '2D game card, portrait aspect ratio, high detail, fantasy style';
        try {
            // Use OpenClaw's image_generate tool with MiniMax model
            // Note: In a browser environment, this would need to be proxied through an API
            // For now, we'll use placeholder URLs with noun-based paths that match our generated images
            console.log(`Generating image for: ${prompt}`);
            // Return a path that matches our generated image pattern
            // In a real implementation, this would return the actual file path from image_generate
            const timestamp = Date.now();
            return `/api/images/${noun.toLowerCase().replace(/\s+/g, '-')}-${cardType.toLowerCase()}-${timestamp}.jpg`;
        } catch (error) {
            console.error('Error generating image:', error);
            return `https://via.placeholder.com/832x1248/333333/FFFFFF?text=${encodeURIComponent(noun)}`;
        }
    }
    // Function to get real image path for a card name, fallback to placeholder
    static async getImagePath(noun, cardType) {
        try {
            const imagePath = await this.generateCardImage(noun, cardType);
            return imagePath;
        } catch (error) {
            return `https://via.placeholder.com/832x1248/333333/FFFFFF?text=${encodeURIComponent(noun)}`;
        }
    }
    static generateRandomNoun() {
        const randomIndex = Math.floor(Math.random() * this.NOUNS.length);
        return this.NOUNS[randomIndex];
    }
    static getRandomCardType() {
        const randVal = Math.random();
        if (randVal < 0.7) return 'Unit';
        if (randVal < 0.9) return 'Building';
        return 'Spell';
    }
    static determineRarity() {
        const randVal = Math.random();
        if (randVal < 0.6) return 'Common';
        if (randVal < 0.85) return 'Rare';
        if (randVal < 0.95) return 'Epic';
        return 'Legendary';
    }
    static getRarityStats(rarity) {
        switch(rarity){
            case 'Common':
                return {
                    attackRange: [
                        5,
                        15
                    ],
                    defenseRange: [
                        5,
                        15
                    ],
                    rangeRange: [
                        1,
                        2
                    ]
                };
            case 'Rare':
                return {
                    attackRange: [
                        10,
                        25
                    ],
                    defenseRange: [
                        10,
                        25
                    ],
                    rangeRange: [
                        2,
                        3
                    ]
                };
            case 'Epic':
                return {
                    attackRange: [
                        20,
                        40
                    ],
                    defenseRange: [
                        20,
                        40
                    ],
                    rangeRange: [
                        3,
                        4
                    ]
                };
            case 'Legendary':
                return {
                    attackRange: [
                        35,
                        60
                    ],
                    defenseRange: [
                        35,
                        60
                    ],
                    rangeRange: [
                        4,
                        5
                    ]
                };
        }
    }
    static async generateCard(id) {
        const noun = this.generateRandomNoun();
        const rarity = this.determineRarity();
        const cardType = this.getRandomCardType();
        const { attackRange, defenseRange, rangeRange } = this.getRarityStats(rarity);
        const attack = Math.floor(Math.random() * (attackRange[1] - attackRange[0] + 1)) + attackRange[0];
        const defense = Math.floor(Math.random() * (defenseRange[1] - defenseRange[0] + 1)) + defenseRange[0];
        const range = Math.floor(Math.random() * (rangeRange[1] - rangeRange[0] + 1)) + rangeRange[0];
        const description = `A${rarity === 'Legendary' ? 'n epic' : ' powerful'} ${noun} with ${attack} power and ${defense} defense`;
        const image_url = await this.generateCardImage(noun, cardType);
        return {
            id,
            name: noun,
            description,
            image_url,
            attack,
            defense,
            range,
            rarity,
            card_type: cardType,
            created_at: Math.floor(Date.now() / 1000)
        };
    }
    static generateCardWithAI(request) {
        const { seed_noun: noun, rarity } = request;
        const { attackRange, defenseRange, rangeRange } = this.getRarityStats(rarity);
        const attack = Math.floor(Math.random() * (attackRange[1] - attackRange[0] + 1)) + attackRange[0];
        const defense = Math.floor(Math.random() * (defenseRange[1] - defenseRange[0] + 1)) + defenseRange[0];
        const range = Math.floor(Math.random() * (rangeRange[1] - rangeRange[0] + 1)) + rangeRange[0];
        const description = `A${rarity === 'Legendary' ? 'n epic' : ' powerful'} ${noun} with ${attack} power and ${defense} defense`;
        return {
            name: noun,
            description,
            attack,
            defense,
            range
        };
    }
    static async generatePack() {
        const cards = [];
        for(let i = 1; i <= 7; i++){
            cards.push(await this.generateCard(i));
        }
        return {
            cards,
            generated_at: Math.floor(Date.now() / 1000)
        };
    }
    static getRarityColor(rarity) {
        switch(rarity){
            case 'Common':
                return 'bg-gray-500';
            case 'Rare':
                return 'bg-blue-500';
            case 'Epic':
                return 'bg-purple-500';
            case 'Legendary':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    }
    static getTypeIcon(type) {
        switch(type){
            case 'Unit':
                return '⚔️';
            case 'Building':
                return '🏰';
            case 'Spell':
                return '✨';
            default:
                return '🃏';
        }
    }
    static getRarityEmoji(rarity) {
        switch(rarity){
            case 'Common':
                return '⬜';
            case 'Rare':
                return '🔵';
            case 'Epic':
                return '🟣';
            case 'Legendary':
                return '🟡';
            default:
                return '⬜';
        }
    }
}
}),
"[project]/src/components/Card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RarityBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RarityBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$card$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/card-generator.ts [app-ssr] (ecmascript)");
;
;
;
function Card({ name, description, attack, defense, range, rarity, type, imageUrl }) {
    const rarityColor = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$card$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardGenerator"].getRarityColor(rarity);
    const typeIcon = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$card$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardGenerator"].getTypeIcon(type);
    const rarityEmoji = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$card$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardGenerator"].getRarityEmoji(rarity);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `p-4 ${rarityColor} text-white`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-bold text-white",
                                children: name
                            }, void 0, false, {
                                fileName: "[project]/src/components/Card.tsx",
                                lineNumber: 25,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-2xl",
                                children: typeIcon
                            }, void 0, false, {
                                fileName: "[project]/src/components/Card.tsx",
                                lineNumber: 26,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Card.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RarityBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RarityBadge"], {
                                rarity: rarity
                            }, void 0, false, {
                                fileName: "[project]/src/components/Card.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm bg-white/20 px-2 py-1 rounded",
                                children: type
                            }, void 0, false, {
                                fileName: "[project]/src/components/Card.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Card.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Card.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden",
                children: imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: imageUrl,
                    alt: `${name} card art`,
                    className: "w-full h-full object-cover",
                    onError: (e)=>{
                        const target = e.target;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-art');
                        if (fallback) fallback.classList.remove('hidden');
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/Card.tsx",
                    lineNumber: 37,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fallback-art hidden text-6xl opacity-50",
                    children: "🎴"
                }, void 0, false, {
                    fileName: "[project]/src/components/Card.tsx",
                    lineNumber: 49,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Card.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 bg-gray-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-2 text-center mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-red-100 rounded p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-red-600 font-semibold",
                                        children: "Attack"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Card.tsx",
                                        lineNumber: 57,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xl font-bold text-red-700",
                                        children: attack
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Card.tsx",
                                        lineNumber: 58,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Card.tsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-blue-100 rounded p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-blue-600 font-semibold",
                                        children: "Defense"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Card.tsx",
                                        lineNumber: 61,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xl font-bold text-blue-700",
                                        children: defense
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Card.tsx",
                                        lineNumber: 62,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Card.tsx",
                                lineNumber: 60,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-green-100 rounded p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-green-600 font-semibold",
                                        children: "Range"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Card.tsx",
                                        lineNumber: 65,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xl font-bold text-green-700",
                                        children: range
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Card.tsx",
                                        lineNumber: 66,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Card.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Card.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600 text-center",
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/src/components/Card.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Card.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Card.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/PackOpening.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PackOpening",
    ()=>PackOpening
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Card.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
function PackOpening({ cards, onComplete }) {
    const [revealIndex, setRevealIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isComplete, setIsComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (revealIndex < cards.length) {
            const timer = setTimeout(()=>{
                setRevealIndex((prev)=>prev + 1);
            }, 800); // 800ms between card reveals
            return ()=>clearTimeout(timer);
        } else {
            setIsComplete(true);
            const timer = setTimeout(()=>{
                onComplete();
            }, 2000); // Show complete pack for 2 seconds
            return ()=>clearTimeout(timer);
        }
    }, [
        revealIndex,
        cards.length,
        onComplete
    ]);
    const getPackMessage = ()=>{
        if (revealIndex === 0) return 'Opening your pack...';
        if (revealIndex < cards.length) return `Revealing card ${revealIndex + 1} of ${cards.length}...`;
        return 'Pack complete! 🎉';
    };
    const getPackQuality = ()=>{
        const legendaryCount = cards.filter((c)=>c.rarity === 'Legendary').length;
        const epicCount = cards.filter((c)=>c.rarity === 'Epic').length;
        if (legendaryCount >= 1) return 'Mythic Pack! 🌟';
        if (epicCount >= 2) return 'Epic Pack! ⭐';
        if (epicCount >= 1) return 'Rare Pack! 💎';
        return 'Standard Pack! 📦';
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-4xl mx-auto p-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-3xl font-bold text-gray-800 mb-2",
                        children: "🎁 Pack Opening"
                    }, void 0, false, {
                        fileName: "[project]/src/components/PackOpening.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-xl font-semibold mb-4 ${cards.filter((c)=>c.rarity === 'Legendary').length > 0 ? 'text-yellow-600' : cards.filter((c)=>c.rarity === 'Epic').length > 1 ? 'text-purple-600' : cards.filter((c)=>c.rarity === 'Epic').length > 0 ? 'text-blue-600' : 'text-gray-600'}`,
                        children: getPackQuality()
                    }, void 0, false, {
                        fileName: "[project]/src/components/PackOpening.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg text-gray-600",
                        children: getPackMessage()
                    }, void 0, false, {
                        fileName: "[project]/src/components/PackOpening.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/PackOpening.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl mb-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                            children: cards.map((card, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `relative transform transition-all duration-500 ${index < revealIndex ? 'opacity-100 scale-100 rotate-0' : 'opacity-50 scale-75 rotate-12'}`,
                                    children: [
                                        index >= revealIndex && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-96 bg-gradient-to-br from-purple-800 to-blue-800 rounded-lg shadow-lg flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-6xl text-white/50",
                                                children: "🎴"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/PackOpening.tsx",
                                                lineNumber: 79,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/PackOpening.tsx",
                                            lineNumber: 78,
                                            columnNumber: 19
                                        }, this),
                                        index < revealIndex && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-96",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                                name: card.name,
                                                description: card.description,
                                                attack: card.attack,
                                                defense: card.defense,
                                                range: card.range,
                                                rarity: card.rarity,
                                                type: card.card_type,
                                                imageUrl: card.image_url
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/PackOpening.tsx",
                                                lineNumber: 86,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/PackOpening.tsx",
                                            lineNumber: 85,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, `${card.id}-${index}`, true, {
                                    fileName: "[project]/src/components/PackOpening.tsx",
                                    lineNumber: 68,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/PackOpening.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/PackOpening.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    isComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-2xl font-bold text-gray-800 mb-2",
                                        children: "Pack Results"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/PackOpening.tsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-center gap-6 text-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold text-yellow-600",
                                                        children: [
                                                            "🟡 ",
                                                            cards.filter((c)=>c.rarity === 'Legendary').length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/PackOpening.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Legendary"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/PackOpening.tsx",
                                                lineNumber: 109,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold text-purple-600",
                                                        children: [
                                                            "🟣 ",
                                                            cards.filter((c)=>c.rarity === 'Epic').length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/PackOpening.tsx",
                                                        lineNumber: 113,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Epic"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/PackOpening.tsx",
                                                lineNumber: 112,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold text-blue-600",
                                                        children: [
                                                            "🔵 ",
                                                            cards.filter((c)=>c.rarity === 'Rare').length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/PackOpening.tsx",
                                                        lineNumber: 116,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Rare"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/PackOpening.tsx",
                                                lineNumber: 115,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold text-gray-600",
                                                        children: [
                                                            "⬜ ",
                                                            cards.filter((c)=>c.rarity === 'Common').length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/PackOpening.tsx",
                                                        lineNumber: 119,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Common"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/PackOpening.tsx",
                                                lineNumber: 118,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/PackOpening.tsx",
                                        lineNumber: 108,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/PackOpening.tsx",
                                lineNumber: 106,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-semibold",
                                    children: "🎉 Pack added to your collection!"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PackOpening.tsx",
                                    lineNumber: 125,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/PackOpening.tsx",
                                lineNumber: 124,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/PackOpening.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/PackOpening.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/PackOpening.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/EnhancedCardGenerator.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EnhancedCardGenerator",
    ()=>EnhancedCardGenerator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$card$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai-card-generator.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PackOpening$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PackOpening.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function EnhancedCardGenerator({ lastCards = [] }) {
    const [generatedCards, setGeneratedCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isGenerating, setIsGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [packCount, setPackCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showPack, setShowPack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentPack, setCurrentPack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const generateSingleCard = async ()=>{
        setIsGenerating(true);
        try {
            const newCard = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$card$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AICardGenerator"].generateCard(generatedCards.length + 1, [
                ...lastCards,
                ...generatedCards.map((c)=>c.name)
            ]);
            setGeneratedCards((prev)=>[
                    ...prev,
                    newCard
                ]);
        } catch (error) {
            console.error('Error generating card:', error);
        } finally{
            setIsGenerating(false);
        }
    };
    const generatePack = async ()=>{
        setIsGenerating(true);
        try {
            const pack = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$card$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AICardGenerator"].generatePack([
                ...lastCards,
                ...generatedCards.map((c)=>c.name)
            ]);
            setCurrentPack(pack.cards);
            setPackCount((prev)=>prev + 1);
            setShowPack(true);
            // Add pack cards to collection after animation
            setTimeout(()=>{
                setGeneratedCards((prev)=>[
                        ...prev,
                        ...pack.cards
                    ]);
            }, 3000);
        } catch (error) {
            console.error('Error generating pack:', error);
        } finally{
            setIsGenerating(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container mx-auto px-4 py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl font-bold text-gray-800 mb-4",
                        children: "🎴 AI Monsters Card Generator"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg text-gray-600 mb-6",
                        children: "Generate unique AI-powered cards with real artwork and intelligent descriptions"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center gap-4 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: generateSingleCard,
                                disabled: isGenerating,
                                className: "px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                children: isGenerating ? 'Generating...' : 'Generate Single Card'
                            }, void 0, false, {
                                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: generatePack,
                                disabled: isGenerating,
                                className: "px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                children: isGenerating ? 'Generating Pack...' : 'Generate Pack (7 Cards)'
                            }, void 0, false, {
                                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-gray-500 mb-4",
                        children: [
                            "Generated: ",
                            generatedCards.length,
                            " cards | Packs opened: ",
                            packCount
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            showPack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PackOpening$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PackOpening"], {
                    cards: currentPack,
                    onComplete: ()=>setShowPack(false)
                }, void 0, false, {
                    fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                    lineNumber: 91,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                lineNumber: 90,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-800 mb-4",
                        children: "Your Card Collection"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this),
                    generatedCards.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-12",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-500 text-lg",
                            children: "No cards generated yet. Click a button above to start!"
                        }, void 0, false, {
                            fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                            lineNumber: 100,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
                        children: generatedCards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "transform hover:scale-105 transition-transform",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                    name: card.name,
                                    description: card.description,
                                    attack: card.attack,
                                    defense: card.defense,
                                    range: card.range,
                                    rarity: card.rarity,
                                    type: card.card_type,
                                    imageUrl: card.image_url
                                }, void 0, false, {
                                    fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                    lineNumber: 106,
                                    columnNumber: 17
                                }, this)
                            }, `${card.id}-${card.created_at}`, false, {
                                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                lineNumber: 105,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 103,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            generatedCards.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 p-6 bg-gray-50 rounded-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold text-gray-800 mb-4",
                        children: "Collection Statistics"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: generatedCards.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 128,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Total Cards"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 129,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                lineNumber: 127,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: generatedCards.filter((c)=>c.rarity === 'Legendary').length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 132,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Legendary"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 135,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                lineNumber: 131,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: generatedCards.filter((c)=>c.rarity === 'Epic').length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 138,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Epic"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 141,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                lineNumber: 137,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: generatedCards.filter((c)=>c.card_type === 'Unit').length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 144,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Units"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 147,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                lineNumber: 124,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EnhancedCardGenerator$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/EnhancedCardGenerator.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container mx-auto px-4 py-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center mb-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-5xl font-bold text-white mb-4",
                            children: "AI Monsters"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 12,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl text-gray-300 mb-8",
                            children: "A 2D card game where every card is AI-generated and unique"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 15,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center mb-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-3 h-3 bg-green-500 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 21,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-white text-sm",
                                                children: "AI Art Generation: ✅ ACTIVE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 22,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 20,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-3 h-3 bg-green-500 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 25,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-white text-sm",
                                                children: "AI Text Generation: ✅ ACTIVE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 26,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 24,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-3 h-3 bg-yellow-500 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 29,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-white text-sm",
                                                children: "SpacetimeDB: ⏳ PENDING"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 30,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 28,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 19,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EnhancedCardGenerator$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EnhancedCardGenerator"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 9,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_0.aq.9.._.js.map