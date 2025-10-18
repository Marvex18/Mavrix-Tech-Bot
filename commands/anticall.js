const fs = require('fs');

const MAVRIX_ASCII = `
╔══════════════════════════════════╗
║           🚀 MAVRIX BOT          ║
║          🛡️ ANTICALL PRO         ║
║        PREMIUM PROTECTION        ║
╚══════════════════════════════════╝
`;

const MAVRIX_SIGNATURE = `
✨ Developed by Mavrix Tech
🎯 Premium Features | ⚡ Lightning Fast
🔒 Secure | 🛠️ Error Free
`;

const ANTICALL_PATH = './data/anticall.json';

function readState() {
    try {
        if (!fs.existsSync(ANTICALL_PATH)) return { enabled: false };
        const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return { enabled: !!data.enabled };
    } catch {
        return { enabled: false };
    }
}

function writeState(enabled) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ enabled: !!enabled }, null, 2));
    } catch {}
}

async function anticallCommand(sock, chatId, message, args) {
    const state = readState();
    const sub = (args || '').trim().toLowerCase();

    if (!sub || (sub !== 'on' && sub !== 'off' && sub !== 'status')) {
        await sock.sendMessage(chatId, { 
            text: `${MAVRIX_ASCII}\n*🛡️ ANTICALL PROTECTION SYSTEM*\n\n*💡 Commands:*\n• .anticall 🟢on  - Enable auto-block on incoming calls\n• .anticall 🔴off - Disable anticall protection\n• .anticall 📊status - Show current status\n\n*⚡ Features:*\n• 🚫 Auto-block unwanted calls\n• 🛡️ Premium protection\n• ⚡ Instant response\n• 🔧 Mavrix Tech Security\n\n${MAVRIX_SIGNATURE}`
        }, { quoted: message });
        return;
    }

    if (sub === 'status') {
        const status = state.enabled ? '🟢 ACTIVATED' : '🔴 DEACTIVATED';
        const emoji = state.enabled ? '🛡️' : '🚫';
        await sock.sendMessage(chatId, { 
            text: `${MAVRIX_ASCII}\n*${emoji} ANTICALL STATUS*\n\n*Current State:* ${status}\n*Protection:* ${state.enabled ? 'Active' : 'Inactive'}\n*Security:* Premium Level\n\n${MAVRIX_SIGNATURE}`
        }, { quoted: message });
        return;
    }

    const enable = sub === 'on';
    writeState(enable);
    
    const status = enable ? '🟢 ACTIVATED' : '🔴 DEACTIVATED';
    const emoji = enable ? '✅' : '❌';
    const messageText = enable ? 
        `*🛡️ ANTICALL PROTECTION ACTIVATED!*\n\n✅ All incoming calls will be automatically blocked\n⚡ Premium security enabled\n🔒 Your privacy is now protected\n🚀 Powered by Mavrix Tech` :
        `*🚫 ANTICALL PROTECTION DEACTIVATED!*\n\n❌ Call blocking is now disabled\n💡 Incoming calls will not be blocked\n⚠️  Security level reduced`;
    
    await sock.sendMessage(chatId, { 
        text: `${MAVRIX_ASCII}\n${messageText}\n\n${MAVRIX_SIGNATURE}`
    }, { quoted: message });
}

module.exports = { anticallCommand, readState };
