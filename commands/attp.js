const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { writeExifImg, writeExifVid } = require('../lib/exif');

const PREMIUM_ASCII = `
╔══════════════════════════╗
║     ✨ ATTP PRO          ║
║   PREMIUM TEXT EFFECTS   ║
╚══════════════════════════╝
`;

async function attpCommand(sock, chatId, message) {
    const userMessage = message.message.conversation || message.message.extendedTextMessage?.text || '';
    const text = userMessage.split(' ').slice(1).join(' ');

    if (!text) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*✨ PREMIUM TEXT TO STICKER*

*❌ MISSING TEXT!*
Please provide text to convert!

*💡 Examples:*
.attp Hello World
.attp Knight Bot
.attp Premium Effects

*⚡ Features:*
• 🎨 Rainbow Color Effects
• ✨ Smooth Animations
• ⚡ Fast Processing
• 🛡️ Premium Quality` 
        }, { quoted: message });
        return;
    }

    try {
        // Premium processing message
        await sock.sendMessage(chatId, {
            react: { text: '⚡', key: message.key }
        });

        await sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*⚡ CREATING PREMIUM STICKER...*\n\n*Text:* "${text}"\n*Effect:* 🎨 Rainbow Blink\n*Quality:* ✨ Premium\n*Status:* Rendering...`
        }, { quoted: message });

        console.log(`✨ Generating premium ATTP sticker: "${text}"`);
        
        const mp4Buffer = await renderBlinkingVideoWithFfmpeg(text);
        const webpPath = await writeExifVid(mp4Buffer, { 
            packname: '✨ Knight Bot Premium',
            author: '🎨 ATTP Pro Effects',
            premium: true
        });
        const webpBuffer = fs.readFileSync(webpPath);
        try { fs.unlinkSync(webpPath) } catch (_) {}
        
        // Success status
        await sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*✅ STICKER READY!*\n\nSending premium animated text sticker...`
        });

        await sock.sendMessage(chatId, { 
            sticker: webpBuffer,
            caption: `${PREMIUM_ASCII}*✨ PREMIUM TEXT STICKER*\n\n*Text:* ${text}\n*Effect:* 🎨 Rainbow Blink\n*Quality:* ⚡ Premium\n*Service:* Knight Bot Pro`
        }, { quoted: message });

        console.log(`✅ Premium ATTP sticker sent successfully`);

    } catch (error) {
        console.error('🚨 Error generating premium sticker:', error);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🚨 CREATION FAILED!*\n\nFailed to generate the premium sticker.\n\n*Possible Reasons:*\n• 🔧 FFmpeg not installed\n• 💾 Insufficient memory\n• ⚠️ Text too long\n\n*💡 Solution:* Try shorter text or check server setup.` 
        }, { quoted: message });
    }
}

module.exports = attpCommand;

function renderTextToPngWithFfmpeg(text) {
    return new Promise((resolve, reject) => {
        const fontPath = process.platform === 'win32'
            ? 'C:/Windows/Fonts/arialbd.ttf'
            : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

        const escapeDrawtextText = (s) => s
            .replace(/\\/g, '\\\\')
            .replace(/:/g, '\\:')
            .replace(/'/g, "\\'")
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/%/g, '\\%');

        const safeText = escapeDrawtextText(text);
        const safeFontPath = process.platform === 'win32'
            ? fontPath.replace(/\\/g, '/').replace(':', '\\:')
            : fontPath;

        const args = [
            '-y',
            '-f', 'lavfi',
            '-i', 'color=c=#00000000:s=512x512',
            '-vf', `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=white:fontsize=56:borderw=2:bordercolor=black@0.6:x=(w-text_w)/2:y=(h-text_h)/2`,
            '-frames:v', '1',
            '-f', 'image2',
            'pipe:1'
        ];

        console.log('🎨 Rendering premium text image...');
        const ff = spawn('ffmpeg', args);
        const chunks = [];
        const errors = [];
        ff.stdout.on('data', d => chunks.push(d));
        ff.stderr.on('data', e => errors.push(e));
        ff.on('error', reject);
        ff.on('close', code => {
            if (code === 0) return resolve(Buffer.concat(chunks));
            reject(new Error(Buffer.concat(errors).toString() || `ffmpeg exited with code ${code}`));
        });
    });
}

function renderBlinkingVideoWithFfmpeg(text) {
    return new Promise((resolve, reject) => {
        const fontPath = process.platform === 'win32'
            ? 'C:/Windows/Fonts/arialbd.ttf'
            : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

        const escapeDrawtextText = (s) => s
            .replace(/\\/g, '\\\\')
            .replace(/:/g, '\\:')
            .replace(/,/g, '\\,')
            .replace(/'/g, "\\'")
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/%/g, '\\%');

        const safeText = escapeDrawtextText(text);
        const safeFontPath = process.platform === 'win32'
            ? fontPath.replace(/\\/g, '/').replace(':', '\\:')
            : fontPath;

        // Premium rainbow blink effect
        const cycle = 0.3;
        const dur = 2.0; // Extended duration

        const drawRed = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=red:borderw=3:bordercolor=black@0.8:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='lt(mod(t\,${cycle})\,0.1)'`;
        const drawBlue = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=blue:borderw=3:bordercolor=black@0.8:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(mod(t\,${cycle})\,0.1\,0.2)'`;
        const drawGreen = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=green:borderw=3:bordercolor=black@0.8:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='gte(mod(t\,${cycle})\,0.2)'`;
        const drawGold = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=yellow:borderw=3:bordercolor=black@0.8:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(mod(t\,${cycle})\,0.2\,0.3)'`;

        const filter = `${drawRed},${drawBlue},${drawGreen},${drawGold}`;

        const args = [
            '-y',
            '-f', 'lavfi',
            '-i', `color=c=black:s=512x512:d=${dur}:r=25`, // Higher frame rate
            '-vf', filter,
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart+frag_keyframe+empty_moov',
            '-t', String(dur),
            '-f', 'mp4',
            'pipe:1'
        ];

        console.log('🌈 Generating premium rainbow text animation...');
        const ff = spawn('ffmpeg', args);
        const chunks = [];
        const errors = [];
        ff.stdout.on('data', d => chunks.push(d));
        ff.stderr.on('data', e => errors.push(e));
        ff.on('error', reject);
        ff.on('close', code => {
            if (code === 0) {
                console.log('✅ Premium animation rendered successfully');
                return resolve(Buffer.concat(chunks));
            }
            reject(new Error(Buffer.concat(errors).toString() || `ffmpeg exited with code ${code}`));
        });
    });
                       }
