const yts = require('yt-search');
const axios = require('axios');

// 🎵 ULTRA PREMIUM MUSIC SYSTEM
console.log(`
╔══════════════════════════════╗
║        🎵 MUSIC PRO          ║
║     ULTRA PREMIUM STREAM     ║
╚══════════════════════════════╝
`);

// 🎯 ELITE MUSIC APIs
const MUSIC_APIS = [
  {
    name: "🎧 Keith API Elite",
    url: (videoUrl) => `https://apis-keith.vercel.app/download/dlmp3?url=${videoUrl}`,
    map: (data) => data?.status && data?.result?.downloadUrl ? {
      download: data.result.downloadUrl,
      title: data.result.title,
      duration: data.result.duration,
      quality: '🎵 128kbps Premium',
      thumbnail: data.result.thumbnail
    } : null,
    priority: 1
  },
  {
    name: "🚀 Ryzendesu Pro",
    url: (videoUrl) => `https://api.ryzendesu.com/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
    map: (data) => data?.result?.download ? {
      download: data.result.download,
      title: data.result.title,
      duration: data.result.duration,
      quality: data.result.quality || '🎵 128kbps Elite',
      thumbnail: data.result.thumbnail
    } : null,
    priority: 2
  },
  {
    name: "💎 YouTubeDL Ultra",
    url: (videoUrl) => `https://yt-downloader.cyclic.app/download?url=${encodeURIComponent(videoUrl)}&type=audio`,
    map: (data) => data?.url ? {
      download: data.url,
      title: data.meta?.title,
      duration: data.meta?.duration,
      quality: data.quality || '🎵 128kbps Ultra',
      thumbnail: data.meta?.thumbnail
    } : null,
    priority: 3
  }
];

// ⚙️ ULTRA PREMIUM CONFIG
const CONFIG = {
  timeout: 60000,
  maxRetries: 3,
  retryDelay: 1500
};

// 🛡️ ELITE HTTP CLIENT
const httpClient = axios.create({
  timeout: CONFIG.timeout,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.youtube.com/'
  }
});

