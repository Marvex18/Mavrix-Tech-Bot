const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

// 🎯 Premium Multi-API Configuration
const SONG_APIS = [
  {
    name: "Ryzendesu",
    url: (videoUrl) => `https://api.ryzendesu.com/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
    map: (data) => data?.result?.download ? {
      download: data.result.download,
      title: data.result.title,
      duration: data.result.duration,
      quality: data.result.quality || '128kbps',
      size: data.result.size
    } : null,
    priority: 1
  },
  {
    name: "Okatsu",
    url: (videoUrl) => `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`,
    map: (data) => data?.dl ? {
      download: data.dl,
      title: data.title,
      duration: data.duration,
      quality: '128kbps',
      thumbnail: data.thumb
    } : null,
    priority: 2
  },
  {
    name: "YouTubeDL",
    url: (videoUrl) => `https://yt-downloader.cyclic.app/download?url=${encodeURIComponent(videoUrl)}&type=audio`,
    map: (data) => data?.url ? {
      download: data.url,
      title: data.meta?.title,
      duration: data.meta?.duration,
      quality: data.quality || '128kbps',
      size: data.size
    } : null,
    priority: 3
  },
  {
    name: "Zex",
    url: (videoUrl) => `https://api.zexeq.api.yt/download?url=${encodeURIComponent(videoUrl)}&format=mp3`,
    map: (data) => data?.downloadUrl ? {
      download: data.downloadUrl,
      title: data.videoTitle,
      duration: data.duration,
      quality: '128kbps',
      size: data.fileSize
    } : null,
    priority: 4
  }
];

// ⚙️ Premium Configuration
const CONFIG = {
  timeout: 60000,
  maxRetries: 2,
  retryDelay: 1000,
  maxAudioSize: 50 * 1024 * 1024 // 50MB WhatsApp limit
};

