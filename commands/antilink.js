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
            return sock.sendMessage(chatId, { text: '```🚫 For Group Admins Only!```' }, { quoted: message });
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
            return sock.sendMessage(chatId, { text: usage }, { quoted: message });
        }

        switch (action) {
            case 'on': {
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    return sock.sendMessage(chatId, { text: '*🛡️ Antilink is already ACTIVATED*' }, { quoted: message });
                }
                const result = await setAntilink(chatId, 'on', 'delete');
                return sock.sendMessage(chatId, {
                    text: result
                        ? `${PREMIUM_ASCII}*✅ ANTILINK ACTIVATED*\n*🔒 Protection: ENABLED*\n*⚡ Action: DELETE*`
                        : '*❌ Failed to activate Antilink*',
                }, { quoted: message });
            }

            case 'off': {
                await removeAntilink(chatId, 'on');
                return sock.sendMessage(chatId, {
                    text: `${PREMIUM_ASCII}*🔴 ANTILINK DEACTIVATED*\n*🛡️ Protection: DISABLED*`,
                }, { quoted: message });
            }

            case 'set': {
                if (args.length < 2) {
                    return sock.sendMessage(chatId, {
                        text: `*⚠️ Please specify an action:*\n${prefix}antilink set delete 🗑️ | kick 👢 | warn ⚠️`,
                    }, { quoted: message });
                }

                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    return sock.sendMessage(chatId, {
                        text: '*❌ Invalid action! Choose:* \n🗑️ delete \n👢 kick \n⚠️ warn',
                    }, { quoted: message });
                }

                const setResult = await setAntilink(chatId, 'on', setAction);
                const emoji = setAction === 'delete' ? '🗑️' : setAction === 'kick' ? '👢' : '⚠️';
                return sock.sendMessage(chatId, {
                    text: setResult
                        ? `${PREMIUM_ASCII}*✅ Action Updated:* ${emoji} ${setAction.toUpperCase()}`
                        : '*❌ Failed to update action*',
                }, { quoted: message });
            }

            case 'get': {
                const config = await getAntilink(chatId, 'on');
                const statusEmoji = config?.enabled ? '🟢' : '🔴';
                const actionEmoji = config?.action === 'delete'
                    ? '🗑️'
                    : config?.action === 'kick'
                    ? '👢'
                    : '⚠️';

                return sock.sendMessage(chatId, {
                    text: `${PREMIUM_ASCII}
*📊 ANTILINK CONFIGURATION*

*Status:* ${statusEmoji} ${config?.enabled ? 'ACTIVE' : 'INACTIVE'}
*Action:* ${actionEmoji} ${config?.action?.toUpperCase() || 'Not set'}
*Level:* 🔥 PREMIUM
*Version:* ⚡ v2.0`,
                }, { quoted: message });
            }

            default:
                return sock.sendMessage(chatId, {
                    text: `*❓ Invalid command! Use ${prefix}antilink for usage guide*`,
                }, { quoted: message });
        }
    } catch (error) {
        console.error('🚨 Error in antilink command:', error);
        return sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*🚨 SYSTEM ERROR*\n*Error processing antilink command*`,
        });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const config = await getAntilink(chatId, 'on');
        if (!config?.enabled) return;

        const linkPatterns = {
            allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i,
        };

        if (!linkPatterns.allLinks.test(userMessage)) return;

        console.log(`🚫 Link detected in ${chatId} from ${senderId}`);

        const participant = message.key.participant || senderId;

        if (config.action === 'delete') {
            await sock.sendMessage(chatId, { delete: message.key });
            await sock.sendMessage(chatId, {
                text: `${PREMIUM_ASCII}*🚫 LINK DETECTED!*\n@${senderId.split('@')[0]}, posting links is not allowed!\n\n*Action:* 🗑️ DELETE`,
                mentions: [senderId],
            });
        } else if (config.action === 'kick') {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            await sock.sendMessage(chatId, {
                text: `${PREMIUM_ASCII}*👢 LINK DETECTED!*\n@${senderId.split('@')[0]} has been removed for posting links!`,
                mentions: [senderId],
            });
        } else if (config.action === 'warn') {
            await sock.sendMessage(chatId, {
                text: `${PREMIUM_ASCII}*⚠️ LINK WARNING!*\n@${senderId.split('@')[0]}, avoid posting links or next time you’ll be removed.`,
                mentions: [senderId],
            });
        }
    } catch (error) {
        console.error('❌ Error in link detection:', error);
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};