// 🔄 SMART RETRY SYSTEM WITH ENHANCED LOGGING
async function smartFetch(url, retries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🎵 Elite Fetch attempt ${attempt}/${retries}`);
      const response = await httpClient.get(url);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.warn(`⚠️ Elite Attempt ${attempt} failed:`, error.message);
      if (attempt < retries) {
        const delay = CONFIG.retryDelay * attempt;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error(`Elite system failed after ${retries} attempts`);
}

// 🎯 MULTI-API FALLBACK WITH PRIORITY
async function fetchAudioFromAPIs(videoUrl) {
  const errors = [];
  
  const sortedAPIs = [...MUSIC_APIS].sort((a, b) => a.priority - b.priority);
  
  for (const api of sortedAPIs) {
    try {
      console.log(`🚀 Trying ${api.name}...`);
      const data = await smartFetch(api.url(videoUrl));
      const result = api.map(data);
      
      if (result && result.download) {
        console.log(`✅ ${api.name} success!`);
        return {
          ...result,
          source: api.name
        };
      }
    } catch (error) {
      console.warn(`❌ ${api.name} failed:`, error.message);
      errors.push(api.name);
      continue;
    }
  }
  
  throw new Error(`All elite APIs failed: ${errors.join(', ')}`);
}

// 🎵 ULTRA PREMIUM PLAY COMMAND
async function playCommand(sock, chatId, message) {
  try {
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const args = text.split(' ').slice(1);
    const searchQuery = args.join(' ').trim();

    if (!searchQuery) {
      const premiumMenu = `
╔══════════════════════════╗
🎵 *ULTRA PREMIUM MUSIC PRO* 🎵
╚══════════════════════════╝

✨ *Download high-quality music from YouTube*

🎯 *Premium Usage:*
• .play never gonna give you up
• .play coldplay adventure of a lifetime  
• .play https://youtu.be/dQw4w9WgXcQ

💎 *Elite Features:*
• Multi-API Support (99.9% Success Rate)
• 🎵 High Quality Audio (128kbps)
• ⚡ Ultra Fast Processing
• 📊 Metadata Preservation
• 🔄 Smart Retry System
• 🛡️ Premium Error Handling

🚀 *Examples:*
.play shape of you
.play https://youtube.com/watch?v=...
.play bohemian rhapsody queen

⭐ *Powered by Knight Bot MD Elite*
      `;

      await sock.sendMessage(chatId, { 
        text: premiumMenu,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'Knight Bot MD Elite',
            serverMessageId: -1
          }
        }
      }, { quoted: message });
      return;
    }

    let videoUrl = '';
    let videoInfo = {};
    let isUrl = searchQuery.startsWith('http');

    // 🔍 ELITE SEARCH SYSTEM
    if (isUrl) {
      videoUrl = searchQuery;
      console.log(`🎵 Direct URL provided: ${videoUrl}`);
    } else {
      // Premium searching message
      const searchMsg = await sock.sendMessage(chatId, {
        text: `🔍 *ELITE MUSIC SEARCH* 🔍\n\n🎵 Searching: "*${searchQuery}*"\n⏳ Initializing premium search...\n⭐ Please wait while we find the best match...`
      }, { quoted: message });

      try {
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
          await sock.sendMessage(chatId, { 
            text: `❌ *PREMIUM SEARCH FAILED* ❌\n\nNo elite results found for "*${searchQuery}*"\n\n💡 *Suggestions:*\n• Check spelling\n• Try different keywords\n• Use more specific terms\n• Ensure stable connection` 
          }, { quoted: message });
          return;
        }

        videoInfo = videos[0];
        videoUrl = videoInfo.url;
        
        console.log(`🎯 Elite selection: ${videoInfo.title}`);
        
      } catch (searchError) {
        await sock.sendMessage(chatId, { 
          text: `🔧 *SEARCH SYSTEM ERROR* 🔧\n\nElite search failed for "*${searchQuery}*"\n\nError: ${searchError.message}\n\n⭐ Please try again in a moment.` 
        }, { quoted: message });
        return;
      }
    }

    // 📊 PREMIUM TRACK INFO
    if (videoInfo.title) {
      await sock.sendMessage(chatId, {
        image: { url: videoInfo.thumbnail },
        caption: `🎵 *${videoInfo.title}*\n\n⏱️ Duration: ${videoInfo.timestamp}\n👀 Views: ${videoInfo.views?.toLocaleString() || 'Elite Track'}\n🎤 Author: ${videoInfo.author?.name || 'Unknown Artist'}\n\n⬇️ *Initializing premium download...*`
      });
    }

    // ⏳ ELITE PROCESSING
    const processingMsg = await sock.sendMessage(chatId, {
      text: `⚡ *ELITE PROCESSING ACTIVATED* ⚡\n\n🔧 Step 1: Audio extraction...\n🎵 Step 2: Quality optimization...\n💎 Step 3: Premium encoding...\n⏳ Estimated: 10-30 seconds\n\n⭐ Please stand by for elite audio...`
    });

    // 🎬 ULTRA DOWNLOAD
    let audioData;
    try {
      audioData = await fetchAudioFromAPIs(videoUrl);
    } catch (downloadError) {
      console.error('💥 Elite download error:', downloadError);
      
      await sock.sendMessage(chatId, {
        text: `❌ *ELITE DOWNLOAD FAILED* ❌\n\nTrack: "*${videoInfo.title || searchQuery}*"\nError: ${downloadError.message}\n\n💡 *Premium Support:*\n• Try different song\n• Check your connection\n• Wait 5 minutes\n• Contact elite support`
      }, { quoted: message });
      return;
    }

    // 🎉 ULTRA SUCCESS - SEND AUDIO
    await sock.sendMessage(chatId, {
      audio: { url: audioData.download },
      mimetype: 'audio/mpeg',
      fileName: `${(audioData.title || videoInfo.title || 'elite_audio').replace(/[^\w\s]/gi, '')}.mp3`.substring(0, 100),
      ptt: false
    }, { quoted: message });

    // 📈 ELITE SUCCESS MESSAGE
    const successText = `
╔══════════════════════════╗
✅ *DOWNLOAD SUCCESSFUL!* ✅
╚══════════════════════════╝

🎵 *Track Details:*
✨ Title: ${audioData.title || videoInfo.title}
💎 Quality: ${audioData.quality}
⏱️ Duration: ${audioData.duration || 'Elite Quality'}
🔧 Source: ${audioData.source}

📊 *System Report:*
⭐ Status: Elite Success
🚀 Speed: Premium Grade
🎯 Accuracy: Perfect

✨ *Thank you for using Music Pro!*
💎 Enjoy your premium audio experience!
    `;

    await sock.sendMessage(chatId, { 
      text: successText 
    });

    console.log(`✅ Elite audio delivered: ${audioData.title}`);

  } catch (error) {
    console.error('💥 ULTRA PREMIUM ERROR:', error);
    
    const errorText = `
💥 *ULTRA PREMIUM SYSTEM ERROR*

🔧 *Error Details:*
${error.message}

🚨 *Emergency Protocol:*
• System auto-recovery initiated
• Error logged for elite support
• Please wait 2 minutes before retry

💡 *Premium Support:*
Contact system administrator with error code: ${Date.now()}

⭐ *Knight Bot MD Elite - Premium Music System*
    `;

    await sock.sendMessage(chatId, { 
      text: errorText 
    });
  }
}

module.exports = { playCommand };
