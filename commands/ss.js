const fetch = require('node-fetch');

async function handleSsCommand(sock, chatId, message, match) {
    if (!match) {
        await sock.sendMessage(chatId, {
            text: `📸 *MAVRIX SCREENSHOT TOOL*

╔══════════════════════════════╗
║    🚀 MAVRIX BOT PREMIUM    ║
║      SCREENSHOT SYSTEM      ║
╚══════════════════════════════╝

⚡ *Available Commands:*
┣ 🔹 *.ss <url>*
┣ 🔹 *.ssweb <url>*
┗ 🔹 *.screenshot <url>*

🎯 *Description:*
Capture professional screenshots of any website with premium quality.

📝 *Example Usage:*
┣ 🔹 .ss https://google.com
┣ 🔹 .ssweb https://github.com
┗ 🔹 .screenshot https://mavrix.tech

🔒 *Powered by Mavrix Tech*`,
            quoted: message
        });
        return;
    }

    try {
        // Show typing indicator
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);

        // Extract URL from command
        const url = match.trim();
        
        // Validate URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return sock.sendMessage(chatId, {
                text: '❌ *INVALID URL*\n\nPlease provide a valid URL starting with http:// or https://',
                quoted: message
            });
        }

        // Send processing message
        await sock.sendMessage(chatId, {
            text: '🔄 *Processing Request...*\n\n📸 Capturing website screenshot...\n⏳ Please wait a moment.',
            quoted: message
        });

        // Call the API
        const apiUrl = `https://api.siputzx.my.id/api/tools/ssweb?url=${encodeURIComponent(url)}&theme=light&device=desktop`;
        const response = await fetch(apiUrl, { 
            headers: { 
                'accept': '*/*',
                'User-Agent': 'Mavrix-Bot/1.0'
            },
            timeout: 30000
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        // Get the image buffer
        const imageBuffer = await response.buffer();

        // Send the screenshot with premium caption
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `📸 *WEBSITE SCREENSHOT CAPTURED*

🌐 *URL:* ${url}
🕒 *Timestamp:* ${new Date().toLocaleString()}
⚡ *Quality:* Premium HD

✅ *Successfully captured website screenshot*

🔒 *Mavrix Bot Premium Screenshot System*`
        }, {
            quoted: message
        });

    } catch (error) {
        console.error('❌ Error in ss command:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *SCREENSHOT FAILED*

╔══════════════════════════════╗
║         CAPTURE ERROR        ║
╚══════════════════════════════╝

🚨 *Possible Reasons:*
┣ 🔹 Invalid or inaccessible URL
┣ 🔹 Website blocking screenshots
┣ 🔹 Website is currently down
┣ 🔹 API service temporary unavailable
┣ 🔹 Network connectivity issues

💡 *Solutions:*
┣ 🔹 Verify the URL is correct
┣ 🔹 Try again in a few minutes
┣ 🔹 Check website accessibility
┣ 🔹 Contact support if persistent

🔒 *Mavrix Tech Support*`,
            quoted: message
        });
    }
}

module.exports = {
    handleSsCommand
};
