// remini.js
const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(sock, message) {
    try {
        // 1) Quoted image (highest priority)
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted?.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            return await uploadImage(buffer);
        }

        // 2) Image in the current message
        if (message.message?.imageMessage) {
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            return await uploadImage(buffer);
        }

        return null;
    } catch (error) {
        console.error('❌ Mavrix Bot - Image Processing Error:', error);
        return null;
    }
}

async function reminiCommand(sock, chatId, message, args) {
    try {
        console.log('✨ Mavrix Bot - Remini Command Activated');
        
        let imageUrl = null;
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `✨ *Mavrix Bot - AI Enhancement* ✨

╔══════════════════════╗
║   ENHANCING IMAGE    ║
╚══════════════════════╝

⚡ *Status:* Initializing AI...
🎨 *Engine:* Mavrix Remini AI v2.0
🔄 *Process:* Analyzing image quality...

💫 *Premium AI enhancement in progress...*
⏳ *This may take a few moments...*`
        }, { quoted: message });

        // Check if args contain a URL
        if (args.length > 0) {
            const url = args.join(' ');
            if (isValidUrl(url)) {
                imageUrl = url;
            } else {
                return sock.sendMessage(chatId, { 
                    text: `❌ *Mavrix Bot - Invalid URL* ❌

╔══════════════════════╗
║     URL ERROR        ║
╚══════════════════════╝

🚨 *Invalid URL provided!*

💡 *Usage Examples:*
.remini https://example.com/image.jpg
.remini (reply to image)
.remini (send image with caption)

⚡ *Mavrix Tech - AI Enhancement*`
                }, { quoted: message });
            }
        } else {
            // Try to get image from message or quoted message
            imageUrl = await getQuotedOrOwnImageUrl(sock, message);
            
            if (!imageUrl) {
                return sock.sendMessage(chatId, { 
                    text: `✨ *Mavrix Bot - Remini AI* ✨

╔══════════════════════╗
║   IMAGE ENHANCEMENT  ║
╚══════════════════════╝

📸 *Premium AI Image Enhancement*

💡 *How to use:*
• \`.remini <image_url>\`
• Reply to an image with \`.remini\`
• Send image with \`.remini\`

🎯 *Examples:*
.remini https://example.com/photo.jpg
.remini (reply to blurry image)

⚡ *Features:*
• HD Quality Enhancement
• Noise Reduction
• Sharpness Improvement
• Color Correction

💫 *Powered by Mavrix AI Technology*`
                }, { quoted: message });
            }
        }

        // Update progress
        await sock.sendMessage(chatId, {
            text: `🔄 *Processing Image...*
            
⚡ *Status:* Uploading to AI server...
🎨 *Stage:* Initial enhancement...
✨ *Quality:* Premium HD Enhancement`
        }, { quoted: message });

        // Call the Remini API
        const apiUrl = `https://api.princetechn.com/api/tools/remini?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(imageUrl)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.data && response.data.success && response.data.result) {
            const result = response.data.result;
            
            if (result.image_url) {
                // Download the enhanced image
                const imageResponse = await axios.get(result.image_url, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                
                if (imageResponse.status === 200 && imageResponse.data) {
                    // Send the enhanced image
                    await sock.sendMessage(chatId, {
                        image: imageResponse.data,
                        caption: `✨ *Mavrix Bot - Enhancement Complete* ✨

╔══════════════════════╗
║     HD RESULT        ║
╚══════════════════════╝

✅ *Status:* Successfully Enhanced
🎨 *Quality:* Premium HD
⚡ *Technology:* Mavrix AI

💫 *Image enhanced with professional AI*
📊 *Resolution:* Ultra High Definition
🎯 *Clarity:* Maximum Sharpness

⚡ *Enhanced by Mavrix Bot AI Technology*
🌟 *Professional Grade Results*`
                    }, { quoted: message });
                } else {
                    throw new Error('Failed to download enhanced image');
                }
            } else {
                throw new Error(result.message || 'Failed to enhance image');
            }
        } else {
            throw new Error('API returned invalid response');
        }

    } catch (error) {
        console.error('❌ Mavrix Bot - Remini Command Error:', error);
        
        let errorMessage = `❌ *Mavrix Bot - Enhancement Failed* ❌

╔══════════════════════╗
║     AI ERROR         ║
╚══════════════════════╝

🚨 *Failed to enhance image!*`;
        
        if (error.response?.status === 429) {
            errorMessage += '\n\n⏰ *Rate limit exceeded!*\nPlease try again in a few minutes.';
        } else if (error.response?.status === 400) {
            errorMessage += '\n\n❌ *Invalid image format!*\nPlease use a different image.';
        } else if (error.response?.status === 500) {
            errorMessage += '\n\n🔧 *AI service busy!*\nPlease try again later.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage += '\n\n⏰ *Processing timeout!*\nImage was too complex.';
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            errorMessage += '\n\n🌐 *Network error!*\nCheck your connection.';
        } else {
            errorMessage += '\n\n🔧 *Technical issue!*\nPlease try with a different image.';
        }
        
        errorMessage += '\n\n⚡ *Mavrix Tech - AI Services*';
        
        await sock.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: message });
    }
}

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

module.exports = { reminiCommand };
