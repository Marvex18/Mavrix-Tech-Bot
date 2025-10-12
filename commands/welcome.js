const { handleWelcome } = require('../lib/welcome');
const { isWelcomeOn } = require('../lib/index');
const { channelInfo } = require('../lib/messageConfig');
const fetch = require('node-fetch');

// Premium welcome templates
const PREMIUM_WELCOME_TEMPLATES = {
    standard: {
        name: "🎉 Standard Welcome",
        premium: false,
        api: "https://api.some-random-api.com/welcome/img/2/gaming3"
    },
    premium: {
        name: "💎 Premium Welcome", 
        premium: true,
        api: "https://api.nekosapi.com/premium/welcome"
    },
    anime: {
        name: "🎎 Anime Welcome",
        premium: true, 
        api: "https://api.anisafe.com/welcome"
    },
    gaming: {
        name: "🎮 Gaming Welcome",
        premium: true,
        api: "https://api.gamingtools.net/welcome"
    }
};

async function welcomeCommand(sock, chatId, message, match) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { 
            text: '❌ *Group Only!*\n\nThis command can only be used in groups.'
        });
        return;
    }

    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');

    // Show welcome settings menu if no args
    if (!matchText) {
        return await showWelcomeMenu(sock, chatId, message);
    }

    await handleWelcome(sock, chatId, message, matchText);
}

async function showWelcomeMenu(sock, chatId, message) {
    const menuText = `🎊 *Welcome System* 🎊

⚙️ *Commands:*
• .welcome on - Enable welcome messages
• .welcome off - Disable welcome messages  
• .welcome premium - Premium templates 💎
• .welcome test - Test welcome message

💎 *Premium Features:*
• 4K Welcome Images
• Custom Templates
• Anime/Gaming Themes
• Auto Member Count

✨ *Current Status:* ${await isWelcomeOn(chatId) ? '✅ Enabled' : '❌ Disabled'}

💡 Use *.welcome premium* to see premium options!`;

    await sock.sendMessage(chatId, { 
        text: menuText,
        ...channelInfo
    });
}

async function handleJoinEvent(sock, id, participants) {
    const isWelcomeEnabled = await isWelcomeOn(id);
    if (!isWelcomeEnabled) return;

    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || 'No description available';

    for (const participant of participants) {
        try {
            const user = participant.split('@')[0];
            let displayName = user;
            
            // Get user info
            try {
                const contact = await sock.getBusinessProfile(participant);
                if (contact && contact.name) {
                    displayName = contact.name;
                }
            } catch (nameError) {
                console.log('Using default display name');
            }
            
            // Get profile picture
            let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`;
            try {
                const profilePic = await sock.profilePictureUrl(participant, 'image');
                if (profilePic) profilePicUrl = profilePic;
            } catch (profileError) {
                console.log('Using default profile picture');
            }
            
            // Current time
            const now = new Date();
            const timeString = now.toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            // Premium welcome image
            const apiUrl = `${PREMIUM_WELCOME_TEMPLATES.premium.api}?type=join&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
            
            const response = await fetch(apiUrl);
            if (response.ok) {
                const imageBuffer = await response.buffer();
                
                await sock.sendMessage(id, {
                    image: imageBuffer,
                    caption: `╭━━━✦🎊✦━━━╮\n       🎉 *WELCOME* 🎉\n╰━━━✦🎊✦━━━╯\n\n👋 Hello *@${displayName}*!\n🏠 Group: *${groupName}*\n👥 Members: *${groupMetadata.participants.length}*\n⏰ Joined: *${timeString}*\n\n📝 *Group Description:*\n${groupDesc}\n\n💎 *Premium Welcome* • Knight Bot MD`,
                    mentions: [participant],
                    ...channelInfo
                });
            } else {
                // Fallback to text
                const welcomeMessage = `╭━━━✦🎊✦━━━╮\n       🎉 *WELCOME* 🎉\n╰━━━✦🎊✦━━━╯\n\n👋 Hello *@${displayName}*!\n🏠 Group: *${groupName}*\n👥 Members: *${groupMetadata.participants.length}*\n⏰ Joined: *${timeString}*\n\n📝 *Group Description:*\n${groupDesc}\n\n✨ *Standard Welcome* • Knight Bot MD`;
                await sock.sendMessage(id, {
                    text: welcomeMessage,
                    mentions: [participant],
                    ...channelInfo
                });
            }
        } catch (error) {
            console.error('Welcome error:', error);
            // Ultimate fallback
            const user = participant.split('@')[0];
            const fallbackMessage = `🎉 Welcome @${user} to the group! 🎊\n\nWe're glad to have you here! 👋`;
            await sock.sendMessage(id, {
                text: fallbackMessage,
                mentions: [participant],
                ...channelInfo
            });
        }
    }
}

module.exports = { welcomeCommand, handleJoinEvent };
