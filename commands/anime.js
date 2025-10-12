const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');

const PREMIUM_ASCII = `
╔══════════════════════════╗
║     🎌 ANIME PRO        ║
║   PREMIUM CONTENT       ║
╚══════════════════════════╝
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
    
    console.log(`🎌 Fetching premium anime content: ${type}`);
    
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
            const input = path.join(tmpDir, `animu_premium_${Date.now()}.${inputExt}`);
            const output = path.join(tmpDir, `animu_premium_${Date.now()}.webp`);
            fs.writeFileSync(input, mediaBuffer);

            console.log(`🔄 Converting to premium sticker...`);

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
                'sticker-pack-name': '🎌 Anime Premium Stickers',
                'sticker-pack-publisher': 'Knight Bot Pro',
                'emojis': ['🎌', '✨', '⭐'],
                'premium': true
            };
            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
            const exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);
            img.exif = exif;

            const finalBuffer = await img.save(null);

            try { fs.unlinkSync(input); } catch {}
            try { fs.unlinkSync(output); } catch {}
            
            console.log(`✅ Premium sticker conversion complete`);
            return finalBuffer;
        }

        if (data.link) {
            const link = data.link;
            const lower = link.toLowerCase();
            const isGifLink = lower.endsWith('.gif');
            const isImageLink = lower.match(/\.(jpg|jpeg|png|webp)$/);

            // Send processing status
            await sock.sendMessage(chatId, {
                text: `${PREMIUM_ASCII}*⚡ PROCESSING ANIME CONTENT...*\n\n*Type:* ${type}\n*Quality:* 🎌 Premium\n*Format:* ${isGifLink ? 'Animated' : 'Static'} Sticker\n*Status:* Converting...`
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
                    
                    console.log(`✅ Sending premium anime sticker: ${type}`);
                    await sock.sendMessage(
                        chatId,
                        { sticker: stickerBuf },
                        { quoted: message }
                    );
                    return;
                } catch (error) {
                    console.error('🚨 Error converting media to sticker:', error);
                }
            }

            // Premium fallback to image
            try {
                await sock.sendMessage(
                    chatId,
                    { 
                        image: { url: link }, 
                        caption: `${PREMIUM_ASCII}*🎌 ANIME ${type.toUpperCase()}*\n\n*Source:* Some-Random-API\n*Quality:* 🖼️ Premium\n*Service:* Knight Bot Pro` 
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
                    text: `${PREMIUM_ASCII}*💫 ANIME QUOTE*\n\n"${data.quote}"\n\n*✨ Premium Anime Collection*` 
                },
                { quoted: message }
            );
            return;
        }

        await sock.sendMessage(
            chatId,
            { 
                text: `${PREMIUM_ASCII}*🚨 PREMIUM CONTENT UNAVAILABLE*\n\nFailed to fetch anime ${type}. Service might be busy.` 
            },
            { quoted: message }
        );
    } catch (error) {
        console.error('🚨 Premium anime error:', error);
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
                    text: `${PREMIUM_ASCII}
*🎌 PREMIUM ANIME COMMANDS*

*Usage:* .animu <type>

*🎯 Available Types:*
${supported.map(type => `• ${type}`).join('\n')}

*⚡ Premium Features:*
• 🎌 High Quality Stickers
• ⚡ Fast Processing
• 🛡️ Premium API
• ✨ Auto Conversion

*💡 Example:* .animu hug` 
                }, { quoted: message });
            } catch {
                await sock.sendMessage(chatId, { 
                    text: `${PREMIUM_ASCII}*🎌 ANIME TYPES*\n\n${supported.map(type => `• ${type}`).join('\n')}\n\n*Usage:* .animu <type>*` 
                }, { quoted: message });
            }
            return;
        }

        if (!supported.includes(sub)) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🚫 UNSUPPORTED TYPE!*\n\n"${sub}" is not available.\n\n*✅ Supported:* ${supported.join(', ')}` 
            }, { quoted: message });
            return;
        }

        console.log(`🎌 Processing premium anime request: ${sub}`);
        await sendAnimu(sock, chatId, message, sub);
        
    } catch (err) {
        console.error('🚨 Error in premium anime command:', err);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🚨 SERVICE ERROR!*\n\nFailed to fetch anime content. Please try again later!` 
        }, { quoted: message });
    }
}

module.exports = { animeCommand };
