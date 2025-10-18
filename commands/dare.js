// dare.js
const fetch = require('node-fetch');

async function dareCommand(sock, chatId, message) {
    try {
        const PREMIUM_ASCII = `
╔══════════════════════════╗
║     😈 MAVRIX BOT       ║
║    PREMIUM DARE GAME    ║
╚══════════════════════════╝
`;

        // Send loading message for premium feel
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🎯 MAVRIX DARE SYSTEM*\n\n╔══════════════════════════╗\n║   GENERATING DARE       ║
╚══════════════════════════╝\n\n🔍 Searching premium dare database...\n⚡ Preparing challenge...\n😈 Getting ready to test your courage!\n\n*🔰 Mavrix Tech - Ultimate Dare Master*`
        }, { quoted: message });

        const shizokeys = 'shizo';
        const res = await fetch(`https://shizokeys.onrender.com/api/texts/dare?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw new Error(`API Error: ${res.status}`);
        }
        
        const json = await res.json();
        const dareMessage = json.result;

        // Add premium delay for suspense
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Send the dare message with premium formatting
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*😈 PREMIUM DARE CHALLENGE!*\n\n╔══════════════════════════╗\n║   YOUR MISSION          ║
╚══════════════════════════╝\n\n🎯 *Challenge:* ${dareMessage}\n\n📊 *Difficulty:* ${['Easy', 'Medium', 'Hard', 'Extreme'][Math.floor(Math.random() * 4)]}\n⏰ *Time Limit:* ${Math.floor(Math.random() * 60) + 5} minutes\n🏆 *Reward:* Ultimate Respect\n\n💀 *Warning:* This dare may test your limits!\n\n*🔰 Mavrix Tech - Dare Master System*`
        }, { quoted: message });

        console.log('😈 Mavrix Dare: Challenge delivered successfully');

    } catch (error) {
        console.error('Mavrix Dare Error:', error);
        
        const ERROR_ASCII = `
╔══════════════════════════╗
║     🚨 SYSTEM ERROR     ║
║    MAVRIX DARE GAME     ║
╚══════════════════════════╝
`;

        await sock.sendMessage(chatId, { 
            text: `${ERROR_ASCII}
*❌ DARE FAILED TO LOAD!*\n\n╔══════════════════════════╗\n║   CHALLENGE UNAVAILABLE ║
╚══════════════════════════╝\n\nOur dare database is currently unavailable! 😔\n\n🔧 *Possible Reasons:*\n• API Service Down\n• Network Issues\n• System Maintenance\n\n💡 *Solution:* Try again in a few minutes!\n\n*🔰 Mavrix Tech Support*`
        }, { quoted: message });
    }
}

module.exports = { dareCommand };
