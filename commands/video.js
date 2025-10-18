// [file name]: video.js
const axios = require('axios');
const yts = require('yt-search');

// 🎯 Production-Grade Multi-API Configuration for YouTube
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
          size: data.result.size,
          type: 'youtube'
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
          size: data.result.size,
          type: 'youtube'
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
          size: data.size,
          type: 'youtube'
        };
      }
      return null;
    }
  }
];

// 🌍 GLOBAL MOVIE APIS Configuration
const MOVIE_APIS = [
  // 🌏 ASIA
  {
    name: "Bollywood-API",
    url: (query) => `https://bollywood-api.mavrix.workers.dev/search?title=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.movie) {
        const movie = data.movie;
        return {
          download: movie.download_link,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '1.5GB',
          type: 'movie',
          genre: 'Bollywood',
          year: movie.year,
          language: movie.language || 'Hindi',
          region: 'India',
          thumbnail: movie.poster
        };
      }
      return null;
    }
  },
  {
    name: "KoreanMovies-API",
    url: (query) => `https://korean-movies-api.vercel.app/search?q=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.movies && data.movies.length > 0) {
        const movie = data.movies[0];
        return {
          download: movie.downloadUrl,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '1080p',
          size: movie.size || '1.8GB',
          type: 'movie',
          genre: 'Korean Drama',
          year: movie.year,
          region: 'South Korea',
          subtitle: movie.subtitle || 'English',
          thumbnail: movie.thumbnail
        };
      }
      return null;
    }
  },
  {
    name: "FilipinoMovies-API",
    url: (query) => `https://pinoy-movies-api.cyclic.app/search?title=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.results && data.results.length > 0) {
        const movie = data.results[0];
        return {
          download: movie.download_link,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '1.2GB',
          type: 'movie',
          genre: movie.genre || 'Filipino',
          year: movie.year,
          region: 'Philippines',
          language: 'Tagalog',
          thumbnail: movie.poster
        };
      }
      return null;
    }
  },
  {
    name: "JapaneseAnime-API",
    url: (query) => `https://anime-movies-api.vercel.app/search?q=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.anime && data.anime.length > 0) {
        const movie = data.anime[0];
        return {
          download: movie.download_url,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '1080p',
          size: movie.size || '1.5GB',
          type: 'movie',
          genre: 'Anime',
          year: movie.year,
          region: 'Japan',
          language: 'Japanese',
          thumbnail: movie.image
        };
      }
      return null;
    }
  },
  {
    name: "ChineseMovies-API",
    url: (query) => `https://chinese-movies-api.vercel.app/search?title=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.movies && data.movies.length > 0) {
        const movie = data.movies[0];
        return {
          download: movie.downloadLink,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '1.3GB',
          type: 'movie',
          genre: movie.genre || 'Chinese',
          year: movie.year,
          region: 'China',
          language: 'Mandarin',
          thumbnail: movie.poster
        };
      }
      return null;
    }
  },
  {
    name: "ThaiMovies-API",
    url: (query) => `https://thai-movies-api.cyclic.app/search?q=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.results && data.results.length > 0) {
        const movie = data.results[0];
        return {
          download: movie.download_url,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '1.1GB',
          type: 'movie',
          genre: 'Thai Drama',
          year: movie.year,
          region: 'Thailand',
          language: 'Thai',
          thumbnail: movie.thumbnail
        };
      }
      return null;
    }
  },

  // 🌍 AFRICA
  {
    name: "Nollywood-API",
    url: (query) => `https://nollywood-api.mavrix.workers.dev/search?movie=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.movies && data.movies.length > 0) {
        const movie = data.movies[0];
        return {
          download: movie.download_link,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '800MB',
          type: 'movie',
          genre: 'Nollywood',
          year: movie.year,
          region: 'Nigeria',
          language: movie.language || 'English',
          thumbnail: movie.poster
        };
      }
      return null;
    }
  },
  {
    name: "AfricanMovies-API",
    url: (query) => `https://african-movies-api.vercel.app/search?title=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.results && data.results.length > 0) {
        const movie = data.results[0];
        return {
          download: movie.downloadUrl,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '900MB',
          type: 'movie',
          genre: movie.genre || 'African Cinema',
          year: movie.year,
          region: movie.country || 'Africa',
          language: movie.language,
          thumbnail: movie.image
        };
      }
      return null;
    }
  },

  // 🌎 NORTH AMERICA
  {
    name: "Hollywood-API",
    url: (query) => `https://hollywood-movies-api.cyclic.app/search?q=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.movies && data.movies.length > 0) {
        const movie = data.movies[0];
        return {
          download: movie.download_link,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '1080p',
          size: movie.size || '2.0GB',
          type: 'movie',
          genre: movie.genre || 'Hollywood',
          year: movie.year,
          region: 'USA',
          language: 'English',
          rating: movie.rating,
          thumbnail: movie.poster
        };
      }
      return null;
    }
  },
  {
    name: "CanadianMovies-API",
    url: (query) => `https://canadian-movies-api.vercel.app/search?title=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.results && data.results.length > 0) {
        const movie = data.results[0];
        return {
          download: movie.downloadUrl,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '1.5GB',
          type: 'movie',
          genre: movie.genre || 'Canadian',
          year: movie.year,
          region: 'Canada',
          language: movie.language || 'English/French',
          thumbnail: movie.poster
        };
      }
      return null;
    }
  },

  // 🌎 LATIN AMERICA
  {
    name: "MexicanMovies-API",
    url: (query) => `https://mexican-movies-api.cyclic.app/search?q=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.peliculas && data.peliculas.length > 0) {
        const movie = data.peliculas[0];
        return {
          download: movie.descarga,
          title: movie.titulo,
          duration: 'Película Completa',
          quality: movie.calidad || '720p',
          size: movie.tamaño || '1.2GB',
          type: 'movie',
          genre: movie.genero || 'Cine Mexicano',
          year: movie.año,
          region: 'México',
          language: 'Español',
          thumbnail: movie.poster
        };
      }
      return null;
    }
  },
  {
    name: "BrazilianMovies-API",
    url: (query) => `https://brazil-movies-api.vercel.app/search?filme=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.filmes && data.filmes.length > 0) {
        const movie = data.filmes[0];
        return {
          download: movie.link_download,
          title: movie.titulo,
          duration: 'Filme Completo',
          quality: movie.qualidade || '720p',
          size: movie.tamanho || '1.3GB',
          type: 'movie',
          genre: movie.genero || 'Cinema Brasileiro',
          year: movie.ano,
          region: 'Brazil',
          language: 'Português',
          thumbnail: movie.cartaz
        };
      }
      return null;
    }
  },

  // 🌏 AUSTRALIA & OCEANIA
  {
    name: "AustralianMovies-API",
    url: (query) => `https://australian-movies-api.cyclic.app/search?title=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.movies && data.movies.length > 0) {
        const movie = data.movies[0];
        return {
          download: movie.downloadUrl,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '1.4GB',
          type: 'movie',
          genre: movie.genre || 'Australian Cinema',
          year: movie.year,
          region: 'Australia',
          language: 'English',
          thumbnail: movie.poster
        };
      }
      return null;
    }
  },

  // 🌍 EUROPE
  {
    name: "EuropeanMovies-API",
    url: (query) => `https://europe-movies-api.vercel.app/search?film=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.films && data.films.length > 0) {
        const movie = data.films[0];
        return {
          download: movie.download_link,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '1080p',
          size: movie.size || '1.6GB',
          type: 'movie',
          genre: movie.genre || 'European Cinema',
          year: movie.year,
          region: movie.country || 'Europe',
          language: movie.language,
          thumbnail: movie.poster
        };
      }
      return null;
    }
  },
  {
    name: "FrenchMovies-API",
    url: (query) => `https://french-cinema-api.cyclic.app/search?titre=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.films && data.films.length > 0) {
        const movie = data.films[0];
        return {
          download: movie.lien_telechargement,
          title: movie.titre,
          duration: 'Film Complet',
          quality: movie.qualite || '720p',
          size: movie.taille || '1.5GB',
          type: 'movie',
          genre: movie.genre || 'Cinéma Français',
          year: movie.année,
          region: 'France',
          language: 'Français',
          thumbnail: movie.affiche
        };
      }
      return null;
    }
  },

  // 🌐 GLOBAL BACKUP APIS
  {
    name: "GlobalMovies-API",
    url: (query) => `https://global-movies-api.mavrix.workers.dev/search?q=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.results && data.results.length > 0) {
        const movie = data.results[0];
        return {
          download: movie.download_url,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '1.5GB',
          type: 'movie',
          genre: movie.genre,
          year: movie.year,
          region: movie.region || 'Global',
          language: movie.language,
          rating: movie.rating,
          thumbnail: movie.thumbnail
        };
      }
      return null;
    }
  },
  {
    name: "MovieDB-Proxy",
    url: (query) => `https://moviedb-proxy.vercel.app/api/search?query=${encodeURIComponent(query)}`,
    map: (data) => {
      if (data?.movies && data.movies.length > 0) {
        const movie = data.movies[0];
        return {
          download: movie.stream_url,
          title: movie.title,
          duration: 'Full Movie',
          quality: movie.quality || '720p',
          size: movie.size || '1.2GB',
          type: 'movie',
          genre: movie.genres?.[0] || 'Movie',
          year: movie.release_date?.split('-')[0],
          region: 'Global',
          language: movie.original_language,
          rating: movie.vote_average,
          thumbnail: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        };
      }
      return null;
    }
  }
];

