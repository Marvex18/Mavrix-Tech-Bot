const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');

const MAVRIX_ASCII = `
╔══════════════════════════════════╗
║           🚀 MAVRIX BOT          ║
║          🎌 ANIME PRO            ║
║        PREMIUM CONTENT v2.0      ║
╚══════════════════════════════════╝
`;

const MAVRIX_SIGNATURE = `
✨ Developed by Mavrix Tech
🎯 Premium Features | ⚡ Lightning Fast
🔒 Secure | 🛠️ Error Free
`;

const ANIMU_BASE = 'https://api.some-random-api.com/animu';

function normalizeType(input) {
    const lower = (input || '').toLowerCase();
    if (lower === 'facepalm' || lower === 'face_palm') return 'face-palm';
    if (lower === 'quote' || lower === 'animu-quote' || lower === 'animuquote') return 'quote';
    return lower;
}

async function sendAnimu(sock, chatId, message, type) {
    const endpoint = `${ANIMU_BASE}/${type}`;
    
    console.log(`🎯 Mavrix Bot - Fetching premium anime content: ${type}`);
    
    try {
        const res = await axios.get(endpoint, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mavrix Bot-Premium/2.0',
                'X-Premium': 'true'
            }
        });
        const data = res.data || {};

        // Premium sticker conversion function
        async function convertMediaToSticker(mediaBuffer, isAnimated) {
            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

            const inputExt = isAnimated ? 'gif' : 'jpg';
            const input = path.join(tmpDir, `mavrix_animu_${Date.now()}.${inputExt}`);
            const output = path.join(tmpDir, `mavrix_animu_${Date.now()}.webp`);
            fs.writeFileSync(input, mediaBuffer);

            console.log(`🎯 Mavrix Bot - Converting to premium sticker...`);

            const ffmpegCmd = isAnimated 
                ? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 80 -compression_level 6 "${output}"`
                : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 85 -compression_level 6 "${output}"`;

            await new Promise((resolve, reject) => {
                exec(ffmpegCmd, (err) => (err ? reject(err) : resolve()));
            });

            let webpBuffer = fs.readFileSync(output);

            // Premium sticker metadata
            const img = new webp.Image();
            await img.load(webpBuffer);

            const json = {
                'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                'sticker-pack-name': '🎌 Mavrix Bot Anime Stickers',
                'sticker-pack-publisher': 'Mavrix Bot Pro',
                'emojis': ['🎌', '✨', '⭐', '🚀'],
                'premium': true,
                'developer': 'Mavrix Tech'
            };
            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
            const exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);
            img.exif = exif;

            const finalBuffer = await img.save(null);

            try { fs.unlinkSync(input); } catch {}
            try { fs.unlinkSync(output); } catch {}
            
            console.log(`✅ Mavrix Bot - Premium sticker conversion complete`);
            return finalBuffer;
        }

        if (data.link) {
            const link = data.link;
            const lower = link.toLowerCase();
            const isGifLink = lower.endsWith('.gif');
            const isImageLink = lower.match(/\.(jpg|jpeg|png|webp)$/);

            // Send processing status
            await sock.sendMessage(chatId, {
                text: `${MAVRIX_ASCII}\n*⚡ PROCESSING ANIME CONTENT...*\n\n*🎌 Type:* ${type}\n*⭐ Quality:* Premium HD\n*📁 Format:* ${isGifLink ? 'Animated' : 'Static'} Sticker\n*🔄 Status:* Converting...\n\n${MAVRIX_SIGNATURE}`
            });

            // Convert all media to premium stickers
            if (isGifLink || isImageLink) {
                try {
                    const resp = await axios.get(link, {
                        responseType: 'arraybuffer',
                        timeout: 20000,
                        headers: { 
                            'User-Agent': 'Mozilla/5.0 (Mavrix Bot-Premium)',
                            'Accept': 'image/*, video/*'
                        }
                    });
                    const mediaBuf = Buffer.from(resp.data);
                    const stickerBuf = await convertMediaToSticker(mediaBuf, isGifLink);
                    
                    console.log(`✅ Mavrix Bot - Sending premium anime sticker: ${type}`);
                    await sock.sendMessage(
                        chatId,
                        { sticker: stickerBuf },
                        { quoted: message }
                    );
                    return;
                } catch (error) {
                    console.error('🎯 Mavrix Bot - Error converting media to sticker:', error);
                }
            }

            // Premium fallback to image
            try {
                await sock.sendMessage(
                    chatId,
                    { 
                        image: { url: link }, 
                        caption: `${MAVRIX_ASCII}\n*🎌 ANIME ${type.toUpperCase()}*\n\n*📡 Source:* Some-Random-API\n*⭐ Quality:* Premium HD\n*🔧 Service:* Mavrix Bot Pro\n\n${MAVRIX_SIGNATURE}` 
                    },
                    { quoted: message }
                );
                return;
            } catch {}
        }
        
        // Premium quote handling
        if (data.quote) {
            await sock.sendMessage(
                chatId,
                { 
                    text: `${MAVRIX_ASCII}\n*💫 ANIME QUOTE OF THE DAY*\n\n"${data.quote}"\n\n*✨ Premium Anime Collection*\n*🔧 Powered by Mavrix Tech*\n\n${MAVRIX_SIGNATURE}` 
                },
                { quoted: message }
            );
            return;
        }

        await sock.sendMessage(
            chatId,
            { 
                text: `${MAVRIX_ASCII}\n*🚨 PREMIUM CONTENT UNAVAILABLE*\n\n❌ Failed to fetch anime ${type}.\n💡 Service might be temporarily busy.\n🔧 Please try again later!\n\n${MAVRIX_SIGNATURE}` 
            },
            { quoted: message }
        );
    } catch (error) {
        console.error('🎯 Mavrix Bot - Premium anime error:', error);
        throw error;
    }
}

