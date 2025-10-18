// staff.js
async function staffCommand(sock, chatId, msg) {
    try {
        console.log('👑 Mavrix Bot - Staff Command Activated');
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `👑 *Mavrix Bot - Staff List* 👑

╔══════════════════════╗
║   FETCHING ADMINS    ║
╚══════════════════════╝

⚡ *Status:* Scanning group...
📊 *Action:* Collecting admin data...
👥 *Processing:* Participant list...

💫 *Preparing premium staff display...*`
        }, { quoted: msg });

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Get group profile picture
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default premium image
        }

        // Get admins from participants
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const superAdmin = groupAdmins.find(p => p.admin === 'superadmin');
        const regularAdmins = groupAdmins.filter(p => p.admin !== 'superadmin');
        
        // Format admin lists
        const listSuperAdmin = superAdmin ? 
            `👑 *Group Owner:*\n▢ @${superAdmin.id.split('@')[0]}\n\n` : '';
        
        const listAdmins = regularAdmins.length > 0 ? 
            `⚡ *Administrators (${regularAdmins.length}):*\n${regularAdmins.map((v, i) => `▢ ${i + 1}. @${v.id.split('@')[0]}`).join('\n')}` : 
            '📝 *No additional administrators*';

        // Create premium staff text
        const text = `👑 *Mavrix Bot - Group Staff* 👑

╔══════════════════════╗
║      ADMIN TEAM      ║
╚══════════════════════╝

🎯 *Group:* ${groupMetadata.subject}
📊 *Total Members:* ${participants.length}
👑 *Total Admins:* ${groupAdmins.length}

${listSuperAdmin}${listAdmins}

✨ *━━━━━━━━━━━━━━━━━━━━━━━━━✨*

💫 *Managed by Mavrix Bot*
⚡ *Professional Group Management*
🔒 *Secure & Reliable*`;

        // Get all mentions
        const allMentions = [...groupAdmins.map(v => v.id)];
        if (superAdmin) allMentions.push(superAdmin.id);

        // Send the message with image and mentions
        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: allMentions
        }, { quoted: msg });

    } catch (error) {
        console.error('❌ Mavrix Bot - Staff Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Staff List Failed* ❌

╔══════════════════════╗
║     FETCH ERROR      ║
╚══════════════════════╝

🚨 *Failed to retrieve admin list!*

🔧 *Possible Issues:*
• Group metadata unavailable
• Network connectivity issues
• Permission restrictions
• Server timeout

🔄 *Please try:*
1. Check your connection
2. Ensure bot has permissions
3. Try again in a moment

⚡ *Mavrix Tech - Professional Support*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: msg });
    }
}

module.exports = staffCommand;
