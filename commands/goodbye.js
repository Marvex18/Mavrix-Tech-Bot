// goodbye.js (Premium Enhanced)
const { handleGoodbye } = require('../lib/welcome');
const { isGoodByeOn } = require('../lib/index');
const fetch = require('node-fetch');

// Premium ASCII Art
const PREMIUM_GOODBYE_ART = `
╔═══════════════════════════╗
║    🚪 PREMIUM GOODBYE     ║
║         💎 ELITE          ║
╚═══════════════════════════╝
`;

async function goodbyeCommand(sock, chatId, message, match) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { 
            text: `🚫 *PREMIUM FEATURE RESTRICTED* 🚫

${PREMIUM_GOODBYE_ART}
💎 This premium feature is only available in groups.

✨ *Upgrade your experience with premium goodbye messages!*`
        });
        return;
    }

    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');

    await handleGoodbye(sock, chatId, message, matchText);
}

async function handleLeaveEvent(sock, id, participants) {
    const isGoodbyeEnabled = await isGoodByeOn(id);
    if (!isGoodbyeEnabled) return;

    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;

    for (const participant of participants) {
        try {
            const user = participant.split('@')[0];
            
            let displayName = user;
            try {
                const contact = await sock.getBusinessProfile(participant);
                if (contact && contact.name) {
                    displayName = contact.name;
                } else {
                    const groupParticipants = groupMetadata.participants;
                    const userParticipant = groupParticipants.find(p => p.id === participant);
                    if (userParticipant && userParticipant.name) {
                        displayName = userParticipant.name;
                    }
                }
            } catch (nameError) {
                console.log('Could not fetch display name, using phone number');
            }
            
            let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`;
            try {
                const profilePic = await sock.profilePictureUrl(participant, 'image');
                if (profilePic) {
                    profilePicUrl = profilePic;
                }
            } catch (profileError) {
                console.log('Could not fetch profile picture, using default');
            }
            
            const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming1?type=leave&textcolor=red&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
            
            const response = await fetch(apiUrl);
            if (response.ok) {
                const imageBuffer = await response.buffer();
                
                await sock.sendMessage(id, {
                    image: imageBuffer,
                    caption: `🎭 *PREMIUM GOODBYE NOTIFICATION* 💎

👋 Farewell, *@${displayName}*! 

📊 *Group Statistics:*
┌・Members: ${groupMetadata.participants.length}
├・Group: ${groupName}
└・Status: Member Left

💔 We will never miss you! 

${PREMIUM_GOODBYE_ART}`,
                    mentions: [participant]
                });
            } else {
                const goodbyeMessage = `🎭 *PREMIUM GOODBYE NOTIFICATION* 💎

🚪 *Member Left:* @${displayName}
📉 Group population decreased to ${groupMetadata.participants.length}

💔 We will never miss you! 

${PREMIUM_GOODBYE_ART}`;
                
                await sock.sendMessage(id, {
                    text: goodbyeMessage,
                    mentions: [participant]
                });
            }
        } catch (error) {
            console.error('Error sending goodbye message:', error);
            const user = participant.split('@')[0];
            const goodbyeMessage = `🎭 *GOODBYE NOTIFICATION* 

👋 @${user} has left the group!
💔 We will never miss you!

${PREMIUM_GOODBYE_ART}`;
            
            await sock.sendMessage(id, {
                text: goodbyeMessage,
                mentions: [participant]
            });
        }
    }
}

module.exports = { goodbyeCommand, handleLeaveEvent };
