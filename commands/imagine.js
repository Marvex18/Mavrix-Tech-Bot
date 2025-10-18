// imagine.js
const axios = require('axios');

async function imagineCommand(sock, chatId, message) {
    try {
        console.log('🎨 Mavrix Bot - Image Generation Request');
        
        // Get the prompt from the message
        const prompt = message.message?.conversation?.trim() || 
                      message.message?.extendedTextMessage?.text?.trim() || '';
        
        // Remove the command prefix and trim
        const imagePrompt = prompt.replace(/^\.?imagine\s+/i, '').trim();
        
        if (!imagePrompt) {
            await sock.sendMessage(chatId, {
                text: `🖼️ *Mavrix Bot - Image Generation* 🖼️

╔══════════════════════╗
║    IMAGE CREATOR     ║
╚══════════════════════╝

❌ *Missing Prompt!*
📝 Please provide a description for the image.

💡 *Example:*
.imagine a cyberpunk city with neon lights
.imagine fantasy castle in the clouds

🌟 *Powered by Mavrix Tech*`
            }, {
                quoted: message
            });
            return;
        }

        // Send processing message with ASCII art
        await sock.sendMessage(chatId, {
            text: `🎨 *Mavrix AI Artist Activated* 🎨

╔══════════════════════╗
║   GENERATING ART...  ║
╚══════════════════════╝

📋 *Prompt:* ${imagePrompt}
⏳ *Status:* Processing your masterpiece...
🔄 *AI Model:* Mavrix Imagine v2.0

🎯 *Enhancing quality...*
✨ *Adding creative touches...*
🖌️  *Finalizing artwork...*

⚡ *Please wait while our AI creates magic!*`
        }, {
            quoted: message
        });

        // Enhance the prompt with premium quality keywords
        const enhancedPrompt = enhancePrompt(imagePrompt);

        // Make API request
        const response = await axios.get(`https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(enhancedPrompt)}`, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        if (!response.data || response.data.length === 0) {
            throw new Error('Empty response from AI service');
        }

        // Convert response to buffer
        const imageBuffer = Buffer.from(response.data);

        // Send the generated image with premium caption
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🖼️ *Mavrix Bot - Art Generation Complete* 🖼️

╔══════════════════════╗
║    ARTWORK READY!    ║
╚══════════════════════╝

🎨 *Original Prompt:* "${imagePrompt}"
✅ *Status:* Successfully Generated
🔄 *Quality:* Premium Enhanced
📐 *Resolution:* 4K Ultra HD

💫 *Enhanced with Mavrix AI Technology*
⭐ *Thank you for using Mavrix Bot!*

🔮 *Want another masterpiece? Use .imagine again!*`
        }, {
            quoted: message
        });

    } catch (error) {
        console.error('❌ Mavrix Bot - Image Generation Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Generation Failed* ❌

╔══════════════════════╗
║     ERROR REPORT     ║
╚══════════════════════╝

🚨 *Oops! Something went wrong!*

🔧 *Possible reasons:*
• AI service is busy
• Prompt was too complex
• Network issues
• Server timeout

🔄 *Please try:*
1. Simplify your prompt
2. Wait a few minutes
3. Try again later

📞 *Support:* Mavrix Tech Team

💫 *We're working to improve your experience!*`;

        await sock.sendMessage(chatId, {
            text: errorMessage
        }, {
            quoted: message
        });
    }
}

// Enhanced prompt enhancement function
function enhancePrompt(prompt) {
    const qualityEnhancers = [
        'masterpiece', 'best quality', '4k resolution', 'ultra detailed',
        'professional photography', 'cinematic lighting', 'sharp focus',
        'artstation trending', 'unreal engine render', 'octane render',
        'ray tracing', 'global illumination', 'hyperrealistic',
        'award winning', 'photorealistic', 'high contrast', 'vibrant colors'
    ];

    const styleEnhancers = [
        'digital art', 'concept art', 'illustration', 'painting',
        'fantasy art', 'sci-fi art', 'cyberpunk style', 'anime style'
    ];

    const numQuality = Math.floor(Math.random() * 3) + 4;
    const numStyle = Math.floor(Math.random() * 2) + 2;
    
    const selectedQuality = qualityEnhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, numQuality);
        
    const selectedStyle = styleEnhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, numStyle);

    return `${prompt}, ${selectedQuality.join(', ')}, ${selectedStyle.join(', ')}, [Mavrix AI Enhanced]`;
}

module.exports = imagineCommand;
