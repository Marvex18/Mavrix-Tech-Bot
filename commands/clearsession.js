// clearsession.js
const fs = require('fs');
const path = require('path');
const os = require('os');

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'Mavrix Bot MD',
            serverMessageId: -1
        }
    }
};

async function clearSessionCommand(sock, chatId, msg) {
    try {
        const PREMIUM_ASCII = `
╔══════════════════════════╗
║   🗂️ MAVRIX SESSION     ║
║    PREMIUM CLEANER      ║
╚══════════════════════════╝
`;

        // Check if sender is owner or sudo
        const { isSudo } = require('../lib/index');
        const senderId = msg.key.participant || msg.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = msg.key.fromMe || senderIsSudo;
        
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*🚫 ACCESS DENIED!*\n\n╔══════════════════════════╗\n║   PERMISSION ERROR      ║\n╚══════════════════════════╝\n\n❌ This command can only be used by Mavrix Bot owner!\n\n*🔰 Mavrix Tech Security Protocol*`,
                ...channelInfo
            });
            return;
        }

        // Define session directory
        const sessionDir = path.join(__dirname, '../session');

        if (!fs.existsSync(sessionDir)) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*❌ DIRECTORY NOT FOUND!*\n\n╔══════════════════════════╗\n║   SYSTEM ERROR          ║\n╚══════════════════════════╝\n\nSession directory not found!\n\n*🔰 Mavrix Tech Support*`,
                ...channelInfo
            });
            return;
        }

        let filesCleared = 0;
        let errors = 0;
        let errorDetails = [];

        // Send initial status with premium styling
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🔍 MAVRIX SESSION OPTIMIZATION*\n\n╔══════════════════════════╗\n║   SCANNING SYSTEM       ║\n╚══════════════════════════╝\n\n📊 *Analyzing session files...*\n⚡ *Optimizing performance...*\n🛡️ *Checking security protocols...*\n\n*🔰 Mavrix Tech - Premium Systems*`,
            ...channelInfo
        });

        const files = fs.readdirSync(sessionDir);
        
        // Count files by type for optimization
        let appStateSyncCount = 0;
        let preKeyCount = 0;
        let sessionCount = 0;
        let otherCount = 0;

        for (const file of files) {
            if (file.startsWith('app-state-sync-')) appStateSyncCount++;
            else if (file.startsWith('pre-key-')) preKeyCount++;
            else if (file.startsWith('session-')) sessionCount++;
            else if (file !== 'creds.json') otherCount++;
        }

        // Add processing delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Delete files
        for (const file of files) {
            if (file === 'creds.json') {
                // Skip creds.json file - keep authentication safe
                continue;
            }
            try {
                const filePath = path.join(sessionDir, file);
                fs.unlinkSync(filePath);
                filesCleared++;
                
                // Log each file deletion
                console.log(`🗑️ Mavrix Cleaner: Deleted ${file}`);
                
            } catch (error) {
                errors++;
                errorDetails.push(`❌ ${file}: ${error.message}`);
                console.error(`🚨 Mavrix Cleaner Error: Failed to delete ${file}`, error);
            }
        }

        // Send completion message with premium styling
        const successMessage = `${PREMIUM_ASCII}
*✅ SESSION CLEANUP COMPLETE!*\n\n╔══════════════════════════╗\n║   SYSTEM OPTIMIZED      ║
╚══════════════════════════╝\n\n📊 *Cleaning Statistics:*\n┌──────────────────────────┐
│ 📁 Total Files Cleared: ${filesCleared.toString().padEnd(3)} │
│ 🔄 App State Sync: ${appStateSyncCount.toString().padEnd(7)} │
│ 🔑 Pre-Key Files: ${preKeyCount.toString().padEnd(8)} │
│ 💼 Session Files: ${sessionCount.toString().padEnd(7)} │
│ 📄 Other Files: ${otherCount.toString().padEnd(9)} │
└──────────────────────────┘\n\n${errors > 0 ? `⚠️ *Errors Encountered:* ${errors}\n${errorDetails.slice(0, 3).join('\\n')}${errorDetails.length > 3 ? '\\n... and more' : ''}\n` : '🎉 *All files cleared successfully!*'}\n⚡ *Performance:* Optimized\n🛡️ *Security:* Enhanced\n🔧 *Status:* Ready\n\n*🔰 Powered by Mavrix Tech*`;

        await sock.sendMessage(chatId, { 
            text: successMessage,
            ...channelInfo
        });

    } catch (error) {
        console.error('Mavrix Session Clear Error:', error);
        
        const ERROR_ASCII = `
╔══════════════════════════╗
║     🚨 CRITICAL ERROR   ║
║    MAVRIX SESSION       ║
╚══════════════════════════╝
`;
        
        await sock.sendMessage(chatId, { 
            text: `${ERROR_ASCII}
*❌ SESSION CLEANUP FAILED!*\n\n╔══════════════════════════╗\n║   OPERATION ABORTED     ║
╚══════════════════════════╝\n\n🔧 *Issue:* System encountered an error\n💡 *Solution:* Check file permissions\n🚨 *Status:* Cleanup cancelled\n\n*Error Details:* ${error.message}\n\n*🔰 Mavrix Tech Support Required*`,
            ...channelInfo
        });
    }
}

module.exports = clearSessionCommand;
