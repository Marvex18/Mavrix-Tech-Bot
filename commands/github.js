const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch('https://api.github.com/repos/Marvex18/Mavrix-Tech-Bot', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mavrix-Bot-MD',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Repository "Marvex18/Mavrix-Tech-Bot" not found on GitHub.');
      }
      throw new Error(`GitHub API returned ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();

    // Validate required fields
    if (!json.name || !json.html_url) {
      throw new Error('Invalid repository data received from GitHub');
    }

    // Build the information text
    let txt = `*乂  Mavrix Bot MD  乂*\n\n`;
    txt += `✩  *Name* : ${json.name}\n`;
    txt += `✩  *Description* : ${json.description || 'No description available'}\n`;
    txt += `✩  *Watchers* : ${json.watchers_count}\n`;
    txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `✩  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✩  *URL* : ${json.html_url}\n`;
    txt += `✩  *Forks* : ${json.forks_count}\n`;
    txt += `✩  *Stars* : ${json.stargazers_count}\n`;
    txt += `✩  *Open Issues* : ${json.open_issues_count || 0}\n`;
    txt += `✩  *Language* : ${json.language || 'Not specified'}\n\n`;
    txt += `💥 *Mavrix Bot MD*`;

    // Handle the image with fallback
    try {
      const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
      
      if (fs.existsSync(imgPath)) {
        const imgBuffer = fs.readFileSync(imgPath);
        await sock.sendMessage(chatId, 
          { 
            image: imgBuffer, 
            caption: txt 
          }, 
          { quoted: message }
        );
      } else {
        // Fallback: send as text only if image not found
        console.log('📁 Image not found, sending text only');
        await sock.sendMessage(chatId, 
          { 
            text: txt 
          }, 
          { quoted: message }
        );
      }
    } catch (imageError) {
      console.error('Image error:', imageError.message);
      // Fallback to text only
      await sock.sendMessage(chatId, 
        { 
          text: txt 
        }, 
        { quoted: message }
      );
    }

  } catch (error) {
    console.error('GitHub command error:', error.message);
    
    let errorMessage = '❌ Error fetching repository information.';
    
    if (error.name === 'AbortError') {
      errorMessage = '❌ Request timeout: GitHub API took too long to respond.';
    } else if (error.message.includes('not found')) {
      errorMessage = `❌ ${error.message}`;
    } else if (error.message.includes('rate limit')) {
      errorMessage = '❌ GitHub API rate limit exceeded. Try again later.';
    }

    // Fallback response with local package info
    try {
      const packageJson = require('../package.json');
      const fallbackText = `*乂  Mavrix Bot MD  乂*\n\n` +
        `✩  *Name* : ${packageJson.name}\n` +
        `✩  *Version* : ${packageJson.version}\n` +
        `✩  *Description* : ${packageJson.description}\n` +
        `✩  *Developer* : Mavrix\n` +
        `✩  *Status* : Online ✅\n\n` +
        `💥 *Mavrix Bot MD*\n\n` +
        `*Note:* ${errorMessage.replace('❌ ', '')}`;

      await sock.sendMessage(chatId, 
        { 
          text: fallbackText 
        }, 
        { quoted: message }
      );
    } catch (fallbackError) {
      // Ultimate fallback
      await sock.sendMessage(chatId, 
        { 
          text: errorMessage 
        }, 
        { quoted: message }
      );
    }
  }
}

module.exports = githubCommand;
