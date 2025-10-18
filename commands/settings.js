const fs = require('fs');

function readJsonSafe(path, fallback) {
    try {
        const txt = fs.readFileSync(path, 'utf8');
        return JSON.parse(txt);
    } catch (_) {
        return fallback;
    }
}

async function settingsCommand(sock, chatId, message) {
    try {
        // Owner-only or sudo
        const { isSudo } = require('../lib/index');
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = message.key.fromMe || senderIsSudo;
        
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *ACCESS DENIED*\n\nOnly Mavrix Bot Owner can access settings! 🔒' 
            }, { quoted: message });
            return;
        }

        const isGroup = chatId.endsWith('@g.us');
        const dataDir = './data';

        const mode = readJsonSafe(`${dataDir}/messageCount.json`, { isPublic: true });
        const autoStatus = readJsonSafe(`${dataDir}/autoStatus.json`, { enabled: false });
        const autoread = readJsonSafe(`${dataDir}/autoread.json`, { enabled: false });
        const autotyping = readJsonSafe(`${dataDir}/autotyping.json`, { enabled: false });
        const pmblocker = readJsonSafe(`${dataDir}/pmblocker.json`, { enabled: false });
        const anticall = readJsonSafe(`${dataDir}/anticall.json`, { enabled: false });
        const userGroupData = readJsonSafe(`${dataDir}/userGroupData.json`, {
            antilink: {}, antibadword: {}, welcome: {}, goodbye: {}, chatbot: {}, antitag: {}
        });
        const autoReaction = Boolean(userGroupData.autoReaction);

        // Per-group features
        const groupId = isGroup ? chatId : null;
        const antilinkOn = groupId ? Boolean(userGroupData.antilink && userGroupData.antilink[groupId]) : false;
        const antibadwordOn = groupId ? Boolean(userGroupData.antibadword && userGroupData.antibadword[groupId]) : false;
        const welcomeOn = groupId ? Boolean(userGroupData.welcome && userGroupData.welcome[groupId]) : false;
        const goodbyeOn = groupId ? Boolean(userGroupData.goodbye && userGroupData.goodbye[groupId]) : false;
        const chatbotOn = groupId ? Boolean(userGroupData.chatbot && userGroupData.chatbot[groupId]) : false;
        const antitagCfg = groupId ? (userGroupData.antitag && userGroupData.antitag[groupId]) : null;

        // ASCII Art Header
        const header = `
╔══════════════════════════════╗
║    🚀 MAVRIX BOT PREMIUM    ║
║       SETTINGS PANEL        ║
║    🔒 Mavrix Tech © 2025    ║
╚══════════════════════════════╝
`;

        const lines = [];
        lines.push(header);
        lines.push('🎯 *SYSTEM SETTINGS*');
        lines.push('');

        // Global Settings with Premium Icons
        lines.push(`🌐 *Bot Mode:* ${mode.isPublic ? '🟢 PUBLIC' : '🔴 PRIVATE'}`);
        lines.push(`📊 *Auto Status:* ${autoStatus.enabled ? '🟢 ON' : '🔴 OFF'}`);
        lines.push(`👁️ *Autoread:* ${autoread.enabled ? '🟢 ON' : '🔴 OFF'}`);
        lines.push(`⌨️ *Autotyping:* ${autotyping.enabled ? '🟢 ON' : '🔴 OFF'}`);
        lines.push(`🚫 *PM Blocker:* ${pmblocker.enabled ? '🟢 ON' : '🔴 OFF'}`);
        lines.push(`📞 *Anticall:* ${anticall.enabled ? '🟢 ON' : '🔴 OFF'}`);
        lines.push(`❤️ *Auto Reaction:* ${autoReaction ? '🟢 ON' : '🔴 OFF'}`);

        if (groupId) {
            lines.push('');
            lines.push('👥 *GROUP SETTINGS*');
            lines.push(`📱 *Group ID:* ${groupId.substring(0, 20)}...`);
            lines.push('');

            if (antilinkOn) {
                const al = userGroupData.antilink[groupId];
                lines.push(`🔗 *Antilink:* 🟢 ON (⚡ ${al.action || 'delete'})`);
            } else {
                lines.push('🔗 *Antilink:* 🔴 OFF');
            }

            if (antibadwordOn) {
                const ab = userGroupData.antibadword[groupId];
                lines.push(`🤬 *Antibadword:* 🟢 ON (⚡ ${ab.action || 'delete'})`);
            } else {
                lines.push('🤬 *Antibadword:* 🔴 OFF');
            }

            lines.push(`🎉 *Welcome:* ${welcomeOn ? '🟢 ON' : '🔴 OFF'}`);
            lines.push(`👋 *Goodbye:* ${goodbyeOn ? '🟢 ON' : '🔴 OFF'}`);
            lines.push(`🤖 *Chatbot:* ${chatbotOn ? '🟢 ON' : '🔴 OFF'}`);

            if (antitagCfg && antitagCfg.enabled) {
                lines.push(`🏷️ *Antitag:* 🟢 ON (⚡ ${antitagCfg.action || 'delete'})`);
            } else {
                lines.push('🏷️ *Antitag:* 🔴 OFF');
            }
        } else {
            lines.push('');
            lines.push('💡 *Note:* Group-specific settings will appear when used in a group.');
        }

        lines.push('');
        lines.push('🔒 *Powered by Mavrix Tech*');

        await sock.sendMessage(chatId, { text: lines.join('\n') }, { quoted: message });
    } catch (error) {
        console.error('❌ Error in settings command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *SETTINGS ERROR*\n\nFailed to read configuration. Please try again later.' 
        }, { quoted: message });
    }
}

module.exports = settingsCommand;
