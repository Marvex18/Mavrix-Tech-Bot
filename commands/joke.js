// joke.js
const axios = require('axios');

module.exports = async function (sock, chatId, message) {
    try {
        console.log('😂 Mavrix Bot - Joke Command Activated');
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `😂 *Mavrix Bot - Comedy Central* 😂

╔══════════════════════╗
║    JOKE INCOMING!    ║
╚══════════════════════╝

🎭 *Preparing premium laughter...*
📚 *Accessing joke database...*
✨ *Selecting the funniest one...*

⚡ *Get ready to laugh!*`
        }, {
            quoted: message
        });

        const response = await axios.get('https://icanhazdadjoke.com/', {
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Mavrix Bot (https://mavrix.tech)'
            },
            timeout: 10000
        });
        
        const joke = response.data.joke;

        // Premium joke presentation
        const jokeMessage = `😂 *Mavrix Bot - Premium Comedy* 😂

╔══════════════════════╗
║     FRESH JOKE!      ║
╚══════════════════════╝

📜 *Here's your daily dose of laughter:*

"${joke}"

🎯 *Joke Quality:* Premium 🏆
😂 *Laugh Level:* ${Math.floor(Math.random() * 100) + 1}%

⭐ *Rate this joke:*
👍 - Funny!   👎 - Try again

💫 *Powered by Mavrix Humor AI*
🔔 *Want more? Use .joke again!*

🎭 *Mavrix Bot - Making the world funnier!*`;

        await sock.sendMessage(chatId, { 
            text: jokeMessage 
        });

    } catch (error) {
        console.error('❌ Mavrix Bot - Joke Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Comedy Failure* ❌

╔══════════════════════╗
║     JOKE FAILED      ║
╚══════════════════════╝

🎭 *Oops! The joke disappeared!*

🔧 *What happened:*
• Comedy server is resting
• Laughter overload
• Punchline got lost

🔄 *Please try:*
1. Use .joke command again
2. Wait a few moments
3. Check your connection

💡 *Alternative:*
Tell me your own joke! 😊

⚡ *Mavrix Tech - Professional Fun*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage 
        }, {
            quoted: message
        });
    }
};
