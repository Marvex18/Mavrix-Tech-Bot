// ban.js
const fs = require('fs');
const { channelInfo } = require('../lib/messageConfig');

async function banCommand(sock, chatId, message) {
    let userToBan;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToBan = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToBan) {
        await sock.sendMessage(chatId, { 
            text: `🚫 *Mavrix Bot - Ban System*\n\n` +
                  `╔═══════════════════╗\n` +
                  `║    ❌ ERROR!      ║\n` +
                  `╚═══════════════════╝\n\n` +
                  `📝 *Usage:* Please mention the user or reply to their message to ban!\n\n` +
                  `🔧 *Powered by Mavrix Tech*`,
            ...channelInfo 
        });
        return;
    }

    try {
        // Add user to banned list
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        if (!bannedUsers.includes(userToBan)) {
            bannedUsers.push(userToBan);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `🔨 *Mavrix Bot - User Banned* 🔨\n\n` +
                      `╔══════════════════════════╗\n` +
                      `║     🚫 BAN HAMMER!      ║\n` +
                      `╚══════════════════════════╝\n\n` +
                      `👤 *User:* @${userToBan.split('@')[0]}\n` +
                      `⏰ *Status:* Successfully Banned\n` +
                      `📅 *Date:* ${new Date().toLocaleString()}\n\n` +
                      `⚡ *This user can no longer use Mavrix Bot features*\n\n` +
                      `🔰 *Powered by Mavrix Tech*`,
                mentions: [userToBan],
                ...channelInfo 
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ *Mavrix Bot - Already Banned*\n\n` +
                      `╔══════════════════════╗\n` +
                      `║     📛 DUPLICATE     ║\n` +
                      `╚══════════════════════╝\n\n` +
                      `👤 @${userToBan.split('@')[0]} is already banned from using Mavrix Bot!\n\n` +
                      `🔰 *Mavrix Tech - Premium Security*`,
                mentions: [userToBan],
                ...channelInfo 
            });
        }
    } catch (error) {
        console.error('Error in ban command:', error);
        await sock.sendMessage(chatId, { 
            text: `💥 *Mavrix Bot - System Error*\n\n` +
                  `╔═══════════════════╗\n` +
                  `║    🚨 ALERT!      ║\n` +
                  `╚═══════════════════╝\n\n` +
                  `❌ Failed to ban user!\n` +
                  `🔧 Please try again later\n\n` +
                  `⚡ *Mavrix Tech Support*`,
            ...channelInfo 
        });
    }
}

module.exports = banCommand;
