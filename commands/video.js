const axios = require('axios');
const yts = require('yt-search');

// 🎯 Production-Grade Multi-API Configuration
const YT_APIS = [
  {
    name: "Ryzendesu",
    url: (videoUrl) => `https://api.ryzendesu.com/api/ytmp4?url=${encodeURIComponent(videoUrl)}`,
    map: (data) => {
      if (data?.result?.download) {
        return {
          download: data.result.download,
          title: data.result.title || 'YouTube Video',
          duration: data.result.duration,
          quality: data.result.quality || '720p',
          size: data.result.size
        };
      }
      return null;
    }
  },
  {
    name: "Okatsu", 
    url: (videoUrl) => `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}`,
    map: (data) => {
      if (data?.result?.mp4) {
        return {
          download: data.result.mp4,
          title: data.result.title || 'YouTube Video',
          duration: data.result.duration,
          quality: '720p',
          size: data.result.size
        };
      }
      return null;
    }
  },
  {
    name: "YouTubeDL",
    url: (videoUrl) => `https://yt-downloader.cyclic.app/download?url=${encodeURIComponent(videoUrl)}&type=video`,
    map: (data) => {
      if (data?.url) {
        return {
          download: data.url,
          title: data.meta?.title || 'YouTube Video',
          duration: data.meta?.duration,
          quality: data.quality || '720p',
          size: data.size
        };
      }
      return null;
    }
  }
];

// ⚙️ Production Configuration
const CONFIG = {
  timeout: 60000,
  maxRetries: 2,
  retryDelay: 1000,
  maxVideoSize: 80 * 1024 * 1024, // 80MB WhatsApp limit
  maxVideoDuration: 900 // 15 minutes in seconds
};

// 🛡️ Safe HTTP Client
const httpClient = axios.create({
  timeout: CONFIG.timeout,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json'
  }
});

