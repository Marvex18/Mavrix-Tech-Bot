// resetlink.js
async function resetlinkCommand(sock, chatId, senderId, message) {
    try {
        console.log('🔗 Mavrix Bot - Reset Link Command Activated');
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `🔗 *Mavrix Bot - Link Reset* 🔗

╔══════════════════════╗
║   RESETTING LINK     ║
╚══════════════════════╝

⚡ *Status:* Checking permissions...
🔒 *Action:* Security verification...
🔄 *Process:* Initializing reset...`
        }, { quoted: message });

        // Check if sender is admin
        const groupMetadata = await sock.groupMetadata(chatId);
        const isAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(senderId);

        // Check if bot is admin
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(botId);

        if (!isAdmin) {
            await sock.sendMessage(chatId, { 
                text: `🚫 *Mavrix Bot - Permission Denied* 🚫

╔══════════════════════╗
║   ACCESS RESTRICTED  ║
╚══════════════════════╝

❌ *Admin Only Command!*

👤 *Your Role:* Member
🔒 *Required Role:* Admin

💡 *Only group admins can reset the group link.*

⚡ *Mavrix Tech - Secure Management*`
            }, { quoted: message });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: `🤖 *Mavrix Bot - Bot Admin Required* 🤖

╔══════════════════════╗
║   BOT PERMISSION     ║
╚══════════════════════╝

❌ *Bot Not Admin!*

🔧 *Required Action:*
Please make me a group admin to reset the group link.

⚡ *Mavrix Tech - Professional Tools*`
            }, { quoted: message });
            return;
        }

        // Reset the group link
        const newCode = await sock.groupRevokeInvite(chatId);
        
        // Success message with new link
        const successMessage = `✅ *Mavrix Bot - Link Reset Successful* ✅

╔══════════════════════╗
║   NEW LINK READY     ║
╚══════════════════════╝

🔗 *New Group Link:*
https://chat.whatsapp.com/${newCode}

📊 *Security Features:*
✅ Old link invalidated
✅ New link generated
✅ Secure invite system

💡 *Share this new link carefully!*
⚠️ *Old link no longer works*

⚡ *Reset by:* @${senderId.split('@')[0]}
📅 *Time:* ${new Date().toLocaleString()}

💫 *Mavrix Tech - Secure Invite System*`;

        await sock.sendMessage(chatId, { 
            text: successMessage,
            mentions: [senderId]
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Mavrix Bot - Reset Link Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Reset Failed* ❌

╔══════════════════════╗
║     RESET ERROR      ║
╚══════════════════════╝

🚨 *Failed to reset group link!*

🔧 *Possible Reasons:*
• Bot lost admin permissions
• WhatsApp API limitations
• Network issues
• Group settings conflict

🔄 *Please try:*
1. Ensure bot is admin
2. Check group settings
3. Try again later

⚡ *Mavrix Tech - Reliable Services*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: message });
    }
}

module.exports = resetlinkCommand;
