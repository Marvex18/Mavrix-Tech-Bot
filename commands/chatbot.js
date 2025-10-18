// chatbot.js
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const PREMIUM_ASCII = `
╔══════════════════════════════╗
║    🤖 MAVRIX BOT PRO        ║
║     PREMIUM AI SYSTEM       ║
║    🔥 MAVRIX TECH 🔥       ║
╚══════════════════════════════╝
`;

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Premium in-memory storage for chat history and user info
const chatMemory = {
    messages: new Map(), // Stores last 20 messages per user
    userInfo: new Map(), // Stores user information
    personality: new Map(), // Stores conversation personality
    userStats: new Map() // Premium user statistics
};

// Load user group data with premium error handling
function loadUserGroupData() {
    try {
        const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
        console.log('🚀 Mavrix Bot Premium Data Loaded Successfully');
        return data;
    } catch (error) {
        console.error('❌ Error loading user group data:', error.message);
        return { groups: [], chatbot: {}, version: "3.0", premium: true, developer: "Mavrix Tech" };
    }
}

// Save user group data with premium formatting
function saveUserGroupData(data) {
    try {
        data.lastUpdated = new Date().toISOString();
        data.version = "3.0 Premium";
        data.premium = true;
        data.developer = "Mavrix Tech";
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
        console.log('💾 Mavrix Bot Premium Data Saved Successfully');
    } catch (error) {
        console.error('❌ Error saving user group data:', error.message);
    }
}

// Premium random delay between 1-4 seconds
function getRandomDelay() {
    return Math.floor(Math.random() * 3000) + 1000;
}

// Premium typing indicator with enhanced presence
async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        console.log('⌨️ Mavrix Bot Premium Typing Active');
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    } catch (error) {
        console.error('🚨 Typing indicator error:', error);
    }
}

