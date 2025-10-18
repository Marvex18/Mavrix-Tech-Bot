// groupmanage.js
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const PREMIUM_ASCII = `
╔══════════════════════════╗
║     👑 MAVRIX BOT       ║
║    GROUP MANAGEMENT     ║
╚══════════════════════════╝
`;

async function ensureGroupAndAdmin(sock, chatId, senderId) {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🚫 COMMAND RESTRICTED!*\n\n╔══════════════════════════╗\n║   GROUP ONLY COMMAND    ║
╚══════════════════════════╝\n\nThis command can only be used in groups! 👥\n\n💡 *Usage:* Add me to a group and make me admin!\n\n*🔰 Mavrix Tech - Group Management*`
        });
        return { ok: false };
    }
    
    // Check admin status of sender and bot
    const isAdmin = require('../lib/isAdmin');
    const adminStatus = await isAdmin(sock, chatId, senderId);
    
    if (!adminStatus.isBotAdmin) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🤖 BOT PERMISSION ERROR!*\n\n╔══════════════════════════╗\n║   ADMIN ACCESS REQUIRED ║
╚══════════════════════════╝\n\nPlease make Mavrix Bot a group admin first! 👮‍♂️\n\n🔧 *How to fix:*\n1. Go to group settings\n2. Make @Mavrix Bot an admin\n3. Try the command again\n\n*🔰 Mavrix Tech - Admin Privileges*`
        });
        return { ok: false };
    }
    
    if (!adminStatus.isSenderAdmin) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🚫 PERMISSION DENIED!*\n\n╔══════════════════════════╗\n║   ADMIN ONLY COMMAND    ║
╚══════════════════════════╝\n\nOnly group admins can use this command! 🔒\n\n📛 *Access Level:* Admin Required\n🛡️ *Security:* High Priority\n\n*🔰 Mavrix Tech - Security Protocol*`
        });
        return { ok: false };
    }
    
    return { ok: true };
}

async function setGroupDescription(sock, chatId, senderId, text, message) {
    const check = await ensureGroupAndAdmin(sock, chatId, senderId);
    if (!check.ok) return;
    
    const desc = (text || '').trim();
    if (!desc) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*📝 GROUP DESCRIPTION*\n\n╔══════════════════════════╗\n║   USAGE GUIDE           ║
╚══════════════════════════╝\n\n✨ *Command:* .setgdesc\n📌 *Usage:* .setgdesc <description>\n\n💡 *Examples:*\n• .setgdesc Welcome to our awesome group!\n• .setgdesc Official Mavrix Bot community\n• .setgdesc Chat, share, and have fun!\n\n⚡ *Max Length:* 512 characters\n🎯 *Note:* Only group admins can use this\n\n*🔰 Mavrix Tech - Group Management*`
        }, { quoted: message });
        return;
    }
    
    if (desc.length > 512) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*❌ DESCRIPTION TOO LONG!*\n\n╔══════════════════════════╗\n║   LENGTH ERROR          ║
