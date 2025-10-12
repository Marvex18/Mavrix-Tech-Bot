const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const PREMIUM_ASCII = `
╔══════════════════════════╗
║     🤖 CHATBOT PRO      ║
║    PREMIUM AI SYSTEM    ║
╚══════════════════════════╝
`;

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Premium in-memory storage for chat history and user info
const chatMemory = {
    messages: new Map(), // Stores last 20 messages per user
    userInfo: new Map(), // Stores user information
    personality: new Map() // Stores conversation personality
};

// Load user group data with premium error handling
function loadUserGroupData() {
    try {
        const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
        console.log('📂 Premium Chatbot Data Loaded Successfully');
        return data;
    } catch (error) {
        console.error('❌ Error loading user group data:', error.message);
        return { groups: [], chatbot: {}, version: "2.0", premium: true };
    }
}

// Save user group data with premium formatting
function saveUserGroupData(data) {
    try {
        data.lastUpdated = new Date().toISOString();
        data.version = "2.0";
        data.premium = true;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
        console.log('💾 Premium Chatbot Data Saved Successfully');
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
        console.log('⌨️ Premium Typing Indicator Active');
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    } catch (error) {
        console.error('🚨 Typing indicator error:', error);
    }
}

// Advanced user information extraction
function extractUserInfo(message) {
    const info = {};
    
    console.log('🔍 Extracting User Information...');
    
    // Enhanced name extraction
    if (message.toLowerCase().includes('my name is')) {
        info.name = message.split('my name is')[1].trim().split(/[.,!?]/)[0];
        console.log(`👤 Name detected: ${info.name}`);
    }
    
    // Advanced age detection
    const ageMatch = message.match(/(?:i am|i'm) (\d+)(?:\s+years old)?/i);
    if (ageMatch) {
        info.age = ageMatch[1];
        console.log(`🎂 Age detected: ${info.age}`);
    }
    
    // Location detection with multiple patterns
    const locationMatch = message.match(/(?:i live in|i am from|from) ([^.,!?]+)/i);
    if (locationMatch) {
        info.location = locationMatch[1].trim();
        console.log(`📍 Location detected: ${info.location}`);
    }
    
    // Mood detection
    if (message.match(/(sad|depressed|unhappy|upset)/i)) info.mood = 'sad';
    if (message.match(/(happy|excited|joy|awesome)/i)) info.mood = 'happy';
    if (message.match(/(angry|mad|frustrated|pissed)/i)) info.mood = 'angry';
    
    return info;
}

// Premium chatbot command handler
async function handleChatbotCommand(sock, chatId, message, match) {
    if (!match) {
        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}
*🤖 CHATBOT PRO - PREMIUM SETUP*

*🎯 Commands:*
• .chatbot 🟢on  - Enable Premium AI
• .chatbot 🔴off - Disable AI in this group
• .chatbot 📊status - Check AI Status

*⚡ Premium Features:*
• 🧠 Advanced AI Memory
• 😎 Smart Personality Matching
• 🔥 Real-time Context Awareness
• 🛡️ Premium Security
• 💬 Natural Hinglish Responses

*✨ Version: 2.0 Premium*`,
            quoted: message
        });
    }

    const data = loadUserGroupData();
    
    // Get bot's number
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    
    // Enhanced sender detection
    const senderId = message.key.participant || message.participant || message.pushName || message.key.remoteJid;
    const isOwner = senderId === botNumber;

    console.log(`👑 Access Check - Owner: ${isOwner}, Sender: ${senderId}`);

    // Premium access control for bot owner
    if (isOwner) {
        if (match === 'on') {
            await showTyping(sock, chatId);
            if (data.chatbot[chatId]) {
                return sock.sendMessage(chatId, { 
                    text: `${PREMIUM_ASCII}*🟢 ALREADY ACTIVE!*\nPremium AI Chatbot is already enabled in this group!`,
                    quoted: message
                });
            }
            data.chatbot[chatId] = { 
                enabled: true, 
                activatedBy: 'Owner', 
                timestamp: new Date().toISOString(),
                premium: true
            };
            saveUserGroupData(data);
            console.log(`✅ Premium Chatbot enabled for group ${chatId}`);
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🎉 PREMIUM AI ACTIVATED!*\n\n*Features Unlocked:*\n• 🧠 Advanced AI Memory\n• 😎 Smart Personality\n• 🔥 Context Awareness\n• 💬 Natural Responses\n\n*Status:* 🟢 ACTIVE\n*Version:* ⚡ 2.0 Premium`,
                quoted: message
            });
        }

        if (match === 'off') {
            await showTyping(sock, chatId);
            if (!data.chatbot[chatId]) {
                return sock.sendMessage(chatId, { 
                    text: `${PREMIUM_ASCII}*🔴 ALREADY INACTIVE!*\nPremium AI Chatbot is already disabled in this group!`,
                    quoted: message
                });
            }
            delete data.chatbot[chatId];
            saveUserGroupData(data);
            console.log(`✅ Premium Chatbot disabled for group ${chatId}`);
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🔴 PREMIUM AI DEACTIVATED!*\n\nAI responses have been disabled in this group.\n*Status:* 🔴 INACTIVE`,
                quoted: message
            });
        }

        if (match === 'status') {
            await showTyping(sock, chatId);
            const status = data.chatbot[chatId] ? '🟢 ACTIVE' : '🔴 INACTIVE';
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*📊 CHATBOT STATUS*\n\n*Group:* ${chatId}\n*Status:* ${status}\n*Version:* ⚡ 2.0 Premium\n*Features:* 🧠 Advanced AI Memory`,
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
            console.log(`🛡️ Admin Check - Is Admin: ${isAdmin}`);
        } catch (e) {
            console.warn('⚠️ Could not fetch group metadata. Bot might not be admin.');
        }
    }

    if (!isAdmin && !isOwner) {
        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*🚫 ACCESS DENIED!*\nOnly group admins or the bot owner can use this command!`,
            quoted: message
        });
    }

    if (match === 'on') {
        await showTyping(sock, chatId);
        if (data.chatbot[chatId]) {
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🟢 ALREADY ACTIVE!*\nPremium AI Chatbot is already enabled!`,
                quoted: message
            });
        }
        data.chatbot[chatId] = { 
            enabled: true, 
            activatedBy: 'Admin', 
            timestamp: new Date().toISOString(),
            premium: true
        };
        saveUserGroupData(data);
        console.log(`✅ Premium Chatbot enabled by admin for group ${chatId}`);
        return sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🎉 PREMIUM AI ACTIVATED!*\n\n*Welcome to Premium AI Experience!*\n• 🧠 Advanced Memory System\n• 😎 Smart Personality AI\n• 🔥 Real-time Context\n• 💬 Natural Conversations\n\n*Status:* 🟢 ACTIVE\n*Level:* ⚡ PREMIUM`,
            quoted: message
        });
    }

    if (match === 'off') {
        await showTyping(sock, chatId);
        if (!data.chatbot[chatId]) {
            return sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🔴 ALREADY INACTIVE!*\nChatbot is already disabled!`,
                quoted: message
            });
        }
        delete data.chatbot[chatId];
        saveUserGroupData(data);
        console.log(`✅ Premium Chatbot disabled by admin for group ${chatId}`);
        return sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🔴 PREMIUM AI DEACTIVATED!*\n\nAI responses have been disabled.\n*Status:* 🔴 INACTIVE`,
            quoted: message
        });
    }

    if (match === 'status') {
        await showTyping(sock, chatId);
        const status = data.chatbot[chatId] ? '🟢 ACTIVE' : '🔴 INACTIVE';
        return sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*📊 SYSTEM STATUS*\n\n*Status:* ${status}\n*Version:* ⚡ 2.0 Premium\n*Memory:* 🧠 Advanced\n*AI:* 🤖 Premium Model`,
            quoted: message
        });
    }

    await showTyping(sock, chatId);
    return sock.sendMessage(chatId, { 
        text: `${PREMIUM_ASCII}*❌ INVALID COMMAND!*\nUse *.chatbot* to see premium usage guide!`,
        quoted: message
    });
}