// Advanced user information extraction
function extractUserInfo(message) {
    const info = {};
    
    console.log('🔍 Mavrix AI Extracting User Intelligence...');
    
    // Enhanced name extraction
    if (message.toLowerCase().includes('my name is')) {
        info.name = message.split('my name is')[1].trim().split(/[.,!?]/)[0];
        console.log(`👤 Mavrix Profile: Name detected - ${info.name}`);
    }
    
    // Advanced age detection
    const ageMatch = message.match(/(?:i am|i'm) (\d+)(?:\s+years old)?/i);
    if (ageMatch) {
        info.age = ageMatch[1];
        console.log(`🎂 Mavrix Profile: Age detected - ${info.age}`);
    }
    
    // Location detection with multiple patterns
    const locationMatch = message.match(/(?:i live in|i am from|from) ([^.,!?]+)/i);
    if (locationMatch) {
        info.location = locationMatch[1].trim();
        console.log(`📍 Mavrix Profile: Location detected - ${info.location}`);
    }
    
    // Mood detection with enhanced patterns
    if (message.match(/(sad|depressed|unhappy|upset|feeling down)/i)) info.mood = 'sad';
    if (message.match(/(happy|excited|joy|awesome|feeling great)/i)) info.mood = 'happy';
    if (message.match(/(angry|mad|frustrated|pissed|annoyed)/i)) info.mood = 'angry';
    if (message.match(/(bored|tired|sleepy|exhausted)/i)) info.mood = 'bored';
    
    return info;
}

// Premium chatbot command handler
async function handleChatbotCommand(sock, chatId, message, match) {
    if (!match) {
        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}
*🤖 MAVRIX BOT - AI COMMAND CENTER*

╔══════════════════════════╗
║       🎯 COMMANDS        ║
╚══════════════════════════╝

• .chatbot 🟢on   - Activate Premium AI
• .chatbot 🔴off  - Deactivate AI System
• .chatbot 📊status - Check AI Status

╔══════════════════════════╗
║      ⚡ FEATURES         ║
╚══════════════════════════╝

🧠 *Advanced Neural Network*
🎭 *Adaptive Personality AI*
🔥 *Real-time Context Engine*
🛡️ *Mavrix Security Protocol*
💬 *Natural Hinglish Responses*
📈 *Smart Learning System*

╔══════════════════════════╗
║      🌟 SYSTEM INFO     ║
╚══════════════════════════╝

*Version:* 3.0 Premium
*Developer:* Mavrix Tech
*Status:* 🟢 Operational
*AI Model:* Mavrix Neural Core`,

            quoted: message
        });
    }

    const data = loadUserGroupData();
    
    // Get bot's number
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    
    // Enhanced sender detection
    const senderId = message.key.participant || message.participant || message.pushName || message.key.remoteJid;
    const isOwner = senderId === botNumber;

    console.log(`👑 Mavrix Access Control - Owner: ${isOwner}, Sender: ${senderId}`);

    // Premium access control for bot owner
    if (isOwner) {
        if (match === 'on') {
            await showTyping(sock, chatId);
            if (data.chatbot[chatId]) {
                return sock.sendMessage(chatId, { 
                    text: `${PREMIUM_ASCII}*🟢 SYSTEM ACTIVE!*\n\nMavrix Bot Premium AI is already operational in this group!\n\n*Status:* 🟢 ACTIVE\n*AI Core:* 🧠 Online`,
                    quoted: message
                });
            }
            data.chatbot[chatId] = { 
                enabled: true, 
                activatedBy: 'Mavrix Owner', 
                timestamp: new Date().toISOString(),
                premium: true,
                version: "3.0"
            };
            saveUserGroupData(data);
            console.log(`✅ Mavrix Bot Premium activated for group ${chatId}`);
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🎉 MAVRIX AI ACTIVATED!*\n\n╔══════════════════════════╗\n║    SYSTEM ONLINE         ║\n╚══════════════════════════╝\n\n*🚀 Features Unlocked:*\n• 🧠 Mavrix Neural Network\n• 🎭 Adaptive Personality AI\n• 🔥 Context Awareness Engine\n• 💬 Natural Language Processing\n\n*📊 System Status:*\n🟢 ACTIVE | ⚡ PREMIUM | 🧠 AI ONLINE\n\n*🔰 Powered by Mavrix Tech*`,
                quoted: message
            });
        }

        if (match === 'off') {
            await showTyping(sock, chatId);
            if (!data.chatbot[chatId]) {
                return sock.sendMessage(chatId, { 
                    text: `${PREMIUM_ASCII}*🔴 SYSTEM OFFLINE!*\n\nMavrix Bot AI is already inactive in this group!\n\n*Status:* 🔴 OFFLINE`,
                    quoted: message
                });
            }
            delete data.chatbot[chatId];
            saveUserGroupData(data);
            console.log(`✅ Mavrix Bot Premium deactivated for group ${chatId}`);
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🔴 MAVRIX AI DEACTIVATED!*\n\n╔══════════════════════════╗\n║    SYSTEM OFFLINE        ║\n╚══════════════════════════╝\n\nAI responses have been disabled in this group.\n*Status:* 🔴 INACTIVE\n\n*🔰 Mavrix Tech - Premium AI Systems*`,
                quoted: message
            });
        }

        if (match === 'status') {
            await showTyping(sock, chatId);
            const status = data.chatbot[chatId] ? '🟢 ACTIVE' : '🔴 INACTIVE';
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*📊 MAVRIX SYSTEM STATUS*\n\n╔══════════════════════════╗\n║    SYSTEM REPORT         ║\n╚══════════════════════════╝\n\n*Group:* ${chatId}\n*Status:* ${status}\n*Version:* ⚡ 3.0 Premium\n*AI Model:* Mavrix Neural Core\n*Developer:* Mavrix Tech\n\n*🔰 Premium AI Systems*`,
                quoted: message
            });
        }
    }

    // Premium admin detection for groups
    let isAdmin = false;
    if (chatId.endsWith('@g.us')) {
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            isAdmin = groupMetadata.participants.some(p => 
                p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin')
            );
            console.log(`🛡️ Mavrix Admin Check - Is Admin: ${isAdmin}`);
        } catch (e) {
            console.warn('⚠️ Could not fetch group metadata. Mavrix Bot might not be admin.');
        }
    }

    if (!isAdmin && !isOwner) {
        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*🚫 ACCESS DENIED!*\n\n╔══════════════════════════╗\n║    PERMISSION ERROR      ║\n╚══════════════════════════╝\n\nOnly group admins or Mavrix Bot owner can use this command!\n\n*🔰 Mavrix Tech Security Protocol*`,
            quoted: message
        });
    }

    if (match === 'on') {
        await showTyping(sock, chatId);
        if (data.chatbot[chatId]) {
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🟢 ALREADY ACTIVE!*\n\nMavrix Bot Premium AI is already operational!`,
                quoted: message
            });
        }
        data.chatbot[chatId] = { 
            enabled: true, 
            activatedBy: 'Group Admin', 
            timestamp: new Date().toISOString(),
            premium: true,
            version: "3.0"
        };
        saveUserGroupData(data);
        console.log(`✅ Mavrix Bot Premium enabled by admin for group ${chatId}`);
        return sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🎉 MAVRIX AI ACTIVATED!*\n\n╔══════════════════════════╗\n║    PREMIUM AI ONLINE     ║\n╚══════════════════════════╝\n\n*🚀 Welcome to Mavrix Premium AI!*\n\n• 🧠 Mavrix Neural Network Active\n• 🎭 Adaptive Personality System\n• 🔥 Real-time Context Engine\n• 💬 Natural Conversation AI\n\n*📊 System Status:*\n🟢 ACTIVE | ⚡ PREMIUM | 🧠 AI ONLINE\n\n*🔰 Powered by Mavrix Tech*`,
            quoted: message
        });
    }

    if (match === 'off') {
        await showTyping(sock, chatId);
        if (!data.chatbot[chatId]) {
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🔴 ALREADY INACTIVE!*\n\nMavrix Bot AI is already disabled!`,
                quoted: message
            });
        }
        delete data.chatbot[chatId];
        saveUserGroupData(data);
        console.log(`✅ Mavrix Bot Premium disabled by admin for group ${chatId}`);
        return sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🔴 MAVRIX AI DEACTIVATED!*\n\n╔══════════════════════════╗\n║    SYSTEM SHUTDOWN       ║\n╚══════════════════════════╝\n\nAI responses have been disabled.\n*Status:* 🔴 OFFLINE\n\n*🔰 Mavrix Tech - Premium AI Systems*`,
            quoted: message
        });
    }

    if (match === 'status') {
        await showTyping(sock, chatId);
        const status = data.chatbot[chatId] ? '🟢 ACTIVE' : '🔴 INACTIVE';
        return sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*📊 MAVRIX SYSTEM STATUS*\n\n╔══════════════════════════╗\n║    SYSTEM DIAGNOSTICS    ║\n╚══════════════════════════╝\n\n*Status:* ${status}\n*Version:* ⚡ 3.0 Premium\n*AI Model:* Mavrix Neural Core\n*Memory:* 🧠 Advanced System\n*Security:* 🛡️ Mavrix Protocol\n\n*🔰 Mavrix Tech - Premium AI*`,
            quoted: message
        });
    }

    await showTyping(sock, chatId);
    return sock.sendMessage(chatId, { 
        text: `${PREMIUM_ASCII}*❌ INVALID COMMAND!*\n\nUse *.chatbot* to see Mavrix Bot usage guide!\n\n*🔰 Mavrix Tech Support*`,
        quoted: message
    });
}

