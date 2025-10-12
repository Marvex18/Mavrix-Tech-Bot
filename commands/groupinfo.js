const PREMIUM_ASCII = `
╔══════════════════════════╗
║     👥 GROUP PRO        ║
║   PREMIUM ANALYTICS     ║
╚══════════════════════════╝
`;

async function groupInfoCommand(sock, chatId, msg) {
    try {
        console.log('👥 Fetching premium group information...');
        
        // Send processing status
        await sock.sendMessage(chatId, {
            react: { text: '🔍', key: msg.key }
        });

        await sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*⚡ ANALYZING GROUP...*\n\n*Status:* Gathering premium analytics...\n*Data:* Members, Admins, Settings\n*Report:* Generating...`
        });

        // Get premium group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Get premium group profile picture
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
            console.log('🖼️ Premium group picture loaded');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default premium image
            console.log('⚠️ Using default premium group image');
        }

        // Premium participant analysis
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const superAdmins = participants.filter(p => p.admin === 'superadmin');
        const regularMembers = participants.filter(p => !p.admin);
        
        // Premium admin list with numbering
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]} ${v.admin === 'superadmin' ? '👑' : '⚡'}`).join('\n');
        
        // Get group owner with premium detection
        const owner = groupMetadata.owner || superAdmins[0]?.id || groupAdmins[0]?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Premium creation date formatting
        const creationDate = groupMetadata.creation ? new Date(groupMetadata.creation * 1000).toLocaleDateString() : 'Unknown';
        
        // Premium member statistics
        const totalMembers = participants.length;
        const adminCount = groupAdmins.length;
        const superAdminCount = superAdmins.length;
        const regularCount = regularMembers.length;

        // Create premium info text
        const text = `
${PREMIUM_ASCII}
*👥 PREMIUM GROUP ANALYTICS*

*🏷️ GROUP IDENTITY*
┌─ • 📝 Name: ${groupMetadata.subject}
├─ • 🆔 ID: ${groupMetadata.id}
└─ • 📅 Created: ${creationDate}

*📊 MEMBER STATISTICS*
┌─ • 👥 Total: ${totalMembers} members
├─ • 👑 Owners: ${superAdminCount}
├─ • ⚡ Admins: ${adminCount - superAdminCount}
└─ • 🔰 Members: ${regularCount}

*🎯 ADMINISTRATION*
┌─ • 👑 Owner: @${owner.split('@')[0]}
├─ • ⚡ Admins:*
${listAdmin || '• No additional admins'}

*📋 GROUP DESCRIPTION*
${groupMetadata.desc?.toString() || '• No description set'}

*⚡ PREMIUM FEATURES*
• 📊 Advanced Analytics
• 👥 Member Insights
• 🛡️ Security Overview
• 💫 Professional Report

*✨ Powered by Knight Bot Premium*
`.trim();

        // Send the premium message with image and mentions
        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), owner]
        });

        console.log(`✅ Premium group info sent for: ${groupMetadata.subject}`);

    } catch (error) {
        console.error('🚨 Error in premium groupinfo command:', error);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🚨 ANALYSIS FAILED!*\n\nFailed to get premium group information!\n\n*Possible Reasons:*\n• 🔒 Bot not admin\n• 📵 Group restricted\n• ⚠️ Service temporary down` 
        });
    }
}

module.exports = groupInfoCommand;
