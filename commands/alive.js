const settings = require("../settings");

const MAVRIX_ASCII = `
╔══════════════════════════════════╗
║           🚀 MAVRIX BOT          ║
║          SYSTEM STATUS           ║
║        PREMIUM EDITION v2.0      ║
╚══════════════════════════════════╝
`;

const MAVRIX_SIGNATURE = `
✨ Developed by Mavrix Tech
🎯 Premium Features | ⚡ Lightning Fast
🔒 Secure | 🛠️ Error Free
`;

async function aliveCommand(sock, chatId, message) {
    try {
        const message1 = `${MAVRIX_ASCII}\n` +
                       `*🚀 MAVRIX BOT IS ACTIVE!*\n\n` +
                       `*📊 Version:* ${settings.version}\n` +
                       `*🟢 Status:* Online & Ready\n` +
                       `*🌐 Mode:* Public\n` +
                       `*⚡ Uptime:* 24/7\n\n` +
                       `*🌟 PREMIUM FEATURES:*\n` +
                       `• 🛡️ Advanced Group Management\n` +
                       `• 🔗 Smart Antilink Protection\n` +
                       `• 🎮 Fun & Entertainment Commands\n` +
                       `• 📱 Social Media Downloaders\n` +
                       `• 🎨 Sticker & Media Tools\n` +
                       `• ⚡ Lightning Fast Responses\n\n` +
                       `💡 Type *.menu* for full command list\n\n` +
                       `${MAVRIX_SIGNATURE}`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'Mavrix Bot Premium',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error in alive command:', error);
        await sock.sendMessage(chatId, { 
            text: `${MAVRIX_ASCII}\n*🚀 MAVRIX BOT IS RUNNING!*\n\n⚡ System Operational\n🔧 Powered by Mavrix Tech\n\n${MAVRIX_SIGNATURE}`
        }, { quoted: message });
    }
}

module.exports = aliveCommand;
