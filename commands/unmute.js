async function unmuteCommand(sock, chatId, message) {
    try {
        // ASCII Art Header
        const UNMUTE_ASCII = `
╔══════════════════════════════╗
║    🚀 MAVRIX BOT PREMIUM    ║
║        UNMUTE SYSTEM        ║
║    🔒 Mavrix Tech © 2025    ║
╚══════════════════════════════╝
`;

        // Check if user has admin permissions
        const participant = message.key.participant || message.key.remoteJid;
        const metadata = await sock.groupMetadata(chatId);
        const isAdmin = metadata.participants.find(p => p.id === participant)?.admin;

        if (!isAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: `🚫 *PERMISSION DENIED*

${UNMUTE_ASCII}

❌ *Unauthorized Action*
You must be a group admin to unmute this group.

🔒 *Mavrix Bot Security System*` 
            }, { quoted: message });
            return;
        }

        // Send processing message
        await sock.sendMessage(chatId, { 
            text: `🔄 *PROCESSING REQUEST*

${UNMUTE_ASCII}

⚡ Unmuting group...
⏳ Please wait a moment.` 
        }, { quoted: message });

        // Unmute the group
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        
        // Get group info for the success message
        const groupInfo = await sock.groupMetadata(chatId);
        
        // Success message with premium styling
        await sock.sendMessage(chatId, { 
            text: `🔊 *GROUP UNMUTED SUCCESSFULLY*

${UNMUTE_ASCII}

✅ *Status:* 🟢 UNMUTED
👥 *Group:* ${groupInfo.subject}
👤 *Action By:* @${participant.split('@')[0]}
🕒 *Time:* ${new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
})}

🎯 *Features Enabled:*
┣ 🔹 All participants can send messages
┣ 🔹 Group notifications are active
┣ 🔹 Members can interact freely
┗ 🔹 Full chat functionality restored

💡 *Note:* Group members can now send messages normally.

🔒 *Powered by Mavrix Tech Premium*`,
            mentions: [participant]
        }, { quoted: message });

        // Send a celebratory reaction
        try {
            await sock.sendMessage(chatId, {
                react: { text: "🎉", key: message.key }
            });
        } catch (error) {
            // Reaction failed silently
        }

    } catch (error) {
        console.error('❌ Unmute command error:', error);
        
        // Enhanced error message
        await sock.sendMessage(chatId, { 
            text: `❌ *UNMUTE FAILED*

╔══════════════════════════════╗
║         OPERATION ERROR      ║
╚══════════════════════════════╝

🚨 *Error Details:*
${error.message || 'Unknown error occurred'}

💡 *Possible Solutions:*
┣ 🔹 Verify bot has admin permissions
┣ 🔹 Check group settings
┣ 🔹 Ensure stable connection
┣ 🔹 Try again in a moment

🔒 *Mavrix Tech Support*` 
        }, { quoted: message });
    }
}

// Alternative command handler for different command formats
async function handleUnmuteCommand(sock, chatId, message, match) {
    await unmuteCommand(sock, chatId, message);
}

module.exports = {
    unmuteCommand,
    handleUnmuteCommand
};
