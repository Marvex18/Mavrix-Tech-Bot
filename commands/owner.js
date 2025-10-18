// owner.js
const settings = require('../settings');

async function ownerCommand(sock, chatId, message) {
    try {
        console.log('👑 Mavrix Bot - Owner Command Activated');
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `👑 *Mavrix Bot - Owner Info* 👑

╔══════════════════════╗
║   FETCHING OWNER     ║
╚══════════════════════╝

⚡ *Status:* Preparing contact...
📇 *Action:* Generating vCard...
👤 *Processing:* Owner details...

💫 *Get in touch with Mavrix Tech!*`
        }, { quoted: message });

        const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${settings.botOwner}
ORG:Mavrix Tech;
TEL;type=CELL;type=VOICE;waid=${settings.ownerNumber}:+${settings.ownerNumber}
EMAIL:contact@mavrix.tech
URL:https://mavrix.tech
NOTE:Developer of Mavrix Bot - Premium WhatsApp Bot
X-ABLabel:📞 Mavrix Bot Owner
END:VCARD
`.trim();

        // Send contact with premium caption
        await sock.sendMessage(chatId, {
            contacts: { 
                displayName: `${settings.botOwner} 👑`, 
                contacts: [{ vcard }] 
            },
            contextInfo: {
                mentionedJid: [`${settings.ownerNumber}@s.whatsapp.net`]
            }
        });

        // Send follow-up message
        const infoMessage = `👑 *Mavrix Bot - Contact Owner* 👑

╔══════════════════════╗
║      OWNER INFO      ║
╚══════════════════════╝

📛 *Name:* ${settings.botOwner}
🏢 *Organization:* Mavrix Tech
📞 *Contact:* +${settings.ownerNumber}
🌐 *Website:* mavrix.tech

💡 *Contact for:*
• Bot Support & Issues
• Feature Requests
• Custom Development
• Business Inquiries

⚡ *Professional WhatsApp Solutions*
💫 *Powered by Mavrix Technology*

🔧 *Need help? Don't hesitate to reach out!*`;

        await sock.sendMessage(chatId, { 
            text: infoMessage
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Mavrix Bot - Owner Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Contact Failed* ❌

╔══════════════════════╗
║     CONTACT ERROR    ║
╚══════════════════════╝

🚨 *Failed to retrieve owner contact!*

🔧 *Possible Issues:*
• Contact generation failed
• Settings configuration
• Network issues
• vCard format error

🔄 *Please try:*
1. Check bot configuration
2. Try again later
3. Contact support manually

📧 *Alternative Contact:*
Email: contact@mavrix.tech

⚡ *Mavrix Tech - Professional Support*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage
        }, { quoted: message });
    }
}

module.exports = ownerCommand;
