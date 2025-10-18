const { ttdl } = require("ruhend-scraper");
const axios = require('axios');

const MAVRIX_ASCII = `
╔══════════════════════════════════╗
║           🚀 MAVRIX BOT          ║
║          📱 TIKTOK PRO           ║
║        PREMIUM DOWNLOADER        ║
╚══════════════════════════════════╝
`;

const MAVRIX_SIGNATURE = `
✨ Developed by Mavrix Tech
🎯 Premium Features | ⚡ Lightning Fast
🔒 Secure | 🛠️ Error Free
`;

// Store processed message IDs to prevent duplicates
const processedMessages = new Set();

async function tiktokCommand(sock, chatId, message) {
    try {
        // Check if message has already been processed
        if (processedMessages.has(message.key.id)) {
            return;
        }
        
        // Add message ID to processed set
        processedMessages.add(message.key.id);
        
        // Clean up old message IDs after 5 minutes
        setTimeout(() => {
            processedMessages.delete(message.key.id);
        }, 5 * 60 * 1000);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}*📱 TIKTOK PRO DOWNLOADER*\n\n❌ Please provide a TikTok link for the video.\n\n${MAVRIX_SIGNATURE}`
            });
        }

        // Extract URL from command
        const url = text.split(' ').slice(1).join(' ').trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}*📱 TIKTOK PRO DOWNLOADER*\n\n❌ Please provide a TikTok link for the video.\n\n${MAVRIX_SIGNATURE}`
            });
        }

        // Check for various TikTok URL formats
        const tiktokPatterns = [
            /https?:\/\/(?:www\.)?tiktok\.com\//,
            /https?:\/\/(?:vm\.)?tiktok\.com\//,
            /https?:\/\/(?:vt\.)?tiktok\.com\//,
            /https?:\/\/(?:www\.)?tiktok\.com\/@/,
            /https?:\/\/(?:www\.)?tiktok\.com\/t\//
        ];

        const isValidUrl = tiktokPatterns.some(pattern => pattern.test(url));
        
        if (!isValidUrl) {
            return await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}*❌ INVALID TIKTOK LINK!*\n\n📛 That is not a valid TikTok link.\n💡 Please provide a valid TikTok video link.\n\n${MAVRIX_SIGNATURE}`
            });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        // Send processing message
        await sock.sendMessage(chatId, {
            text: `${MAVRIX_ASCII}*🔄 PROCESSING YOUR REQUEST...*\n\n📥 Downloading from TikTok\n⚡ Premium servers activated\n🎯 High-quality download initiated\n\n${MAVRIX_SIGNATURE}`
        });

        try {
            // Try multiple APIs in sequence
            const apis = [
                `https://api.princetechn.com/api/download/tiktok?apikey=prince&url=${encodeURIComponent(url)}`,
                `https://api.princetechn.com/api/download/tiktokdlv2?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(url)}`,
                `https://api.princetechn.com/api/download/tiktokdlv3?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(url)}`,
                `https://api.princetechn.com/api/download/tiktokdlv4?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(url)}`,
                `https://api.dreaded.site/api/tiktok?url=${encodeURIComponent(url)}`
            ];

            let videoUrl = null;
            let audioUrl = null;
            let title = null;

            // Try each API until one works
            for (const apiUrl of apis) {
                try {
                    const response = await axios.get(apiUrl, { timeout: 10000 });
                    
                    if (response.data) {
                        // Handle different API response formats
                        if (response.data.result && response.data.result.videoUrl) {
                            // PrinceTech API format
                            videoUrl = response.data.result.videoUrl;
                            audioUrl = response.data.result.audioUrl;
                            title = response.data.result.title;
                            break;
                        } else if (response.data.tiktok && response.data.tiktok.video) {
                            // Dreaded API format
                            videoUrl = response.data.tiktok.video;
                            break;
                        } else if (response.data.video) {
                            // Alternative format
                            videoUrl = response.data.video;
                            break;
                        }
                    }
                } catch (apiError) {
                    console.error(`🎯 Mavrix Bot - TikTok API failed: ${apiError.message}`);
                    continue;
                }
            }

            // If no API worked, try the original ttdl method
            if (!videoUrl) {
                let downloadData = await ttdl(url);
                if (downloadData && downloadData.data && downloadData.data.length > 0) {
                    const mediaData = downloadData.data;
                    for (let i = 0; i < Math.min(20, mediaData.length); i++) {
                        const media = mediaData[i];
                        const mediaUrl = mediaUrl;

                        // Check if URL ends with common video extensions
                        const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                                      media.type === 'video';

                        if (isVideo) {
                            await sock.sendMessage(chatId, {
                                video: { url: mediaUrl },
                                mimetype: "video/mp4",
                                caption: "🚀 **DOWNLOADED BY MAVRIX BOT** ✨\n📱 Premium TikTok Downloader\n🔧 Powered by Mavrix Tech"
                            }, { quoted: message });
                        } else {
                            await sock.sendMessage(chatId, {
                                image: { url: mediaUrl },
                                caption: "🚀 **DOWNLOADED BY MAVRIX BOT** ✨\n📱 Premium TikTok Downloader\n🔧 Powered by Mavrix Tech"
                            }, { quoted: message });
                        }
                    }
                    return;
                }
            }

            // Send the video if we got a URL from the APIs
            if (videoUrl) {
                try {
                    // Download video as buffer
                    const videoResponse = await axios.get(videoUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    
                    const videoBuffer = Buffer.from(videoResponse.data);
                    
                    const caption = title ? 
                        `🚀 **DOWNLOADED BY MAVRIX BOT** ✨\n\n📝 **Title:** ${title}\n📱 **Quality:** Premium HD\n🔧 **Powered by:** Mavrix Tech` : 
                        "🚀 **DOWNLOADED BY MAVRIX BOT** ✨\n📱 Premium TikTok Downloader\n🔧 Powered by Mavrix Tech";
                    
                    await sock.sendMessage(chatId, {
                        video: videoBuffer,
                        mimetype: "video/mp4",
                        caption: caption
                    }, { quoted: message });

                    // If we have audio URL, download and send it as well
                    if (audioUrl) {
                        try {
                            const audioResponse = await axios.get(audioUrl, {
                                responseType: 'arraybuffer',
                                timeout: 30000,
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                                }
                            });
                            
                            const audioBuffer = Buffer.from(audioResponse.data);
                            
                            await sock.sendMessage(chatId, {
                                audio: audioBuffer,
                                mimetype: "audio/mp3",
                                caption: "🎵 **AUDIO EXTRACTED BY MAVRIX BOT**\n🔧 Powered by Mavrix Tech"
                            }, { quoted: message });
                        } catch (audioError) {
                            console.error(`🎯 Mavrix Bot - Failed to download audio: ${audioError.message}`);
                        }
                    }
                    return;
                } catch (downloadError) {
                    console.error(`🎯 Mavrix Bot - Failed to download video: ${downloadError.message}`);
                    // Fallback to URL method
                    try {
                        const caption = title ? 
                            `🚀 **DOWNLOADED BY MAVRIX BOT** ✨\n\n📝 **Title:** ${title}\n📱 **Quality:** Premium HD\n🔧 **Powered by:** Mavrix Tech` : 
                            "🚀 **DOWNLOADED BY MAVRIX BOT** ✨\n📱 Premium TikTok Downloader\n🔧 Powered by Mavrix Tech";
                        
                        await sock.sendMessage(chatId, {
                            video: { url: videoUrl },
                            mimetype: "video/mp4",
                            caption: caption
                        }, { quoted: message });
                        return;
                    } catch (urlError) {
                        console.error(`🎯 Mavrix Bot - URL method also failed: ${urlError.message}`);
                    }
                }
            }

            // If we reach here, no method worked
            return await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}*❌ DOWNLOAD FAILED!*\n\n📛 Failed to download TikTok video.\n💡 All download methods failed.\n🔧 Please try again with a different link.\n\n${MAVRIX_SIGNATURE}`
            });
        } catch (error) {
            console.error('🎯 Mavrix Bot - Error in TikTok download:', error);
            await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}*❌ DOWNLOAD ERROR!*\n\n📛 Failed to download the TikTok video.\n💡 Please try again with a different link.\n\n${MAVRIX_SIGNATURE}`
            });
        }
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error in TikTok command:', error);
        await sock.sendMessage(chatId, { 
            text: `${MAVRIX_ASCII}*🚨 SYSTEM ERROR!*\n\n📛 An error occurred while processing the request.\n💡 Please try again later.\n\n${MAVRIX_SIGNATURE}`
        });
    }
}

module.exports = tiktokCommand;
