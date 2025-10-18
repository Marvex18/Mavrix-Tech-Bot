const { setAntitag, getAntitag, removeAntitag } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

const MAVRIX_ASCII = `
╔══════════════════════════════════╗
║           🚀 MAVRIX BOT          ║
║          🚫 ANTITAG PRO          ║
║        PREMIUM PROTECTION        ║
╚══════════════════════════════════╝
`;

const MAVRIX_SIGNATURE = `
✨ Developed by Mavrix Tech
🎯 Premium Features | ⚡ Lightning Fast
🔒 Secure | 🛠️ Error Free
`;

async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}\n*🚫 ADMIN PRIVILEGES REQUIRED!*\n\n❌ This command is for group admins only!\n🔒 Premium protection system\n\n${MAVRIX_SIGNATURE}`
            }, {quoted: message});
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `${MAVRIX_ASCII}\n*🛡️ ANTITAG PROTECTION SYSTEM*\n\n*💡 Premium Commands:*\n• ${prefix}antitag 🟢on - Enable antitag protection\n• ${prefix}antitag set 🗑️delete - Set action to delete messages\n• ${prefix}antitag set 🚫kick - Set action to kick users\n• ${prefix}antitag 🔴off - Disable antitag protection\n• ${prefix}antitag 📊get - View current configuration\n\n*⚡ Features:*\n• 🚫 Auto-detect mass tagging\n• 🛡️ Protect group from spam\n• ⚡ Instant action system\n• 🔧 Mavrix Tech Security\n\n${MAVRIX_SIGNATURE}`;
            await sock.sendMessage(chatId, { text: usage }, {quoted: message});
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntitag(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { 
                        text: `${MAVRIX_ASCII}\n*ℹ️ SYSTEM STATUS*\n\n🛡️ Antitag protection is already active!\n⚡ Premium security enabled\n\n${MAVRIX_SIGNATURE}`
                    }, {quoted: message});
                    return;
                }
                const result = await setAntitag(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? 
                        `${MAVRIX_ASCII}\n*✅ ANTITAG ACTIVATED!*\n\n🛡️ Premium protection enabled\n⚡ Auto-delete mode activated\n🔒 Group security enhanced\n\n${MAVRIX_SIGNATURE}` : 
                        `${MAVRIX_ASCII}\n*❌ ACTIVATION FAILED!*\n\n🚫 Failed to enable antitag protection\n🔧 Please try again\n\n${MAVRIX_SIGNATURE}`
                }, {quoted: message});
                break;

            case 'off':
                await removeAntitag(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `${MAVRIX_ASCII}\n*🔴 ANTITAG DEACTIVATED!*\n\n🚫 Protection system disabled\n⚠️  Group is now vulnerable to mass tagging\n\n${MAVRIX_SIGNATURE}`
                }, {quoted: message});
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `${MAVRIX_ASCII}\n*❌ MISSING ACTION!*\n\n💡 Please specify an action:\n${prefix}antitag set 🗑️delete\n${prefix}antitag set 🚫kick\n\n${MAVRIX_SIGNATURE}`
                    }, {quoted: message});
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: `${MAVRIX_ASCII}\n*❌ INVALID ACTION!*\n\n🚫 Please choose:\n• 🗑️ delete - Delete spam messages\n• 🚫 kick - Kick spam users\n\n${MAVRIX_SIGNATURE}`
                    }, {quoted: message});
                    return;
                }
                const setResult = await setAntitag(chatId, 'on', setAction);
                const actionEmoji = setAction === 'delete' ? '🗑️' : '🚫';
                await sock.sendMessage(chatId, { 
                    text: setResult ? 
                        `${MAVRIX_ASCII}\n*✅ ACTION UPDATED!*\n\n${actionEmoji} Antitag action set to: ${setAction}\n⚡ Protection system optimized\n🔒 Premium security active\n\n${MAVRIX_SIGNATURE}` : 
                        `${MAVRIX_ASCII}\n*❌ UPDATE FAILED!*\n\n🚫 Failed to update antitag action\n🔧 Please try again\n\n${MAVRIX_SIGNATURE}`
                }, {quoted: message});
                break;

            case 'get':
                const status = await getAntitag(chatId, 'on');
                const actionConfig = await getAntitag(chatId, 'on');
                const statusEmoji = status ? '🟢' : '🔴';
                const actionText = actionConfig ? 
                    (actionConfig.action === 'delete' ? '🗑️ Delete Messages' : '🚫 Kick Users') : 
                    'Not set';
                
                await sock.sendMessage(chatId, { 
                    text: `${MAVRIX_ASCII}\n*📊 ANTITAG CONFIGURATION*\n\n${statusEmoji} *Status:* ${status ? 'ACTIVE' : 'INACTIVE'}\n⚡ *Action:* ${actionText}\n🛡️ *Protection:* Premium Level\n🔧 *System:* Mavrix Bot Pro\n\n${MAVRIX_SIGNATURE}`
                }, {quoted: message});
                break;

            default:
                await sock.sendMessage(chatId, { 
                    text: `${MAVRIX_ASCII}\n*❌ UNKNOWN COMMAND!*\n\n💡 Use ${prefix}antitag for usage information\n🔧 Premium protection system\n\n${MAVRIX_SIGNATURE}`
                }, {quoted: message});
        }
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error in antitag command:', error);
        await sock.sendMessage(chatId, { 
            text: `${MAVRIX_ASCII}\n*🚨 SYSTEM ERROR!*\n\n❌ Error processing antitag command\n🔧 Please try again later\n\n${MAVRIX_SIGNATURE}`
        }, {quoted: message});
    }
}

async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = await getAntitag(chatId, 'on');
        if (!antitagSetting || !antitagSetting.enabled) return;

        // Check if message contains mentions
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || 
                        message.message?.conversation?.match(/@\d+/g) ||
                        [];

        // Check if it's a group message and has multiple mentions
        if (mentions.length > 0 && mentions.length >= 3) {
            // Get group participants to check if it's tagging most/all members
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            
            // If mentions are more than 50% of group members, consider it as tagall
            const mentionThreshold = Math.ceil(participants.length * 0.5);
            
            if (mentions.length >= mentionThreshold) {
                
                const action = antitagSetting.action || 'delete';
                
                if (action === 'delete') {
                    // Delete the message
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    
                    // Send warning
                    await sock.sendMessage(chatId, {
                        text: `${MAVRIX_ASCII}\n*⚠️ MASS TAGGING DETECTED!*\n\n🚫 Anti-tag protection activated\n🗑️ Spam message deleted\n🔒 Premium security system\n\n${MAVRIX_SIGNATURE}`
                    }, { quoted: message });
                    
                } else if (action === 'kick') {
                    // First delete the message
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });

                    // Then kick the user
                    await sock.groupParticipantsUpdate(chatId, [senderId], "remove");

                    // Send notification
                    const usernames = [`@${senderId.split('@')[0]}`];
                    await sock.sendMessage(chatId, {
                        text: `${MAVRIX_ASCII}\n*🚫 USER REMOVED!*\n\n❌ ${usernames.join(', ')} has been kicked\n💡 Reason: Mass tagging detected\n🛡️ Premium protection active\n🔧 Mavrix Bot Security\n\n${MAVRIX_SIGNATURE}`,
                        mentions: [senderId]
                    }, { quoted: message });
                }
            }
        }
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error in tag detection:', error);
    }
}

module.exports = {
    handleAntitagCommand,
    handleTagDetection
};
