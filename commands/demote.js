const isAdmin = require('../lib/isAdmin');

// ⭐ PREMIUM DEMOTE SYSTEM
console.log(`
╔══════════════════════════════╗
║         👑 DEMOTE PRO        ║
║      PREMIUM MANAGEMENT      ║
╚══════════════════════════════╝
`);

async function demoteCommand(sock, chatId, mentionedJids, message) {
    try {
        // Premium admin check with enhanced logging
        console.log(`⭐ Premium Demote Command Activated by: ${message.key.participant}`);

        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Premium Group Feature Only*\n\nThis command works exclusively in premium groups! 👑' 
            });
            return;
        }

        // Enhanced admin status check
        try {
            const adminStatus = await isAdmin(sock, chatId, message.key.participant || message.key.remoteJid);
            
            if (!adminStatus.isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    text: '🔧 *Bot Admin Required*\n\nPlease grant admin permissions to enable premium features! ⭐' 
                });
                return;
            }

            if (!adminStatus.isSenderAdmin) {
                await sock.sendMessage(chatId, { 
                    text: '👑 *Admin Privileges Required*\n\nOnly group admins can use premium management tools! 💎' 
                });
                return;
            }
        } catch (adminError) {
            console.error('⭐ Premium Admin Check Error:', adminError);
            await sock.sendMessage(chatId, { 
                text: '🔧 *System Configuration Error*\n\nPlease ensure bot has proper admin permissions! ⚠️' 
            });
            return;
        }

        let userToDemote = [];
        
        // Premium user detection system
        if (mentionedJids && mentionedJids.length > 0) {
            userToDemote = mentionedJids;
            console.log(`⭐ Users mentioned for demotion: ${mentionedJids.length}`);
        }
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
            console.log(`⭐ User from reply detected for demotion`);
        }
        
        if (userToDemote.length === 0) {
            const helpText = `
👑 *PREMIUM DEMOTE COMMAND* 👑

❌ *No user specified!*

💡 *Usage:*
• Reply to user's message with .demote
• Mention user: .demote @username
• Multiple users: .demote @user1 @user2

⚡ *Premium Features:*
• Bulk demotion support
• Smart user detection
• Enhanced security
• Audit logging

⭐ Example: .demote @john
            `;
            await sock.sendMessage(chatId, { text: helpText });
            return;
        }

        // Premium rate limiting with better UX
        await sock.sendMessage(chatId, { 
            text: `⚡ *Processing Premium Demotion...*\n\n👥 Users: ${userToDemote.length}\n🔧 System: Initializing...` 
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        // Execute demotion
        await sock.groupParticipantsUpdate(chatId, userToDemote, "demote");
        
        // Premium user information gathering
        const userDetails = await Promise.all(userToDemote.map(async jid => {
            return {
                jid,
                username: `@${jid.split('@')[0]}`,
                shortcode: jid.split('@')[0].substring(0, 8) + '...'
            };
        }));

        // Premium delay for better user experience
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Premium demotion announcement
        const demotionMessage = `
╔══════════════════════════╗
👑 *PREMIUM DEMOTION ALERT* 👑
╚══════════════════════════╝

📋 *Demotion Details:*
👥 ${userToDemote.length > 1 ? 'Users Affected' : 'User Affected'}: ${userToDemote.length}
🕒 Time: ${new Date().toLocaleString()}
🔧 Type: Administrative Demotion

📜 *Demoted ${userToDemote.length > 1 ? 'Users' : 'User'}:*
${userDetails.map(user => `• ${user.username} (${user.shortcode})`).join('\n')}

👤 *Executed By:* @${message.key.participant ? message.key.participant.split('@')[0] : message.key.remoteJid.split('@')[0]}

⚡ *Premium Management System*
⭐ Secure • Efficient • Professional
        `;
        
        await sock.sendMessage(chatId, { 
            text: demotionMessage,
            mentions: [...userToDemote, message.key.participant || message.key.remoteJid]
        });

        console.log(`✅ Premium demotion completed for ${userToDemote.length} users`);

    } catch (error) {
        console.error('💥 Premium Demote Error:', error);
        
        const errorMessage = `
❌ *PREMIUM DEMOTION FAILED*

🔧 *Error Details:*
${error.data === 429 ? '⏳ Rate limit exceeded. Please wait a moment.' : '⚠️ System error occurred.'}

💡 *Troubleshooting:*
• Ensure bot has proper permissions
• Check if users are admins
• Verify group settings
• Wait 30 seconds before retry

⭐ Contact support if issue persists.
        `;

        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        await sock.sendMessage(chatId, { text: errorMessage });
    }
}

// Enhanced demotion event handler
async function handleDemotionEvent(sock, groupId, participants, author) {
    try {
        console.log(`⭐ Premium Auto-Demotion Detection Activated`);

        if (!groupId || !participants) {
            console.log('❌ Invalid event data received');
            return;
        }

        // Premium processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const userDetails = await Promise.all(participants.map(async jid => {
            return {
                jid,
                username: `@${jid.split('@')[0]}`,
                shortcode: jid.split('@')[0].substring(0, 8) + '...'
            };
        }));

        let demotedBy;
        let mentionList = [...participants];

        if (author && author.length > 0) {
            const authorJid = author;
            demotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            demotedBy = '🤖 System Auto-Demotion';
        }

        // Premium event announcement
        const eventMessage = `
╔══════════════════════════╗
🔔 *AUTO-DEMOTION DETECTED* 🔔
╚══════════════════════════╝

📊 *Event Summary:*
👥 Users Demoted: ${participants.length}
🔍 Detected By: Premium Monitor
🕒 Time: ${new Date().toLocaleString()}

📜 *Affected Users:*
${userDetails.map(user => `• ${user.username} (${user.shortcode})`).join('\n')}

👤 *Action By:* ${demotedBy}

⚡ *Premium Security System*
⭐ Real-time monitoring • Automatic alerts • Professional logging
        `;

        await sock.sendMessage(groupId, {
            text: eventMessage,
            mentions: mentionList
        });

        console.log(`✅ Premium demotion event handled for ${participants.length} users`);

    } catch (error) {
        console.error('❌ Premium Demotion Event Error:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

module.exports = { demoteCommand, handleDemotionEvent };
