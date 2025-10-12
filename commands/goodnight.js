// goodnight.js (Premium Enhanced)
const fetch = require('node-fetch');

// Premium ASCII Art
const PREMIUM_NIGHT_ART = `
╔═══════════════════════════╗
║   🌙 PREMIUM GOODNIGHT    ║
║         💎 ELITE          ║
╚═══════════════════════════╝
`;

const MOON_ART = `
        _____
     .-'     '-.
    /           \\
   |    MOON     |
    \\           /
     '-._____.-'
          |
         / \\
`;

async function goodnightCommand(sock, chatId, message) {
    try {
        // Send processing reaction
        await sock.sendMessage(chatId, {
            react: { text: '🌙', key: message.key }
        });

        const processingMsg = await sock.sendMessage(chatId, {
            text: `🌙 *PREPARING YOUR GOODNIGHT* ✨

${MOON_ART}
💎 Crafting premium goodnight message...
⭐ Gathering celestial blessings...`
        });

        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/lovenight?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const goodnightMessage = json.result;

        // Delete processing message
        await sock.sendMessage(chatId, { 
            delete: processingMsg.key 
        });

        // Send the premium goodnight message
        await sock.sendMessage(chatId, { 
            text: `🌙 *PREMIUM GOODNIGHT BLESSINGS* 💎

${MOON_ART}
✨ *Your Special Message:*
${goodnightMessage}

🛌 *Sleep Well Commands:*
┌・Dream sweet dreams 💫
├・Rest your mind and soul 🧘
└・Wake up refreshed and powerful 💪

${PREMIUM_NIGHT_ART}
💫 Powered by Premium Night System`
        }, { 
            quoted: message 
        });

    } catch (error) {
        console.error('Error in goodnight command:', error);
        
        await sock.sendMessage(chatId, { 
            text: `❌ *PREMIUM SERVICE UNAVAILABLE* ❌

😔 Our goodnight blessing service is temporarily offline.

${PREMIUM_NIGHT_ART}
🔧 *Please try:*
• Using command again in 5 minutes ⏳
• Checking your connection 📶
• Contacting moon support 🌙

💎 We apologize for the inconvenience.`
        }, { 
            quoted: message 
        });
    }
}

module.exports = { goodnightCommand };
