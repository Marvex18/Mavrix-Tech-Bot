const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// 🎯 Premium Mention System Configuration
const PREMIUM_RESPONSE_MODES = {
    RANDOM_STICKER: 'random_sticker',
    CUSTOM_MEDIA: 'custom_media', 
    AI_CHAT: 'ai_chat',
    VOICE_RESPONSE: 'voice_response',
    QUOTE_REPLY: 'quote_reply',
    FUN_FACT: 'fun_fact',
    COMPLIMENT: 'compliment'
};

// 🎨 Premium Sticker Packs
const PREMIUM_STICKER_PACKS = {
    greetings: [
        'https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/app/src/main/assets/1/01_Cuppy_smile.webp',
        'https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/app/src/main/assets/1/02_Cuppy_love.webp',
        'https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/app/src/main/assets/1/03_Cuppy_hey.webp'
    ],
    anime: [
        'https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/app/src/main/assets/2/01_WEBP_Anime_01.webp',
        'https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/app/src/main/assets/2/02_WEBP_Anime_02.webp',
        'https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/app/src/main/assets/2/03_WEBP_Anime_03.webp'
    ],
    funny: [
        'https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/app/src/main/assets/3/01_Funny_01.webp',
        'https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/app/src/main/assets/3/02_Funny_02.webp',
        'https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/app/src/main/assets/3/03_Funny_03.webp'
    ]
};

// 💬 AI Response Templates
const AI_RESPONSES = {
    greetings: [
        "Hello there! 👋 How can I assist you today?",
        "Hey! 😊 Nice to see you mentioned me!",
        "Hi! 🎉 I'm here and ready to help!",
        "Greetings! ✨ What can I do for you?",
        "Hello! 🤖 Knight Bot at your service!"
    ],
    questions: [
        "That's an interesting question! Let me think... 🤔",
        "I'd be happy to help with that! 💡",
        "Great question! Here's what I think...",
        "Hmm, let me process that for you... ⚡",
        "I've got some insights on that! 🎯"
    ],
    fun: [
        "Did you know I can do amazing things? 🚀",
        "You've got great taste in bots! 😎",
        "I'm feeling extra smart today! 💎",
        "Let's make this conversation awesome! 🌟",
        "You're talking to the most advanced bot! 🤖"
    ]
};

// 🎭 Compliment Database
const COMPLIMENTS = [
    "You're absolutely amazing! 🌟",
    "Your energy lights up this chat! 💫",
    "You've got great taste in bots! 😎",
    "You're making this group better! 🎉",
    "Your messages are always on point! 🎯",
    "You're a true legend! 🏆",
    "Your vibe is immaculate! ✨",
    "You're crushing it today! 💪",
    "You're smarter than you think! 🧠",
    "You're one in a million! 💎"
];

// 📚 Fun Facts Database  
const FUN_FACTS = [
    "Honey never spoils! Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat. 🍯",
    "Octopuses have three hearts! Two pump blood through the gills, while the third pumps it through the rest of the body. 🐙",
    "A day on Venus is longer than a year on Venus! It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun. 🪐",
    "Bananas are berries, but strawberries aren't! In botanical terms, berries have seeds inside, which bananas do, but strawberries have their seeds on the outside. 🍌",
    "The shortest war in history was between Britain and Zanzibar in 1896. It lasted only 38 minutes! ⏱️"
];

function loadState() {
    try {
        const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'mention.json'), 'utf8');
        return JSON.parse(raw);
    } catch {
        return { 
            enabled: false, 
            assetPath: 'assets/mention_default.webp', 
            type: 'sticker',
            mode: PREMIUM_RESPONSE_MODES.RANDOM_STICKER,
            responseChance: 100, // 100% response rate
            cooldown: 0, // No cooldown
            premiumUsers: [],
            customResponses: {},
            stickerPack: 'greetings'
        };
    }
}

function saveState(state) {
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'mention.json'), JSON.stringify(state, null, 2));
}

// 💎 Premium User Management
function isPremiumUser(userId, state) {
    return state.premiumUsers.includes(userId);
}

function addPremiumUser(userId, state) {
    if (!state.premiumUsers.includes(userId)) {
        state.premiumUsers.push(userId);
        saveState(state);
    }
}

function removePremiumUser(userId, state) {
    state.premiumUsers = state.premiumUsers.filter(user => user !== userId);
    saveState(state);
}

