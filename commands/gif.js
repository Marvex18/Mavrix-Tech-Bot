const axios = require('axios');
const settings = require('../settings');

const PREMIUM_ASCII = `
╔══════════════════════════╗
║      🎭 GIF PRO         ║
║   PREMIUM SEARCH ENGINE  ║
╚══════════════════════════╝
`;

async function gifCommand(sock, chatId, message, query) {
    const apiKey = settings.giphyApiKey;

    // Extract query from message
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    const searchQuery = query || text?.split(' ').slice(1).join(' ').trim();

    if (!searchQuery) {
        await sock.sendMessage(chatId, { 
            text: `${PREMIUM_ASCII}
*🎭 PREMIUM GIF SEARCH*

*❌ MISSING SEARCH TERM!*
Please provide what you're looking for!

*💡 Examples:*
.gif laughing
.gif cat dancing
.gif happy birthday

*⚡ Premium Features:*
• 🎭 4K GIF Database
• ⚡ Instant Results
• 🔍 Smart Search
• 🛡️ GIPHY API Pro`
        }, { quoted: message });
        return;
    }

    try {
        console.log(`🔍 Premium GIF Search: "${searchQuery}"`);

        // Send premium searching status
        await sock.sendMessage(chatId, {
            react: { text: '🔍', key: message.key }
        });

        await sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*🔍 SEARCHING GIF...*\n\n*Query:* "${searchQuery}"\n*Database:* 🎭 GIPHY Premium\n*Status:* ⚡ Processing...\n*Results:* 🎯 Top Quality`
        }, { quoted: message });

        // Premium API call with enhanced parameters
        const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
            params: {
                api_key: apiKey,
                q: searchQuery,
                limit: 10, // Increased for better selection
                rating: 'g',
                lang: 'en',
                bundle: 'messaging_non_clips'
            },
            timeout: 15000,
            headers: {
                'User-Agent': 'Mavrix Bot-Premium/2.0',
                'Accept': 'application/json',
                'X-Premium': 'true'
            }
        });

        console.log(`✅ GIF API Response: ${response.data.data.length} results found`);

        if (!response.data.data || response.data.data.length === 0) {
            await sock.sendMessage(chatId, { 
                text: `${PREMIUM_ASCII}*🚫 NO GIFS FOUND!*\n\n*Search:* "${searchQuery}"\n*Status:* ❌ No results\n\n*💡 Tips:*\n• 🔄 Try different keywords\n• 🎯 Be more specific\n• ✨ Use English terms\n• 🔍 Check spelling`
            }, { quoted: message });
            return;
        }

        // Select random GIF from top results for variety
        const randomIndex = Math.floor(Math.random() * Math.min(5, response.data.data.length));
        const gifData = response.data.data[randomIndex];
        const gifUrl = gifData?.images?.downsized_medium?.url;

        if (!gifUrl) {
            throw new Error('🚨 No valid GIF URL in response');
        }

        console.log(`🎯 Selected GIF: ${gifUrl}`);

        // Get GIF details for premium caption
        const gifTitle = gifData.title || 'Premium GIF';
        const gifRating = gifData.rating?.toUpperCase() || 'G';
        const gifUsername = gifData.username || 'GIPHY';

        // Send premium success status
        await sock.sendMessage(chatId, {
            text: `${PREMIUM_ASCII}*✅ GIF FOUND!*\n\n*Sending premium GIF...*\n*Title:* ${gifTitle}\n*Creator:* @${gifUsername}\n*Rating:* ${gifRating} ✅\n*Quality:* 🎭 HD Animated`
        });

        // Send the premium GIF with enhanced caption
        await sock.sendMessage(chatId, { 
            video: { url: gifUrl }, 
            mimetype: "video/mp4",
            caption: `${PREMIUM_ASCII}*🎭 PREMIUM GIF DELIVERED!*\n\n*🔍 Search:* "${searchQuery}"\n*🎯 Title:* ${gifTitle}\n*👤 Creator:* ${gifUsername}\n*⭐ Rating:* ${gifRating}\n*⚡ Powered By:* GIPHY API Pro\n*✨ Service:* Knight Bot Premium\n\n*💫 Enjoy your GIF!*`
        }, { quoted: message });

        console.log(`✅ Premium GIF sent successfully for: "${searchQuery}"`);

    } catch (error) {
        console.error('🚨 Premium GIF Error:', error);
        
        let errorMessage = `${PREMIUM_ASCII}*🚨 GIF SEARCH FAILED!*\n\n`;

        if (error.code === 'ECONNABORTED') {
            errorMessage += '*Reason:* ⏰ Request timeout\n*Solution:* Try again in a moment';
        } else if (error.response?.status === 429) {
            errorMessage += '*Reason:* 🚫 API rate limit\n*Solution:* Wait a few minutes';
        } else if (error.response?.status === 403) {
            errorMessage += '*Reason:* 🔑 API key invalid\n*Solution:* Contact bot owner';
        } else {
            errorMessage += '*Reason:* 🔧 Service temporary unavailable\n*Solution:* Try different search terms';
        }

        errorMessage += '\n\n*💡 Premium Support Active*';

        await sock.sendMessage(chatId, { 
            text: errorMessage
        }, { quoted: message });
    }
}

// Premium GIF helper function for random GIFs
async function getRandomGif(sock, chatId, category = 'funny') {
    try {
        const apiKey = settings.giphyApiKey;
        
        const response = await axios.get(`https://api.giphy.com/v1/gifs/random`, {
            params: {
                api_key: apiKey,
                tag: category,
                rating: 'g'
            },
            timeout: 10000
        });

        const gifUrl = response.data.data?.images?.downsized_medium?.url;
        
        if (gifUrl) {
            await sock.sendMessage(chatId, {
                video: { url: gifUrl },
                mimetype: "video/mp4",
                caption: `${PREMIUM_ASCII}*🎭 RANDOM PREMIUM GIF!*\n\n*Category:* ${category}\n*Service:* 🎯 GIPHY Random\n*Powered By:* Knight Bot Premium`
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('🚨 Random GIF error:', error);
        return false;
    }
}

module.exports = {
    gifCommand,
    getRandomGif
};