async function animeCommand(sock, chatId, message, args) {
    const subArg = args && args[0] ? args[0] : '';
    const sub = normalizeType(subArg);

    const supported = [
        'nom', 'poke', 'cry', 'kiss', 'pat', 'hug', 'wink', 'face-palm', 'quote'
    ];

    try {
        if (!sub) {
            // Premium help message
            try {
                const res = await axios.get(ANIMU_BASE, {
                    headers: { 'X-Premium': 'true' }
                });
                const apiTypes = res.data && res.data.types ? 
                    res.data.types.map(s => s.replace('/animu/', '')).join(', ') : 
                    supported.join(', ');
                    
                await sock.sendMessage(chatId, { 
                    text: `${MAVRIX_ASCII}
*🎌 PREMIUM ANIME COMMANDS*

*💡 Usage:* .animu <type>

*🎯 Available Types:*
${supported.map(type => `• ${type}`).join('\n')}

*⚡ Premium Features:*
• 🎌 High Quality Stickers
• ⚡ Fast Processing
• 🛡️ Premium API Access
• ✨ Auto Media Conversion
• 🚀 Mavrix Bot Technology

*🔧 Example:* .animu hug\n\n${MAVRIX_SIGNATURE}` 
                }, { quoted: message });
            } catch {
                await sock.sendMessage(chatId, { 
                    text: `${MAVRIX_ASCII}\n*🎌 ANIME TYPES*\n\n${supported.map(type => `• ${type}`).join('\n')}\n\n*💡 Usage:* .animu <type>*\n\n${MAVRIX_SIGNATURE}` 
                }, { quoted: message });
            }
            return;
        }

        if (!supported.includes(sub)) {
            await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}\n*🚫 UNSUPPORTED TYPE!*\n\n❌ "${sub}" is not available.\n\n*✅ Supported Types:* ${supported.join(', ')}\n\n${MAVRIX_SIGNATURE}` 
            }, { quoted: message });
            return;
        }

        console.log(`🎯 Mavrix Bot - Processing premium anime request: ${sub}`);
        await sendAnimu(sock, chatId, message, sub);
        
    } catch (err) {
        console.error('🎯 Mavrix Bot - Error in premium anime command:', err);
        await sock.sendMessage(chatId, { 
            text: `${MAVRIX_ASCII}\n*🚨 SERVICE ERROR!*\n\n❌ Failed to fetch anime content.\n💡 Please try again later!\n🔧 Powered by Mavrix Tech\n\n${MAVRIX_SIGNATURE}` 
        }, { quoted: message });
    }
}

module.exports = { animeCommand };
