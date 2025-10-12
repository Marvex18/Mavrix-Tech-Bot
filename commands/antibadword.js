const { handleAntiBadwordCommand } = require('../lib/antibadword');
const isAdminHelper = require('../lib/isAdmin');

const PREMIUM_ASCII = `
╔══════════════════════════╗
║     🚫 ANTIBAD PRO      ║
║   PREMIUM PROTECTION    ║
╚══════════════════════════╝
`;

async function antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🚫 ACCESS DENIED!*\nThis command is for Group Admins only!` 
            }, { quoted: message });
            return;
        }

        // Extract match from message
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || '';
        const match = text.split(' ').slice(1).join(' ');

        console.log(`🛡️ Premium Antibadword Command Executed by Admin`);

        // Send processing status
        await sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*⚡ PROCESSING REQUEST...*\n\n*Command:* Antibadword\n*Admin:* @${senderId.split('@')[0]}\n*Status:* Configuring protection...`,
            mentions: [senderId]
        });

        await handleAntiBadwordCommand(sock, chatId, message, match);

        // Success reaction
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('🚨 Error in premium antibadword command:', error);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🚨 SYSTEM ERROR!*\nError processing antibadword command!\n\n*Support:* Check console logs` 
        }, { quoted: message });
    }
}

module.exports = antibadwordCommand;
