// kick.js
const isAdmin = require('../lib/isAdmin');

async function kickCommand(sock, chatId, senderId, mentionedJids, message) {
    try {
        console.log('🦵 Mavrix Bot - Kick Command Activated');
        
        // Check if user is owner
        const isOwner = message.key.fromMe;
        if (!isOwner) {
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    text: `🚫 *Mavrix Bot - Admin Required* 🚫

╔══════════════════════╗
║   PERMISSION DENIED  ║
╚══════════════════════╝

❌ *Bot Not Admin!*

🔧 *Required Action:*
Please make me a group admin to use kick commands.

⚡ *How to:*
1. Open group settings
2. Make Mavrix Bot admin
3. Try again

💫 *Mavrix Tech - Secure Moderation*`
                }, { quoted: message });
                return;
            }

            if (!isSenderAdmin) {
                await sock.sendMessage(chatId, { 
                    text: `👮‍♂️ *Mavrix Bot - Admin Only* 👮‍♂️

╔══════════════════════╗
║   ACCESS RESTRICTED  ║
╚══════════════════════╝

❌ *Permission Denied!*

📛 *Command:* Kick User
👤 *Your Role:* Member
🔒 *Required Role:* Admin

💡 *Only group admins can use this command.*

⚡ *Mavrix Tech - Secure Management*`
                }, { quoted: message });
                return;
            }
        }

        let usersToKick = [];
        
        // Check for mentioned users
        if (mentionedJids && mentionedJids.length > 0) {
            usersToKick = mentionedJids;
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            usersToKick = [message.message.extendedTextMessage.contextInfo.participant];
        }
        
        // If no user found through either method
        if (usersToKick.length === 0) {
            await sock.sendMessage(chatId, { 
                text: `🎯 *Mavrix Bot - Kick System* 🎯

╔══════════════════════╗
║    TARGET MISSING    ║
╚══════════════════════╝

❌ *No user specified!*

💡 *How to kick users:*
• Mention: .kick @username
• Reply: .kick (reply to user's message)

🎯 *Examples:*
.kick @spammer123
.kick (reply to user)

⚡ *Mavrix Tech - Professional Moderation*`
            }, { quoted: message });
            return;
        }

        // Get bot's ID
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // Check if any of the users to kick is the bot itself
        if (usersToKick.includes(botId)) {
            await sock.sendMessage(chatId, { 
                text: `🤖 *Mavrix Bot - Self Protection* 🤖

╔══════════════════════╗
║    SELF-KICK DENIED  ║
╚══════════════════════╝

❌ *Invalid Target!*

🚫 I can't kick myself!
⚡ I'm here to help, not leave!

💡 Try kicking actual users instead.

🎯 *Mavrix Bot - Always Active*`
            }, { quoted: message });
            return;
        }

        // Check if trying to kick other admins
        const groupMetadata = await sock.groupMetadata(chatId);
        const adminJids = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        
        const adminTargets = usersToKick.filter(jid => adminJids.includes(jid));
        if (adminTargets.length > 0 && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: `👑 *Mavrix Bot - Admin Protection* 👑

╔══════════════════════╗
║   ADMIN KICK DENIED  ║
╚══════════════════════╝

❌ *Cannot Kick Admins!*

👑 *Protected Users:*
${adminTargets.map(jid => `• @${jid.split('@')[0]}`).join('\n')}

🔒 *Security Policy:*
Only bot owner can kick other admins.

⚡ *Mavrix Tech - Secure Hierarchy*`,
                mentions: adminTargets
            }, { quoted: message });
            return;
        }

        // Send kick confirmation
        await sock.sendMessage(chatId, {
            text: `🦵 *Mavrix Bot - Kick Initiated* 🦵

╔══════════════════════╗
║    KICK IN PROGRESS  ║
╚══════════════════════╝

🎯 *Targets:*
${usersToKick.map(jid => `• @${jid.split('@')[0]}`).join('\n')}

⚡ *Action:* Removing from group...
🔄 *Status:* Processing...
⏳ *Please wait...*`,
            mentions: usersToKick
        });

        // Execute kick
        await sock.groupParticipantsUpdate(chatId, usersToKick, "remove");
        
        // Success message
        const successMessage = `✅ *Mavrix Bot - Kick Successful* ✅

╔══════════════════════╗
║     USERS KICKED     ║
╚══════════════════════╝

🎯 *Removed Users:*
${usersToKick.map(jid => `• @${jid.split('@')[0]}`).join('\n')}

📊 *Total Kicked:* ${usersToKick.length}
✅ *Status:* Successfully Removed
⚡ *Action:* Group Cleaned

💫 *Group security maintained by Mavrix Bot*`;

        await sock.sendMessage(chatId, { 
            text: successMessage,
            mentions: usersToKick
        });

    } catch (error) {
        console.error('❌ Mavrix Bot - Kick Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Kick Failed* ❌

╔══════════════════════╗
║     KICK FAILED      ║
╚══════════════════════╝

🚨 *Operation Failed!*

🔧 *Possible Reasons:*
• User is already not in group
• Bot lost admin permissions
• Network issues
• User is group owner

🔄 *Please check:*
1. Bot admin status
2. User existence in group
3. Your permissions

⚡ *Mavrix Tech - Reliable Moderation*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage
        });
    }
}

module.exports = kickCommand;
