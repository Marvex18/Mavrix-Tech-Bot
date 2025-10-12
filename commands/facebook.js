const axios = require('axios');
const fs = require('fs');
const path = require('path');

const PREMIUM_ASCII = `
╔══════════════════════════╗
║     📱 FACEBOOK PRO     ║
║   PREMIUM DOWNLOADER    ║
╚══════════════════════════╝
`;

async function facebookCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const url = text.split(' ').slice(1).join(' ').trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}
*📱 FACEBOOK VIDEO DOWNLOADER*

*❌ MISSING URL!*
Please provide a Facebook video URL.

*💡 Example:*
.fb https://www.facebook.com/watch/?v=123456789

*⚡ Features:*
• 🎥 HD Video Download
• 🔗 Auto URL Resolution
• ⚡ Fast Processing
• 🛡️ Premium API`
            }, { quoted: message });
        }

        // Validate Facebook URL
        if (!url.includes('facebook.com')) {
            return await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🚫 INVALID URL!*\nThat doesn't look like a Facebook link! 🔗`
            }, { quoted: message });
        }

        // Send premium loading reaction
        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        // Premium processing message
        await sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*⚡ PROCESSING REQUEST...*\n\n*URL:* ${url}\n*Status:* 🔄 Analyzing link...\n*Quality:* 🎥 HD Preferred\n*API:* 🛡️ Premium Service`
        }, { quoted: message });

        // Resolve share/short URLs to their final destination first
        let resolvedUrl = url;
        try {
            console.log('🔗 Resolving Facebook URL...');
            const res = await axios.get(url, { 
                timeout: 20000, 
                maxRedirects: 10, 
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Premium Facebook Downloader)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                } 
            });
            const possible = res?.request?.res?.responseUrl;
            if (possible && typeof possible === 'string') {
                resolvedUrl = possible;
                console.log(`✅ URL Resolved: ${resolvedUrl}`);
            }
        } catch {
            console.log('⚠️ URL resolution failed, using original URL');
        }

        // Premium API helper with enhanced error handling
        async function fetchFromApi(u) {
            const apiUrl = `https://api.princetechn.com/api/download/facebook?apikey=prince&url=${encodeURIComponent(u)}`;
            console.log(`🌐 Calling Premium API: ${apiUrl}`);
            
            return axios.get(apiUrl, {
                timeout: 40000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'X-Premium': 'true',
                    'X-Client': 'Mavrix Bot-Premium'
                },
                maxRedirects: 5,
                validateStatus: s => s >= 200 && s < 500
            });
        }

        // Try resolved URL, then fallback to original URL
        let response;
        try {
            console.log('🎯 Attempt 1: Using resolved URL');
            response = await fetchFromApi(resolvedUrl);
            if (!response || response.status >= 400 || !response.data) throw new Error('First attempt failed');
        } catch {
            console.log('🔄 Attempt 2: Using original URL');
            response = await fetchFromApi(url);
        }

        const data = response.data;

        if (!data || data.status !== 200 || !data.success || !data.result) {
            console.log('🚨 API Response Invalid:', data);
            return await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🚨 DOWNLOAD FAILED!*\n\n*Possible Reasons:*\n• 🔗 Invalid Facebook URL\n• 🚫 Video is private/restricted\n• ⚠️ API service temporary down\n• 📵 Video doesn't exist\n\n*💡 Try Again with a valid public Facebook video!*`
            }, { quoted: message });
        }

        const fbvid = data.result.hd_video || data.result.sd_video;

        if (!fbvid) {
            return await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🚫 VIDEO NOT FOUND!*\n\nPlease ensure:\n• ✅ Video is public\n• ✅ URL is correct\n• ✅ Video exists\n• 🔓 No age restrictions`
            }, { quoted: message });
        }

        console.log(`✅ Video URL obtained: ${fbvid}`);

        // Create premium temp directory
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
            console.log('📁 Created premium temp directory');
        }

        // Generate premium temp file path
        const tempFile = path.join(tmpDir, `fb_premium_${Date.now()}.mp4`);
        console.log(`💾 Downloading to: ${tempFile}`);

        // Send downloading status
        await sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*📥 DOWNLOADING VIDEO...*\n\n*Status:* ⬇️ Fetching HD video...\n*Size:* 📊 Processing...\n*ETA:* ⏳ 10-30 seconds`
        });

        // Premium video download with enhanced headers
        const videoResponse = await axios({
            method: 'GET',
            url: fbvid,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Range': 'bytes=0-',
                'Connection': 'keep-alive',
                'Referer': 'https://www.facebook.com/',
                'X-Premium-Download': 'true'
            },
            timeout: 60000
        });

        const writer = fs.createWriteStream(tempFile);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Premium file validation
        if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
            throw new Error('🚨 Downloaded file is empty or missing');
        }

        const fileSize = (fs.statSync(tempFile).size / (1024 * 1024)).toFixed(2);
        console.log(`✅ Download complete! Size: ${fileSize} MB`);

        // Premium success message
        await sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*✅ DOWNLOAD SUCCESSFUL!*\n\n*📊 Video Details:*\n• Size: ${fileSize} MB\n• Quality: 🎥 ${fbvid.includes('hd') ? 'HD' : 'SD'}\n• Status: 🟢 Ready to send\n• API: ⚡ Premium Service`
        });

        // Send the premium video
        await sock.sendMessage(chatId, {
            video: { url: tempFile },
            mimetype: "video/mp4",
            caption: `${PREMIUM_ASCII}*📱 FACEBOOK VIDEO DOWNLOADED*\n\n*✨ Downloaded By:* Knight Bot Premium\n*🎥 Quality:* ${fbvid.includes('hd') ? 'HD' : 'Standard'}\n*⚡ Service:* Premium Downloader\n*🔗 Source:* Facebook\n\n*💫 Powered by Knight Bot Premium*`
        }, { quoted: message });

        // Premium cleanup with error handling
        try {
            fs.unlinkSync(tempFile);
            console.log('🧹 Premium cleanup completed');
        } catch (err) {
            console.error('⚠️ Cleanup warning:', err);
        }

    } catch (error) {
        console.error('🚨 Premium Facebook Error:', error);
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}*🚨 DOWNLOAD FAILED!*\n\n*Error Details:*\n${error.message}\n\n*💡 Solutions:*\n• 🔄 Try again in 1 minute\n• 🔗 Check URL validity\n• 📵 Ensure video is public\n• ⚠️ Service might be busy\n\n*✨ Premium Support Active*`
        }, { quoted: message });
    }
}

module.exports = facebookCommand;
