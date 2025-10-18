// cleartmp.js
const fs = require('fs');
const path = require('path');

const PREMIUM_ASCII = `
╔══════════════════════════╗
║    🗑️ MAVRIX CLEANER    ║
║   PREMIUM OPTIMIZER     ║
╚══════════════════════════╝
`;

// Function to clear a single directory
function clearDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            return { 
                success: false, 
                message: `❌ Directory not found: ${path.basename(dirPath)}`,
                count: 0 
            };
        }
        
        const files = fs.readdirSync(dirPath);
        let deletedCount = 0;
        let errorCount = 0;
        
        for (const file of files) {
            try {
                const filePath = path.join(dirPath, file);
                const stat = fs.lstatSync(filePath);
                
                if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                    console.log(`🗂️ Mavrix Cleaner: Deleted directory ${file}`);
                } else {
                    fs.unlinkSync(filePath);
                    console.log(`📄 Mavrix Cleaner: Deleted file ${file}`);
                }
                deletedCount++;
                
            } catch (err) {
                errorCount++;
                console.error(`🚨 Mavrix Cleaner Error deleting ${file}:`, err.message);
            }
        }
        
        return { 
            success: errorCount === 0, 
            message: `✅ Cleared ${deletedCount} files in ${path.basename(dirPath)}${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
            count: deletedCount,
            errors: errorCount
        };
        
    } catch (error) {
        console.error('Mavrix Directory Clear Error:', error);
        return { 
            success: false, 
            message: `❌ Failed to clear ${path.basename(dirPath)}: ${error.message}`,
            count: 0,
            error: error.message 
        };
    }
}

// Function to clear both tmp and temp directories
async function clearTmpDirectory() {
    const tmpDir = path.join(process.cwd(), 'tmp');
    const tempDir = path.join(process.cwd(), 'temp');
    const cacheDir = path.join(process.cwd(), 'cache');
    
    const results = [];
    results.push(clearDirectory(tmpDir));
    results.push(clearDirectory(tempDir));
    results.push(clearDirectory(cacheDir));
    
    // Combine results
    const success = results.every(r => r.success);
    const totalDeleted = results.reduce((sum, r) => sum + (r.count || 0), 0);
    const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
    const message = results.map(r => r.message).join('\n• ');
    
    return { 
        success, 
        message: `• ${message}`,
        count: totalDeleted,
        errors: totalErrors,
        details: results
    };
}

// Function to handle manual command
async function clearTmpCommand(sock, chatId, msg) {
    try {
        // Check if user is owner or sudo
        const { isSudo } = require('../lib/index');
        const senderId = msg.key.participant || msg.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = msg.key.fromMe || senderIsSudo;
        
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*🚫 ACCESS DENIED!*\n\n╔══════════════════════════╗\n║   OWNER COMMAND ONLY   ║
╚══════════════════════════╝\n\n❌ This command is exclusively for Mavrix Bot owner!\n\n*🔰 Mavrix Tech Security Protocol*`
            });
            return;
        }

        // Send processing message
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🔍 MAVRIX SYSTEM CLEANER*\n\n╔══════════════════════════╗\n║   OPTIMIZING SYSTEM     ║
╚══════════════════════════╝\n\n📊 Scanning temporary directories...\n⚡ Preparing cleanup operation...\n🛡️ Verifying file permissions...\n\n*🔰 Mavrix Tech - Premium Optimization*`
        });

        const result = await clearTmpDirectory();
        
        // Add processing delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (result.success && result.count > 0) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*✅ SYSTEM CLEANUP COMPLETE!*\n\n╔══════════════════════════╗\n║   PERFORMANCE BOOSTED   ║
╚══════════════════════════╝\n\n📊 *Cleaning Report:*\n${result.message}\n\n┌──────────────────────────┐
│ 🗑️ Total Files Cleared: ${result.count.toString().padEnd(3)} │
│ ⚡ System Performance: Boosted  │
│ 🧹 Storage Space: Freed        │
│ 🔧 Status: Optimized           │
└──────────────────────────┘\n\n🎉 *Mavrix Bot is running at peak performance!*\n\n*🔰 Powered by Mavrix Tech*`
            });
        } else if (result.count === 0) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*✅ SYSTEM ALREADY CLEAN!*\n\n╔══════════════════════════╗\n║   NO ACTION NEEDED      ║
╚══════════════════════════╝\n\n📊 *Status Report:*\n${result.message}\n\n🎉 All temporary directories are already clean!\n⚡ Mavrix Bot is running optimally\n\n*🔰 Mavrix Tech - Premium Maintenance*`
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*⚠️ CLEANUP WITH ERRORS!*\n\n╔══════════════════════════╗\n║   PARTIAL COMPLETION    ║
╚══════════════════════════╝\n\n📊 *Operation Report:*\n${result.message}\n\n❌ Encountered ${result.errors} errors during cleanup\n🔧 Some files may require manual attention\n\n*🔰 Mavrix Tech Support Recommended*`
            });
        }

    } catch (error) {
        console.error('Mavrix TMP Clear Error:', error);
        
        const ERROR_ASCII = `
╔══════════════════════════╗
║     🚨 SYSTEM ERROR     ║
║    MAVRIX CLEANER       ║
╚══════════════════════════╝
`;
        
        await sock.sendMessage(chatId, { 
            text: `${ERROR_ASCII}
*❌ CLEANUP OPERATION FAILED!*\n\n╔══════════════════════════╗\n║   CRITICAL ERROR        ║
╚══════════════════════════╝\n\n🔧 *Issue:* System unable to clear temporary files\n💡 *Solution:* Check directory permissions\n🚨 *Status:* Operation aborted\n\n*Error Details:* ${error.message}\n\n*🔰 Mavrix Tech Support Required*`
        });
    }
}

// Start automatic clearing every 6 hours with premium logging
function startAutoClear() {
    console.log('🚀 Mavrix Auto-Cleaner Initialized - Premium System');
    
    // Run immediately on startup
    clearTmpDirectory().then(result => {
        if (result.count > 0) {
            console.log(`🗑️ Mavrix Auto-Cleaner: Cleared ${result.count} files on startup`);
        } else {
            console.log('✅ Mavrix Auto-Cleaner: System already clean on startup');
        }
    });

    // Set interval for every 6 hours
    setInterval(async () => {
        const result = await clearTmpDirectory();
        if (result.count > 0) {
            console.log(`🗑️ Mavrix Auto-Cleaner: Cleared ${result.count} files in scheduled cleanup`);
        }
        // No log if no files were cleared (system already clean)
    }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds

    console.log('⏰ Mavrix Auto-Cleaner: Scheduled every 6 hours');
}

// Start the automatic clearing
startAutoClear();

module.exports = clearTmpCommand;
