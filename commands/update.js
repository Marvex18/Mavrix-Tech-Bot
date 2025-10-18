const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const settings = require('../settings');

// ASCII Art for Update System
const UPDATE_ASCII = `
╔══════════════════════════════╗
║    🚀 MAVRIX BOT PREMIUM    ║
║       UPDATE SYSTEM         ║
║    🔒 Mavrix Tech © 2025    ║
╚══════════════════════════════╝
`;

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

async function hasGitRepo() {
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) return false;
    try {
        await run('git --version');
        return true;
    } catch {
        return false;
    }
}

async function updateViaGit() {
    const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
    await run('git fetch --all --prune');
    const newRev = (await run('git rev-parse origin/main')).trim();
    const alreadyUpToDate = oldRev === newRev;
    const commits = alreadyUpToDate ? '' : await run(`git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`).catch(() => '');
    const files = alreadyUpToDate ? '' : await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => '');
    await run(`git reset --hard ${newRev}`);
    await run('git clean -fd');
    return { oldRev, newRev, alreadyUpToDate, commits, files };
}

function downloadFile(url, dest, visited = new Set()) {
    return new Promise((resolve, reject) => {
        try {
            // Avoid infinite redirect loops
            if (visited.has(url) || visited.size > 5) {
                return reject(new Error('🔄 Too many redirects detected'));
            }
            visited.add(url);

            const useHttps = url.startsWith('https://');
            const client = useHttps ? require('https') : require('http');
            const req = client.get(url, {
                headers: {
                    'User-Agent': 'Mavrix-Bot-Updater/2.0-Premium',
                    'Accept': '*/*'
                },
                timeout: 60000
            }, res => {
                // Handle redirects
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error(`🔄 HTTP ${res.statusCode} without Location header`));
                    const nextUrl = new URL(location, url).toString();
                    res.resume();
                    return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
                }

                if (res.statusCode !== 200) {
                    return reject(new Error(`❌ HTTP Error: ${res.statusCode}`));
                }

                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => file.close(resolve));
                file.on('error', err => {
                    try { file.close(() => {}); } catch {}
                    fs.unlink(dest, () => reject(err));
                });
            });
            req.on('error', err => {
                fs.unlink(dest, () => reject(err));
            });
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('⏰ Download timeout'));
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function extractZip(zipPath, outDir) {
    // Try to use platform tools; no extra npm modules required
    if (process.platform === 'win32') {
        const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
        await run(cmd);
        return;
    }
    // Linux/mac: try unzip, else 7z, else busybox unzip
    try {
        await run('command -v unzip');
        await run(`unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch {}
    try {
        await run('command -v 7z');
        await run(`7z x -y '${zipPath}' -o'${outDir}'`);
        return;
    } catch {}
    try {
        await run('busybox unzip -h');
        await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch {}
    throw new Error("❌ No system unzip tool found (unzip/7z/busybox). Git mode is recommended.");
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.lstatSync(s);
        if (stat.isDirectory()) {
            copyRecursive(s, d, ignore, path.join(relative, entry), outList);
        } else {
            fs.copyFileSync(s, d);
            if (outList) outList.push(path.join(relative, entry).replace(/\\/g, '/'));
        }
    }
}

async function updateViaZip(sock, chatId, message, zipOverride) {
    const zipUrl = (zipOverride || settings.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();
    if (!zipUrl) {
        throw new Error('❌ No ZIP URL configured. Set settings.updateZipUrl or UPDATE_ZIP_URL environment variable.');
    }
    
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, 'update.zip');
    
    // Send download progress
    await sock.sendMessage(chatId, {
        text: '📥 *DOWNLOADING UPDATE*\n\n⬇️ Downloading latest version from Mavrix servers...'
    }, { quoted: message });
    
    await downloadFile(zipUrl, zipPath);
    
    await sock.sendMessage(chatId, {
        text: '📦 *EXTRACTING FILES*\n\n🗂️ Extracting update package...'
    }, { quoted: message });
    
    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);

    // Find the top-level extracted folder
    const [root] = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
    const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;

    // Copy over while preserving runtime dirs/files
    const ignore = ['node_modules', '.git', 'session', 'tmp', 'tmp/', 'temp', 'data', 'baileys_store.json'];
    const copied = [];
    
    // Preserve ownerNumber from existing settings.js if present
    let preservedOwner = null;
    let preservedBotOwner = null;
    try {
        const currentSettings = require('../settings');
        preservedOwner = currentSettings && currentSettings.ownerNumber ? String(currentSettings.ownerNumber) : null;
        preservedBotOwner = currentSettings && currentSettings.botOwner ? String(currentSettings.botOwner) : null;
    } catch {}
    
    await sock.sendMessage(chatId, {
        text: '🔄 *APPLYING UPDATE*\n\n⚡ Copying new files and preserving configuration...'
    }, { quoted: message });
    
    copyRecursive(srcRoot, process.cwd(), ignore, '', copied);
    
    if (preservedOwner) {
        try {
            const settingsPath = path.join(process.cwd(), 'settings.js');
            if (fs.existsSync(settingsPath)) {
                let text = fs.readFileSync(settingsPath, 'utf8');
                text = text.replace(/ownerNumber:\s*'[^']*'/, `ownerNumber: '${preservedOwner}'`);
                if (preservedBotOwner) {
                    text = text.replace(/botOwner:\s*'[^']*'/, `botOwner: '${preservedBotOwner}'`);
                }
                fs.writeFileSync(settingsPath, text);
            }
        } catch {}
    }
    
    // Cleanup
    try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(zipPath, { force: true }); } catch {}
    
    return { copiedFiles: copied };
}

async function restartProcess(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, { 
            text: '🔄 *RESTARTING SYSTEM*\n\n✅ Update complete! Restarting Mavrix Bot...' 
        }, { quoted: message });
    } catch {}
    
    try {
        // Preferred: PM2
        await run('pm2 restart all');
        return;
    } catch {}
    
    // Exit after a short delay to allow the above message to flush.
    setTimeout(() => {
        process.exit(0);
    }, 1000);
}

async function updateCommand(sock, chatId, message, senderIsSudo, zipOverride) {
    if (!message.key.fromMe && !senderIsSudo) {
        await sock.sendMessage(chatId, { 
            text: '🚫 *ACCESS DENIED*\n\nOnly Mavrix Bot Owner can perform updates! 🔒' 
        }, { quoted: message });
        return;
    }
    
    try {
        // Premium Update Header
        await sock.sendMessage(chatId, { 
            text: `${UPDATE_ASCII}\n🔄 *INITIATING UPDATE PROCESS*\n\n⚡ Checking for updates...` 
        }, { quoted: message });
        
        if (await hasGitRepo()) {
            const { oldRev, newRev, alreadyUpToDate, commits, files } = await updateViaGit();
            
            if (alreadyUpToDate) {
                await sock.sendMessage(chatId, { 
                    text: `✅ *ALREADY UP TO DATE*\n\n🟢 Your Mavrix Bot is running the latest version!\n\n🔒 No updates required.` 
                }, { quoted: message });
                return;
            }
            
            await sock.sendMessage(chatId, { 
                text: `📥 *UPDATING FROM GIT*\n\n🔄 Installing dependencies...` 
            }, { quoted: message });
            
            await run('npm install --no-audit --no-fund');
        } else {
            const { copiedFiles } = await updateViaZip(sock, chatId, message, zipOverride);
            await sock.sendMessage(chatId, { 
                text: `📦 *ZIP UPDATE COMPLETE*\n\n✅ Successfully updated ${copiedFiles.length} files!` 
            }, { quoted: message });
        }
        
        await restartProcess(sock, chatId, message);
        
    } catch (err) {
        console.error('❌ Update failed:', err);
        await sock.sendMessage(chatId, { 
            text: `❌ *UPDATE FAILED*

╔══════════════════════════════╗
║         UPDATE ERROR         ║
╚══════════════════════════════╝

🚨 *Error Details:*
${String(err.message || err)}

💡 *Possible Solutions:*
┣ 🔹 Check internet connection
┣ 🔹 Verify update source
┣ 🔹 Check file permissions
┣ 🔹 Contact Mavrix Support

🔒 *Mavrix Tech - Premium Support*` 
        }, { quoted: message });
    }
}

module.exports = updateCommand;