// ⚙️ Production Configuration
const CONFIG = {
  timeout: 120000, // 2 minutes for movies
  maxRetries: 3,
  retryDelay: 1000,
  maxVideoSize: 100 * 1024 * 1024, // 100MB WhatsApp limit
  maxVideoDuration: 1800, // 30 minutes in seconds
  movieKeywords: [
    // Global movie terms
    'movie', 'film', 'cinema', 'pelicula', 'filme', 'film', 'cine',
    // Regions
    'hollywood', 'bollywood', 'nollywood', 'korean', 'japanese', 'chinese',
    'filipino', 'thai', 'indian', 'nigerian', 'african', 'european',
    'french', 'spanish', 'mexican', 'brazilian', 'australian', 'canadian',
    // Languages
    'english', 'hindi', 'tagalog', 'korean', 'japanese', 'mandarin',
    'thai', 'french', 'spanish', 'portuguese', 'german', 'italian',
    // Specific indicators
    'full movie', 'hd movie', 'download movie', 'watch online', 'película completa', 'filme completo',
    // Genres worldwide
    'action', 'comedy', 'drama', 'horror', 'romance', 'sci-fi', 'thriller', 
    'adventure', 'fantasy', 'animation', 'documentary', 'musical', 'historical'
  ],
  regionKeywords: {
    'india': ['bollywood', 'hindi', 'tamil', 'telugu', 'indian'],
    'korea': ['korean', 'k-drama', 'korean movie'],
    'philippines': ['filipino', 'pinoy', 'tagalog'],
    'japan': ['japanese', 'anime', 'japan movie'],
    'china': ['chinese', 'mandarin', 'china movie'],
    'thailand': ['thai', 'thai drama', 'thailand'],
    'nigeria': ['nollywood', 'nigerian', 'naija'],
    'africa': ['african', 'ghana', 'kenya', 'south africa'],
    'usa': ['hollywood', 'american', 'usa movie'],
    'canada': ['canadian', 'canada'],
    'mexico': ['mexican', 'méxico', 'pelicula mexicana'],
    'brazil': ['brazilian', 'brasil', 'filme brasileiro'],
    'australia': ['australian', 'australia'],
    'france': ['french', 'français', 'film français'],
    'europe': ['european', 'british', 'german', 'italian', 'spanish']
  }
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

// 🎯 Smart Query Classifier with Region Detection
function classifyQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Detect specific regions
  let detectedRegion = null;
  for (const [region, keywords] of Object.entries(CONFIG.regionKeywords)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      detectedRegion = region;
      break;
    }
  }
  
  // Check if it's likely a movie request
  const isMovieRequest = CONFIG.movieKeywords.some(keyword => 
    lowerQuery.includes(keyword)
  ) || 
  // Check for movie title patterns
  /(movie|film|cinema|pelicula|filme|part\s+\d+|chapter\s+\d+|season\s+\d+)/i.test(query) ||
  // Check for specific global movie titles
  /(avengers|infinity war|endgame|black panther|spider-man|batman|superman|wonder woman|joker|titanic|inception|interstellar|the matrix|bahubali|rrr|dangal|parasite|train to busan|oldboy)/i.test(query);
  
  return {
    isMovie: isMovieRequest,
    isYouTube: !isMovieRequest || lowerQuery.includes('youtube') || lowerQuery.includes('yt'),
    region: detectedRegion,
    query: query
  };
}

