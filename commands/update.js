const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');

// Premium ASCII Art
const ASCII_ART = {
    banner: `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ███╗   ███╗ █████╗ ██╗   ██╗██████╗ ██╗██╗  ██╗███████╗     ║
║  ████╗ ████║██╔══██╗██║   ██║██╔══██╗██║╚██╗██╔╝██╔════╝     ║
║  ██╔████╔██║███████║██║   ██║██████╔╝██║ ╚███╔╝ █████╗       ║
║  ██║╚██╔╝██║██╔══██║╚██╗ ██╔╝██╔══██╗██║ ██╔██╗ ██╔══╝       ║
║  ██║ ╚═╝ ██║██║  ██║ ╚████╔╝ ██║  ██║██║██╔╝ ██╗███████╗     ║
║  ╚═╝     ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝     ║
║                                                                ║
║              🤖 P R E M I U M  U P D A T E R 🚀               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `,
    checking: `
╔════════════════════════════════════════════════════════════════╗
║ 🔍 CHECKING FOR UPDATES...                                    ║
║                                                                ║
║    📡 Contacting GitHub Repository...                         ║
║    ⏳ Please wait while we check for new updates...           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `,
    updateFound: `
╔════════════════════════════════════════════════════════════════╗
║ 🎉 NEW UPDATE FOUND!                                          ║
║                                                                ║
║    ⬇️  Downloading latest version...                         ║
║    📦 Preparing installation...                              ║
║    🔄 Updating your bot...                                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `,
    noUpdate: `
╔════════════════════════════════════════════════════════════════╗
║ ✅ YOU'RE UP TO DATE!                                         ║
║                                                                ║
║    🎊 Running latest version!                                ║
║    ⭐ No updates available at this time.                     ║
║    💫 Your bot is premium and updated!                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `,
    success: `
╔════════════════════════════════════════════════════════════════╗
║ 🎊 UPDATE COMPLETED SUCCESSFULLY!                            ║
║                                                                ║
║    ✅ Files updated successfully                             ║
║    🔄 Restarting bot system...                               ║
║    🚀 Ready for premium performance!                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `,
    error: `
╔════════════════════════════════════════════════════════════════╗
║ ❌ UPDATE FAILED                                              ║
║                                                                ║
║    ⚠️  An error occurred during update                      ║
║    🔧 Please check your connection and try again            ║
║    📞 Contact support if issue persists                     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `
};

