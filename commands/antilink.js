const { bots } = require('../lib/antilink');
const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

const PREMIUM_ASCII = `
╔═══════════════════════╗
║    🛡️ ANTILINK PRO   ║
║     PREMIUM SYSTEM    ║
╚═══════════════════════╝
`;

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: '```🚫 For Group Admins Only!```' 
            }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `${PREMIUM_ASCII}
\`\`\`🛡️ ANTILINK PREMIUM SETUP

${prefix}antilink on 🟢
${prefix}antilink set delete 🗑️ | kick 👢 | warn ⚠️
${prefix}antilink off 🔴
${prefix}antilink get 📊
\`\`\``;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { 
                        text: '*🛡️ Antilink is already ACTIVATED*' 
                    }, { quoted: message });
                    return;
                }
                const result = await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? 
                        `${PREMIUM_ASCII}*✅ ANTILINK ACTIVATED*\n*🔒 Protection: ENABLED*\n*⚡ Action: DELETE*` : 
                        '*❌ Failed to activate Antilink*' 
                }, { quoted: message });
                break;

            case 'off':
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `${PREMIUM_ASCII}*🔴 ANTILINK DEACTIVATED*\n*🛡️ Protection: DISABLED*` 
                }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `*⚠️ Please specify an action:*\n${prefix}antilink set delete 🗑️ | kick 👢 | warn ⚠️` 
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '*❌ Invalid action! Choose:* \\n🗑️ delete \\n👢 kick \\n⚠️ warn' 
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntilink(chatId, 'on', setAction);
                const setActionEmoji = setAction === 'delete' ? '🗑️' : setAction === 'kick' ? '👢' : '⚠️';
                await sock.sendMessage(chatId, { 
                    text: setResult ? 
                        `${PREMIUM_ASCII}*✅ Action Updated:* ${setActionEmoji} ${setAction.toUpperCase()}` : 
                        '*❌ Failed to update action*' 
                }, { quoted: message });
                break;

            case 'get':
                const status = await getAntilink(chatId, 'on');
                const actionConfig = await getAntilink(chatId, 'on');
                const statusEmoji = status ? '🟢' : '🔴';
                const getActionEmoji = actionConfig?.action === 'delete' ? '🗑️' : 
                                     actionConfig?.action === 'kick' ? '👢' : '⚠️';
                
                await sock.sendMessage(chatId, { 
                    text: `${PREMIUM_ASCII}
*📊 ANTILINK CONFIGURATION*

*Status:* ${statusEmoji} ${status ? 'ACTIVE' : 'INACTIVE'}
*Action:* ${getActionEmoji} ${actionConfig?.action?.toUpperCase() || 'Not set'}
*Level:* 🔥 PREMIUM
*Version:* ⚡ v2.0` 
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { 
                    text: `*❓ Invalid command! Use ${prefix}antilink for usage guide*` 
                });
        }
    } catch (error) {
        console.error('🚨 Error in antilink command:', error);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🚨 SYSTEM ERROR*\n*Error processing antilink command*` 
        });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    const antilinkSetting = getAntilinkSetting(chatId);
    if (antilinkSetting === 'off') return;

    console.log(`🛡️ Antilink Protection Active for ${chatId}: ${antilinkSetting}`);
    console.log(`🔍 Scanning message: ${userMessage}`);
    
    let shouldDelete = false;

    const linkPatterns = {
        whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
        whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
        telegram: /t\.me\/[A-Za-z0-9_]+/i,
        allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i,
    };

    // Premium link detection with enhanced patterns
    if (antilinkSetting === 'whatsappGroup' && linkPatterns.whatsappGroup.test(userMessage)) {
        console.log('🚫 Detected WhatsApp group link!');
        shouldDelete = true;
    } else if (antilinkSetting === 'whatsappChannel' && linkPatterns.whatsappChannel.test(userMessage)) {
        console.log('🚫 Detected WhatsApp channel link!');
        shouldDelete = true;
    } else if (antilinkSetting === 'telegram' && linkPatterns.telegram.test(userMessage)) {
        console.log('🚫 Detected Telegram link!');
        shouldDelete = true;
    } else if (antilinkSetting === 'allLinks' && linkPatterns.allLinks.test(userMessage)) {
        console.log('🚫 Detected restricted link!');
        shouldDelete = true;
    }

    if (shouldDelete) {
        const quotedMessageId = message.key.id;
        const quotedParticipant = message.key.participant || senderId;

        console.log(`🗑️ Deleting malicious message from ${quotedParticipant}`);

        try {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: quotedMessageId, participant: quotedParticipant },
            });
            console.log(`✅ Message deleted successfully!`);
            
            // Premium warning message
            const mentionedJidList = [senderId];
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🚫 LINK DETECTED!*\n@${senderId.split('@')[0]}, posting links is strictly prohibited!\n\n*⚡ Premium Protection Active*`,
                mentions: mentionedJidList 
            });
        } catch (error) {
            console.error('❌ Failed to delete message:', error);
        }
    } else {
        console.log('✅ Message cleared - No restricted links detected');
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};