╚══════════════════════════╝\n\nDescription exceeds 512 character limit! 📏\n\n📊 *Current Length:* ${desc.length} characters\n💡 *Solution:* Shorten your description\n\n*🔰 Mavrix Tech - Character Limit*`
        }, { quoted: message });
        return;
    }
    
    try {
        // Send processing message
        const processingMsg = await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🔄 UPDATING GROUP INFO*\n\n╔══════════════════════════╗\n║   PROCESSING REQUEST    ║
╚══════════════════════════╝\n\n📝 Updating group description...\n⚡ Applying changes...\n🔧 Verifying permissions...\n\n*🔰 Mavrix Tech - Processing*`
        }, { quoted: message });

        await sock.groupUpdateDescription(chatId, desc);
        
        // Delete processing message
        try {
            await sock.sendMessage(chatId, { delete: processingMsg.key });
        } catch (e) {}
        
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*✅ DESCRIPTION UPDATED!*\n\n╔══════════════════════════╗\n║   SUCCESSFUL UPDATE     ║
╚══════════════════════════╝\n\n📝 *New Description:*\n${desc}\n\n📊 *Details:*\n┌──────────────────────────┐
│ 📏 Length: ${desc.length.toString().padEnd(3)} characters │
│ 👥 Affected: All Members   │
│ ⚡ Status: Successfully    │
└──────────────────────────┘\n\n✨ *Group info has been updated!*\n\n*🔰 Powered by Mavrix Tech - Group Management*`
        }, { quoted: message });

        console.log(`📝 Mavrix Group: Updated description for ${chatId}`);

    } catch (e) {
        console.error('Mavrix Group Description Error:', e);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*❌ UPDATE FAILED!*\n\n╔══════════════════════════╗\n║   OPERATION ERROR       ║
╚══════════════════════════╝\n\nFailed to update group description! 😔\n\n🔧 *Possible Reasons:*\n• Bot lost admin permissions\n• WhatsApp API limitations\n• Network connectivity issues\n\n💡 *Solution:*\n• Check bot admin status\n• Try again in 30 seconds\n• Contact group owner\n\n*🔰 Mavrix Tech Support*`
        }, { quoted: message });
    }
}

