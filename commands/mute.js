// mute.js
const isAdmin = require('../lib/isAdmin');

async function muteCommand(sock, chatId, senderId, message, durationInMinutes) {
    try {
        console.log('🔇 Mavrix Bot - Mute Command Activated');
        
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        
        // Check bot admin status
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: `🚫 *Mavrix Bot - Admin Required* 🚫

╔══════════════════════╗
║   PERMISSION DENIED  ║
╚══════════════════════╝

❌ *Bot Not Admin!*

🔧 *Required Action:*
Please make me a group admin to use mute commands.

⚡ *How to:*
1. Open group settings
2. Make Mavrix Bot admin
3. Try the command again

💫 *Mavrix Tech - Professional Moderation*`
            }, { quoted: message });
            return;
        }

        // Check sender admin status
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: `👮‍♂️ *Mavrix Bot - Admin Only* 👮‍♂️

╔══════════════════════╗
║   ACCESS RESTRICTED  ║
╚══════════════════════╝

❌ *Permission Denied!*

📛 *Command:* Mute Group
👤 *Your Role:* Member
🔒 *Required Role:* Admin

💡 *Only group admins can mute/unmute the group.*

⚡ *Mavrix Tech - Secure Management*`
            }, { quoted: message });
            return;
        }

        // Send processing message
        await sock.sendMessage(chatId, {
            text: `🔇 *Mavrix Bot - Mute System* 🔇

╔══════════════════════╗
║    MUTE IN PROGRESS  ║
╚══════════════════════╝

⚡ *Action:* ${durationInMinutes ? `Temporary Mute (${durationInMinutes} minutes)` : 'Permanent Mute'}
🔄 *Status:* Applying settings...
⏳ *Please wait...*`
        }, { quoted: message });

        // Mute the group
        await sock.groupSettingUpdate(chatId, 'announcement');
        
        if (durationInMinutes !== undefined && durationInMinutes > 0) {
            const durationInMilliseconds = durationInMinutes * 60 * 1000;
            
            const muteMessage = `🔇 *Mavrix Bot - Group Muted* 🔇

╔══════════════════════╗
║     MUTE APPLIED     ║
╚══════════════════════╝

✅ *Status:* Successfully Muted
⏰ *Duration:* ${durationInMinutes} minutes
📊 *Type:* Temporary Mute
🔒 *Mode:* Announcement Only

💡 *During mute:*
• Only admins can send messages
• Members can read messages only
• Auto-unmute after ${durationInMinutes} minutes

⚡ *Mavrix Tech - Smart Moderation*`;

            await sock.sendMessage(chatId, { text: muteMessage }, { quoted: message });
            
            // Set timeout to unmute after duration
            setTimeout(async () => {
                try {
                    await sock.groupSettingUpdate(chatId, 'not_announcement');
                    
                    const unmuteMessage = `🔊 *Mavrix Bot - Auto Unmute* 🔊

╔══════════════════════╗
║    GROUP UNMUTED     ║
╚══════════════════════╝

✅ *Status:* Successfully Unmuted
⏰ *Duration:* Complete
🔓 *Mode:* All Messages Allowed

🎉 *Chat is now open!*
💬 *Everyone can send messages again*

⚡ *Mavrix Tech - Automated Management*`;

                    await sock.sendMessage(chatId, { text: unmuteMessage });
                } catch (unmuteError) {
                    console.error('❌ Mavrix Bot - Auto Unmute Error:', unmuteError);
                    await sock.sendMessage(chatId, { 
                        text: '⚠️ *Auto-unmute failed! Please unmute manually.*'
                    });
                }
            }, durationInMilliseconds);
        } else {
            const permanentMuteMessage = `🔇 *Mavrix Bot - Permanent Mute* 🔇

╔══════════════════════╗
║   PERMANENT MUTE     ║
╚══════════════════════╝

✅ *Status:* Successfully Muted
⏰ *Duration:* Until Manual Unmute
🔒 *Mode:* Announcement Only

💡 *Current restrictions:*
• Only admins can send messages
• Members can read messages only
• No auto-unmute scheduled

⚡ *To unmute use:* .unmute
💫 *Mavrix Tech - Professional Control*`;

            await sock.sendMessage(chatId, { text: permanentMuteMessage }, { quoted: message });
        }
    } catch (error) {
        console.error('❌ Mavrix Bot - Mute Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Mute Failed* ❌

╔══════════════════════╗
║     MUTE ERROR       ║
╚══════════════════════╝

🚨 *Operation Failed!*

🔧 *Possible Reasons:*
• Bot lost admin permissions
• Group settings conflict
• Network issues
• Server timeout

🔄 *Please check:*
1. Bot admin status
2. Group settings
3. Your permissions

⚡ *Mavrix Tech - Reliable Moderation*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage
        }, { quoted: message });
    }
}

module.exports = muteCommand;
