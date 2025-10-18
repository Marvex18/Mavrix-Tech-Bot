// compliment.js
const compliments = [
    "🌟 You're absolutely amazing just the way you are!",
    "😄 You have an incredible sense of humor that lights up every room!",
    "💖 You're incredibly thoughtful and kind - a rare gem!",
    "⚡ You are more powerful and capable than you know!",
    "💫 You light up every room you walk into!",
    "🤝 You're a true friend that everyone wishes they had!",
    "🚀 You inspire everyone around you to be better!",
    "🎨 Your creativity knows no bounds - pure genius!",
    "💎 You have a heart of pure gold!",
    "🌍 You make a significant difference in this world!",
    "🌈 Your positivity is absolutely contagious!",
    "💼 You have an incredible work ethic that's truly admirable!",
    "✨ You bring out the best in everyone around you!",
    "😊 Your smile could brighten the darkest day!",
    "🎯 You're incredibly talented in everything you do!",
    "🕊️ Your kindness makes the world a better place!",
    "🔮 You have a unique and wonderful perspective on life!",
    "🔥 Your enthusiasm is truly inspiring and motivating!",
    "🏆 You are capable of achieving absolutely anything!",
    "💝 You always know how to make people feel special!",
    "💪 Your confidence is truly admirable and inspiring!",
    "🌹 You have a beautiful soul that shines through!",
    "🎁 Your generosity knows no limits!",
    "🔍 You have an amazing eye for detail!",
    "💓 Your passion is truly motivating to witness!",
    "👂 You're an amazing listener - people feel truly heard!",
    "🦸 You're stronger than you think - a true warrior!",
    "😂 Your laughter is absolutely infectious!",
    "💫 You have a natural gift for making others feel valued!",
    "🎉 You make the world better just by being in it!"
];

async function complimentCommand(sock, chatId, message) {
    try {
        const PREMIUM_ASCII = `
╔══════════════════════════╗
║     💝 MAVRIX BOT       ║
║    PREMIUM COMPLIMENTS  ║
╚══════════════════════════╝
`;

        if (!message || !chatId) {
            console.log('Mavrix Compliment: Invalid message or chatId');
            return;
        }

        let userToCompliment;
        
        // Check for mentioned users
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToCompliment) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*💝 MAVRIX COMPLIMENT SYSTEM*\n\n╔══════════════════════════╗\n║   MENTION REQUIRED      ║
╚══════════════════════════╝\n\nPlease mention someone or reply to their message to send a premium compliment! 💫\n\n*🔰 Mavrix Tech - Spreading Positivity*`
            });
            return;
        }

        const compliment = compliments[Math.floor(Math.random() * compliments.length)];
        const username = userToCompliment.split('@')[0];

        // Add premium delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*💫 PREMIUM COMPLIMENT DELIVERED!*\n\n╔══════════════════════════╗\n║   SPREADING POSITIVITY  ║
╚══════════════════════════╝\n\nHey @${username}! 👋\n\n${compliment}\n\n✨ *Compliment ID:* #${Math.random().toString(36).substr(2, 6).toUpperCase()}\n🎯 *Category:* Premium Boost\n💖 *Effect:* Instant Happiness\n\n*🔰 Powered by Mavrix Tech*`,
            mentions: [userToCompliment]
        });

        console.log(`💝 Mavrix Compliment: Sent to ${username}`);

    } catch (error) {
        console.error('Mavrix Compliment Error:', error);
        
        const ERROR_ASCII = `
╔══════════════════════════╗
║     🚨 SYSTEM ERROR     ║
║    MAVRIX COMPLIMENTS   ║
╚══════════════════════════╝
`;

        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await sock.sendMessage(chatId, { 
                    text: `${ERROR_ASCII}
*⏰ RATE LIMIT EXCEEDED!*\n\n╔══════════════════════════╗\n║   PLEASE WAIT           ║
╚══════════════════════════╝\n\nToo many compliments being sent! 🚀\nPlease try again in a few seconds...\n\n*🔰 Mavrix Tech - Premium Systems*`
                });
            } catch (retryError) {
                console.error('Mavrix Retry Error:', retryError);
            }
        } else {
            try {
                await sock.sendMessage(chatId, { 
                    text: `${ERROR_ASCII}
*❌ COMPLIMENT FAILED!*\n\n╔══════════════════════════╗\n║   SYSTEM ERROR          ║
╚══════════════════════════╝\n\nFailed to deliver your premium compliment! 😔\nPlease try again later...\n\n*🔰 Mavrix Tech Support*`
                });
            } catch (sendError) {
                console.error('Mavrix Error Message Failed:', sendError);
            }
        }
    }
}

module.exports = { complimentCommand };
