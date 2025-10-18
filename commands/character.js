// character.js
const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function characterCommand(sock, chatId, message) {
    let userToAnalyze;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToAnalyze) {
        await sock.sendMessage(chatId, { 
            text: `🔮 *Mavrix Bot - Character Analysis*\n\n` +
                  `╔═══════════════════╗\n` +
                  `║    ❌ MISSING     ║\n` +
                  `╚═══════════════════╝\n\n` +
                  `📝 Please mention someone or reply to their message to analyze their character!\n\n` +
                  `✨ *Powered by Mavrix AI Systems*`,
            ...channelInfo 
        });
        return;
    }

    try {
        // Get user's profile picture
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';
        }

        const traits = [
            "Intelligent", "Creative", "Determined", "Ambitious", "Caring",
            "Charismatic", "Confident", "Empathetic", "Energetic", "Friendly",
            "Generous", "Honest", "Humorous", "Imaginative", "Independent",
            "Intuitive", "Kind", "Logical", "Loyal", "Optimistic",
            "Passionate", "Patient", "Persistent", "Reliable", "Resourceful",
            "Sincere", "Thoughtful", "Understanding", "Versatile", "Wise"
        ];

        // Get 3-5 random traits
        const numTraits = Math.floor(Math.random() * 3) + 3;
        const selectedTraits = [];
        for (let i = 0; i < numTraits; i++) {
            const randomTrait = traits[Math.floor(Math.random() * traits.length)];
            if (!selectedTraits.includes(randomTrait)) {
                selectedTraits.push(randomTrait);
            }
        }

        // Calculate random percentages for each trait
        const traitPercentages = selectedTraits.map(trait => {
            const percentage = Math.floor(Math.random() * 41) + 60;
            const bars = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
            return `▫️ ${trait}: ${bars} ${percentage}%`;
        });

        const overallRating = Math.floor(Math.random() * 21) + 80;
        const ratingStars = '⭐'.repeat(Math.floor(overallRating / 20));

        // Create premium character analysis message
        const analysis = `🔮 *Mavrix Bot - Character Analysis* 🔮\n\n` +
            `╔══════════════════════════╗\n` +
            `║       🌟 PROFILE        ║\n` +
            `╚══════════════════════════╝\n\n` +
            `👤 *User Analysis:* @${userToAnalyze.split('@')[0]}\n` +
            `📊 *Scan Date:* ${new Date().toLocaleString()}\n\n` +
            `╔══════════════════════════╗\n` +
            `║       ✨ TRAITS          ║\n` +
            `╚══════════════════════════╝\n\n` +
            `${traitPercentages.join('\n')}\n\n` +
            `╔══════════════════════════╗\n` +
            `║       📈 SUMMARY         ║\n` +
            `╚══════════════════════════╝\n\n` +
            `🎯 *Overall Rating:* ${overallRating}%\n` +
            `⭐ *Star Rating:* ${ratingStars}\n` +
            `📅 *Analysis ID:* #${Math.random().toString(36).substr(2, 9).toUpperCase()}\n\n` +
            `💫 *Note:* This AI-powered analysis is for entertainment purposes only!\n\n` +
            `🔰 *Powered by Mavrix Tech AI Systems*`;

        // Send the analysis with the user's profile picture
        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption: analysis,
            mentions: [userToAnalyze],
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in character command:', error);
        await sock.sendMessage(chatId, { 
            text: `💥 *Mavrix Bot - Analysis Failed*\n\n` +
                  `╔═══════════════════╗\n` +
                  `║    🚨 ERROR!      ║\n` +
                  `╚═══════════════════╝\n\n` +
                  `❌ Failed to analyze character!\n` +
                  `🔧 Our AI systems are experiencing high load\n\n` +
                  `⚡ *Mavrix Tech - Try again later*`,
            ...channelInfo 
        });
    }
}

module.exports = characterCommand;