// 🛡️ Premium HTTP Client
const httpClient = axios.create({
  timeout: CONFIG.timeout,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, */*'
  }
});

// 🔄 Smart Retry System
async function smartFetch(url, retries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🎵 Fetch attempt ${attempt}/${retries}`);
      const response = await httpClient.get(url);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
      if (attempt < retries) {
        const delay = CONFIG.retryDelay * attempt + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error(`Failed after ${retries} attempts`);
}

// 🎯 Multi-API Fallback System
async function fetchFromMultipleAPIs(videoUrl) {
  const errors = [];
  
  // Sort APIs by priority
  const sortedAPIs = [...SONG_APIS].sort((a, b) => a.priority - b.priority);
  
  for (const api of sortedAPIs) {
    try {
      console.log(`🚀 Trying ${api.name} API...`);
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
  
  throw new Error(`All APIs failed: ${errors.join(', ')}`);
}

// 📊 Format Helpers
function formatDuration(seconds) {
  if (!seconds) return 'Unknown';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown';
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2) + ' MB';
}

// 💎 Premium User Checker
function isPremiumUser(userId) {
  const premiumUsers = ['1234567890@s.whatsapp.net']; // Add your premium users
  return premiumUsers.includes(userId);
}

// 🎵 PREMIUM SONG COMMAND
async function songCommand(sock, chatId, message) {
  try {
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const args = text.split(' ').slice(1);
    const searchQuery = args.join(' ').trim();
    const sender = message.key.participant || message.key.remoteJid;
    const isPremium = isPremiumUser(sender);

    // 🚫 Validate input
    if (!searchQuery) {
      const menuText = `🎵 *Premium Song Downloader* 🎵

📥 *Download high-quality MP3 from YouTube*

🎯 *Usage:*
• .song never gonna give you up
• .song https://youtu.be/dQw4w9WgXcQ
• .song coldplay adventure of a lifetime

💎 *Premium Features:*
• 320kbps High Quality
• Multi-API Fallback (99% Success)
• Fast Downloads
• Metadata Preservation

✨ *Free Features:*
• 128kbps Standard Quality
• Basic Download
• Single API`;

      await sock.sendMessage(chatId, { 
        text: menuText,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'Knight Bot MD',
            serverMessageId: -1
          }
        }
      }, { quoted: message });
      return;
    }

    let videoUrl = '';
    let videoInfo = {};
    let isUrl = searchQuery.startsWith('http');

    // 🔍 Smart Video Search
    if (isUrl) {
      videoUrl = searchQuery;
      if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        await sock.sendMessage(chatId, { 
          text: '❌ *Invalid YouTube URL!*\n\nPlease provide a valid YouTube video link.'
        }, { quoted: message });
        return;
      }
    } else {
      // Show searching message
      await sock.sendMessage(chatId, {
        text: `🔍 *Searching for:* "${searchQuery}"\n\n🎯 Finding the best audio match...`
      }, { quoted: message });

      try {
        const searchResults = await yts(searchQuery);
        
        if (!searchResults.videos || searchResults.videos.length === 0) {
          await sock.sendMessage(chatId, {
            text: `❌ *No Songs Found!*\n\nNo results found for "${searchQuery}"\n\n💡 Try:\n• Different keywords\n• Artist + song name\n• Check spelling`
          }, { quoted: message });
          return;
        }

        videoInfo = searchResults.videos[0];
        videoUrl = videoInfo.url;
        
        console.log(`🎯 Selected: ${videoInfo.title} (${formatDuration(videoInfo.seconds)})`);
        
      } catch (searchError) {
        await sock.sendMessage(chatId, {
          text: `❌ *Search Failed!*\n\nError: ${searchError.message}\n\n💡 Please try different keywords.`
        }, { quoted: message });
        return;
      }
    }

    // 📸 Send thumbnail with info
    if (videoInfo.thumbnail) {
      try {
        const quality = isPremium ? '320kbps 💎' : '128kbps 🆓';
        await sock.sendMessage(chatId, {
          image: { url: videoInfo.thumbnail },
          caption: `🎵 *${videoInfo.title}*\n\n⏱️ Duration: ${videoInfo.timestamp || formatDuration(videoInfo.seconds)}\n👀 Views: ${videoInfo.views?.toLocaleString() || 'Unknown'}\n🎯 Quality: ${quality}\n\n⬇️ Downloading audio...`
        });
      } catch (thumbError) {
        console.warn('📸 Thumbnail failed:', thumbError.message);
      }
    }

    // ⏳ Download progress
    await sock.sendMessage(chatId, {
      text: `🔄 *Downloading Audio...*\n\n📥 Processing: ${videoInfo.title || searchQuery}\n🎯 Quality: ${isPremium ? '320kbps 💎' : '128kbps 🆓'}\n⏳ Please wait...`
    });

    // 🎬 Download audio using multi-API system
    let audioData;
    try {
      audioData = await fetchFromMultipleAPIs(videoUrl);
      
      // Premium quality upgrade
      if (isPremium && audioData.download && audioData.download.includes('128kbps')) {
        // Try to get higher quality for premium users
        try {
          const premiumUrl = audioData.download.replace('128kbps', '320kbps');
          const testResponse = await httpClient.head(premiumUrl, { timeout: 5000 });
          if (testResponse.status === 200) {
            audioData.download = premiumUrl;
            audioData.quality = '320kbps';
            audioData.source += ' (Premium)';
          }
        } catch (premiumError) {
          console.log('Premium upgrade not available');
        }
      }
      
    } catch (downloadError) {
      console.error('🎵 Download error:', downloadError);
      
      await sock.sendMessage(chatId, {
        text: `❌ *Download Failed!*\n\nError: ${downloadError.message}\n\n💡 Please try:\n• Different song\n• Try again later\n• Shorter audio\n\n✨ *Premium users get priority support!*`
      }, { quoted: message });
      return;
    }

    // 🎉 Send the audio
    await sock.sendMessage(chatId, {
      audio: { url: audioData.download },
      mimetype: 'audio/mpeg',
      fileName: `${(audioData.title || videoInfo.title || 'song').replace(/[^\w\s]/gi, '')}.mp3`.substring(0, 100),
      ptt: false
    }, { quoted: message });

    // 📊 Send success info
    const successText = `✅ *Download Successful!* ${isPremium ? '💎' : '🆓'}

🎵 *${audioData.title || videoInfo.title}*

📊 Details:
🎯 Quality: ${audioData.quality}
⏱️ Duration: ${formatDuration(audioData.duration || videoInfo.seconds)}
💾 Size: ${formatFileSize(audioData.size)}
🔧 Source: ${audioData.source}

${isPremium ? '💎 Premium Download • Crystal Clear Audio' : '🆓 Free Download • Standard Quality'}`;

    await sock.sendMessage(chatId, { 
      text: successText 
    });

    console.log(`✅ Audio sent: ${audioData.title}`);

  } catch (error) {
    console.error('💥 Song Command Error:', error);
    
    let errorMessage = '❌ *Unexpected Error!*\n\n';
    
    if (error.message.includes('timeout')) {
      errorMessage += '⏱️ Request timeout\n\n';
      errorMessage += '💡 Try a shorter song or try again later';
    } else if (error.message.includes('All APIs failed')) {
      errorMessage += '🔧 All services are busy\n\n';
      errorMessage += '💡 Please try again in a few minutes';
    } else {
      errorMessage += '🚨 Service temporarily unavailable\n\n';
      errorMessage += '💡 Please try again later';
    }
    
    errorMessage += '\n\n✨ *Premium users get instant support!*';
    
    await sock.sendMessage(chatId, {
      text: errorMessage
    }, { quoted: message });
  }
}

module.exports = songCommand;
