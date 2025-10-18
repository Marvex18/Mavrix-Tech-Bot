// fact.js
const axios = require('axios');

const PREMIUM_ASCII = `
╔══════════════════════════╗
║     🧠 MAVRIX BOT       ║
║    PREMIUM FACTS        ║
╚══════════════════════════╝
`;

module.exports = async function (sock, chatId, message) {
    try {
        // Send processing message
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🔍 MAVRIX FACT FINDER*\n\n╔══════════════════════════╗\n║   SEARCHING DATABASE    ║
╚══════════════════════════╝\n\n🌍 Connecting to global fact database...\n📚 Scanning knowledge base...\n💡 Preparing amazing fact...\n\n*🔰 Mavrix Tech - Knowledge Engine*`
        }, { quoted: message });

        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', {
            timeout: 10000
        });
        
        const fact = response.data.text;
        const factId = Math.random().toString(36).substr(2, 8).toUpperCase();
        
        // Add some delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Send the fact with premium formatting
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*💡 PREMIUM FACT REVEALED!*\n\n╔══════════════════════════╗\n║   DID YOU KNOW?         ║
╚══════════════════════════╝\n\n📜 *Fact:* ${fact}\n\n📊 *Fact Details:*\n┌──────────────────────────┐
│ 🆔 Fact ID: ${factId.padEnd(10)} │
│ 🌐 Source: Global Database │
│ 💎 Category: Premium Fact  │
│ ⭐ Rarity: ${['Common', 'Rare', 'Epic'][Math.floor(Math.random() * 3)]}          │
└──────────────────────────┘\n\n✨ *Knowledge is power! Share this fact!*\n\n*🔰 Powered by Mavrix Tech - Premium Facts*`
        }, { quoted: message });

        console.log(`🧠 Mavrix Facts: Delivered fact ${factId}`);

    } catch (error) {
        console.error('Mavrix Facts Error:', error);
        
        const ERROR_ASCII = `
╔══════════════════════════╗
║     🚨 SYSTEM ERROR     ║
║    MAVRIX FACTS         ║
╚══════════════════════════╝
`;

        let errorMessage = '';
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            errorMessage = `${ERROR_ASCII}
*🌐 CONNECTION ERROR!*\n\n╔══════════════════════════╗\n║   NETWORK ISSUE         ║
╚══════════════════════════╝\n\nUnable to connect to the global fact database! 🌍\n\n🔧 *Possible Reasons:*\n• Internet connection unstable\n• Fact API server down\n• Network timeout\n\n💡 *Solution:*\n• Check your internet connection\n• Try again in 30 seconds\n• Use .fact command later\n\n*🔰 Mavrix Tech Support*`;
        } else {
            errorMessage = `${ERROR_ASCII}
*❌ FACT RETRIEVAL FAILED!*\n\n╔══════════════════════════╗\n║   KNOWLEDGE ERROR       ║
╚══════════════════════════╝\n\nSorry, I couldn't fetch an amazing fact right now! 😔\n\n🔧 *System Status:* Temporary Glitch\n💡 *Quick Fix:* Try the command again!\n\n*🔰 Mavrix Tech - Premium Systems*`;
        }

        await sock.sendMessage(chatId, { text: errorMessage }, { quoted: message });
    }
};