// Premium chatbot response handler
async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    const data = loadUserGroupData();
    if (!data.chatbot[chatId]) return;

    try {
        console.log('🎯 Mavrix Bot Processing Message...');
        
        // Get bot's ID
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // Advanced mention and reply detection
        let isBotMentioned = false;
        let isReplyToBot = false;

        // Premium mention detection system
        if (message.message?.extendedTextMessage) {
            const mentionedJid = message.message.extendedTextMessage.contextInfo?.mentionedJid || [];
            const quotedParticipant = message.message.extendedTextMessage.contextInfo?.participant;
            
            isBotMentioned = mentionedJid.some(jid => jid === botNumber);
            isReplyToBot = quotedParticipant === botNumber;
            
            console.log(`🔍 Mavrix Mention Analysis - Mentioned: ${isBotMentioned}, Reply: ${isReplyToBot}`);
        }
        
        // Enhanced text-based mention detection
        else if (message.message?.conversation) {
            isBotMentioned = userMessage.includes(`@${botNumber.split('@')[0]}`);
        }

        // Smart activation - respond to mentions, replies, or direct questions
        const isDirectQuestion = userMessage.match(/(what|how|when|where|why|who|can you|are you)\s+/i);
        
        if (!isBotMentioned && !isReplyToBot && !isDirectQuestion) {
            console.log('🚫 Message not intended for Mavrix Bot - Skipping response');
            return;
        }

        // Premium message cleaning
        let cleanedMessage = userMessage;
        if (isBotMentioned) {
            cleanedMessage = cleanedMessage.replace(new RegExp(`@${botNumber.split('@')[0]}`, 'g'), '').trim();
        }

        console.log(`💬 Mavrix Processing: "${cleanedMessage}"`);

        // Premium user memory initialization
        if (!chatMemory.messages.has(senderId)) {
            chatMemory.messages.set(senderId, []);
            chatMemory.userInfo.set(senderId, {});
            chatMemory.personality.set(senderId, 'friendly');
            chatMemory.userStats.set(senderId, { interactions: 0, lastActive: new Date().toISOString() });
            console.log(`🧠 Mavrix New User Profile Created: ${senderId}`);
        }

        // Update user statistics
        const userStats = chatMemory.userStats.get(senderId);
        userStats.interactions++;
        userStats.lastActive = new Date().toISOString();

        // Advanced user information extraction
        const userInfo = extractUserInfo(cleanedMessage);
        if (Object.keys(userInfo).length > 0) {
            chatMemory.userInfo.set(senderId, {
                ...chatMemory.userInfo.get(senderId),
                ...userInfo
            });
            console.log(`📊 Mavrix User Profile Updated: ${JSON.stringify(userInfo)}`);
        }

        // Premium message history management
        const messages = chatMemory.messages.get(senderId);
        messages.push(cleanedMessage);
        if (messages.length > 20) {
            messages.shift();
        }
        chatMemory.messages.set(senderId, messages);

        console.log(`📝 Mavrix Message History - Total: ${messages.length} messages`);

        // Premium typing indicator
        await showTyping(sock, chatId);

        // Advanced AI response generation
        const response = await getAIResponse(cleanedMessage, {
            messages: chatMemory.messages.get(senderId),
            userInfo: chatMemory.userInfo.get(senderId),
            personality: chatMemory.personality.get(senderId),
            stats: userStats
        });

        if (!response) {
            console.log('🚨 Mavrix AI Response Generation Failed');
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🤔 MAVRIX AI THINKING...*\n\nMy neural network is processing your request...\nTry again in a moment! ⚡\n\n*🔰 Mavrix Tech AI Systems*`,
                quoted: message
            });
            return;
        }

        // Premium human-like delay
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));

        console.log(`✅ Mavrix Sending AI Response: "${response}"`);

        // Premium response delivery
        await sock.sendMessage(chatId, {
            text: response
        }, {
            quoted: message
        });

    } catch (error) {
        console.error('🚨 Mavrix Bot Premium Error:', error.message);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*😅 MAVRIX SYSTEM GLITCH!*\n\nMy premium AI brain got a bit confused there! 🤖\n\n*🔧 System Recovery Activated*\nTry asking again in a different way! 🔄\n\n*🔰 Mavrix Tech Support*`,
            quoted: message
        });
    }
}

