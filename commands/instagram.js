/**
 * 🚀 Mavrix Bot - PREMIUM EDITION
 * 📸 Instagram Downloader - Premium Media Management
 * 🔧 Developed by Mavrix Tech
 */

const { igdl } = require("ruhend-scraper");

const MAVRIX_ASCII = `
╔══════════════════════════════════╗
║           🚀 MAVRIX BOT          ║
║         📸 INSTAGRAM PRO         ║
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

// Function to extract unique media URLs with simple deduplication
function extractUniqueMedia(mediaData) {
    const uniqueMedia = [];
    const seenUrls = new Set();
    
    for (const media of mediaData) {
        if (!media.url) continue;
        
        // Only check for exact URL duplicates
        if (!seenUrls.has(media.url)) {
            seenUrls.add(media.url);
            uniqueMedia.push(media);
        }
    }
    
    return uniqueMedia;
}

// Function to validate media URL
function isValidMediaUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Accept any URL that looks like media
    return url.includes('cdninstagram.com') || 
           url.includes('instagram') || 
           url.includes('http');
}

async function instagramCommand(sock, chatId, message) {
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
                text: `${MAVRIX_ASCII}*📸 INSTAGRAM PRO DOWNLOADER*\n\n❌ Please provide an Instagram link for the video.\n\n${MAVRIX_SIGNATURE}`
            });
        }

        // Check for various Instagram URL formats
        const instagramPatterns = [
            /https?:\/\/(?:www\.)?instagram\.com\//,
            /https?:\/\/(?:www\.)?instagr\.am\//,
            /https?:\/\/(?:www\.)?instagram\.com\/p\//,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
            /https?:\/\/(?:www\.)?instagram\.com\/tv\//
        ];

        const isValidUrl = instagramPatterns.some(pattern => pattern.test(text));
        
        if (!isValidUrl) {
            return await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}*❌ INVALID INSTAGRAM LINK!*\n\n📛 That is not a valid Instagram link.\n💡 Please provide a valid Instagram post, reel, or video link.\n\n${MAVRIX_SIGNATURE}`
            });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        // Send processing message
        await sock.sendMessage(chatId, {
            text: `${MAVRIX_ASCII}*🔄 PROCESSING YOUR REQUEST...*\n\n📥 Downloading media from Instagram\n⚡ Premium servers activated\n🎯 High-quality download initiated\n\n${MAVRIX_SIGNATURE}`
        });

        const downloadData = await igdl(text);
        
        if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}*❌ DOWNLOAD FAILED!*\n\n📛 No media found at the provided link.\n💡 The post might be private or the link is invalid.\n\n${MAVRIX_SIGNATURE}`
            });
        }

        const mediaData = downloadData.data;
        
        // Simple deduplication - just remove exact URL duplicates
        const uniqueMedia = extractUniqueMedia(mediaData);
        
        // Limit to maximum 20 unique media items
        const mediaToDownload = uniqueMedia.slice(0, 20);
        
        if (mediaToDownload.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}*❌ DOWNLOAD FAILED!*\n\n📛 No valid media found to download.\n💡 This might be a private post or the scraper failed.\n\n${MAVRIX_SIGNATURE}`
            });
        }

        // Send success message
        await sock.sendMessage(chatId, {
            text: `${MAVRIX_ASCII}*✅ DOWNLOAD SUCCESSFUL!*\n\n📦 Found ${mediaToDownload.length} media files\n🚀 Starting premium download...\n\n${MAVRIX_SIGNATURE}`
        });

        // Download all media silently without status messages
        for (let i = 0; i < mediaToDownload.length; i++) {
            try {
                const media = mediaToDownload[i];
                const mediaUrl = media.url;

                // Check if URL ends with common video extensions
                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                              media.type === 'video' || 
                              text.includes('/reel/') || 
                              text.includes('/tv/');

                if (isVideo) {
                    await sock.sendMessage(chatId, {
                        video: { url: mediaUrl },
                        mimetype: "video/mp4",
                        caption: "🚀 **DOWNLOADED BY MAVRIX BOT** ✨\n📸 Premium Instagram Downloader\n🔧 Powered by Mavrix Tech"
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        image: { url: mediaUrl },
                        caption: "🚀 **DOWNLOADED BY MAVRIX BOT** ✨\n📸 Premium Instagram Downloader\n🔧 Powered by Mavrix Tech"
                    }, { quoted: message });
                }
                
                // Add small delay between downloads to prevent rate limiting
                if (i < mediaToDownload.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (mediaError) {
                console.error(`🎯 Mavrix Bot - Error downloading media ${i + 1}:`, mediaError);
                // Continue with next media if one fails
            }
        }

        // Send completion message
        await sock.sendMessage(chatId, {
            text: `${MAVRIX_ASCII}*🎉 DOWNLOAD COMPLETED!*\n\n✅ Successfully downloaded ${mediaToDownload.length} files\n⚡ Premium service completed\n🔧 Powered by Mavrix Tech\n\n${MAVRIX_SIGNATURE}`
        });

    } catch (error) {
        console.error('🎯 Mavrix Bot - Error in Instagram command:', error);
        await sock.sendMessage(chatId, { 
            text: `${MAVRIX_ASCII}*❌ SYSTEM ERROR!*\n\n📛 An error occurred while processing the Instagram request.\n💡 Please try again.\n\n${MAVRIX_SIGNATURE}`
        });
    }
}

module.exports = instagramCommand;
