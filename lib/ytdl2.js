/**
 * 🚀 Mavrix Bot - Premium WhatsApp Bot
 * Copyright (c) 2024-2025 Mavrix Tech
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * 🔧 Enhanced YouTube Downloader with Premium Features
 * ✨ Premium styling, ASCII arts, and enhanced error handling
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Mavrix Tech Development Team
 */

const ytdl = require('@distube/ytdl-core');
const yts = require('youtube-yts');
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg')
const NodeID3 = require('node-id3')
const fs = require('fs');
const { fetchBuffer } = require("./myfunc2")
const ytM = require('node-youtube-music')
const { randomBytes } = require('crypto')
const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/
const path = require('path');

class MavrixYTDownloader {
    constructor() {
        this.tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(this.tmpDir)) {
            fs.mkdirSync(this.tmpDir, { recursive: true });
        }
        
        // ASCII Art for Premium Branding
        this.BANNER_ASCII = `
╔══════════════════════════════════════╗
║           🚀 MAVRIX BOT             ║
║         PREMIUM YT DOWNLOADER        ║
║         © 2024-2025 Mavrix Tech      ║
╚══════════════════════════════════════╝
`.trim();
    }

    /**
     * 🎯 Checks if it is YouTube link
     * @param {string|URL} url YouTube url
     * @returns {boolean} Returns true if the given YouTube URL.
     */
    static isYTUrl = (url) => {
        return ytIdRegex.test(url)
    }

    /**
     * 🆔 VideoID from url
     * @param {string|URL} url to get videoID
     * @returns {string}
     */
    static getVideoID = (url) => {
        if (!this.isYTUrl(url)) throw new Error('❌ Invalid YouTube URL')
        return ytIdRegex.exec(url)[1]
    }

    /**
     * 🏷️ Write Track Tag Metadata with Premium Quality
     * @param {string} filePath 
     * @param {Object} Metadata 
     * @param {string} Metadata.Title
     * @param {string} Metadata.Artist
     * @param {string} Metadata.Image
     * @param {string} Metadata.Album
     * @param {string} Metadata.Year
     */
    static WriteTags = async (filePath, Metadata) => {
        try {
            console.log(`🎵 Writing metadata for: ${Metadata.Title}`);
            NodeID3.write(
                {
                    title: Metadata.Title,
                    artist: Metadata.Artist,
                    originalArtist: Metadata.Artist,
                    image: {
                        mime: 'jpeg',
                        type: {
                            id: 3,
                            name: 'front cover',
                        },
                        imageBuffer: (await fetchBuffer(Metadata.Image)).buffer,
                        description: `🎨 Cover of ${Metadata.Title}`,
                    },
                    album: Metadata.Album,
                    year: Metadata.Year || '',
                    composer: 'Mavrix Bot Premium',
                    encodedBy: 'Mavrix Tech © 2025'
                },
                filePath
            );
            console.log('✅ Metadata written successfully');
        } catch (error) {
            console.error('❌ Metadata writing failed:', error);
            throw error;
        }
    }

    /**
     * 🔍 Search YouTube videos
     * @param {string} query 
     * @param {Object} options
     * @returns {Promise<Array>}
     */
    static search = async (query, options = {}) => {
        console.log(`🔍 Searching for: "${query}"`);
        const search = await yts.search({ query, hl: 'id', gl: 'ID', ...options })
        console.log(`✅ Found ${search.videos.length} results`);
        return search.videos
    }

    /**
     * @typedef {Object} TrackSearchResult
     * @property {boolean} isYtMusic is from YT Music search?
     * @property {string} title music title
     * @property {string} artist music artist
     * @property {string} id YouTube ID
     * @property {string} url YouTube URL
     * @property {string} album music album
     * @property {Object} duration music duration {seconds, label}
     * @property {string} image Cover Art
     */

    /**
     * 🎵 Search track with premium details
     * @param {string} query 
     * @returns {Promise<TrackSearchResult[]>}
     */
    static searchTrack = (query) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`🎶 Searching track: "${query}"`);
                let ytMusic = await ytM.searchMusics(query);
                let result = []
                
                console.log(`📊 Processing ${ytMusic.length} music results...`);
                
                for (let i = 0; i < ytMusic.length; i++) {
                    result.push({
                        isYtMusic: true,
                        title: `${ytMusic[i].title} - ${ytMusic[i].artists.map(x => x.name).join(' ')}`,
                        artist: ytMusic[i].artists.map(x => x.name).join(' '),
                        id: ytMusic[i].youtubeId,
                        url: 'https://youtu.be/' + ytMusic[i].youtubeId,
                        album: ytMusic[i].album,
                        duration: {
                            seconds: ytMusic[i].duration.totalSeconds,
                            label: ytMusic[i].duration.label
                        },
                        image: ytMusic[i].thumbnailUrl.replace('w120-h120', 'w600-h600'),
                        quality: '🎵 Premium Audio'
                    })
                }
                
                console.log(`✅ Track search completed: ${result.length} results`);
                resolve(result)
            } catch (error) {
                console.error('❌ Track search failed:', error);
                reject(error)
            }
        })
    }

    /**
     * @typedef {Object} MusicResult
     * @property {TrackSearchResult} meta music meta
     * @property {string} path file path
     * @property {number} size file size in bytes
     */

    /**
     * ⬇️ Download music with premium tag metadata
     * @param {string|TrackSearchResult[]} query title of track want to download
     * @returns {Promise<MusicResult>} filepath of the result
     */
    static downloadMusic = async (query) => {
        try {
            console.log('🎧 Starting premium music download...');
            const getTrack = Array.isArray(query) ? query : await this.searchTrack(query);
            
            if (!getTrack || getTrack.length === 0) {
                throw new Error('❌ No tracks found for download');
            }
            
            const search = getTrack[0];
            console.log(`📥 Downloading: ${search.title}`);
            
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + search.id, { lang: 'id' });
            let stream = ytdl(search.id, { filter: 'audioonly', quality: 140 });
            let songPath = `./MavrixMedia/audio/${randomBytes(3).toString('hex')}.mp3`
            
            // Create directory if not exists
            const dir = path.dirname(songPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            stream.on('error', (err) => {
                console.error('❌ Stream error:', err);
                throw err;
            })

            console.log('🔄 Converting to MP3 with premium quality...');
            const file = await new Promise((resolve, reject) => {
                ffmpeg(stream)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate(192) // Enhanced bitrate for premium quality
                    .audioCodec('libmp3lame')
                    .audioQuality(2) // Higher quality
                    .toFormat('mp3')
                    .on('error', (err) => reject(err))
                    .save(songPath)
                    .on('end', () => {
                        console.log('✅ Conversion completed');
                        resolve(songPath)
                    })
            });
            
            console.log('🏷️ Writing premium metadata...');
            await this.WriteTags(file, { 
                Title: search.title, 
                Artist: search.artist, 
                Image: search.image, 
                Album: search.album, 
                Year: videoInfo.videoDetails.publishDate?.split('-')[0] || '2024'
            });
            
            const fileSize = fs.statSync(songPath).size;
            console.log(`✅ Download completed: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`);
            
            return {
                meta: search,
                path: file,
                size: fileSize,
                quality: '🎵 Premium 192kbps'
            }
        } catch (error) {
            console.error('❌ Music download failed:', error);
            throw new Error(`🎵 Download Error: ${error.message}`)
        }
    }

    /**
     * 🎬 Get downloadable video urls with premium options
     * @param {string|URL} query videoID or YouTube URL
     * @param {string} quality 
     * @returns {Object}
     */
    static mp4 = async (query, quality = 134) => {
        try {
            if (!query) throw new Error('❌ Video ID or YouTube Url is required')
            
            console.log(`🎬 Processing video download: ${query}`);
            const videoId = this.isYTUrl(query) ? this.getVideoID(query) : query
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId, { lang: 'id' });
            const format = ytdl.chooseFormat(videoInfo.formats, { format: quality, filter: 'videoandaudio' })
            
            if (!format) {
                throw new Error('❌ No suitable format found for download');
            }
            
            console.log(`✅ Video info retrieved: ${videoInfo.videoDetails.title}`);
            
            return {
                title: videoInfo.videoDetails.title,
                thumb: videoInfo.videoDetails.thumbnails.slice(-1)[0],
                date: videoInfo.videoDetails.publishDate,
                duration: videoInfo.videoDetails.lengthSeconds,
                channel: videoInfo.videoDetails.ownerChannelName,
                quality: format.qualityLabel,
                contentLength: format.contentLength,
                description: videoInfo.videoDetails.description,
                videoUrl: format.url,
                qualityLabel: `🎥 ${format.qualityLabel}`,
                size: format.contentLength ? `💾 ${(format.contentLength / (1024 * 1024)).toFixed(2)}MB` : 'Unknown'
            }
        } catch (error) {
            console.error('❌ Video processing failed:', error);
            throw error
        }
    }

    /**
     * 🎧 Download YouTube to premium mp3
     * @param {string|URL} url YouTube link want to download to mp3
     * @param {Object} metadata track metadata
     * @param {boolean} autoWriteTags if set true, it will auto write tags meta following the YouTube info
     * @returns {Promise<Object>}
     */
    static mp3 = async (url, metadata = {}, autoWriteTags = false) => {
        try {
            if (!url) throw new Error('❌ Video ID or YouTube Url is required')
            
            console.log('🎧 Starting premium MP3 download...');
            url = this.isYTUrl(url) ? 'https://www.youtube.com/watch?v=' + this.getVideoID(url) : url
            const { videoDetails } = await ytdl.getInfo(url, { lang: 'id' });
            
            console.log(`📥 Downloading: ${videoDetails.title}`);
            let stream = ytdl(url, { filter: 'audioonly', quality: 140 });
            let songPath = `./MavrixMedia/audio/${randomBytes(3).toString('hex')}.mp3`
            
            // Create directory if not exists
            const dir = path.dirname(songPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            let starttime;
            let downloaded = 0;
            let total = 0;
            
            stream.once('response', () => {
                starttime = Date.now();
                console.log('🔄 Download started...');
            });
            
            stream.on('progress', (chunkLength, downloadedBytes, totalBytes) => {
                downloaded = downloadedBytes;
                total = totalBytes;
                const percent = (downloadedBytes / totalBytes * 100).toFixed(2);
                const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                const estimatedDownloadTime = (downloadedMinutes / (percent / 100)) - downloadedMinutes;
                
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`⬇️  ${percent}% downloaded `);
                process.stdout.write(`(${(downloadedBytes / 1024 / 1024).toFixed(2)}MB of ${(totalBytes / 1024 / 1024).toFixed(2)}MB)\n`);
                process.stdout.write(`⏱️  elapsed: ${downloadedMinutes.toFixed(2)}min`);
                process.stdout.write(`, ETA: ${estimatedDownloadTime.toFixed(2)}min `);
                readline.moveCursor(process.stdout, 0, -1);
            });
            
            stream.on('end', () => {
                process.stdout.write('\n\n');
                console.log('✅ Download completed, starting conversion...');
            });
            
            stream.on('error', (err) => {
                console.error('❌ Stream error:', err);
                throw err;
            })

            const file = await new Promise((resolve, reject) => {
                ffmpeg(stream)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate(192) // Enhanced premium quality
                    .audioCodec('libmp3lame')
                    .audioQuality(2)
                    .toFormat('mp3')
                    .on('error', (err) => reject(err))
                    .save(songPath)
                    .on('end', () => {
                        console.log('✅ Conversion completed');
                        resolve(songPath)
                    })
            });
            
            if (Object.keys(metadata).length !== 0) {
                console.log('🏷️ Writing custom metadata...');
                await this.WriteTags(file, metadata)
            }
            
            if (autoWriteTags) {
                console.log('🏷️ Writing auto metadata...');
                await this.WriteTags(file, { 
                    Title: videoDetails.title, 
                    Album: videoDetails.author.name, 
                    Year: videoDetails.publishDate?.split('-')[0] || '2024', 
                    Image: videoDetails.thumbnails.slice(-1)[0].url 
                })
            }
            
            const fileSize = fs.statSync(songPath).size;
            console.log(`✅ MP3 download completed: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`);
            
            return {
                meta: {
                    title: videoDetails.title,
                    channel: videoDetails.author.name,
                    seconds: videoDetails.lengthSeconds,
                    image: videoDetails.thumbnails.slice(-1)[0].url,
                    quality: '🎵 Premium 192kbps'
                },
                path: file,
                size: fileSize,
                duration: `⏱️ ${Math.floor(videoDetails.lengthSeconds / 60)}:${(videoDetails.lengthSeconds % 60).toString().padStart(2, '0')}`
            }
        } catch (error) {
            console.error('❌ MP3 download failed:', error);
            throw error
        }
    }

    /**
     * 🎧 Enhanced MP3 download with premium features
     * @param {string} url YouTube URL
     * @returns {Promise<Object>}
     */
    async mp3(url) {
        try {
            console.log('🚀 Starting premium MP3 download...');
            console.log(this.BANNER_ASCII);
            
            const info = await ytdl.getInfo(url);
            const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
            
            const fileName = `mavrix_${Date.now()}.mp3`;
            const filePath = path.join(this.tmpDir, fileName);

            console.log(`📥 Downloading: ${info.videoDetails.title}`);
            console.log(`🎵 Quality: ${audioFormat.qualityLabel}`);

            return new Promise((resolve, reject) => {
                const stream = ytdl(url, {
                    quality: 'highestaudio',
                    filter: 'audioonly'
                });

                let startTime = Date.now();
                stream.on('progress', (chunkLength, downloaded, total) => {
                    const percent = (downloaded / total * 100).toFixed(2);
                    const elapsed = (Date.now() - startTime) / 1000;
                    process.stdout.write(`\r⬇️  ${percent}% | ${(downloaded / 1024 / 1024).toFixed(2)}MB | ${elapsed.toFixed(1)}s`);
                });

                ffmpeg(stream)
                    .audioBitrate(192) // Premium bitrate
                    .audioChannels(2)
                    .audioFrequency(44100)
                    .toFormat('mp3')
                    .on('start', () => console.log('\n🔄 Converting to premium MP3...'))
                    .on('progress', (progress) => {
                        process.stdout.write(`\r🎵 Converting: ${progress.percent?.toFixed(2) || '0'}%`);
                    })
                    .save(filePath)
                    .on('end', () => {
                        console.log('\n✅ Conversion completed!');
                        const stats = fs.statSync(filePath);
                        resolve({
                            path: filePath,
                            meta: {
                                title: info.videoDetails.title,
                                thumbnail: info.videoDetails.thumbnails[0].url,
                                duration: info.videoDetails.lengthSeconds,
                                channel: info.videoDetails.author.name,
                                quality: '🎵 Premium 192kbps',
                                size: `💾 ${(stats.size / (1024 * 1024)).toFixed(2)}MB`
                            }
                        });
                    })
                    .on('error', (err) => {
                        console.error('\n❌ Conversion failed:', err);
                        reject(err);
                    });
            });
        } catch (error) {
            console.error('❌ Premium download failed:', error);
            throw error;
        }
    }

    /**
     * 📊 Get download status with premium formatting
     * @returns {string}
     */
    getStatus() {
        return `
${this.BANNER_ASCII}

📊 **Download Status:**
┣ 🔹 **Service:** 🟢 Active
┣ 🔹 **Quality:** 🎵 Premium 192kbps
┣ 🔹 **Format:** MP3/MP4
┣ 🔹 **Features:** Metadata Tagging
┣ 🔹 **Version:** 2.0 Premium
┗ 🔹 **Developer:** Mavrix Tech

✨ **Ready for premium downloads!**
        `.trim();
    }
}

module.exports = new MavrixYTDownloader();
