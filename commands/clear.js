// clear.js
async function clearCommand(sock, chatId) {
    try {
        const PREMIUM_ASCII = `
╔══════════════════════════╗
║     🧹 MAVRIX CLEANER   ║
║    PREMIUM SYSTEM       ║
╚══════════════════════════╝
`;

        // Send initial message with premium styling
        const message = await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🧹 MAVRIX BOT - MESSAGE CLEANER*\n\n🔍 *Scanning and optimizing message cache...*`
        });
        
        const messageKey = message.key;
        
        // Add a small delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Delete the bot's message with premium styling
        await sock.sendMessage(chatId, { delete: messageKey });
        
        // Send success confirmation
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*✅ CLEANUP COMPLETE!*\n\n╔══════════════════════════╗\n║    SYSTEM OPTIMIZED     ║\n╚══════════════════════════╝\n\n*🗑️ Cache Cleared:* Bot messages\n*⚡ Performance:* Optimized\n*🧹 Status:* Clean & Ready\n\n*🔰 Powered by Mavrix Tech*`
        });
        
    } catch (error) {
        console.error('Mavrix Clear Error:', error);
        
        const ERROR_ASCII = `
╔══════════════════════════╗
║     🚨 SYSTEM ERROR     ║
║    MAVRIX CLEANER       ║
╚══════════════════════════╝
`;
        
        await sock.sendMessage(chatId, { 
            text: `${ERROR_ASCII}
*❌ CLEANUP FAILED!*\n\n╔══════════════════════════╗\n║    OPERATION FAILED     ║\n╚══════════════════════════╝\n\n*🔧 Issue:* Unable to clear messages\n*💡 Solution:* Check bot permissions\n*🚨 Status:* Operation cancelled\n\n*🔰 Mavrix Tech Support*`
        });
    }
}

module.exports = { clearCommand };