// 🎲 Random Selection Helper
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 🎯 Advanced Mention Detection
async function handleMentionDetection(sock, chatId, message) {
    try {
        if (message.key?.fromMe) return;

        const state = loadState();
        if (!state.enabled) return;

        // 🎲 Response chance system
        if (Math.random() * 100 > state.responseChance) {
            return; // Skip response based on chance setting
        }

        // ⏰ Cooldown system
        const now = Date.now();
        if (state.lastResponse && (now - state.lastResponse) < (state.cooldown * 1000)) {
            return; // Still in cooldown period
        }

        // Normalize bot JID
        const rawId = sock.user?.id || sock.user?.jid || '';
        if (!rawId) return;
        const botNum = rawId.split('@')[0].split(':')[0];
        const botJids = [
            `${botNum}@s.whatsapp.net`,
            `${botNum}@whatsapp.net`,
            rawId
        ];

        // Extract mentions from multiple message types
        const msg = message.message || {};
        const contexts = [
            msg.extendedTextMessage?.contextInfo,
            msg.imageMessage?.contextInfo,
            msg.videoMessage?.contextInfo,
            msg.documentMessage?.contextInfo,
            msg.stickerMessage?.contextInfo,
            msg.buttonsResponseMessage?.contextInfo,
            msg.listResponseMessage?.contextInfo
        ].filter(Boolean);

        let mentioned = [];
        for (const c of contexts) {
            if (Array.isArray(c.mentionedJid)) {
                mentioned = mentioned.concat(c.mentionedJid);
            }
        }

        if (!mentioned.length) return;
        const isBotMentioned = mentioned.some(j => botJids.includes(j));
        if (!isBotMentioned) return;

        // 🎭 Premium Response System
        await handlePremiumResponse(sock, chatId, message, state);

        // Update last response time
        state.lastResponse = now;
        saveState(state);

    } catch (err) {
        console.error('💥 handleMentionDetection error:', err);
    }
}

// 🎪 Premium Response Handler
async function handlePremiumResponse(sock, chatId, message, state) {
    const sender = message.key.participant || message.key.remoteJid;
    const isPremium = isPremiumUser(sender, state);

    try {
        switch (state.mode) {
            case PREMIUM_RESPONSE_MODES.RANDOM_STICKER:
                await sendRandomSticker(sock, chatId, message, state);
                break;

            case PREMIUM_RESPONSE_MODES.CUSTOM_MEDIA:
                await sendCustomMedia(sock, chatId, message, state);
                break;

            case PREMIUM_RESPONSE_MODES.AI_CHAT:
                await sendAIResponse(sock, chatId, message, isPremium);
                break;

            case PREMIUM_RESPONSE_MODES.VOICE_RESPONSE:
                await sendVoiceResponse(sock, chatId, message);
                break;

            case PREMIUM_RESPONSE_MODES.QUOTE_REPLY:
                await sendQuoteReply(sock, chatId, message);
                break;

            case PREMIUM_RESPONSE_MODES.FUN_FACT:
                await sendFunFact(sock, chatId, message);
                break;

            case PREMIUM_RESPONSE_MODES.COMPLIMENT:
                await sendCompliment(sock, chatId, message, sender);
                break;

            default:
                await sendRandomSticker(sock, chatId, message, state);
        }
    } catch (error) {
        console.error('💥 Response error:', error);
        // Fallback to basic response
        await sock.sendMessage(chatId, { text: '👋 Hello!' }, { quoted: message });
    }
}

// 🎨 Random Sticker Response
async function sendRandomSticker(sock, chatId, message, state) {
    const stickerPack = PREMIUM_STICKER_PACKS[state.stickerPack] || PREMIUM_STICKER_PACKS.greetings;
    const randomSticker = getRandomItem(stickerPack);
    
    try {
        const response = await axios.get(randomSticker, { responseType: 'arraybuffer' });
        const stickerBuffer = Buffer.from(response.data);
        await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });
    } catch {
        // Fallback to default sticker
        const assetPath = path.join(__dirname, '..', state.assetPath);
        if (fs.existsSync(assetPath)) {
            await sock.sendMessage(chatId, { sticker: fs.readFileSync(assetPath) }, { quoted: message });
        }
    }
}

// 🖼️ Custom Media Response
async function sendCustomMedia(sock, chatId, message, state) {
    const assetPath = path.join(__dirname, '..', state.assetPath);
    if (!fs.existsSync(assetPath)) {
        await sendRandomSticker(sock, chatId, message, state);
        return;
    }

    const payload = {};
    if (state.type === 'sticker') {
        payload.sticker = fs.readFileSync(assetPath);
    } else if (state.type === 'image') {
        payload.image = fs.readFileSync(assetPath);
        payload.caption = "👋 You mentioned me!";
    } else if (state.type === 'video') {
        payload.video = fs.readFileSync(assetPath);
        if (state.gifPlayback) payload.gifPlayback = true;
        payload.caption = "🎬 You called?";
    } else if (state.type === 'audio') {
        payload.audio = fs.readFileSync(assetPath);
        payload.mimetype = state.mimetype || 'audio/mpeg';
        payload.ptt = state.ptt || false;
    } else if (state.type === 'text') {
        const text = fs.readFileSync(assetPath, 'utf8');
        payload.text = `💬 ${text}`;
    }

    await sock.sendMessage(chatId, payload, { quoted: message });
}

