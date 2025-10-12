// 🎱 PREMIUM 8-BALL FORTUNE TELLER
console.log(`
╔══════════════════════════════╗
║         🎱 MAGIC 8-BALL      ║
║       PREMIUM ORACLE 🔮      ║
╚══════════════════════════════╝
`);

const eightBallResponses = [
    { answer: "🎯 It is certain.", type: "positive" },
    { answer: "✨ Without a doubt.", type: "positive" },
    { answer: "👍 Yes, definitely!", type: "positive" },
    { answer: "🔮 Signs point to yes.", type: "positive" },
    { answer: "💫 As I see it, yes.", type: "positive" },
    { answer: "❓ Ask again later.", type: "neutral" },
    { answer: "⏳ Better not tell you now.", type: "neutral" },
    { answer: "🌀 Cannot predict now.", type: "neutral" },
    { answer: "📞 Concentrate and ask again.", type: "neutral" },
    { answer: "👎 Don't count on it.", type: "negative" },
    { answer: "🚫 My reply is no.", type: "negative" },
    { answer: "😔 My sources say no.", type: "negative" },
    { answer: "💔 Outlook not so good.", type: "negative" },
    { answer: "🌪️ Very doubtful.", type: "negative" },
    { answer: "⚡ Absolutely yes!", type: "positive" },
    { answer: "🌟 The stars say yes!", type: "positive" },
    { answer: "💎 Premium answer: YES!", type: "positive" },
    { answer: "🔥 It's gonna be amazing!", type: "positive" }
];

async function eightBallCommand(sock, chatId, question) {
    if (!question) {
        const premiumMenu = `
╔══════════════════════════╗
🎱 *PREMIUM MAGIC 8-BALL* 🎱
╚══════════════════════════╝

🔮 *Ask your question and receive mystical guidance!*

💫 *Usage:*
.8ball Will I succeed today?
.8ball Is this the right path?
.8ball Should I take this opportunity?

✨ *Premium Features:*
• 18 mystical responses
• Positive/Negual/Neutral answers
• Star-powered accuracy
• VIP fortune telling

⭐ *Example:*
.8ball Will I win the lottery?
        `;

        await sock.sendMessage(chatId, { text: premiumMenu });
        return;
    }

    // 🎯 Premium random selection with weighting
    const randomIndex = Math.floor(Math.random() * eightBallResponses.length);
    const response = eightBallResponses[randomIndex];
    
    const thinkingMessages = [
        "🔮 Consulting the spirits...",
        "✨ Gazing into the crystal ball...",
        "🌟 Asking the universe...",
        "💫 Reading the stars...",
        "🎱 Shaking the magic ball..."
    ];
    
    const thinkingMsg = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
    
    // Send thinking message
    await sock.sendMessage(chatId, { 
        text: `${thinkingMsg}\n\n*Your Question:* "${question}"` 
    });

    // Add dramatic delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Determine response style
    let header = "";
    switch(response.type) {
        case "positive":
            header = "🌈 *EXCELLENT NEWS!* 🌈";
            break;
        case "negative":
            header = "🌧️ *CAREFUL NOW* 🌧️";
            break;
        case "neutral":
            header = "⚖️ *NEUTRAL GUIDANCE* ⚖️";
            break;
    }

    const premiumResponse = `
${header}

🎱 *The Magic 8-Ball Says:*
✨ "${response.answer}"

📜 *Your Question:*
"${question}"

💎 *Premium Fortune Reading Complete*
⭐ Thank you for using Magic 8-Ball Pro!
    `;

    await sock.sendMessage(chatId, { text: premiumResponse });
}

// 🆕 Premium Feature: Daily Horoscope
async function dailyHoroscope(sock, chatId, sign) {
    const horoscopes = {
        aries: "🔥 Today brings exciting opportunities! Your energy is magnetic.",
        taurus: "💎 Stability meets opportunity. Financial gains possible.",
        gemini: "📚 Communication is key. New connections await.",
        cancer: "🏡 Focus on home and family. Emotional balance needed.",
        leo: "👑 Leadership opportunities arise. Shine bright!",
        virgo: "🔍 Attention to detail pays off. Organization is key.",
        libra: "⚖️ Balance in relationships. Harmony achieved.",
        scorpio: "🔮 Deep insights revealed. Trust your intuition.",
        sagittarius: "🎯 Adventure calls! New horizons await.",
        capricorn: "🏔️ Career progress made. Hard work rewarded.",
        aquarius: "💡 Innovative ideas flow. Collaborate with others.",
        pisces: "🌊 Creativity peaks. Spiritual growth occurs."
    };

    const validSign = horoscopes[sign.toLowerCase()];
    
    if (!validSign) {
        await sock.sendMessage(chatId, {
            text: `❌ *Invalid Zodiac Sign*\n\nAvailable: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces\n\n💫 Usage: .horoscope leo`
        });
        return;
    }

    const horoscopeMessage = `
✨ *DAILY HOROSCOPE* ✨
⭐ ${sign.toUpperCase()} ⭐

${validSign}

🔮 *Lucky Numbers:* ${Array.from({length: 3}, () => Math.floor(Math.random() * 100)).join(', ')}
💎 *Lucky Color:* ${['Red', 'Blue', 'Green', 'Gold', 'Purple', 'Silver'][Math.floor(Math.random() * 6)]}
🌟 *Mood:* ${['Excellent', 'Positive', 'Creative', 'Adventurous', 'Focused', 'Inspired'][Math.floor(Math.random() * 6)]}

📅 *Date:* ${new Date().toLocaleDateString()}
💫 *Powered by Premium Astrology*
    `;

    await sock.sendMessage(chatId, { text: horoscopeMessage });
}

module.exports = { eightBallCommand, dailyHoroscope };