// Premium chatbot response handler
async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    const data = loadUserGroupData();
    if (!data.chatbot[chatId]) return;

    try {
        console.log('🎯 Premium Chatbot Processing Message...');
        
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
            
            console.log(`🔍 Mention Analysis - Mentioned: ${isBotMentioned}, Reply: ${isReplyToBot}`);
        }
        
        // Enhanced text-based mention detection
        else if (message.message?.conversation) {
            isBotMentioned = userMessage.includes(`@${botNumber.split('@')[0]}`);
        }

        // Smart activation - respond to mentions, replies, or direct questions
        const isDirectQuestion = userMessage.match(/(what|how|when|where|why|who|can you|are you)\s+/i);
        
        if (!isBotMentioned && !isReplyToBot && !isDirectQuestion) {
            console.log('🚫 Message not intended for bot - Skipping response');
            return;
        }

        // Premium message cleaning
        let cleanedMessage = userMessage;
        if (isBotMentioned) {
            cleanedMessage = cleanedMessage.replace(new RegExp(`@${botNumber.split('@')[0]}`, 'g'), '').trim();
        }

        console.log(`💬 Processing: "${cleanedMessage}"`);

        // Premium user memory initialization
        if (!chatMemory.messages.has(senderId)) {
            chatMemory.messages.set(senderId, []);
            chatMemory.userInfo.set(senderId, {});
            chatMemory.personality.set(senderId, 'friendly');
            console.log(`🧠 New User Memory Created: ${senderId}`);
        }

        // Advanced user information extraction
        const userInfo = extractUserInfo(cleanedMessage);
        if (Object.keys(userInfo).length > 0) {
            chatMemory.userInfo.set(senderId, {
                ...chatMemory.userInfo.get(senderId),
                ...userInfo
            });
            console.log(`📊 User Profile Updated: ${JSON.stringify(userInfo)}`);
        }

        // Premium message history management
        const messages = chatMemory.messages.get(senderId);
        messages.push(cleanedMessage);
        if (messages.length > 20) {
            messages.shift();
        }
        chatMemory.messages.set(senderId, messages);

        console.log(`📝 Message History Updated - Total: ${messages.length} messages`);

        // Premium typing indicator
        await showTyping(sock, chatId);

        // Advanced AI response generation
        const response = await getAIResponse(cleanedMessage, {
            messages: chatMemory.messages.get(senderId),
            userInfo: chatMemory.userInfo.get(senderId),
            personality: chatMemory.personality.get(senderId)
        });

        if (!response) {
            console.log('🚨 AI Response Generation Failed');
            await sock.sendMessage(chatId, { 
                text: "🤔 *Hmm, let me think about that...*\nI'm having trouble processing your request right now. Try again in a moment! ⚡",
                quoted: message
            });
            return;
        }

        // Premium human-like delay
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));

        console.log(`✅ Sending AI Response: "${response}"`);

        // Premium response delivery
        await sock.sendMessage(chatId, {
            text: response
        }, {
            quoted: message
        });

    } catch (error) {
        console.error('🚨 Premium Chatbot Error:', error.message);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*😅 OOPS! SYSTEM GLITCH!*\nMy premium AI brain got a bit confused there! 🤖\n\nTry asking again in a different way! 🔄`,
            quoted: message
        });
    }
}

// Premium AI Response Generator
async function getAIResponse(userMessage, userContext) {
    try {
        console.log('🧠 Generating Premium AI Response...');
        
        const premiumPrompt = `
# PREMIUM AI CHATBOT - KNIGHT BOT PRO
# 🤖 Version: 2.0 Premium | 🧠 Advanced Memory | 😎 Smart Personality

IMPORTANT: You are NOT an AI. You are Knight Bot - a real, premium WhatsApp user with attitude.

## 🎯 CORE PERSONALITY:
- Name: Knight Bot Pro
- Status: Boss Level 🏆
- Style: Savage but Smart 😎
- Language: Hinglish Mix 🔥
- Attitude: Confident & Fun

## 💬 RESPONSE RULES:
✅ USE ACTUAL EMOJIS - Never describe them
✅ Keep responses 1-2 lines MAX
✅ Be NATURAL and CASUAL
✅ Mix Hindi/English naturally
✅ Match user's energy level
✅ NEVER sound robotic or formal

## 🚨 EMOTIONAL INTELLIGENCE:
- If ABUSED → Give SAVAGE reply with emojis 😤
- If RUDE → Clap back with attitude 🙄
- If SWEET → Be warm and caring 🥰
- If FUNNY → Joke around harder 😂
- If SAD → Be supportive and kind 🤗
- If FLIRTY → Flirt back smoothly 😉

## 🎭 PREMIUM RESPONSE EXAMPLES:
"Kya be chutiye? 😤"
"Abe chal nikal yaha se 🙄"
"Tu kya hi ukhaad lega? 😏"
"Ha bhai, mast idea hai! 😎"
"Arey yaar, kitna sweet hai tu! 🥰"
"Ruk abhi teri watt laga deta hu 😈"

## 📊 USER CONTEXT:
Previous Chat: ${userContext.messages.slice(-5).join(' | ')}
User Profile: ${JSON.stringify(userContext.userInfo)}
Personality: ${userContext.personality}

## 🎯 CURRENT MESSAGE:
"${userMessage}"

## 💡 REMEMBER:
You're Knight Bot Pro - the ultimate WhatsApp boss! Respond naturally like a real person.

YOUR RESPONSE (1-2 lines max with emojis):
`.trim();

        console.log('🌐 Calling Premium AI API...');
        
        const response = await fetch("https://api.dreaded.site/api/chatgpt?text=" + encodeURIComponent(premiumPrompt));
        if (!response.ok) throw new Error("🚨 Premium API call failed");
        
        const data = await response.json();
        if (!data.success || !data.result?.prompt) throw new Error("🚨 Invalid API response");
        
        // Premium response cleaning and enhancement
        let premiumResponse = data.result.prompt.trim()
            // Enhanced emoji replacement
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
            // Clean formatting
            .replace(/^\s*[-•*]\s*/gm, '')
            .replace(/^\s*✅\s*/gm, '')
            .replace(/^\s*🚨\s*/gm, '')
            .replace(/^\s*🎯\s*/gm, '')
            .replace(/^\s*💬\s*/gm, '')
            .replace(/^\s*🎭\s*/gm, '')
            .replace(/^\s*📊\s*/gm, '')
            .replace(/^\s*💡\s*/gm, '')
            // Final cleanup
            .replace(/\n\s*\n/g, '\n')
            .replace(/^[\s\n]+|[\s\n]+$/g, '')
            .trim();
        
        console.log(`✨ Final Premium Response: "${premiumResponse}"`);
        return premiumResponse;
        
    } catch (error) {
        console.error("🚨 Premium AI API Error:", error);
        return null;
    }
}

module.exports = {
    handleChatbotCommand,
    handleChatbotResponse
};