// 🔄 Smart Retry System with Jitter
async function smartFetch(url, retries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌐 Fetch attempt ${attempt}/${retries}`);
      
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

// 🔍 Smart Video Selection (Under 15 minutes preferred)
function findBestVideo(videos) {
  if (!videos || !videos.length) return null;
  
  const shortVideo = videos.find(v => v.seconds <= CONFIG.maxVideoDuration);
  return shortVideo || videos[0];
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

// 🎨 Message Templates
function createThumbnailCaption(videoInfo, searchQuery) {
  const title = videoInfo.title || searchQuery;
  const duration = formatDuration(videoInfo.duration);
  const views = videoInfo.views ? `${videoInfo.views.toLocaleString()} views` : '';
  
  return `🎬 *${title}*

📊 Metadata:
⏱️ Duration: ${duration}
👀 ${views}
📅 ${videoInfo.ago || 'Recently'}
👤 ${videoInfo.author?.name || 'Unknown'}

⬇️ Downloading your video...
🔄 Please wait...`;
}

function createSuccessCaption(videoData, originalTitle) {
  const title = videoData.title || originalTitle;
  const duration = formatDuration(videoData.duration);
  const size = formatFileSize(videoData.size);
  const quality = videoData.quality || 'HD';
  
  return `✅ *Download Successful!*

📹 *${title}*

📊 Details:
🎯 Quality: ${quality}
⏱️ Duration: ${duration}
📦 Size: ${size}
🔧 Source: ${videoData.source}

✨ *Enjoy your video!*`;
}

// 🚀 Caching System for Better Performance
let lastWorkingAPI = null;

// 🎯 Multi-API Fallback with Caching
async function fetchFromMultipleAPIs(videoUrl) {
  const errors = [];
  
  // Try last working API first for speed
  if (lastWorkingAPI) {
    try {
      console.log(`🚀 Trying cached API: ${lastWorkingAPI.name}`);
      const data = await smartFetch(lastWorkingAPI.url(videoUrl));
      const result = lastWorkingAPI.map(data);
      
      if (result && result.download) {
        console.log(`✅ Cached API success!`);
        return {
          ...result,
          source: lastWorkingAPI.name + ' (cached)'
        };
      }
    } catch (error) {
      console.warn(`❌ Cached API failed:`, error.message);
      lastWorkingAPI = null;
    }
  }
  
  // Fallback to all APIs
  for (const api of YT_APIS) {
    try {
      console.log(`🔄 Trying ${api.name} API...`);
      
      const data = await smartFetch(api.url(videoUrl));
      const result = api.map(data);
      
      if (result && result.download) {
        console.log(`✅ ${api.name} success!`);
        
        // Cache the working API
        lastWorkingAPI = api;
        
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
  
  throw new Error('All download APIs failed. Please try again later.');
}

// 📏 Video Size Validator
async function validateVideoSize(videoUrl) {
  try {
    const response = await httpClient.head(videoUrl, { timeout: 10000 });
    const contentLength = response.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > CONFIG.maxVideoSize) {
      return {
        valid: false,
        size: parseInt(contentLength),
        message: `❌ Video too large (${formatFileSize(contentLength)}). WhatsApp limit is 80MB.`
      };
    }
    
    return { valid: true, size: parseInt(contentLength) };
  } catch (error) {
    console.warn('Size validation failed, proceeding anyway:', error.message);
    return { valid: true, size: null };
  }
}

// 🎵 PRODUCTION-READY .ytmp4 COMMAND
async function videoCommand(sock, chatId, message) {
  try {
    // ✅ Extract text safely for Bailey (matches your main.js structure)
    let text = '';
    if (message.message?.conversation) {
      text = message.message.conversation;
    } else if (message.message?.extendedTextMessage?.text) {
      text = message.message.extendedTextMessage.text;
    } else if (message.message?.imageMessage?.caption) {
      text = message.message.imageMessage.caption;
    }
    
    // ✅ Check if it's .ytmp4 command (matches your main.js switch case)
    if (!text.startsWith('.ytmp4')) {
      return; // Not our command
    }
    
    const args = text.split(' ').slice(1);
    const searchQuery = args.join(' ').trim();

    // 🚫 Validate input
    if (!searchQuery) {
      await sock.sendMessage(chatId, {
        text: `❌ *Usage:* .ytmp4 [video name or YouTube URL]\n\nExamples:\n• .ytmp4 never gonna give you up\n• .ytmp4 https://youtu.be/dQw4w9WgXcQ`
      }, { quoted: message });
      return;
    }

    let videoUrl = '';
    let videoInfo = {};
    let isUrl = searchQuery.startsWith('http');

    // 🔍 Smart Video Search
    if (isUrl) {
      videoUrl = searchQuery;
      
      // Basic YouTube URL validation
      if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        await sock.sendMessage(chatId, {
          text: '❌ *Invalid YouTube URL*\n\nPlease provide a valid YouTube video link.'
        }, { quoted: message });
        return;
      }
    } else {
      // Show searching message
      await sock.sendMessage(chatId, {
        text: `🔍 *Searching:* "${searchQuery}"\n📡 Finding the best video match...`
      }, { quoted: message });

      try {
        const searchResults = await yts(searchQuery);
        
        if (!searchResults.videos || searchResults.videos.length === 0) {
          await sock.sendMessage(chatId, {
            text: `❌ No videos found for "${searchQuery}"\n\n💡 Try different keywords or YouTube URL`
          }, { quoted: message });
          return;
        }

        // Smart video selection
        videoInfo = findBestVideo(searchResults.videos);
        if (!videoInfo) {
          await sock.sendMessage(chatId, {
            text: `❌ No suitable videos found for "${searchQuery}"`
          }, { quoted: message });
          return;
        }
        
        videoUrl = videoInfo.url;
        
        console.log(`🎯 Selected: ${videoInfo.title} (${formatDuration(videoInfo.duration)})`);
        
      } catch (searchError) {
        await sock.sendMessage(chatId, {
          text: `❌ Search failed for "${searchQuery}"\n\nError: ${searchError.message}`
        }, { quoted: message });
        return;
      }
    }

    // 📸 Send thumbnail (with safety check)
    if (videoInfo.thumbnail && videoInfo.thumbnail.startsWith('https')) {
      try {
        await sock.sendMessage(chatId, {
          image: { url: videoInfo.thumbnail },
          caption: createThumbnailCaption(videoInfo, searchQuery)
        });
      } catch (thumbError) {
        console.warn('📸 Thumbnail skipped:', thumbError.message);
        // Continue without thumbnail
      }
    }

    // ⏳ Download progress
    await sock.sendMessage(chatId, {
      text: `🔄 *Downloading Video...*\n\n📥 Connecting to servers...\n⏳ This may take 30-60 seconds\n🎯 Quality: 720p HD`
    });

    // 🎬 Download video using multi-API system
    let videoData;
    try {
      videoData = await fetchFromMultipleAPIs(videoUrl);
      
      // Validate video size before sending
      const sizeCheck = await validateVideoSize(videoData.download);
      if (!sizeCheck.valid) {
        await sock.sendMessage(chatId, { 
          text: sizeCheck.message 
        }, { quoted: message });
        return;
      }
      
    } catch (downloadError) {
      console.error('🎬 Download error:', downloadError);
      
      await sock.sendMessage(chatId, {
        text: `❌ *Download Failed!*\n\nError: ${downloadError.message}\n\n💡 Please try:\n• Different video\n• Try again later\n• Shorter video`
      }, { quoted: message });
      return;
    }

    // 🎉 Send the video
    await sock.sendMessage(chatId, {
      video: { 
        url: videoData.download 
      },
      mimetype: 'video/mp4',
      fileName: `${(videoData.title || videoInfo.title || 'video').replace(/[^\w\s]/gi, '')}.mp4`.substring(0, 100),
      caption: createSuccessCaption(videoData, videoInfo.title)
    });

    console.log(`✅ Video sent successfully: ${videoData.title}`);

  } catch (error) {
    console.error('💥 Command Error:', error);
    
    // 🚨 User-friendly error messages
    let errorMessage = '❌ *Unexpected Error!*\n\n';
    
    if (error.message.includes('timeout')) {
      errorMessage += '⏱️ Request timeout\n\n';
      errorMessage += '💡 Try a shorter video or try again later';
    } else if (error.message.includes('size')) {
      errorMessage += '📦 Video too large\n\n';
      errorMessage += '💡 Try a shorter video (<15 minutes)';
    } else {
      errorMessage += '🔧 Service temporarily unavailable\n\n';
      errorMessage += '💡 Please try again in a few minutes';
    }
    
    await sock.sendMessage(chatId, {
      text: errorMessage
    }, { quoted: message });
  }
}

module.exports = videoCommand;
