// promote.js
const { isAdmin } = require('../lib/isAdmin');

// Function to handle manual promotions via command
async function promoteCommand(sock, chatId, mentionedJids, message) {
    try {
        console.log('👑 Mavrix Bot - Promote Command Activated');
        
        let userToPromote = [];
        
        // Check for mentioned users
        if (mentionedJids && mentionedJids.length > 0) {
            userToPromote = mentionedJids;
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
        }
        
        // If no user found through either method
        if (userToPromote.length === 0) {
            await sock.sendMessage(chatId, { 
                text: `👑 *Mavrix Bot - Promotion System* 👑

╔══════════════════════╗
║    TARGET MISSING    ║
╚══════════════════════╝

❌ *No user specified!*

💡 *How to promote users:*
• Mention: .promote @username
• Reply: .promote (reply to user's message)

🎯 *Examples:*
.promote @user123
.promote (reply to user)

⚡ *Mavrix Tech - Professional Management*`
            }, { quoted: message });
            return;
        }

        // Check if user has admin permissions
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: `🚫 *Mavrix Bot - Admin Required* 🚫

╔══════════════════════╗
║   PERMISSION DENIED  ║
╚══════════════════════╝

❌ *Bot Not Admin!*

🔧 *Required Action:*
Please make me a group admin to promote users.

⚡ *Mavrix Tech - Professional Management*`
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

📛 *Command:* Promote User
👤 *Your Role:* Member
🔒 *Required Role:* Admin

💡 *Only group admins can promote users.*

⚡ *Mavrix Tech - Secure Hierarchy*`
            }, { quoted: message });
            return;
        }

        // Send processing message
        await sock.sendMessage(chatId, {
            text: `👑 *Mavrix Bot - Promotion Process* 👑

╔══════════════════════╗
║   PROMOTING USERS    ║
╚══════════════════════╝

⚡ *Action:* Elevating to Admin
🔄 *Status:* Processing promotion...
⏳ *Please wait...*`
        }, { quoted: message });

        await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");
        
        // Get usernames for each promoted user
        const usernames = await Promise.all(userToPromote.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));

        // Get promoter's name
        const promoterJid = senderId;
        
        const promotionMessage = `🎉 *Mavrix Bot - Promotion Successful* 🎉

╔══════════════════════╗
║   NEW ADMIN(S) ADDED ║
╚══════════════════════╝

👑 *Promoted User${userToPromote.length > 1 ? 's' : ''}:*
${usernames.map(name => `• ${name}`).join('\n')}

⚡ *Promoted By:* @${promoterJid.split('@')[0]}
📅 *Date:* ${new Date().toLocaleString()}
📊 *Total Promoted:* ${userToPromote.length}

💫 *Congratulations on your new role!*
🔧 *New admins can now manage the group.*

⚡ *Mavrix Tech - Professional Administration*`;

        await sock.sendMessage(chatId, { 
            text: promotionMessage,
            mentions: [...userToPromote, promoterJid]
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Mavrix Bot - Promote Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Promotion Failed* ❌

╔══════════════════════╗
║     PROMOTE ERROR    ║
╚══════════════════════╝

🚨 *Failed to promote user(s)!*

🔧 *Possible Reasons:*
• User is already admin
• Bot lost admin permissions
• Network issues
• Permission conflict

🔄 *Please check:*
1. Bot admin status
2. User current role
3. Your permissions

⚡ *Mavrix Tech - Reliable Management*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: message });
    }
}

// Function to handle automatic promotion detection
async function handlePromotionEvent(sock, groupId, participants, author) {
    try {
        console.log('👑 Mavrix Bot - Auto Promotion Event Detected');

        // Get usernames for promoted participants
        const promotedUsernames = await Promise.all(participants.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));

        let promotedBy;
        let mentionList = [...participants];

        if (author && author.length > 0) {
            const authorJid = author;
            promotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            promotedBy = 'System';
        }

        const promotionMessage = `🎉 *Mavrix Bot - Auto Promotion Alert* 🎉

╔══════════════════════╗
║   ADMIN PROMOTION    ║
╚══════════════════════╝

👑 *New Admin${participants.length > 1 ? 's' : ''}:*
${promotedUsernames.map(name => `• ${name}`).join('\n')}

⚡ *Promoted By:* ${promotedBy}
📅 *Date:* ${new Date().toLocaleString()}
📊 *Total Promoted:* ${participants.length}

💫 *Welcome to the admin team!*
🔧 *New privileges activated.*

⚡ *Mavrix Tech - Smart Monitoring*`;

        await sock.sendMessage(groupId, {
            text: promotionMessage,
            mentions: mentionList
        });

    } catch (error) {
        console.error('❌ Mavrix Bot - Promotion Event Error:', error);
    }
}

module.exports = { promoteCommand, handlePromotionEvent };