// 🎯 Smart API Selector based on Region
function getRegionalAPIs(region) {
  if (!region) return MOVIE_APIS; // Return all if no region detected
  
  const regionalAPIs = MOVIE_APIS.filter(api => {
    const apiRegion = api.map?.({})?.region?.toLowerCase();
    return apiRegion && apiRegion.includes(region.toLowerCase());
  });
  
  // Return regional APIs + global fallbacks
  return [...regionalAPIs, ...MOVIE_APIS.filter(api => !api.map?.({})?.region)];
}

// 🔍 Smart Video Selection
function findBestVideo(videos) {
  if (!videos || !videos.length) return null;
  
  const shortVideo = videos.find(v => v.seconds <= CONFIG.maxVideoDuration);
  return shortVideo || videos[0];
}

// 📊 Format Helpers
function formatDuration(seconds) {
  if (!seconds) return 'Unknown';
  if (seconds === 'Full Movie' || seconds === 'Película Completa' || seconds === 'Filme Completo') return seconds;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown';
  
  if (typeof bytes === 'string') {
    return bytes;
  }
  
  const mb = bytes / (1024 * 1024);
  if (mb > 1024) {
    return (mb / 1024).toFixed(2) + ' GB';
  }
  return mb.toFixed(2) + ' MB';
}

