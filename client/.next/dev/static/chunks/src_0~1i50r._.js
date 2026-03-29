(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/ai-card-generator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/RarityBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RarityBadge",
    ()=>RarityBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor}`,
        children: rarity
    }, void 0, false, {
        fileName: "[project]/src/components/RarityBadge.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c = RarityBadge;
var _c;
__turbopack_context__.k.register(_c, "RarityBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/card-generator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RarityBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RarityBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$card$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/card-generator.ts [app-client] (ecmascript)");
;
;
;
function Card({ name, description, attack, defense, range, rarity, type, imageUrl }) {
    const rarityColor = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$card$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardGenerator"].getRarityColor(rarity);
    const typeIcon = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$card$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardGenerator"].getTypeIcon(type);
    const rarityEmoji = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$card$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardGenerator"].getRarityEmoji(rarity);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `p-4 ${rarityColor} text-white`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-bold text-white",
                                children: name
                            }, void 0, false, {
                                fileName: "[project]/src/components/Card.tsx",
                                lineNumber: 25,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RarityBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RarityBadge"], {
                                rarity: rarity
                            }, void 0, false, {
                                fileName: "[project]/src/components/Card.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden",
                children: imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
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
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 bg-gray-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-2 text-center mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-red-100 rounded p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-red-600 font-semibold",
                                        children: "Attack"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Card.tsx",
                                        lineNumber: 57,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-blue-100 rounded p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-blue-600 font-semibold",
                                        children: "Defense"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Card.tsx",
                                        lineNumber: 61,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-green-100 rounded p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-green-600 font-semibold",
                                        children: "Range"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Card.tsx",
                                        lineNumber: 65,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
_c = Card;
var _c;
__turbopack_context__.k.register(_c, "Card");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/PackOpening.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PackOpening",
    ()=>PackOpening
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Card.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function PackOpening({ cards, onComplete }) {
    _s();
    const [revealIndex, setRevealIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isComplete, setIsComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PackOpening.useEffect": ()=>{
            if (revealIndex < cards.length) {
                const timer = setTimeout({
                    "PackOpening.useEffect.timer": ()=>{
                        setRevealIndex({
                            "PackOpening.useEffect.timer": (prev)=>prev + 1
                        }["PackOpening.useEffect.timer"]);
                    }
                }["PackOpening.useEffect.timer"], 800); // 800ms between card reveals
                return ({
                    "PackOpening.useEffect": ()=>clearTimeout(timer)
                })["PackOpening.useEffect"];
            } else {
                setIsComplete(true);
                const timer = setTimeout({
                    "PackOpening.useEffect.timer": ()=>{
                        onComplete();
                    }
                }["PackOpening.useEffect.timer"], 2000); // Show complete pack for 2 seconds
                return ({
                    "PackOpening.useEffect": ()=>clearTimeout(timer)
                })["PackOpening.useEffect"];
            }
        }
    }["PackOpening.useEffect"], [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-4xl mx-auto p-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-3xl font-bold text-gray-800 mb-2",
                        children: "🎁 Pack Opening"
                    }, void 0, false, {
                        fileName: "[project]/src/components/PackOpening.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-xl font-semibold mb-4 ${cards.filter((c)=>c.rarity === 'Legendary').length > 0 ? 'text-yellow-600' : cards.filter((c)=>c.rarity === 'Epic').length > 1 ? 'text-purple-600' : cards.filter((c)=>c.rarity === 'Epic').length > 0 ? 'text-blue-600' : 'text-gray-600'}`,
                        children: getPackQuality()
                    }, void 0, false, {
                        fileName: "[project]/src/components/PackOpening.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl mb-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                            children: cards.map((card, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `relative transform transition-all duration-500 ${index < revealIndex ? 'opacity-100 scale-100 rotate-0' : 'opacity-50 scale-75 rotate-12'}`,
                                    children: [
                                        index >= revealIndex && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-96 bg-gradient-to-br from-purple-800 to-blue-800 rounded-lg shadow-lg flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                        index < revealIndex && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-96",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
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
                    isComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-2xl font-bold text-gray-800 mb-2",
                                        children: "Pack Results"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/PackOpening.tsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-center gap-6 text-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
_s(PackOpening, "ItQURCm+2ieGfZoSnYF7yDK6vAA=");
_c = PackOpening;
var _c;
__turbopack_context__.k.register(_c, "PackOpening");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/EnhancedCardGenerator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EnhancedCardGenerator",
    ()=>EnhancedCardGenerator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$card$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai-card-generator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PackOpening$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PackOpening.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function EnhancedCardGenerator({ lastCards = [] }) {
    _s();
    const [generatedCards, setGeneratedCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isGenerating, setIsGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [packCount, setPackCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showPack, setShowPack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentPack, setCurrentPack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const generateSingleCard = async ()=>{
        setIsGenerating(true);
        try {
            const newCard = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$card$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AICardGenerator"].generateCard(generatedCards.length + 1, [
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
            const pack = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$card$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AICardGenerator"].generatePack([
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container mx-auto px-4 py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl font-bold text-gray-800 mb-4",
                        children: "🎴 AI Monsters Card Generator"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg text-gray-600 mb-6",
                        children: "Generate unique AI-powered cards with real artwork and intelligent descriptions"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center gap-4 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: generateSingleCard,
                                disabled: isGenerating,
                                className: "px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                children: isGenerating ? 'Generating...' : 'Generate Single Card'
                            }, void 0, false, {
                                fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            showPack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PackOpening$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PackOpening"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-800 mb-4",
                        children: "Your Card Collection"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this),
                    generatedCards.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-12",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
                        children: generatedCards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "transform hover:scale-105 transition-transform",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
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
            generatedCards.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 p-6 bg-gray-50 rounded-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold text-gray-800 mb-4",
                        children: "Collection Statistics"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: generatedCards.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 128,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: generatedCards.filter((c)=>c.rarity === 'Legendary').length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 132,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: generatedCards.filter((c)=>c.rarity === 'Epic').length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 138,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: generatedCards.filter((c)=>c.card_type === 'Unit').length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EnhancedCardGenerator.tsx",
                                        lineNumber: 144,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_s(EnhancedCardGenerator, "I1yUnNac5QTuJ5lZpU4f3AbaL8k=");
_c = EnhancedCardGenerator;
var _c;
__turbopack_context__.k.register(_c, "EnhancedCardGenerator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/GameBoard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameBoard",
    ()=>GameBoard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function GameBoard({ gameId }) {
    _s();
    const [gameState, setGameState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedTile, setSelectedTile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [handCards, setHandCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameBoard.useEffect": ()=>{
            fetchGameState();
        }
    }["GameBoard.useEffect"], [
        gameId
    ]);
    const fetchGameState = async ()=>{
        try {
            // Placeholder - would fetch from SpacetimeDB
            const mockState = {
                tiles: Array(6).fill(null).map(()=>Array(3).fill(null).map(()=>({
                            is_face_up: false,
                            is_attack_mode: false
                        }))),
                current_turn: 1,
                turn_number: 1,
                phase: 'Placement',
                status: 'Active'
            };
            setGameState(mockState);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching game state:', error);
            setLoading(false);
        }
    };
    const handleTileClick = (x, y)=>{
        if (!gameState || gameState.status !== 'Active') return;
        if (selectedTile) {
            // Try to move or attack
            if (selectedTile.x === x && selectedTile.y === y) {
                // Deselect
                setSelectedTile(null);
            } else {
                // Try to move/attack
                handleAction(selectedTile.x, selectedTile.y, x, y);
                setSelectedTile(null);
            }
        } else {
            // Select tile
            setSelectedTile({
                x,
                y
            });
        }
    };
    const handleAction = (fromX, fromY, toX, toY)=>{
        // Placeholder for game actions
        console.log(`Action from (${fromX},${fromY}) to (${toX},${toY})`);
    };
    const placeCard = (cardId, x, y)=>{
        // Placeholder for placing a card
        console.log(`Place card ${cardId} at (${x},${y})`);
    };
    const endTurn = ()=>{
        // Placeholder for ending turn
        console.log('End turn');
    };
    const getTileClass = (x, y)=>{
        const tile = gameState?.tiles[x][y];
        const isSelected = selectedTile?.x === x && selectedTile?.y === y;
        let classes = 'w-24 h-32 border-2 border-gray-700 rounded-lg flex items-center justify-center cursor-pointer ';
        if (isSelected) {
            classes += 'ring-4 ring-yellow-400 ring-opacity-50 ';
        }
        if (tile?.is_face_up) {
            classes += 'bg-white ';
        } else {
            classes += 'bg-gradient-to-br from-gray-800 to-gray-900 ';
        }
        return classes;
    };
    const renderCard = (tile, x, y)=>{
        if (!tile || !tile.is_face_up) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-500 mb-1",
                        children: [
                            x,
                            ",",
                            y
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameBoard.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-2xl",
                        children: "🂠"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameBoard.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GameBoard.tsx",
                lineNumber: 115,
                columnNumber: 9
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `text-center ${tile.is_attack_mode ? 'bg-red-100' : 'bg-blue-100'} p-2 rounded`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-xs font-bold",
                    children: tile.is_attack_mode ? '⚔️' : '🛡️'
                }, void 0, false, {
                    fileName: "[project]/src/components/GameBoard.tsx",
                    lineNumber: 124,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-xs mt-1",
                    children: "Card"
                }, void 0, false, {
                    fileName: "[project]/src/components/GameBoard.tsx",
                    lineNumber: 127,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/GameBoard.tsx",
            lineNumber: 123,
            columnNumber: 7
        }, this);
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-96",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white text-xl",
                children: "Loading game board..."
            }, void 0, false, {
                fileName: "[project]/src/components/GameBoard.tsx",
                lineNumber: 135,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/GameBoard.tsx",
            lineNumber: 134,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-6xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-800 rounded-lg p-4 mb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-bold text-white",
                                    children: "AI Monsters Battle"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameBoard.tsx",
                                    lineNumber: 146,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-300",
                                    children: [
                                        "Turn ",
                                        gameState?.turn_number,
                                        " | Phase: ",
                                        gameState?.phase,
                                        " | Player ",
                                        gameState?.current_turn,
                                        "'s Turn"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/GameBoard.tsx",
                                    lineNumber: 147,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/GameBoard.tsx",
                            lineNumber: 145,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: endTurn,
                            className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold",
                            children: "End Turn"
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameBoard.tsx",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GameBoard.tsx",
                    lineNumber: 144,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/GameBoard.tsx",
                lineNumber: 143,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 rounded-lg p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-white mb-4",
                                children: "Player 1 (You)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    0,
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map((x)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            0,
                                            1,
                                            2
                                        ].map((y)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: getTileClass(x, y),
                                                onClick: ()=>handleTileClick(x, y),
                                                children: renderCard(gameState?.tiles[x]?.[y] || null, x, y)
                                            }, `p1-tile-${x}-${y}`, false, {
                                                fileName: "[project]/src/components/GameBoard.tsx",
                                                lineNumber: 168,
                                                columnNumber: 19
                                            }, this))
                                    }, `p1-row-${x}`, false, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 166,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameBoard.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 rounded-lg p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-white mb-4",
                                children: "Game Info"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 183,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-white space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Phase: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold",
                                                children: gameState?.phase
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameBoard.tsx",
                                                lineNumber: 185,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 185,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Turn: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold",
                                                children: gameState?.turn_number
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameBoard.tsx",
                                                lineNumber: 186,
                                                columnNumber: 24
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 186,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Status: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold",
                                                children: gameState?.status
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameBoard.tsx",
                                                lineNumber: 187,
                                                columnNumber: 26
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 187,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this),
                            selectedTile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6 p-4 bg-gray-700 rounded-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-white font-bold mb-2",
                                        children: "Selected Tile"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 192,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-300",
                                        children: [
                                            "Position: (",
                                            selectedTile.x,
                                            ", ",
                                            selectedTile.y,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 193,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-300 text-sm mt-2",
                                        children: "Click another tile to move or attack"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 196,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 191,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-white font-bold mb-2",
                                        children: "Your Hand"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 203,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            1,
                                            2,
                                            3,
                                            4,
                                            5
                                        ].map((cardId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-16 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-2 cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all",
                                                onClick: ()=>{
                                                    // Place card on empty tile
                                                    for(let x = 0; x < 6; x++){
                                                        for(let y = 0; y < 3; y++){
                                                            if (!gameState?.tiles[x][y].card_id) {
                                                                placeCard(cardId, x, y);
                                                                return;
                                                            }
                                                        }
                                                    }
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-white text-xs text-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-lg",
                                                            children: "🃏"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/GameBoard.tsx",
                                                            lineNumber: 222,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs mt-1",
                                                            children: "Card"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/GameBoard.tsx",
                                                            lineNumber: 223,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/GameBoard.tsx",
                                                    lineNumber: 221,
                                                    columnNumber: 19
                                                }, this)
                                            }, `card-${cardId}`, false, {
                                                fileName: "[project]/src/components/GameBoard.tsx",
                                                lineNumber: 206,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 204,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameBoard.tsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 rounded-lg p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-white mb-4",
                                children: "Player 2 (Opponent)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 233,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    0,
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map((x)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            0,
                                            1,
                                            2
                                        ].map((y)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: getTileClass(x, y),
                                                onClick: ()=>handleTileClick(x, y),
                                                children: renderCard(gameState?.tiles[x]?.[y] || null, x, y)
                                            }, `p2-tile-${x}-${y}`, false, {
                                                fileName: "[project]/src/components/GameBoard.tsx",
                                                lineNumber: 238,
                                                columnNumber: 19
                                            }, this))
                                    }, `p2-row-${x}`, false, {
                                        fileName: "[project]/src/components/GameBoard.tsx",
                                        lineNumber: 236,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameBoard.tsx",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GameBoard.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 bg-gray-800 rounded-lg p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-bold text-white mb-2",
                        children: [
                            "Current Phase: ",
                            gameState?.phase
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameBoard.tsx",
                        lineNumber: 254,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-300",
                        children: [
                            gameState?.phase === 'Placement' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Place cards from your hand onto the board. Face-down cards create strategic advantages."
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 257,
                                columnNumber: 13
                            }, this),
                            gameState?.phase === 'Action' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Move attack-mode cards or switch between attack/defense modes. Only attack-mode cards can move."
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 260,
                                columnNumber: 13
                            }, this),
                            gameState?.phase === 'Combat' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Attack enemy cards. Attack vs attack or attack vs defense. Higher attack wins!"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameBoard.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameBoard.tsx",
                        lineNumber: 255,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GameBoard.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/GameBoard.tsx",
        lineNumber: 141,
        columnNumber: 5
    }, this);
}
_s(GameBoard, "YNz66Y4RSjSfxuU9jb6IpSnHw4I=");
_c = GameBoard;
var _c;
__turbopack_context__.k.register(_c, "GameBoard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/GameLobby.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameLobby",
    ()=>GameLobby
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameBoard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/GameBoard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function GameLobby() {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('lobby');
    const [matches, setMatches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedMatch, setSelectedMatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [playerName, setPlayerName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Mock data - would come from SpacetimeDB
    const mockPlayers = [
        {
            id: 1,
            name: 'Player 1',
            rating: 1200
        },
        {
            id: 2,
            name: 'AI Bot',
            rating: 1000
        },
        {
            id: 3,
            name: 'Player 2',
            rating: 1100
        }
    ];
    const mockMatches = [
        {
            id: 1,
            player1_id: 1,
            player2_id: 2,
            status: 'Active',
            created_at: Date.now()
        },
        {
            id: 2,
            player1_id: 1,
            player2_id: 3,
            status: 'Waiting',
            created_at: Date.now() - 60000
        }
    ];
    const handleCreateMatch = (opponentId)=>{
        // Placeholder - would create match via SpacetimeDB
        const newMatch = {
            id: Date.now(),
            player1_id: 1,
            player2_id: opponentId,
            status: 'Waiting',
            created_at: Date.now()
        };
        setMatches([
            ...matches,
            newMatch
        ]);
    };
    const handleJoinMatch = (matchId)=>{
        setSelectedMatch(matchId);
        setActiveTab('play');
    };
    const renderLobby = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-800 rounded-lg p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-white mb-4",
                            children: "Quick Play"
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameLobby.tsx",
                            lineNumber: 59,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>handleCreateMatch(2),
                            className: "w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg",
                            children: "🤖 Play vs AI Bot"
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameLobby.tsx",
                            lineNumber: 60,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GameLobby.tsx",
                    lineNumber: 58,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-800 rounded-lg p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-white mb-4",
                            children: "Active Matches"
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameLobby.tsx",
                            lineNumber: 70,
                            columnNumber: 9
                        }, this),
                        matches.filter((m)=>m.status === 'Active').length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-400",
                            children: "No active matches. Start a new game!"
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameLobby.tsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: matches.filter((m)=>m.status === 'Active').map((match)=>{
                                const player1 = mockPlayers.find((p)=>p.id === match.player1_id);
                                const player2 = mockPlayers.find((p)=>p.id === match.player2_id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-700 rounded-lg p-4 flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white font-semibold",
                                                    children: [
                                                        player1?.name,
                                                        " vs ",
                                                        player2?.name
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/GameLobby.tsx",
                                                    lineNumber: 81,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-400 text-sm",
                                                    children: [
                                                        "Match #",
                                                        match.id
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/GameLobby.tsx",
                                                    lineNumber: 84,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/GameLobby.tsx",
                                            lineNumber: 80,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleJoinMatch(match.id),
                                            className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg",
                                            children: "Continue"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/GameLobby.tsx",
                                            lineNumber: 86,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, match.id, true, {
                                    fileName: "[project]/src/components/GameLobby.tsx",
                                    lineNumber: 79,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameLobby.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GameLobby.tsx",
                    lineNumber: 69,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-800 rounded-lg p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-white mb-4",
                            children: "Challenge Players"
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameLobby.tsx",
                            lineNumber: 101,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: mockPlayers.filter((p)=>p.id !== 1).map((player)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-700 rounded-lg p-4 flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white font-semibold",
                                                    children: player.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/GameLobby.tsx",
                                                    lineNumber: 106,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-400 text-sm",
                                                    children: [
                                                        "Rating: ",
                                                        player.rating
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/GameLobby.tsx",
                                                    lineNumber: 107,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/GameLobby.tsx",
                                            lineNumber: 105,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleCreateMatch(player.id),
                                            className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg",
                                            children: "Challenge"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/GameLobby.tsx",
                                            lineNumber: 109,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, player.id, true, {
                                    fileName: "[project]/src/components/GameLobby.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameLobby.tsx",
                            lineNumber: 102,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GameLobby.tsx",
                    lineNumber: 100,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/GameLobby.tsx",
            lineNumber: 56,
            columnNumber: 5
        }, this);
    const renderCreateGame = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-800 rounded-lg p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-white mb-4",
                        children: "Create New Game"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameLobby.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-white font-semibold mb-2",
                                children: "Your Name"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameLobby.tsx",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: playerName,
                                onChange: (e)=>setPlayerName(e.target.value),
                                placeholder: "Enter your name",
                                className: "w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameLobby.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameLobby.tsx",
                        lineNumber: 127,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-700 rounded-lg p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-bold text-white mb-3",
                                        children: "Quick Match"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameLobby.tsx",
                                        lineNumber: 140,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-300 mb-4",
                                        children: "Get matched with an AI opponent for a quick game"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameLobby.tsx",
                                        lineNumber: 141,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg",
                                        children: "🤖 Play vs AI"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameLobby.tsx",
                                        lineNumber: 142,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GameLobby.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-700 rounded-lg p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-bold text-white mb-3",
                                        children: "Private Match"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameLobby.tsx",
                                        lineNumber: 148,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-300 mb-4",
                                        children: "Create a match for you and a friend to join"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameLobby.tsx",
                                        lineNumber: 149,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg",
                                        children: "👥 Create Private Room"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameLobby.tsx",
                                        lineNumber: 150,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GameLobby.tsx",
                                lineNumber: 147,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameLobby.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-white mb-3",
                                children: "Game Settings"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameLobby.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-gray-300",
                                                children: "Deck Size"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameLobby.tsx",
                                                lineNumber: 160,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: "bg-gray-700 text-white px-3 py-1 rounded",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "30 cards (Standard)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GameLobby.tsx",
                                                        lineNumber: 162,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "50 cards (Large)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GameLobby.tsx",
                                                        lineNumber: 163,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "100 cards (Tournament)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GameLobby.tsx",
                                                        lineNumber: 164,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/GameLobby.tsx",
                                                lineNumber: 161,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GameLobby.tsx",
                                        lineNumber: 159,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-gray-300",
                                                children: "Time Limit"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameLobby.tsx",
                                                lineNumber: 168,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: "bg-gray-700 text-white px-3 py-1 rounded",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "No limit"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GameLobby.tsx",
                                                        lineNumber: 170,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "5 minutes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GameLobby.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "10 minutes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GameLobby.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "20 minutes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GameLobby.tsx",
                                                        lineNumber: 173,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/GameLobby.tsx",
                                                lineNumber: 169,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GameLobby.tsx",
                                        lineNumber: 167,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GameLobby.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameLobby.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GameLobby.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/GameLobby.tsx",
            lineNumber: 123,
            columnNumber: 5
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container mx-auto px-4 py-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-4xl font-bold text-white mb-2",
                            children: "🎮 AI Monsters Arena"
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameLobby.tsx",
                            lineNumber: 187,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl text-gray-300",
                            children: "Battle with unique AI-generated cards"
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameLobby.tsx",
                            lineNumber: 190,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GameLobby.tsx",
                    lineNumber: 186,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center mb-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 rounded-lg p-1 inline-flex",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab('lobby'),
                                className: `px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'lobby' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`,
                                children: "🏠 Lobby"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameLobby.tsx",
                                lineNumber: 198,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab('create'),
                                className: `px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`,
                                children: "➕ Create Game"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameLobby.tsx",
                                lineNumber: 208,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameLobby.tsx",
                        lineNumber: 197,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/GameLobby.tsx",
                    lineNumber: 196,
                    columnNumber: 9
                }, this),
                activeTab === 'lobby' && renderLobby(),
                activeTab === 'create' && renderCreateGame(),
                activeTab === 'play' && selectedMatch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameBoard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameBoard"], {
                        gameId: selectedMatch
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameLobby.tsx",
                        lineNumber: 226,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/GameLobby.tsx",
                    lineNumber: 225,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/GameLobby.tsx",
            lineNumber: 184,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/GameLobby.tsx",
        lineNumber: 183,
        columnNumber: 5
    }, this);
}
_s(GameLobby, "qbUAVHGa54TpnzKimyJ8qQE8GiE=");
_c = GameLobby;
var _c;
__turbopack_context__.k.register(_c, "GameLobby");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MainNavigation.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MainNavigation",
    ()=>MainNavigation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EnhancedCardGenerator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/EnhancedCardGenerator.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameLobby$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/GameLobby.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function MainNavigation() {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('generator');
    const tabs = [
        {
            id: 'generator',
            label: 'Card Generator',
            icon: '🎨'
        },
        {
            id: 'lobby',
            label: 'Game Arena',
            icon: '🏰'
        },
        {
            id: 'collection',
            label: 'My Collection',
            icon: '📚'
        },
        {
            id: 'deck-builder',
            label: 'Deck Builder',
            icon: '🔧'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-black/30 backdrop-blur-sm border-b border-white/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 py-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-3xl",
                                        children: "🎮"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MainNavigation.tsx",
                                        lineNumber: 46,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-2xl font-bold text-white",
                                                children: "AI Monsters"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MainNavigation.tsx",
                                                lineNumber: 48,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-300 text-sm",
                                                children: "Every card is AI-generated and unique"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MainNavigation.tsx",
                                                lineNumber: 49,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MainNavigation.tsx",
                                        lineNumber: 47,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MainNavigation.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-2 h-2 bg-green-500 rounded-full animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MainNavigation.tsx",
                                        lineNumber: 55,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-white text-sm",
                                        children: "Online"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MainNavigation.tsx",
                                        lineNumber: 56,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MainNavigation.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MainNavigation.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/MainNavigation.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/MainNavigation.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "bg-black/20 backdrop-blur-sm border-b border-white/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex space-x-1",
                        children: tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab(tab.id),
                                className: `flex items-center space-x-2 px-6 py-3 font-semibold transition-all relative ${activeTab === tab.id ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: tab.icon
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MainNavigation.tsx",
                                        lineNumber: 76,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: tab.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MainNavigation.tsx",
                                        lineNumber: 77,
                                        columnNumber: 17
                                    }, this),
                                    activeTab === tab.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MainNavigation.tsx",
                                        lineNumber: 79,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, tab.id, true, {
                                fileName: "[project]/src/components/MainNavigation.tsx",
                                lineNumber: 67,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/MainNavigation.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/MainNavigation.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/MainNavigation.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "container mx-auto px-4 py-8",
                children: [
                    activeTab === 'generator' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EnhancedCardGenerator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EnhancedCardGenerator"], {}, void 0, false, {
                        fileName: "[project]/src/components/MainNavigation.tsx",
                        lineNumber: 89,
                        columnNumber: 39
                    }, this),
                    activeTab === 'lobby' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameLobby$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameLobby"], {}, void 0, false, {
                        fileName: "[project]/src/components/MainNavigation.tsx",
                        lineNumber: 90,
                        columnNumber: 35
                    }, this),
                    activeTab === 'collection' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 rounded-lg p-8 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-6xl mb-4",
                                children: "📚"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MainNavigation.tsx",
                                lineNumber: 93,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-bold text-white mb-2",
                                children: "My Collection"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MainNavigation.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-300",
                                children: "Your AI-generated card collection will appear here"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MainNavigation.tsx",
                                lineNumber: 95,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MainNavigation.tsx",
                        lineNumber: 92,
                        columnNumber: 11
                    }, this),
                    activeTab === 'deck-builder' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 rounded-lg p-8 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-6xl mb-4",
                                children: "🔧"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MainNavigation.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-bold text-white mb-2",
                                children: "Deck Builder"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MainNavigation.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-300",
                                children: "Build your custom decks from your collection"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MainNavigation.tsx",
                                lineNumber: 102,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MainNavigation.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MainNavigation.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/MainNavigation.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_s(MainNavigation, "3uWH+WXY3jg6Y6XQXXhxwABKBYU=");
_c = MainNavigation;
var _c;
__turbopack_context__.k.register(_c, "MainNavigation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MainNavigation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MainNavigation.tsx [app-client] (ecmascript)");
'use client';
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MainNavigation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MainNavigation"], {}, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0~1i50r._.js.map