// 🤖 AI Chat Response
async function sendAIResponse(sock, chatId, message, isPremium) {
    const messageText = message.message?.conversation || 
                       message.message?.extendedTextMessage?.text || '';
    
    let responseCategory = 'greetings';
    
    if (messageText.includes('?')) {
        responseCategory = 'questions';
    } else if (messageText.length > 20) {
        responseCategory = 'fun';
    }

    const responses = isPremium ? 
        [...AI_RESPONSES[responseCategory], ...AI_RESPONSES.fun] : 
        AI_RESPONSES[responseCategory];

    const response = getRandomItem(responses);
    await sock.sendMessage(chatId, { text: response }, { quoted: message });
}

// 🎤 Voice Response (Premium Feature)
async function sendVoiceResponse(sock, chatId, message) {
    // This would integrate with a TTS service
    const voiceMessages = [
        "Hello! How can I help you today?",
        "Hey there! You mentioned me!",
        "Hi! I'm listening to you!",
        "Greetings! What can I do for you?"
    ];
    
    const text = getRandomItem(voiceMessages);
    await sock.sendMessage(chatId, { 
        text: `🎤 *Voice Response:* ${text}\n\n💎 *Premium feature - Text version*` 
    }, { quoted: message });
}

// 💬 Quote Reply
async function sendQuoteReply(sock, chatId, message) {
    const quotes = [
        "🌟 *The best way to predict the future is to create it.* - Peter Drucker",
        "🚀 *Innovation distinguishes between a leader and a follower.* - Steve Jobs",
        "💪 *The only way to do great work is to love what you do.* - Steve Jobs",
        "🎯 *Your time is limited, don't waste it living someone else's life.* - Steve Jobs",
        "✨ *The greatest glory in living lies not in never falling, but in rising every time we fall.* - Nelson Mandela"
    ];
    
    const quote = getRandomItem(quotes);
    await sock.sendMessage(chatId, { text: quote }, { quoted: message });
}

// 📚 Fun Fact Response
async function sendFunFact(sock, chatId, message) {
    const fact = getRandomItem(FUN_FACTS);
    await sock.sendMessage(chatId, { 
        text: `🤓 *Did You Know?*\n\n${fact}\n\n💡 *Fun Fact #${Math.floor(Math.random() * 100) + 1}*` 
    }, { quoted: message });
}

// 🏆 Compliment Response
async function sendCompliment(sock, chatId, message, sender) {
    const compliment = getRandomItem(COMPLIMENTS);
    await sock.sendMessage(chatId, { 
        text: `💫 ${compliment}\n\n🎯 *Especially for you, @${sender.split('@')[0]}!*`,
        mentions: [sender]
    }, { quoted: message });
}

// ⚙️ Command Handlers
async function mentionToggleCommand(sock, chatId, message, args, isOwner) {
    if (!isOwner) {
        return sock.sendMessage(chatId, { 
            text: '❌ *Owner Only!*\n\nOnly the bot owner can use this command.' 
        }, { quoted: message });
    }

    const onoff = (args || '').trim().toLowerCase();
    if (!onoff || !['on','off'].includes(onoff)) {
        const state = loadState();
        const menuText = `🎯 *Premium Mention System* 🎯

⚙️ *Current Status:* ${state.enabled ? '✅ Enabled' : '❌ Disabled'}
🎭 *Mode:* ${state.mode.replace(/_/g, ' ').toUpperCase()}
🎲 *Response Chance:* ${state.responseChance}%
⏰ *Cooldown:* ${state.cooldown}s

💡 *Usage:*
• .mention on - Enable mention responses
• .mention off - Disable mention responses
• .mention mode <mode> - Change response mode
• .mention chance <1-100> - Set response chance
• .mention cooldown <seconds> - Set cooldown
• .mention stickerpack <name> - Change sticker pack

🎭 *Available Modes:*
• random_sticker - Random stickers
• custom_media - Your custom media
• ai_chat - Smart AI responses
• voice_response - Voice messages
• quote_reply - Inspirational quotes
• fun_fact - Interesting facts
• compliment - Nice compliments

🎨 *Sticker Packs:* greetings, anime, funny`;

        return sock.sendMessage(chatId, { text: menuText }, { quoted: message });
    }

    const state = loadState();
    state.enabled = onoff === 'on';
    saveState(state);
    
    return sock.sendMessage(chatId, { 
        text: `✅ *Mention System ${state.enabled ? 'Enabled' : 'Disabled'}!*\n\n${state.enabled ? 'I will now respond when mentioned! 🎉' : 'I will stay quiet when mentioned. 🤫'}` 
    }, { quoted: message });
}

