// emojimix.js
const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Premium ASCII Art
const PREMIUM_ASCII = `
╔══════════════════════════╗
║     🎨 MAVRIX BOT       ║
║    PREMIUM EMOJI MIXER  ║
╚══════════════════════════╝
`;

// Working API endpoints - tested and reliable
const WORKING_APIS = [
    {
        name: "Emoji Kitchen API",
        url: (emoji1, emoji2) => `https://emojik.vercel.app/s/${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}?type=png`,
        handler: async (url) => {
            const response = await fetch(url);
            if (response.status === 200) {
                return url;
            }
            return null;
        }
    },
    {
        name: "Google Emoji Kitchen",
        url: (emoji1, emoji2) => `https://www.gstatic.com/android/keyboard/emojikitchen/${getEmojiDate()}/u${getEmojiCode(emoji1)}/u${getEmojiCode(emoji1)}_u${getEmojiCode(emoji2)}.png`,
        handler: async (url) => {
            try {
                const response = await fetch(url);
                if (response.status === 200) {
                    return url;
                }
            } catch (e) {
                return null;
            }
            return null;
        }
    },
    {
        name: "Tenor Emoji Mix",
        url: (emoji1, emoji2) => `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`,
        handler: async (url) => {
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.results && data.results.length > 0 && data.results[0].url) {
                    return data.results[0].url;
                }
            } catch (e) {
                return null;
            }
            return null;
        }
    }
];

// Helper function to get emoji Unicode code point
function getEmojiCode(emoji) {
    return emoji.codePointAt(0).toString(16).toLowerCase();
}

// Helper function to get date for Google emoji kitchen
function getEmojiDate() {
    const dates = [
        '20201001', '20210521', '20210831', '20220110', 
        '20220501', '20220815', '20221101', '20230205'
    ];
    return dates[Math.floor(Math.random() * dates.length)];
}

// Popular working emoji combinations
const POPULAR_COMBINATIONS = [
    ['😊', '😂'], ['❤️', '🔥'], ['😎', '🥰'], ['🤣', '😍'],
    ['😭', '😂'], ['🥺', '❤️'], ['🙏', '❤️'], ['🎉', '🔥'],
    ['💀', '😂'], ['✨', '❤️'], ['🤔', '💭'], ['😴', '💤'],
    ['🤩', '🌟'], ['😡', '💥'], ['🥶', '🔥'], ['🤯', '💥'],
    ['🥰', '💕'], ['😋', '🍕'], ['😏', '💅'], ['🙈', '💕']
];

// Validate if emoji is supported
function isValidEmoji(emoji) {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    return emojiRegex.test(emoji) && emoji.length <= 2;
}

async function emojimixCommand(sock, chatId, msg) {
    try {
        const text = msg.message?.conversation?.trim() || 
                    msg.message?.extendedTextMessage?.text?.trim() || '';
        
        const args = text.split(' ').slice(1);
        
        if (!args[0]) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*🎨 MAVRIX EMOJI MIXER*\n\n╔══════════════════════════╗\n║   HOW TO USE            ║
╚══════════════════════════╝\n\n✨ *Basic Usage:*\n.emojimix 😊+😂\n\n🎭 *Advanced Features:*\n• Supports 1000+ emoji combinations\n• HD 512x512 quality\n• Instant processing\n\n🔥 *Popular Examples:*\n${POPULAR_COMBINATIONS.slice(0, 5).map(combo => `• .emojimix ${combo[0]}+${combo[1]}`).join('\n')}\n\n*🔰 Mavrix Tech - Premium Emoji Engine*`
            }, { quoted: msg });
            return;
        }

        // Parse emojis
        const emojis = args[0].split('+').map(e => e.trim()).filter(e => e);
        
        if (emojis.length !== 2) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*❌ INVALID FORMAT!*\n\n╔══════════════════════════╗\n║   FORMAT ERROR          ║
╚══════════════════════════╝\n\nPlease use exactly 2 emojis separated by +\n\n📌 *Correct Format:*\n.emojimix 😊+😂\n\n💡 *Working Examples:*\n${POPULAR_COMBINATIONS.slice(0, 3).map(combo => `• ${combo[0]} + ${combo[1]}`).join('\n')}\n\n*🔰 Mavrix Tech - Premium Mixer*`
            }, { quoted: msg });
            return;
        }

        // Validate emojis
        const [emoji1, emoji2] = emojis;
        if (!isValidEmoji(emoji1) || !isValidEmoji(emoji2)) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*❌ INVALID EMOJIS!*\n\n╔══════════════════════════╗\n║   VALIDATION ERROR      ║
╚══════════════════════════╝\n\nPlease use valid single emojis only!\n\n🚫 *Don't Use:*\n• Skin tone modifiers (🏻🏼🏽🏾🏿)\n• Sequence emojis (👨‍👩‍👧‍👦)\n• Text or symbols\n\n✅ *Do Use:*\n• Basic emojis: 😊, ❤️, 🎉, ✨\n• Single character emojis only\n\n*🔰 Mavrix Tech - Emoji Validation*`
            }, { quoted: msg });
            return;
        }

        // Show premium processing message
        const processingMsg = await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🔄 MAVRIX MIXING ENGINE*\n\n╔══════════════════════════╗\n║   PROCESSING EMOJIS     ║
