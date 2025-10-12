const axios = require('axios');

const PREMIUM_ASCII = `
╔═══════════════════════╗
║     🎬 SORA AI PRO    ║
║    PREMIUM CREATOR    ║
╚═══════════════════════╝
`;

async function soraCommand(sock, chatId, message) {
    try {
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        // Extract prompt after command keyword or use quoted text
        const used = (rawText || '').split(/\s+/)[0] || '.sora';
        const args = rawText.slice(used.length).trim();
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const input = args || quotedText;

        if (!input) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🎬 SORA AI VIDEO GENERATOR*\n\n*❌ Please provide a prompt!*\n\n*Example:*\n.sora anime girl with short blue hair, cinematic, 4k\n\n*💡 Tip:* Be descriptive for better results!` 
            }, { quoted: message });
            return;
        }

        // Premium loading message
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*⚡ PROCESSING YOUR REQUEST...*\n\n*Prompt:* ${input}\n*Status:* 🎬 Generating video...\n*Time:* ⏳ 30-60 seconds\n\n*✨ Premium AI Model Active*` 
        }, { quoted: message });

        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/txt2video?text=${encodeURIComponent(input)}`;
        const { data } = await axios.get(apiUrl, { 
            timeout: 120000, 
            headers: { 
                'user-agent': 'Mozilla/5.0 (Premium Sora AI Client)',
                'x-premium': 'true'
            } 
        });

        const videoUrl = data?.videoUrl || data?.result || data?.data?.videoUrl;
        if (!videoUrl) {
            throw new Error('🚨 No video URL received from AI service');
        }

        // Success message with premium formatting
        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `${PREMIUM_ASCII}*🎬 SORA AI VIDEO GENERATED!*\n\n*Prompt:* ${input}\n*Quality:* 🎥 4K Premium\n*Model:* 🤖 Sora AI v2\n*Status:* ✅ Success\n\n*✨ Powered by Knight Bot Premium*`
        }, { quoted: message });

        console.log(`✅ Sora AI Premium: Video generated for prompt: ${input}`);

    } catch (error) {
        console.error('🚨 [SORA PREMIUM] error:', error?.message || error);
        
        let errorMessage = `${PREMIUM_ASCII}*🚨 GENERATION FAILED!*\n\n`;
        
        if (error.code === 'ECONNABORTED') {
            errorMessage += '*Reason:* ⏰ Request timeout\n*Solution:* Try a shorter prompt or try again later';
        } else if (error.response?.status === 429) {
            errorMessage += '*Reason:* 🚫 Rate limit exceeded\n*Solution:* Please wait before making another request';
        } else {
            errorMessage += '*Reason:* 🔧 Service temporarily unavailable\n*Solution:* Try again in a few minutes';
        }
        
        errorMessage += '\n\n*💡 Tip:* Keep prompts under 50 words for best results';
        
        await sock.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: message });
    }
}

module.exports = soraCommand;