async function setGroupName(sock, chatId, senderId, text, message) {
    const check = await ensureGroupAndAdmin(sock, chatId, senderId);
    if (!check.ok) return;
    
    const name = (text || '').trim();
    if (!name) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🏷️ GROUP NAME*\n\n╔══════════════════════════╗\n║   USAGE GUIDE           ║
╚══════════════════════════╝\n\n✨ *Command:* .setgname\n📌 *Usage:* .setgname <new name>\n\n💡 *Examples:*\n• .setgname Mavrix Bot Community\n• .setgname Official Chat Group\n• .setgname Friends Forever\n\n⚡ *Max Length:* 25 characters\n🎯 *Note:* Only group admins can use this\n\n*🔰 Mavrix Tech - Group Management*`
        }, { quoted: message });
        return;
    }
    
    if (name.length > 25) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*❌ NAME TOO LONG!*\n\n╔══════════════════════════╗\n║   LENGTH ERROR          ║
╚══════════════════════════╝\n\nGroup name exceeds 25 character limit! 📏\n\n📊 *Current Length:* ${name.length} characters\n💡 *Solution:* Shorten the group name\n\n*🔰 Mavrix Tech - Character Limit*`
        }, { quoted: message });
        return;
    }
    
    try {
        // Send processing message
        const processingMsg = await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🔄 UPDATING GROUP INFO*\n\n╔══════════════════════════╗\n║   PROCESSING REQUEST    ║
╚══════════════════════════╝\n\n🏷️ Updating group name...\n⚡ Applying changes...\n🔧 Verifying permissions...\n\n*🔰 Mavrix Tech - Processing*`
        }, { quoted: message });

        await sock.groupUpdateSubject(chatId, name);
        
        // Delete processing message
        try {
            await sock.sendMessage(chatId, { delete: processingMsg.key });
        } catch (e) {}
        
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*✅ NAME UPDATED!*\n\n╔══════════════════════════╗\n║   SUCCESSFUL UPDATE     ║
╚══════════════════════════╝\n\n🏷️ *New Group Name:*\n${name}\n\n📊 *Details:*\n┌──────────────────────────┐
│ 📏 Length: ${name.length.toString().padEnd(3)} characters │
│ 👥 Affected: All Members   │
│ ⚡ Status: Successfully    │
└──────────────────────────┘\n\n✨ *Group has been renamed successfully!*\n\n*🔰 Powered by Mavrix Tech - Group Management*`
        }, { quoted: message });

        console.log(`🏷️ Mavrix Group: Updated name to "${name}" for ${chatId}`);

    } catch (e) {
        console.error('Mavrix Group Name Error:', e);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*❌ UPDATE FAILED!*\n\n╔══════════════════════════╗\n║   OPERATION ERROR       ║
╚══════════════════════════╝\n\nFailed to update group name! 😔\n\n🔧 *Possible Reasons:*\n• Bot lost admin permissions\n• Name contains invalid characters\n• WhatsApp API rate limit\n\n💡 *Solution:*\n• Check bot admin status\n• Try a different name\n• Wait 1 minute and retry\n\n*🔰 Mavrix Tech Support*`
        }, { quoted: message });
    }
}

async function setGroupPhoto(sock, chatId, senderId, message) {
    const check = await ensureGroupAndAdmin(sock, chatId, senderId);
    if (!check.ok) return;

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMessage = quoted?.imageMessage || message.message?.imageMessage;
    
    if (!imageMessage) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🖼️ GROUP PHOTO*\n\n╔══════════════════════════╗\n║   USAGE GUIDE           ║
╚══════════════════════════╝\n\n✨ *Command:* .setgpp\n📌 *Usage:* Send an image with caption .setgpp OR reply .setgpp to an image\n\n💡 *Supported Formats:*\n• JPEG, PNG images\n• High quality photos\n• Square images work best\n\n⚡ *Requirements:*\n• Image must be clear\n• Bot must be admin\n• You must be admin\n\n*🔰 Mavrix Tech - Group Management*`
        }, { quoted: message });
        return;
    }
    
    try {
        // Send processing message
        const processingMsg = await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🔄 UPDATING GROUP PHOTO*\n\n╔══════════════════════════╗\n║   PROCESSING IMAGE      ║
╚══════════════════════════╝\n\n🖼️ Downloading image...\n⚡ Processing photo...\n🔧 Updating group profile...\n\n*🔰 Mavrix Tech - Image Processing*`
        }, { quoted: message });

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const imgPath = path.join(tmpDir, `mavrix_gpp_${Date.now()}.jpg`);
        fs.writeFileSync(imgPath, buffer);

        // Verify image size and dimensions
        const fileStats = fs.statSync(imgPath);
        if (fileStats.size > 10 * 1024 * 1024) { // 10MB limit
            fs.unlinkSync(imgPath);
            throw new Error('Image too large');
        }

        await sock.updateProfilePicture(chatId, { url: imgPath });
        
        // Cleanup temp file
        try {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        } catch (_) {}
        
        // Delete processing message
        try {
            await sock.sendMessage(chatId, { delete: processingMsg.key });
        } catch (e) {}
        
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*✅ PHOTO UPDATED!*\n\n╔══════════════════════════╗\n║   SUCCESSFUL UPDATE     ║
╚══════════════════════════╝\n\n🖼️ Group profile photo has been updated! 📸\n\n📊 *Details:*\n┌──────────────────────────┐
│ 📁 File Size: ${(fileStats.size / 1024).toFixed(1)}KB   │
│ 🎯 Quality: High          │
│ 👥 Visible: All Members   │
│ ⚡ Status: Success        │
└──────────────────────────┘\n\n✨ *Your group now has a fresh new look!*\n\n*🔰 Powered by Mavrix Tech - Group Management*`
        }, { quoted: message });

        console.log(`🖼️ Mavrix Group: Updated profile photo for ${chatId}`);

    } catch (e) {
        console.error('Mavrix Group Photo Error:', e);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*❌ PHOTO UPDATE FAILED!*\n\n╔══════════════════════════╗\n║   OPERATION ERROR       ║
╚══════════════════════════╝\n\nFailed to update group profile photo! 😔\n\n🔧 *Possible Reasons:*\n• Image format not supported\n• File too large (>10MB)\n• Bot lost admin permissions\n• Network connectivity issues\n\n💡 *Solution:*\n• Use JPEG/PNG format\n• Compress large images\n• Check bot admin status\n• Try again in 1 minute\n\n*🔰 Mavrix Tech Support*`
        }, { quoted: message });
    }
}

module.exports = {
    setGroupDescription,
    setGroupName,
    setGroupPhoto
};
