// insult.js
const insults = [
    "You're like a cloud. When you disappear, it's a beautiful day! ☁️➡️☀️",
    "You bring everyone so much joy... when you leave the room! 🎉🚪",
    "I'd agree with you, but then we'd both be wrong! 🤷‍♂️❌",
    "You're not stupid; you just have bad luck thinking! 🍀🤔",
    "Your secrets are always safe with me. I never even listen to them! 🤫🔒",
    "You're proof that even evolution takes a break sometimes! 🐒⏸️",
    "You have something on your chin... no, the third one down! 👶🍼",
    "You're like a software update. Whenever I see you, I think 'Not now!'! ⏰❌",
    "You're like a penny—two-faced and not worth much! 💰😒",
    "You're the reason they put directions on shampoo bottles! 🧴📖",
    "You're like a candle in the wind... useless! 🕯️💨",
    "You're like a Wi-Fi signal—always weak when needed most! 📶😫",
    "You have the perfect face for radio! 📻😶",
    "You're like a broken pencil—pointless! ✏️❌",
    "Your brain's running Windows 95—slow and outdated! 💻🦕",
    "You're like a speed bump—annoying but unavoidable! 🛑😤",
    "You're like a cloud of mosquitoes—just irritating! 🦟😠",
    "You bring people together... to complain about you! 👥🗣️",
    "Your IQ is like your hairline—receding! 🧠↘️",
    "You're the human version of a '404 Error'! ❌🖥️"
];

async function insultCommand(sock, chatId, message) {
    try {
        console.log('🎯 Mavrix Bot - Insult Command Activated');
        
        if (!message || !chatId) {
            console.log('❌ Invalid message or chatId');
            return;
        }

        let userToInsult;
        
        // Check for mentioned users
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToInsult = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToInsult = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToInsult) {
            await sock.sendMessage(chatId, { 
                text: `🎯 *Mavrix Bot - Roast Machine* 🎯

╔══════════════════════╗
║     INSULT MODE      ║
╚══════════════════════╝

❌ *Target Missing!*

💡 *How to use:*
• Reply to someone's message with .insult
• Mention someone with .insult @username

⚡ *Example:*
.insult @user123

🎭 *Let the roasting begin!*`
            });
            return;
        }

        const insult = insults[Math.floor(Math.random() * insults.length)];
        const username = userToInsult.split('@')[0];

        // Premium ASCII art response
        const insultMessage = `🎯 *Mavrix Bot - Premium Roast* 🎯

╔══════════════════════╗
║      BURN ALERT!     ║
╚══════════════════════╝

🎯 *Target:* @${username}
🔥 *Roast Level:* ${Math.floor(Math.random() * 100) + 1}%

💥 *The Verdict:*
"${insult}"

⚡ *Powered by Mavrix Roast Technology*
🎭 *Remember, it's all in good fun!*

💫 *Mavrix Bot - Making chats spicy!*`;

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));

        await sock.sendMessage(chatId, { 
            text: insultMessage,
            mentions: [userToInsult]
        });

    } catch (error) {
        console.error('❌ Mavrix Bot - Insult Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Roast Failed* ❌

╔══════════════════════╗
║     ROAST ERROR      ║
╚══════════════════════╝

🚨 *The roast got too hot to handle!*

🔧 *What happened:*
${error.data === 429 ? '• Too many roasts! Cooling down...' : '• System malfunction'}
• Roast engine overheated

🔄 *Please try again in a few moments!*

⚡ *Mavrix Tech - Professional Roasting*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage
        });
    }
}

module.exports = { insultCommand };