const GITHUB_OWNER = 'Marvex18';
const GITHUB_REPO = 'Mavrix-Tech-Bot';
const BRANCH = 'main';
const API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${BRANCH}`;

function runCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(stderr || stdout);
            resolve(stdout);
        });
    });
}

function getLatestCommit() {
    return new Promise((resolve, reject) => {
        https.get(API_URL, {
            headers: { 'User-Agent': 'Mavrix-Premium-Bot' }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const commitInfo = JSON.parse(data);
                    resolve({
                        sha: commitInfo.sha,
                        message: commitInfo.commit?.message || 'No message',
                        author: commitInfo.commit?.author?.name || 'Unknown',
                        date: commitInfo.commit?.author?.date || new Date().toISOString()
                    });
                } catch (e) {
                    reject('Failed to parse GitHub API response');
                }
            });
        }).on('error', reject);
    });
}

async function updateCommand(sock, chatId, message, senderIsSudo, zipArg = '') {
    try {
        // Check if user has permission (owner or sudo)
        if (!senderIsSudo && !message.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Access Denied*\n\nThis command is only available for bot owners and sudo users.' 
            }, { quoted: message });
            return;
        }

        // Send premium banner
        await sock.sendMessage(chatId, { 
            text: `\`\`\`${ASCII_ART.banner}\`\`\`\n*🤖 Mavrix Premium Auto-Updater*\n\n🔧 *Initializing update process...*` 
        }, { quoted: message });

        // Check for updates
        await sock.sendMessage(chatId, { 
            text: `\`\`\`${ASCII_ART.checking}\`\`\`\n*🔍 Checking for updates...*` 
        });

        const cachePath = path.join(__dirname, '../data/last_commit.txt');
        const oldCommit = fs.existsSync(cachePath) ? fs.readFileSync(cachePath, 'utf8').trim() : '';

        let latestCommit;
        try {
            latestCommit = await getLatestCommit();
        } catch (error) {
            await sock.sendMessage(chatId, { 
                text: `\`\`\`${ASCII_ART.error}\`\`\`\n*❌ Network Error*\n\nFailed to connect to GitHub. Please check your internet connection.` 
            }, { quoted: message });
            return;
        }

        // Check if update is needed
        if (latestCommit.sha === oldCommit) {
            await sock.sendMessage(chatId, { 
                text: `\`\`\`${ASCII_ART.noUpdate}\`\`\`\n*✅ You're Up to Date!*\n\n📅 *Last Check:* ${new Date().toLocaleString()}\n🔐 *Status:* Running Latest Version\n⭐ *Your Mavrix Bot is premium and updated!*` 
            }, { quoted: message });
            return;
        }

        // Update available - proceed with installation
        await sock.sendMessage(chatId, { 
            text: `\`\`\`${ASCII_ART.updateFound}\`\`\`\n*🎉 New Update Available!*\n\n📦 *Version:* ${latestCommit.sha.slice(0, 7)}\n👤 *Author:* ${latestCommit.author}\n📝 *Message:* ${latestCommit.message}\n⏳ *Installing update...*` 
        });

        // Perform git pull or alternative update method
        try {
            // Method 1: Try git pull first
            await runCommand('git pull origin main');
            
            // Update npm dependencies
            await sock.sendMessage(chatId, { 
                text: '📦 *Updating dependencies...*\n\nInstalling latest packages...' 
            });
            await runCommand('npm install --legacy-peer-deps');

            // Save the new commit hash
            fs.writeFileSync(cachePath, latestCommit.sha);

            // Success message
            await sock.sendMessage(chatId, { 
                text: `\`\`\`${ASCII_ART.success}\`\`\`\n*🎊 Update Completed!*\n\n✅ *New Version:* ${latestCommit.sha.slice(0, 7)}\n👤 *Changes by:* ${latestCommit.author}\n📝 *Update:* ${latestCommit.message}\n🔄 *Restarting in 5 seconds...*\n\n⭐ *Thank you for using Mavrix Premium!*` 
            }, { quoted: message });

            // Restart the bot
            setTimeout(() => {
                console.log(chalk.green.bold('🔄 Premium Update Complete - Restarting Bot...'));
                process.exit(0);
            }, 5000);

        } catch (gitError) {
            // If git pull fails, provide manual update instructions
            await sock.sendMessage(chatId, { 
                text: `\`\`\`${ASCII_ART.error}\`\`\`\n*❌ Automatic Update Failed*\n\n🔧 *Error:* ${gitError.message || gitError}\n\n💡 *Manual Update Required:*\n1. Go to your server terminal\n2. Run: \\\`git pull origin main\\\`\n3. Run: \\\`npm install\\\`\n4. Restart the bot manually\n\n📞 Contact support if issues persist.` 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('❌ Update command error:', error);
        await sock.sendMessage(chatId, { 
            text: `\`\`\`${ASCII_ART.error}\`\`\`\n*❌ Update Process Failed*\n\n📛 *Error:* ${error.message || error}\n🔧 *Please try again or contact support.*` 
        }, { quoted: message });
    }
}

// Auto-update checker (runs every 6 hours)
function startAutoUpdateChecker(sock) {
    setInterval(async () => {
        try {
            const cachePath = path.join(__dirname, '../data/last_commit.txt');
            const oldCommit = fs.existsSync(cachePath) ? fs.readFileSync(cachePath, 'utf8').trim() : '';
            const latestCommit = await getLatestCommit();
            
            if (latestCommit.sha !== oldCommit) {
                // Notify owner about available update
                const settings = require('../settings');
                const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
                
                await sock.sendMessage(ownerJid, { 
                    text: `🎉 *Premium Update Available!*\n\n📦 New version ready for installation!\n💫 Use *.update* to install automatically\n🔧 *Version:* ${latestCommit.sha.slice(0, 7)}\n👤 *Author:* ${latestCommit.author}\n📝 *Changes:* ${latestCommit.message}\n\n⭐ Keep your Mavrix Bot premium and updated!` 
                });
            }
        } catch (error) {
            console.error('Auto-update check failed:', error);
        }
    }, 6 * 60 * 60 * 1000); // 6 hours
}

module.exports = {
    updateCommand,
    startAutoUpdateChecker
};
