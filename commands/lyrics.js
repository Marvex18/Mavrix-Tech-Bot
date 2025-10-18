// lyrics.js
const fetch = require('node-fetch');

async function lyricsCommand(sock, chatId, songTitle, message) {
    try {
        console.log('🎵 Mavrix Bot - Lyrics Command Activated');
        
        if (!songTitle) {
            await sock.sendMessage(chatId, { 
                text: `🎵 *Mavrix Bot - Lyrics Finder* 🎵

╔══════════════════════╗
║    SONG MISSING!     ║
╚══════════════════════╝

❌ *No song specified!*

💡 *How to use:*
.lyrics <song name>

🎯 *Examples:*
.lyrics Bohemian Rhapsody
.lyrics Shape of You
.lyrics "Blinding Lights"

🎼 *Find lyrics for any song!*

⚡ *Powered by Mavrix Music AI*`
            },{ quoted: message });
            return;
        }

        // Send processing message
        await sock.sendMessage(chatId, {
            text: `🎵 *Mavrix Bot - Searching Lyrics* 🎵

╔══════════════════════╗
║    SEARCHING...      ║
╚══════════════════════╝

🎼 *Song:* "${songTitle}"
🔍 *Status:* Searching database...
⚡ *Engine:* Mavrix Lyrics v2.0

📚 *Scanning music libraries...*
🎶 *Finding perfect match...*
✨ *Preparing lyrics...*

💫 *Please wait while we find your song!*`
        },{ quoted: message });

        // Use lyricsapi.fly.dev and return only the raw lyrics text
        const apiUrl = `https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(songTitle)}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            throw new Error(`API returned ${res.status}`);
        }
        
        const data = await res.json();

        const lyrics = data?.result?.lyrics;
        if (!lyrics) {
            await sock.sendMessage(chatId, {
                text: `❌ *Mavrix Bot - Lyrics Not Found* ❌

╔══════════════════════╗
║     NO RESULTS       ║
╚══════════════════════╝

🎵 *Song:* "${songTitle}"
🔍 *Status:* Not Found

💡 *Suggestions:*
• Check spelling
• Try different title
• Use artist name
• Simplify search

🎯 *Examples:*
.lyrics "shape of you ed sheeran"
.lyrics "bohemian rhapsody queen"

⚡ *Mavrix Music - Extensive Database*`
            },{ quoted: message });
            return;
        }

        const maxChars = 4096;
        const output = lyrics.length > maxChars ? lyrics.slice(0, maxChars - 100) + '\n\n...\n\n*📜 Lyrics truncated due to length limits*\n*🎵 Use .lyrics again for more!*' : lyrics;

        const lyricsMessage = `🎵 *Mavrix Bot - Lyrics Found* 🎵

╔══════════════════════╗
║     LYRICS READY     ║
╚══════════════════════╝

🎼 *Song:* "${songTitle}"
📜 *Lyrics:*

${output}

✨ *━━━━━━━━━━━━━━━━━━━━━━━━━✨*

📊 *Length:* ${lyrics.length} characters
✅ *Source:* Mavrix Music Database
🎤 *Quality:* Premium Lyrics

💫 *Enjoy your music!*
⚡ *Powered by Mavrix Tech*`;

        await sock.sendMessage(chatId, { text: lyricsMessage }, { quoted: message });
        
    } catch (error) {
        console.error('❌ Mavrix Bot - Lyrics Command Error:', error);
        
        const errorMessage = `❌ *Mavrix Bot - Search Failed* ❌

╔══════════════════════╗
║     SEARCH ERROR     ║
╚══════════════════════╝

🎵 *Song:* "${songTitle}"
🚨 *Error:* Failed to fetch lyrics

🔧 *Possible Issues:*
• Lyrics service down
• Network problems
• Invalid song format
• Server timeout

🔄 *Please try:*
1. Check your connection
2. Try different song
3. Wait a few minutes

⚡ *Mavrix Tech - Reliable Music Service*`;

        await sock.sendMessage(chatId, { 
            text: errorMessage
        },{ quoted: message });
    }
}

module.exports = { lyricsCommand };
