// meme.js
const fetch = require('node-fetch');

async function memeCommand(sock, chatId, message) {
    try {
        console.log('🎭 Mavrix Bot - Meme Command Activated');
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `🎭 *Mavrix Bot - Meme Generator* 🎭

╔══════════════════════╗
║    MEME INCOMING!    ║
╚══════════════════════╝

🔄 *Status:* Fetching fresh meme...
📡 *Source:* Cheems Meme API
🎨 *Quality:* Premium HD

⚡ *Preparing your daily dose of laughter...*
✨ *Selecting the funniest cheems...*
😂 *Get ready to laugh!*`
        },{ quoted: message });

        const response = await fetch('https://shizoapi.onrender.com/api/memes/cheems?apikey=shizo', {
            timeout: 15000
        });
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        // Check if response is an image
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('image')) {
            const imageBuffer = await response.buffer();
            
            // Premium buttons with better styling
            const buttons = [
                { 
                    buttonId: '.meme', 
                    buttonText: { 
                        displayText: '🎭 Another Meme' 
                    }, 
                    type: 1 
                },
                { 
                    buttonId: '.joke', 
                    buttonText: { 
                        displayText: '😄 Get Joke' 
                    }, 
                    type: 1 
                },
                { 
                    buttonId: '.fun', 
                    buttonText: { 
                        displayText: '⚡ More Fun' 
                    }, 
                    type: 1 
                }
            ];

            const buttonMessage = {
                image: imageBuffer,
                caption: `🐕 *Mavrix Bot - Premium Meme Delivery* 🐕

╔══════════════════════╗
║     FRESH MEME!      ║
╚══════════════════════╝

🎭 *Type:* Cheems Meme
⭐ *Quality:* HD Premium
😂 *Funny Level:* ${Math.floor(Math.random() * 100) + 1}%

💫 *Powered by Mavrix Humor AI*
🎯 *Want more? Use buttons below!*

⚡ *Mavrix Tech - Making chats funnier!*`,
                buttons: buttons,
                headerType: 4,
                mentions: []
            };

            await sock.sendMessage(chatId, buttonMessage, { quoted: message });
            
        } else {
            throw new Error('Invalid response type from API');
        }
        
    } catch (error) {
        console.error('❌ Mavrix Bot - Meme Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Meme Failed* ❌

╔══════════════════════╗
║     MEME ERROR       ║
╚══════════════════════╝

🎭 *Oops! Meme delivery failed!*

🔧 *What happened:*
• Meme service is busy
• Network issues
• Cheems is resting
• Server timeout

🔄 *Please try:*
1. Use .meme command again
2. Wait a few moments
3. Check your connection

💡 *Alternative:*
Try .joke for some humor!

⚡ *Mavrix Tech - Professional Entertainment*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage
        },{ quoted: message });
    }
}

module.exports = memeCommand;