function getRegionFlag(region) {
  const flags = {
    'india': '🇮🇳',
    'korea': '🇰🇷', 
    'philippines': '🇵🇭',
    'japan': '🇯🇵',
    'china': '🇨🇳',
    'thailand': '🇹🇭',
    'nigeria': '🇳🇬',
    'africa': '🌍',
    'usa': '🇺🇸',
    'canada': '🇨🇦',
    'mexico': '🇲🇽',
    'brazil': '🇧🇷',
    'australia': '🇦🇺',
    'france': '🇫🇷',
    'europe': '🇪🇺'
  };
  return flags[region] || '🎬';
}

// 🎨 Premium Message Templates
function createThumbnailCaption(videoInfo, searchQuery, isMovie = false, region = null) {
  const title = videoInfo.title || searchQuery;
  const duration = formatDuration(videoInfo.duration);
  
  if (isMovie) {
    const flag = getRegionFlag(region);
    return `${flag} *${title}*

📊 Movie Details:
⏱️ Duration: ${duration}
🎭 Genre: ${videoInfo.genre || 'Various'}
🌍 Region: ${videoInfo.region || 'Global'}
⭐ Rating: ${videoInfo.rating || 'Not rated'}
📅 Year: ${videoInfo.year || 'Unknown'}
🗣️ Language: ${videoInfo.language || 'Various'}

⬇️ Preparing your movie download...
🔄 This may take 2-5 minutes...`;
  }
  
  return `🎬 *${title}*

📊 Metadata:
⏱️ Duration: ${duration}
👀 ${videoInfo.views ? `${videoInfo.views.toLocaleString()} views` : ''}
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
  const flag = getRegionFlag(videoData.region?.toLowerCase());
  
  if (videoData.type === 'movie') {
    return `✅ *Movie Download Successful!* ${flag}

🎬 *${title}*

📊 Movie Details:
🎯 Quality: ${quality}
⏱️ Duration: ${duration}
📦 Size: ${size}
🎭 Genre: ${videoData.genre || 'Various'}
🌍 Region: ${videoData.region || 'Global'}
⭐ Rating: ${videoData.rating || 'Not rated'}
📅 Year: ${videoData.year || 'Unknown'}
🗣️ Language: ${videoData.language || 'Various'}

🔧 Source: ${videoData.source}

✨ *Enjoy your movie!* 🍿`;
  }
  
  return `✅ *Download Successful!*

📹 *${title}*

📊 Details:
🎯 Quality: ${quality}
⏱️ Duration: ${duration}
📦 Size: ${size}
🔧 Source: ${videoData.source}

✨ *Enjoy your video!*`;
}

// 🚀 Caching System
let lastWorkingYTAPI = null;
let lastWorkingMovieAPIs = {};

// 🎯 Multi-API Fallback for YouTube
async function fetchFromYouTubeAPIs(videoUrl) {
  // ... (same YouTube API code as before)
  const errors = [];
  
  if (lastWorkingYTAPI) {
    try {
      console.log(`🚀 Trying cached YouTube API: ${lastWorkingYTAPI.name}`);
      const data = await smartFetch(lastWorkingYTAPI.url(videoUrl));
      const result = lastWorkingYTAPI.map(data);
      
      if (result && result.download) {
        console.log(`✅ Cached YouTube API success!`);
        return {
          ...result,
          source: lastWorkingYTAPI.name + ' (cached)'
        };
      }
    } catch (error) {
      console.warn(`❌ Cached YouTube API failed:`, error.message);
      lastWorkingYTAPI = null;
    }
  }
  
  for (const api of YT_APIS) {
    try {
      console.log(`🔄 Trying ${api.name} API...`);
      const data = await smartFetch(api.url(videoUrl));
      const result = api.map(data);
      
      if (result && result.download) {
        console.log(`✅ ${api.name} success!`);
        lastWorkingYTAPI = api;
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
  
  throw new Error('All YouTube download APIs failed.');
}

// 🎯 Multi-API Fallback for Movies with Regional Priority
async function fetchFromMovieAPIs(searchQuery, region = null) {
  const errors = [];
  const apisToTry = getRegionalAPIs(region);
  
  console.log(`🎯 Using ${apisToTry.length} APIs for region: ${region || 'Global'}`);
  
  // Try cached APIs first
  if (region && lastWorkingMovieAPIs[region]) {
    try {
      const api = lastWorkingMovieAPIs[region];
      console.log(`🚀 Trying cached ${region} API: ${api.name}`);
      const data = await smartFetch(api.url(searchQuery));
      const result = api.map(data);
      
      if (result && result.download) {
        console.log(`✅ Cached ${region} API success!`);
        return {
          ...result,
          source: api.name + ' (cached)'
        };
      }
    } catch (error) {
      console.warn(`❌ Cached ${region} API failed:`, error.message);
      delete lastWorkingMovieAPIs[region];
    }
  }
  
  // Try all regional/global APIs
  for (const api of apisToTry) {
    try {
      console.log(`🔄 Trying ${api.name} API...`);
      const data = await smartFetch(api.url(searchQuery));
      const result = api.map(data);
      
      if (result && result.download) {
        console.log(`✅ ${api.name} success!`);
        
        // Cache the working API for this region
        if (region) {
          lastWorkingMovieAPIs[region] = api;
        }
        
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
  
  throw new Error(`No movies found for "${searchQuery}". Try different title or check YouTube for trailer.`);
}

// 📏 Video Size Validator
async function validateVideoSize(videoUrl) {
  try {
    const response = await httpClient.head(videoUrl, { timeout: 15000 });
    const contentLength = response.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > CONFIG.maxVideoSize) {
      return {
        valid: false,
        size: parseInt(contentLength),
        message: `❌ Video too large (${formatFileSize(contentLength)}). WhatsApp limit is 100MB.`
      };
    }
    
    return { valid: true, size: parseInt(contentLength) };
  } catch (error) {
    console.warn('Size validation failed, proceeding anyway:', error.message);
    return { valid: true, size: null };
  }
}

// 🎵 PRODUCTION-READY .ytmp4 COMMAND with Global Movie Support
async function videoCommand(sock, chatId, message) {
  try {
    // ✅ Extract text safely
    let text = '';
    if (message.message?.conversation) {
      text = message.message.conversation;
    } else if (message.message?.extendedTextMessage?.text) {
      text = message.message.extendedTextMessage.text;
    } else if (message.message?.imageMessage?.caption) {
      text = message.message.imageMessage.caption;
    }
    
    if (!text.startsWith('.ytmp4')) return;
    
    const args = text.split(' ').slice(1);
    const searchQuery = args.join(' ').trim();

    // 🚫 Validate input
    if (!searchQuery) {
      await sock.sendMessage(chatId, {
        text: `🌍 *Global Video & Movie Downloader* 🎬

❌ *Usage:* .ytmp4 [video/movie title or YouTube URL]

*Examples:*
• .ytmp4 never gonna give you up
• .ytmp4 https://youtu.be/dQw4w9WgXcQ
• .ytmp4 Avengers Endgame
• .ytmp4 Korean romance movie
• .ytmp4 Bollywood action film
• .ytmp4 Nollywood comedy
• .ytmp4 Filipino drama
• .ytmp4 Anime movie
• .ytmp4 French cinema

*Supported Regions:* 🇮🇳 🇰🇷 🇵🇭 🇯🇵 🇨🇳 🇹🇭 🇳🇬 🇺🇸 🇨🇦 🇲🇽 🇧🇷 🇦🇺 🇫🇷 🌍`
      }, { quoted: message });
      return;
    }

    // 🎯 Smart Query Classification
    const queryType = classifyQuery(searchQuery);
    console.log(`🔍 Query classification:`, queryType);

    let videoUrl = '';
    let videoInfo = {};
    let isUrl = searchQuery.startsWith('http');
    let isMovieSearch = queryType.isMovie && !isUrl;
    let detectedRegion = queryType.region;

    // 🔍 Smart Content Search
    if (isUrl) {
      videoUrl = searchQuery;
      
      if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        await sock.sendMessage(chatId, {
          text: '❌ *Invalid YouTube URL*\n\nPlease provide a valid YouTube video link.'
        }, { quoted: message });
        return;
      }
    } else if (isMovieSearch) {
      // Movie search flow with regional detection
      const regionText = detectedRegion ? `for ${detectedRegion.toUpperCase()} ${getRegionFlag(detectedRegion)}` : "globally";
      await sock.sendMessage(chatId, {
        text: `🎬 *Searching Movies* ${regionText}:\n"${searchQuery}"\n📡 Scanning worldwide movie databases...`
      }, { quoted: message });

      try {
        // Fetch movie data with regional priority
        const movieData = await fetchFromMovieAPIs(searchQuery, detectedRegion);
        
        if (!movieData) {
          await sock.sendMessage(chatId, {
            text: `❌ No movies found for "${searchQuery}"\n\n💡 Try:\n• Different movie title\n• Check spelling\n• Specify region (e.g., "Korean movie")\n• Try YouTube for trailers`
          }, { quoted: message });
          return;
        }

        videoInfo = {
          title: movieData.title,
          duration: movieData.duration,
          thumbnail: movieData.thumbnail,
          genre: movieData.genre,
          year: movieData.year,
          rating: movieData.rating,
          region: movieData.region,
          language: movieData.language
        };

        videoUrl = movieData.download;
        
        console.log(`🎯 Selected Movie: ${videoInfo.title} (${videoInfo.region} - ${videoInfo.year})`);
        
      } catch (searchError) {
        console.error('Movie search error:', searchError);
        await sock.sendMessage(chatId, {
          text: `❌ Movie search failed for "${searchQuery}"\n\nError: ${searchError.message}\n\n🔄 Falling back to YouTube search...`
        });
        
        // Fallback to YouTube
        isMovieSearch = false;
      }
    }

    // If not a movie search or movie search failed, use YouTube
    if (!isMovieSearch && !isUrl) {
      await sock.sendMessage(chatId, {
        text: `🔍 *Searching YouTube:* "${searchQuery}"\n📡 Finding the best video match...`
      }, { quoted: message });

      try {
        const searchResults = await yts(searchQuery);
        
        if (!searchResults.videos || searchResults.videos.length === 0) {
          await sock.sendMessage(chatId, {
            text: `❌ No videos found for "${searchQuery}"\n\n💡 Try:\n• Different keywords\n• Movie titles with region\n• YouTube URL directly`
          }, { quoted: message });
          return;
        }

        videoInfo = findBestVideo(searchResults.videos);
        if (!videoInfo) {
          await sock.sendMessage(chatId, {
            text: `❌ No suitable videos found for "${searchQuery}"`
          }, { quoted: message });
          return;
        }
        
        videoUrl = videoInfo.url;
        console.log(`🎯 Selected YouTube: ${videoInfo.title} (${formatDuration(videoInfo.duration)})`);
        
      } catch (searchError) {
        await sock.sendMessage(chatId, {
          text: `❌ Search failed for "${searchQuery}"\n\nError: ${searchError.message}`
        }, { quoted: message });
        return;
      }
    }

    // 📸 Send thumbnail
    if (videoInfo.thumbnail && (videoInfo.thumbnail.startsWith('https') || (isMovieSearch && videoInfo.thumbnail))) {
      try {
        await sock.sendMessage(chatId, {
          image: { url: videoInfo.thumbnail },
          caption: createThumbnailCaption(videoInfo, searchQuery, isMovieSearch, detectedRegion)
        });
      } catch (thumbError) {
        console.warn('📸 Thumbnail skipped:', thumbError.message);
      }
    }

    // ⏳ Download progress
    const downloadMessage = isMovieSearch ? 
      `🔄 *Downloading Movie...* ${getRegionFlag(detectedRegion)}\n\n📥 Connecting to ${detectedRegion ? detectedRegion + ' ' : ''}movie servers...\n⏳ This may take 2-5 minutes\n🎯 Quality: ${videoInfo.quality || 'HD'}\n💾 Large file - please be patient` :
      `🔄 *Downloading Video...*\n\n📥 Connecting to servers...\n⏳ This may take 30-60 seconds\n🎯 Quality: 720p HD`;
    
    await sock.sendMessage(chatId, { text: downloadMessage });

    // 🎬 Download content
    let videoData;
    try {
      if (isMovieSearch) {
        videoData = await fetchFromMovieAPIs(searchQuery, detectedRegion);
      } else {
        videoData = await fetchFromYouTubeAPIs(videoUrl);
      }
      
      const sizeCheck = await validateVideoSize(videoData.download);
      if (!sizeCheck.valid) {
        await sock.sendMessage(chatId, { 
          text: sizeCheck.message + '\n\n💡 Try searching for a shorter version or trailer.' 
        }, { quoted: message });
        return;
      }
      
    } catch (downloadError) {
      console.error('🎬 Download error:', downloadError);
      
      const errorMessage = isMovieSearch ? 
        `❌ *Movie Download Failed!* ${getRegionFlag(detectedRegion)}\n\nError: ${downloadError.message}\n\n💡 Please try:\n• Different movie title\n• Specify region clearly\n• Check if movie exists\n• Try YouTube for trailer` :
        `❌ *Download Failed!*\n\nError: ${downloadError.message}\n\n💡 Please try:\n• Different video\n• Try again later\n• Shorter video`;
      
      await sock.sendMessage(chatId, { text: errorMessage }, { quoted: message });
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

    console.log(`✅ ${isMovieSearch ? 'Movie' : 'Video'} sent successfully: ${videoData.title}`);

    // 🌍 Send global movie guide
    if (isMovieSearch) {
      setTimeout(async () => {
        await sock.sendMessage(chatId, {
          text: `🌍 *World Cinema Guide* 🎬

*Regional Search Examples:*
🇮🇳 .ytmp4 Bollywood movie
🇰🇷 .ytmp4 Korean drama  
🇵🇭 .ytmp4 Filipino film
🇯🇵 .ytmp4 Anime movie
🇳🇬 .ytmp4 Nollywood comedy
🇺🇸 .ytmp4 Hollywood action
🇫🇷 .ytmp4 French cinema
🇧🇷 .ytmp4 Brazilian movie

*Pro Tip:* Add region name for better results!
✨ *Enjoy global cinema!* 🍿`
        });
      }, 3000);
    }

  } catch (error) {
    console.error('💥 Command Error:', error);
    
    let errorMessage = '❌ *Unexpected Error!*\n\n';
    
    if (error.message.includes('timeout')) {
      errorMessage += '⏱️ Request timeout\n\n';
      errorMessage += '💡 Try again later or search for shorter content';
    } else if (error.message.includes('size')) {
      errorMessage += '📦 File too large\n\n';
      errorMessage += '💡 Try shorter version or trailer';
    } else if (error.message.includes('movie')) {
      errorMessage += '🎬 Content not available\n\n';
      errorMessage += '💡 Try different title or region';
    } else {
      errorMessage += '🔧 Service temporarily unavailable\n\n';
      errorMessage += '💡 Please try again in a few minutes';
    }
    
    await sock.sendMessage(chatId, { text: errorMessage }, { quoted: message });
  }
}

module.exports = videoCommand;