╚══════════════════════════╝\n\n🎨 *Mixing:* ${emoji1} + ${emoji2}\n⚡ *Engine:* Premium Mixer v2.0\n📊 *API Pool:* ${WORKING_APIS.length} endpoints\n\n⏳ *Status:* Initializing mix...\n\n*🔰 Mavrix Tech - Advanced Processing*`
        }, { quoted: msg });

        let imageUrl = null;
        let successfulAPI = null;
        
        // Try all APIs sequentially
        for (const api of WORKING_APIS) {
            try {
                console.log(`🔄 Mavrix Mixer: Trying ${api.name}...`);
                
                // Update processing message
                await sock.sendMessage(chatId, { 
                    text: `${PREMIUM_ASCII}
*🔄 MAVRIX MIXING ENGINE*\n\n╔══════════════════════════╗\n║   PROCESSING EMOJIS     ║
╚══════════════════════════╝\n\n🎨 *Mixing:* ${emoji1} + ${emoji2}\n⚡ *Engine:* ${api.name}\n📊 *Status:* Attempting combination...\n\n🔍 Checking compatibility...\n\n*🔰 Mavrix Tech - API: ${api.name}*`
                }, { quoted: msg });

                const url = api.url(emoji1, emoji2);
                imageUrl = await api.handler(url);
                
                if (imageUrl) {
                    successfulAPI = api.name;
                    console.log(`✅ Mavrix Mixer: Success with ${api.name}`);
                    break;
                }
            } catch (apiError) {
                console.warn(`❌ Mavrix Mixer: ${api.name} failed:`, apiError.message);
                continue;
            }
        }

        if (!imageUrl) {
            // Suggest popular combinations
            const suggestions = POPULAR_COMBINATIONS.slice(0, 5)
                .map(combo => `• ${combo[0]} + ${combo[1]}`)
                .join('\n');
            
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*❌ MIXING FAILED!*\n\n╔══════════════════════════╗\n║   COMBINATION ERROR     ║
╚══════════════════════════╝\n\n😔 *Unable to mix:* ${emoji1} + ${emoji2}\n\n💡 *Possible Reasons:*\n• Emoji combination not supported\n• API service temporarily down\n• Rare emoji compatibility issue\n\n🎯 *Try These Working Combinations:*\n${suggestions}\n\n✨ *Tip:* Use common emojis for best results\n\n*🔰 Mavrix Tech - Support*`
            }, { quoted: msg });
            return;
        }

        // Create temp directory
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const tempFile = path.join(tmpDir, `emoji_mix_${Date.now()}.png`);
        const outputFile = path.join(tmpDir, `sticker_${Date.now()}.webp`);

        try {
            // Download the image
            console.log(`📥 Mavrix Mixer: Downloading from ${successfulAPI}`);
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Download failed: ${imageResponse.status}`);
            }

            const buffer = await imageResponse.buffer();
            fs.writeFileSync(tempFile, buffer);

            // Update progress
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*🔄 MAVRIX MIXING ENGINE*\n\n╔══════════════════════════╗\n║   FINALIZING MIX        ║
╚══════════════════════════╝\n\n🎨 *Mixing:* ${emoji1} + ${emoji2}\n✅ *API:* ${successfulAPI}\n⚡ *Status:* Converting to sticker...\n\n🔄 Optimizing image quality...\n\n*🔰 Mavrix Tech - Final Processing*`
            }, { quoted: msg });

            // Convert to WebP sticker with better settings
            const ffmpegCommand = `ffmpeg -i "${tempFile}" -vf "scale=512:512:flags=lanczos" -c:v libwebp -quality 85 -preset picture -an -vsync 0 -frames:v 1 "${outputFile}"`;
            
            await new Promise((resolve, reject) => {
                exec(ffmpegCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error('FFmpeg error:', error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            if (!fs.existsSync(outputFile)) {
                throw new Error('Sticker creation failed');
            }

            const stickerBuffer = fs.readFileSync(outputFile);
            const fileStats = fs.statSync(outputFile);

            console.log(`✅ Mavrix Mixer: Sticker created - ${fileStats.size} bytes`);

            // Send success message
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*✅ EMOJI MIX SUCCESSFUL!*\n\n╔══════════════════════════╗\n║   MIX CREATED           ║
╚══════════════════════════╝\n\n🎨 *Combination:* ${emoji1} + ${emoji2}\n📊 *API Used:* ${successfulAPI}\n💎 *Quality:* HD 512x512\n📁 *Size:* ${(fileStats.size / 1024).toFixed(1)}KB\n\n✨ *Mix ID:* #${Math.random().toString(36).substr(2, 8).toUpperCase()}\n\n*🔰 Powered by Mavrix Tech - Premium Mixer*`
            }, { quoted: msg });

            // Send the sticker
            await sock.sendMessage(chatId, { 
                sticker: stickerBuffer 
            }, { quoted: msg });

            console.log(`🎉 Mavrix Mixer: Successfully delivered ${emoji1}+${emoji2} mix`);

        } finally {
            // Cleanup temp files
            try {
                if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
            } catch (err) {
                console.error('Mavrix Mixer Cleanup error:', err);
            }
        }

    } catch (error) {
        console.error('Mavrix Emojimix Command Error:', error);
        
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*❌ SYSTEM ERROR!*\n\n╔══════════════════════════╗\n║   PROCESSING FAILED     ║
╚══════════════════════════╝\n\n😔 Emoji mixing service is temporarily unavailable!\n\n🔧 *Technical Details:*\n${error.message}\n\n💡 *Quick Fixes:*\n• Try again in 30 seconds\n• Use different emoji combination\n• Check your internet connection\n\n*🔰 Mavrix Tech Support - Premium Systems*`
        }, { quoted: msg });
    }
}

// Export popular combinations for help command
module.exports = {
    emojimixCommand,
    POPULAR_COMBINATIONS
};