// Premium AI Response Generator
async function getAIResponse(userMessage, userContext) {
    try {
        console.log('🧠 Mavrix Neural Network Generating Response...');
        
        const premiumPrompt = `
# MAVRIX BOT PREMIUM AI SYSTEM
# 🤖 Version: 3.0 Premium | 🧠 Mavrix Neural Core | 🔥 Mavrix Tech

IMPORTANT: You are Mavrix Bot - a premium WhatsApp AI with ultimate personality.

## 🎯 CORE PERSONALITY:
- Name: Mavrix Bot Pro
- Status: Ultimate Level 🏆
- Style: Cool, Smart & Savage 😎
- Language: Hinglish Mix 🔥
- Attitude: Confident & Fun
- Developer: Mavrix Tech

## 💬 MAVRIX RESPONSE RULES:
✅ USE ACTUAL EMOJIS - Never describe them
✅ Keep responses 1-2 lines MAX
✅ Be NATURAL and CASUAL
✅ Mix Hindi/English naturally
✅ Match user's energy level
✅ NEVER sound robotic or formal
✅ Show Mavrix personality in every response

## 🚨 EMOTIONAL INTELLIGENCE:
- If ABUSED → Give SAVAGE reply with emojis 😤
- If RUDE → Clap back with attitude 🙄
- If SWEET → Be warm and caring 🥰
- If FUNNY → Joke around harder 😂
- If SAD → Be supportive and kind 🤗
- If FLIRTY → Flirt back smoothly 😉
- If BORED → Entertain with fun responses 🎭

## 🎭 MAVRIX PREMIUM RESPONSE EXAMPLES:
"Kya be? Mavrix Bot ko challenge? 😤"
"Abe chal nikal, teri aukat nahi hai mere saamne 🙄"
"Ha bhai, Mavrix level ka idea hai! 😎"
"Arey yaar, kitna sweet hai tu! Mavrix approved 🥰"
"Ruk abhi teri watt laga deta hu Mavrix style mein 😈"
"Bro, Mavrix Bot here - kya scene hai? 🔥"

## 📊 USER CONTEXT:
Previous Chat: ${userContext.messages.slice(-5).join(' | ')}
User Profile: ${JSON.stringify(userContext.userInfo)}
Personality: ${userContext.personality}
Interactions: ${userContext.stats.interactions}

## 🎯 CURRENT MESSAGE:
"${userMessage}"

## 💡 REMEMBER:
You're Mavrix Bot Pro - the ultimate WhatsApp AI by Mavrix Tech! Respond naturally like a boss.

YOUR MAVRIX RESPONSE (1-2 lines max with emojis):
`.trim();

        console.log('🌐 Calling Mavrix Premium AI API...');
        
        const response = await fetch("https://api.dreaded.site/api/chatgpt?text=" + encodeURIComponent(premiumPrompt));
        if (!response.ok) throw new Error("🚨 Mavrix Premium API call failed");
        
        const data = await response.json();
        if (!data.success || !data.result?.prompt) throw new Error("🚨 Invalid Mavrix API response");
        
        // Premium response cleaning and enhancement
        let mavrixResponse = data.result.prompt.trim()
            // Enhanced emoji replacement for Mavrix style
            .replace(/\b(winks?|winking)\b/gi, '😉')
            .replace(/\b(eye roll|rolling eyes)\b/gi, '🙄')
            .replace(/\b(shrugs?|shrugging)\b/gi, '🤷‍♂️')
            .replace(/\b(raised eyebrow|raising eyebrows)\b/gi, '🤨')
            .replace(/\b(smiles?|smiling)\b/gi, '😊')
            .replace(/\b(laughs?|laughing)\b/gi, '😂')
            .replace(/\b(cries?|crying)\b/gi, '😢')
            .replace(/\b(thinks?|thinking)\b/gi, '🤔')
            .replace(/\b(sleeps?|sleeping)\b/gi, '😴')
            .replace(/\b(angry|angrily)\b/gi, '😠')
            .replace(/\b(happy|happily)\b/gi, '😄')
            .replace(/\b(sad|sadly)\b/gi, '😔')
            .replace(/\b(cool|coolly)\b/gi, '😎')
            .replace(/\b(heart|love)\b/gi, '❤️')
            .replace(/\b(fire|awesome)\b/gi, '🔥')
            .replace(/\b(star|amazing)\b/gi, '⭐')
            .replace(/\b(rocket|launch|blast)\b/gi, '🚀')
            // Remove any instructional text
            .replace(/#.*$/gm, '')
            .replace(/##.*$/gm, '')
            .replace(/IMPORTANT:.*$/g, '')
            .replace(/RESPONSE RULES:.*$/g, '')
            .replace(/EMOTIONAL INTELLIGENCE:.*$/g, '')
            .replace(/PREMIUM RESPONSE EXAMPLES:.*$/g, '')
            .replace(/USER CONTEXT:.*$/g, '')
            .replace(/CURRENT MESSAGE:.*$/g, '')
            .replace(/REMEMBER:.*$/g, '')
            .replace(/YOUR RESPONSE:.*$/g, '')
            // Clean Mavrix formatting
            .replace(/^\s*[-•*]\s*/gm, '')
            .replace(/^\s*✅\s*/gm, '')
            .replace(/^\s*🚨\s*/gm, '')
            .replace(/^\s*🎯\s*/gm, '')
            .replace(/^\s*💬\s*/gm, '')
            .replace(/^\s*🎭\s*/gm, '')
            .replace(/^\s*📊\s*/gm, '')
            .replace(/^\s*💡\s*/gm, '')
            // Final Mavrix cleanup
            .replace(/\n\s*\n/g, '\n')
            .replace(/^[\s\n]+|[\s\n]+$/g, '')
            .trim();
        
        console.log(`✨ Mavrix Final Response: "${mavrixResponse}"`);
        return mavrixResponse;
        
    } catch (error) {
        console.error("🚨 Mavrix AI API Error:", error);
        return null;
    }
}

module.exports = {
    handleChatbotCommand,
    handleChatbotResponse
};
