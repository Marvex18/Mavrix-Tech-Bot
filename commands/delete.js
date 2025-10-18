// delete.js
const isAdmin = require('../lib/isAdmin');
const store = require('../lib/lightweight_store');

async function deleteCommand(sock, chatId, message, senderId) {
    try {
        const PREMIUM_ASCII = `
╔══════════════════════════╗
║     🗑️ MAVRIX BOT       ║
║    PREMIUM CLEANER      ║
╚══════════════════════════╝
`;

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*🚫 BOT PERMISSION ERROR!*\n\n╔══════════════════════════╗\n║   ADMIN ACCESS REQUIRED ║
╚══════════════════════════╝\n\nI need to be a group admin to delete messages! 👮‍♂️\n\n🔧 *Solution:* Promote Mavrix Bot to admin\n\n*🔰 Mavrix Tech - Security Protocol*`
            }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*🚫 PERMISSION DENIED!*\n\n╔══════════════════════════╗\n║   ADMIN ONLY COMMAND    ║
╚══════════════════════════╝\n\nOnly group admins can use the delete command! 🔒\n\n📛 *Access Level:* Admin Required\n🛡️ *Security:* High Priority\n\n*🔰 Mavrix Tech - Admin Privileges*`
            }, { quoted: message });
            return;
        }

        // Determine target user and count
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const parts = text.trim().split(/\s+/);
        let countArg = 1;
        if (parts.length > 1) {
            const maybeNum = parseInt(parts[1], 10);
            if (!isNaN(maybeNum) && maybeNum > 0) countArg = Math.min(maybeNum, 100); // Increased limit
        }

        const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
        const mentioned = Array.isArray(ctxInfo.mentionedJid) && ctxInfo.mentionedJid.length > 0 ? ctxInfo.mentionedJid[0] : null;
        const repliedParticipant = ctxInfo.participant || null;

        // Determine target user: replied > mentioned; if neither, do not proceed
        let targetUser = null;
        let repliedMsgId = null;
        if (repliedParticipant && ctxInfo.stanzaId) {
            targetUser = repliedParticipant;
            repliedMsgId = ctxInfo.stanzaId;
        } else if (mentioned) {
            targetUser = mentioned;
        } else {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*🎯 TARGET REQUIRED!*\n\n╔══════════════════════════╗\n║   SPECIFY USER          ║
╚══════════════════════════╝\n\nPlease reply to a user's message or mention a user to delete their messages!\n\n💡 *Usage:* .delete @user [count]\n📝 *Example:* .delete @username 5\n\n*🔰 Mavrix Tech - Premium Cleaner*`
            }, { quoted: message });
            return;
        }

        // Send processing message
        const processingMsg = await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🔍 MAVRIX MESSAGE CLEANER*\n\n╔══════════════════════════╗\n║   SCANNING MESSAGES     ║
╚══════════════════════════╝\n\n📊 Analyzing chat history...\n🗑️ Preparing deletion process...\n⚡ Optimizing cleanup operation...\n\n*Target:* @${targetUser.split('@')[0]}\n*Limit:* ${countArg} messages\n\n*🔰 Mavrix Tech - Advanced Cleanup*`
        }, { quoted: message });

        // Gather last N messages from targetUser in this chat
        const chatMessages = Array.isArray(store.messages[chatId]) ? store.messages[chatId] : [];
        const toDelete = [];
        const seenIds = new Set();

        // If replying, prioritize deleting the exact replied message first
        if (repliedMsgId) {
            const repliedInStore = chatMessages.find(m => m.key.id === repliedMsgId && (m.key.participant || m.key.remoteJid) === targetUser);
            if (repliedInStore) {
                toDelete.push(repliedInStore);
                seenIds.add(repliedInStore.key.id);
            } else {
                // If not found in store, still attempt delete directly
                try {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: repliedMsgId,
                            participant: repliedParticipant
                        }
                    });
                    countArg = Math.max(0, countArg - 1);
                } catch {}
            }
        }

        // Collect messages to delete
        for (let i = chatMessages.length - 1; i >= 0 && toDelete.length < countArg; i--) {
            const m = chatMessages[i];
            const participant = m.key.participant || m.key.remoteJid;
            if (participant === targetUser && !seenIds.has(m.key.id)) {
                if (!m.message?.protocolMessage) {
                    toDelete.push(m);
                    seenIds.add(m.key.id);
                }
            }
        }

        if (toDelete.length === 0) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*🔍 NO MESSAGES FOUND!*\n\n╔══════════════════════════╗\n║   CLEANUP COMPLETE      ║
╚══════════════════════════╝\n\nNo recent messages found for @${targetUser.split('@')[0]} to delete! 📭\n\n💡 The chat is already clean!\n\n*🔰 Mavrix Tech - Premium Cleaner*`,
                mentions: [targetUser]
            }, { quoted: message });
            return;
        }

        // Delete sequentially with premium delay
        let successCount = 0;
        for (const m of toDelete) {
            try {
                const msgParticipant = m.key.participant || targetUser;
                await sock.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        fromMe: false,
                        id: m.key.id,
                        participant: msgParticipant
                    }
                });
                successCount++;
                await new Promise(r => setTimeout(r, 500)); // Increased delay for premium feel
            } catch (e) {
                console.error('Mavrix Delete Error for message:', m.key.id, e);
            }
        }

        // Delete processing message first
        try {
            await sock.sendMessage(chatId, { delete: processingMsg.key });
        } catch (e) {}

        // Send success report
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*✅ CLEANUP COMPLETE!*\n\n╔══════════════════════════╗\n║   MESSAGES DELETED      ║
╚══════════════════════════╝\n\n📊 *Deletion Report:*\n┌──────────────────────────┐
│ 👤 Target: @${targetUser.split('@')[0].padEnd(12)} │
│ 🗑️ Deleted: ${successCount.toString().padEnd(3)} messages      │
│ ⚡ Success: ${Math.round((successCount/toDelete.length)*100)}% rate          │
│ 🎯 Status: Operation Complete │
└──────────────────────────┘\n\n🔧 *Cleanup ID:* #${Math.random().toString(36).substr(2, 8).toUpperCase()}\n\n*🔰 Powered by Mavrix Tech - Premium Cleaner*`,
            mentions: [targetUser]
        }, { quoted: message });

        console.log(`🗑️ Mavrix Delete: Removed ${successCount} messages from ${targetUser.split('@')[0]}`);

    } catch (err) {
        console.error('Mavrix Delete Command Error:', err);
        
        const ERROR_ASCII = `
╔══════════════════════════╗
║     🚨 SYSTEM ERROR     ║
║    MAVRIX CLEANER       ║
╚══════════════════════════╝
`;

        await sock.sendMessage(chatId, { 
            text: `${ERROR_ASCII}
*❌ CLEANUP FAILED!*\n\n╔══════════════════════════╗\n║   OPERATION ABORTED     ║
╚══════════════════════════╝\n\nFailed to delete messages due to system error! 🔧\n\n💡 *Possible Issues:*\n• Message too old\n• Permission denied\n• System overload\n\n*🔰 Mavrix Tech Support Required*`
        }, { quoted: message });
    }
}

module.exports = deleteCommand;
