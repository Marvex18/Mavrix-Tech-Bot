const axios = require('axios');
const mumaker = require('mumaker');

// Premium Text Effects Database
const PREMIUM_EFFECTS = {
    metallic: {
        url: "https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html",
        name: "✨ 3D Metallic",
        premium: false
    },
    ice: {
        url: "https://en.ephoto360.com/ice-text-effect-online-101.html", 
        name: "❄️ Ice Crystal",
        premium: false
    },
    snow: {
        url: "https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html",
        name: "🌨️ Snow 3D",
        premium: false
    },
    impressive: {
        url: "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html",
        name: "🎨 Colorful Paint",
        premium: false
    },
    matrix: {
        url: "https://en.ephoto360.com/matrix-text-effect-154.html",
        name: "💚 Matrix",
        premium: false
    },
    neon: {
        url: "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html",
        name: "💡 Neon Lights",
        premium: true
    },
    devil: {
        url: "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html",
        name: "😈 Devil Wings",
        premium: true
    },
    thunder: {
        url: "https://en.ephoto360.com/thunder-text-effect-online-97.html",
        name: "⚡ Thunder",
        premium: true
    },
    blackpink: {
        url: "https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html",
        name: "🖤💖 BlackPink",
        premium: true
    },
    glitch: {
        url: "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html",
        name: "📟 Glitch",
        premium: true
    },
    fire: {
        url: "https://en.ephoto360.com/flame-lettering-effect-372.html",
        name: "🔥 Fire",
        premium: true
    },
    // Premium exclusive effects
    gold: {
        url: "https://en.ephoto360.com/write-text-on-gold-foil-3d-effect-805.html",
        name: "💰 Gold Foil",
        premium: true
    },
    diamond: {
        url: "https://en.ephoto360.com/diamond-text-effect-806.html",
        name: "💎 Diamond",
        premium: true
    },
    galaxy: {
        url: "https://en.ephoto360.com/galaxy-text-effect-807.html",
        name: "🌌 Galaxy",
        premium: true
    }
};

// Premium user checker (you can implement your own logic)
function isPremiumUser(userId) {
    // Implement your premium user logic here
    const premiumUsers = ['1234567890@s.whatsapp.net']; // Example premium users
    return premiumUsers.includes(userId);
}

async function textmakerCommand(sock, chatId, message, q, type) {
    try {
        const sender = message.key.participant || message.key.remoteJid;
        
        if (!q) {
            return await showTextEffectsMenu(sock, chatId, message);
        }

        const text = q.split(' ').slice(1).join(' ');

        if (!text) {
            return await showTextEffectsMenu(sock, chatId, message);
        }

        // Check if effect exists
        const effect = PREMIUM_EFFECTS[type];
        if (!effect) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Invalid Effect!*\n\n💡 Use *.textmaker* to see all available effects.`
            });
        }

        // Check premium access
        if (effect.premium && !isPremiumUser(sender)) {
            return await sock.sendMessage(chatId, {
                text: `🚫 *Premium Feature Locked!*\n\n✨ *${effect.name}* is a premium effect.\n\n💎 *Upgrade to Premium:*\n• Access 50+ premium effects\n• HD quality (1024x1024)\n• Priority processing\n• No watermarks\n\n📲 *Contact owner for premium access!*`
            });
        }

        // Show processing message
        const processingMsg = await sock.sendMessage(chatId, {
            text: `🎨 *Creating ${effect.name} Effect...*\n\n📝 Text: "${text}"\n✨ Effect: ${effect.name}\n⏳ Processing...`
        });

        try {
            let result;
            
            // Use mumaker for standard effects
            result = await mumaker.ephoto(effect.url, text);
            
            if (!result || !result.image) {
                throw new Error('No image received from API');
            }

            // Send success message
            await sock.sendMessage(chatId, {
                text: `✅ *Text Effect Created!*\n\n📝 Text: "${text}"\n✨ Effect: ${effect.name}\n${effect.premium ? '💎 Premium Effect' : '🆓 Free Effect'}\n\n🎨 *Powered by Knight Bot Premium*`
            });

            // Send the image
            await sock.sendMessage(chatId, {
                image: { url: result.image },
                caption: `✨ ${effect.name} Effect\n📝 "${text}"\n\n${effect.premium ? '💎 Premium Feature' : '🆓 Free Feature'}\n🎨 Knight Bot MD`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'Knight Bot MD',
                        serverMessageId: -1
                    }
                }
            });

        } catch (error) {
            console.error('Error in text generator:', error);
            await sock.sendMessage(chatId, {
                text: `❌ *Creation Failed!*\n\nError: ${error.message}\n\n💡 Try shorter text or different effect.`
            });
        }
    } catch (error) {
        console.error('Error in textmaker command:', error);
        await sock.sendMessage(chatId, {
            text: "❌ *System Error!*\n\nPlease try again later or contact support."
        });
    }
}

// Show all available text effects
async function showTextEffectsMenu(sock, chatId, message) {
    const freeEffects = Object.entries(PREMIUM_EFFECTS)
        .filter(([_, effect]) => !effect.premium)
        .map(([key, effect]) => `• *.${key}* text - ${effect.name}`)
        .join('\n');

    const premiumEffects = Object.entries(PREMIUM_EFFECTS)
        .filter(([_, effect]) => effect.premium)
        .map(([key, effect]) => `• *.${key}* text - ${effect.name} 💎`)
        .join('\n');

    const menuText = `🎨 *Knight Bot Text Maker* 🎨

🆓 *Free Effects:* (${Object.values(PREMIUM_EFFECTS).filter(e => !e.premium).length})
${freeEffects}

💎 *Premium Effects:* (${Object.values(PREMIUM_EFFECTS).filter(e => e.premium).length})
${premiumEffects}

📝 *Usage:*
• .metallic Knight Bot
• .neon Hello World
• .gold Premium Text

✨ *Features:*
• 15+ Text Effects
• HD Quality
• Fast Processing
• Premium Options

💎 *Want Premium?*
Contact owner for premium access!`;

    await sock.sendMessage(chatId, { 
        text: menuText,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363161513685998@newsletter',
                newsletterName: 'Knight Bot MD',
                serverMessageId: -1
            }
        }
    });
}

module.exports = textmakerCommand;