async function setMentionCommand(sock, chatId, message, isOwner) {
    if (!isOwner) {
        return sock.sendMessage(chatId, { 
            text: '❌ *Owner Only!*\n\nOnly the bot owner can use this command.' 
        }, { quoted: message });
    }

    const text = message.message?.extendedTextMessage?.text || 
                message.message?.conversation || '';
    const args = text.split(' ').slice(1);

    if (args.length < 2) {
        return sock.sendMessage(chatId, { 
            text: '❌ *Invalid Usage!*\n\nUsage: .mention <setting> <value>\n\nExamples:\n.mention mode ai_chat\n.mention chance 75\n.mention cooldown 30\n.mention stickerpack anime' 
        }, { quoted: message });
    }

    const [setting, value] = args;
    const state = loadState();

    try {
        switch (setting.toLowerCase()) {
            case 'mode':
                if (Object.values(PREMIUM_RESPONSE_MODES).includes(value)) {
                    state.mode = value;
                    saveState(state);
                    await sock.sendMessage(chatId, { 
                        text: `✅ *Response Mode Updated!*\n\nNew mode: ${value.replace(/_/g, ' ').toUpperCase()}\n\nI will now respond with ${value.replace(/_/g, ' ')} when mentioned!` 
                    }, { quoted: message });
                } else {
                    throw new Error('Invalid mode');
                }
                break;

            case 'chance':
                const chance = parseInt(value);
                if (chance >= 1 && chance <= 100) {
                    state.responseChance = chance;
                    saveState(state);
                    await sock.sendMessage(chatId, { 
                        text: `🎲 *Response Chance Updated!*\n\nNew chance: ${chance}%\n\nI will now respond to ${chance}% of mentions!` 
                    }, { quoted: message });
                } else {
                    throw new Error('Chance must be between 1-100');
                }
                break;

            case 'cooldown':
                const cooldown = parseInt(value);
                if (cooldown >= 0 && cooldown <= 3600) {
                    state.cooldown = cooldown;
                    saveState(state);
                    await sock.sendMessage(chatId, { 
                        text: `⏰ *Cooldown Updated!*\n\nNew cooldown: ${cooldown} seconds\n\nI will wait ${cooldown}s between responses!` 
                    }, { quoted: message });
                } else {
                    throw new Error('Cooldown must be between 0-3600 seconds');
                }
                break;

            case 'stickerpack':
                if (PREMIUM_STICKER_PACKS[value]) {
                    state.stickerPack = value;
                    saveState(state);
                    await sock.sendMessage(chatId, { 
                        text: `🎨 *Sticker Pack Updated!*\n\nNew pack: ${value}\n\nI will use ${value} stickers when responding!` 
                    }, { quoted: message });
                } else {
                    throw new Error('Invalid sticker pack');
                }
                break;

            default:
                throw new Error('Unknown setting');
        }
    } catch (error) {
        await sock.sendMessage(chatId, { 
            text: `❌ *Setting Update Failed!*\n\nError: ${error.message}\n\n💡 Use .mention to see available settings and values.` 
        }, { quoted: message });
    }
}

// 🎯 Set Custom Media (Enhanced Version)
async function setMentionMedia(sock, chatId, message, isOwner) {
    if (!isOwner) {
        return sock.sendMessage(chatId, { 
            text: '❌ *Owner Only!*\n\nOnly the bot owner can set custom mention media.' 
        }, { quoted: message });
    }

    const ctx = message.message?.extendedTextMessage?.contextInfo;
    const qMsg = ctx?.quotedMessage;
    if (!qMsg) {
        return sock.sendMessage(chatId, { 
            text: '❌ *Reply Required!*\n\nPlease reply to a message or media (sticker/image/video/audio/document) that you want to use as mention response.' 
        }, { quoted: message });
    }

    // [Previous media processing code remains the same...]
    // (Keep the existing media download and processing logic from your original code)

    // After processing, update the mode to custom_media
    const state = loadState();
    state.mode = PREMIUM_RESPONSE_MODES.CUSTOM_MEDIA;
    saveState(state);

    await sock.sendMessage(chatId, { 
        text: `✅ *Custom Mention Media Set!*\n\nResponse mode automatically switched to CUSTOM_MEDIA.\n\nI will now use this media when mentioned! 🎉` 
    }, { quoted: message });
}

module.exports = { 
    handleMentionDetection, 
    mentionToggleCommand, 
    setMentionCommand: setMentionMedia,
    PREMIUM_RESPONSE_MODES 
};
