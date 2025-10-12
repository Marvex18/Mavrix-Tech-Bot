// ai.js (Premium Enhanced)
const axios = require('axios');
const fetch = require('node-fetch');

// Premium ASCII Art
const PREMIUM_ART = `
╔═══════════════════════════╗
║    🤖 PREMIUM AI SUITE    ║
║          💎 ELITE         ║
╚═══════════════════════════╝
`;

const PROCESSING_ART = `
⏳ ▰▰▰▰▰▰▰▰▰▰ 95%
💎 PROCESSING YOUR REQUEST
`;

async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: `💎 *PREMIUM AI ASSISTANT* 💎

${PREMIUM_ART}
📝 *Usage:* 
┌・.gpt <your_question>
├・.gemini <your_question>
└・Example: .gpt write a python script

✨ *Features:*
• GPT-4 Turbo Technology 🚀
• Gemini Pro AI Integration 
• Ultra Fast Responses ⚡
• Premium Quality Output 💎`
            }, {
                quoted: message
            });
        }

        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: `❌ *INVALID INPUT* ❌

💡 Please provide your question after the command:
┌・.gpt <your_question>
└・.gemini <your_question>

${PREMIUM_ART}`
            }, {quoted:message});
        }

        try {
            // Premium processing indicator
            await sock.sendMessage(chatId, {
                react: { text: '💎', key: message.key }
            });

            const processingMsg = await sock.sendMessage(chatId, {
                text: `🔄 *AI IS THINKING...* 🔄

${PROCESSING_ART}
📊 Analyzing your request...
⚡ Processing with premium AI...`
            });

            if (command === '.gpt') {
                const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`);
                
                if (response.data && response.data.success && response.data.result) {
                    const answer = response.data.result.prompt;
                    
                    // Delete processing message
                    await sock.sendMessage(chatId, { 
                        delete: processingMsg.key 
                    });

                    await sock.sendMessage(chatId, {
                        text: `🤖 *CHATGPT PREMIUM RESPONSE* 💎

📥 *Your Query:*
${query}

💡 *AI Response:*
${answer}

${PREMIUM_ART}
✨ *Powered by Premium AI Suite*`
                    }, {
                        quoted: message
                    });
                    
                } else {
                    throw new Error('Invalid response from API');
                }
            } else if (command === '.gemini') {
                const apis = [
                    `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                    `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                    `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
                    `https://api.dreaded.site/api/gemini2?text=${encodeURIComponent(query)}`,
                    `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
                    `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`
                ];

                for (const api of apis) {
                    try {
                        const response = await fetch(api);
                        const data = await response.json();

                        if (data.message || data.data || data.answer || data.result) {
                            const answer = data.message || data.data || data.answer || data.result;
                            
                            // Delete processing message
                            await sock.sendMessage(chatId, { 
                                delete: processingMsg.key 
                            });

                            await sock.sendMessage(chatId, {
                                text: `🔮 *GEMINI PRO RESPONSE* 💎

📥 *Your Query:*
${query}

💡 *AI Response:*
${answer}

${PREMIUM_ART}
🚀 *Enhanced by Gemini Pro Technology*`
                            }, {
                                quoted: message
                            });
                            
                            return;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                throw new Error('All Gemini APIs failed');
            }
        } catch (error) {
            console.error('API Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ *PREMIUM SERVICE ERROR* ❌

😔 Sorry, our premium AI service is temporarily unavailable.

🔧 *Troubleshooting:*
• Check your internet connection 📶
• Try again in a few moments ⏳
• Contact support if issue persists 🛠️

${PREMIUM_ART}
💎 We're working to restore service immediately.`
            }, {
                quoted: message
            });
        }
    } catch (error) {
        console.error('AI Command Error:', error);
        await sock.sendMessage(chatId, {
            text: `💥 *SYSTEM ERROR* 💥

🚨 An unexpected error occurred in our premium AI system.

${PREMIUM_ART}
🔧 Our technical team has been notified.
📞 Please try again shortly.`
        }, {
            quoted: message
        });
    }
}

module.exports = aiCommand;
