const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Premium Configuration with ASCII Art
const PREMIUM_CONFIG = {
    processingEmojis: ['⚡', '🔮', '🌀', '🌌', '💫', '✨'],
    successEmojis: ['🎯', '🚀', '💎', '🔥', '🌟', '🎉'],
    premiumTerms: ['Secure Decryption', 'Temporal Recovery', 'Advanced Access', 'Encryption Bypass', 'Media Reconstruction']
};

// ASCII Art for premium look
const ASCII_ART = {
    header: `
╔══════════════════════════════╗
║    🎯 MAVRIX BOT MD 🎯      ║
║    VIEW-ONCE RECOVERY       ║
╚══════════════════════════════╝
    `,
    success: `
╔══════════════════════════════╗
║    ✅ RECOVERY SUCCESSFUL   ║
║        MEDIA SECURED        ║
╚══════════════════════════════╝
    `,
    error: `
╔══════════════════════════════╗
║     ❌ RECOVERY FAILED      ║
║     QUANTUM ANALYSIS        ║
╚══════════════════════════════╝
    `
};

// Generate premium-style messages
function getPremiumMessage(type) {
    const randomTerm = PREMIUM_CONFIG.premiumTerms[Math.floor(Math.random() * PREMIUM_CONFIG.premiumTerms.length)];
    const randomEmoji = PREMIUM_CONFIG[type === 'processing' ? 'processingEmojis' : 'successEmojis'][Math.floor(Math.random() * 6)];
    
    switch(type) {
        case 'processing':
            return `${ASCII_ART.header}\n\n` +
                   `${randomEmoji} *SECURE DECRYPTION INITIATED* ${randomEmoji}\n\n` +
                   `🔒 Secure Container Detected\n` +
                   `⚡ Decrypting view-once protocol...\n` +
                   `🌀 Processing media stream...\n` +
                   `🌌 Advanced recovery in progress...\n\n` +
                   `_Decryption process running..._`;
        
        case 'success_image':
            return `${ASCII_ART.success}\n\n` +
                   `${randomEmoji} *RECOVERY SUCCESSFUL* ${randomEmoji}\n\n` +
                   `📸 View-Once Image Secured\n` +
                   `💎 ${randomTerm} Technology\n` +
                   `🔓 Security Lock: **BYPASSED**\n` +
                   `⚡ Process: **COMPLETE**\n\n` +
                   `_Media successfully recovered..._`;
        
        case 'success_video':
            return `${ASCII_ART.success}\n\n` +
                   `${randomEmoji} *RECOVERY SUCCESSFUL* ${randomEmoji}\n\n` +
                   `🎥 View-Once Video Secured\n` +
                   `💎 ${randomTerm} Technology\n` +
                   `🔓 Security Lock: **BYPASSED**\n` +
                   `⚡ Process: **COMPLETE**\n\n` +
                   `_Video successfully recovered..._`;
        
        default:
            return `${randomEmoji} Recovery Process Complete ${randomEmoji}`;
    }
}

// Channel info for premium look
const channelInfo = {
    contextInfo: {
        forwardingScore: 999999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'Mavrix Bot MD',
            serverMessageId: -1
        }
    }
};

async function viewonceCommand(sock, chatId, message) {
    try {
        // Check if message has quoted message
        if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            await sock.sendMessage(chatId, { 
                text: `${ASCII_ART.error}\n\n` +
                      `❌ *Invalid Usage*\n\n` +
                      `💡 *How to use:*\n` +
                      `1. Reply to a view-once image/video\n` +
                      `2. Type *.vv* command\n` +
                      `3. Wait for recovery process\n\n` +
                      `⚡ *Supported Media:*\n` +
                      `• View-once images\n` +
                      `• View-once videos\n` +
                      `• Disappearing media\n\n` +
                      `_Reply to media and try again..._`
            }, { quoted: message });
            return;
        }

        const quoted = message.message.extendedTextMessage.contextInfo.quotedMessage;
        const quotedImage = quoted?.imageMessage;
        const quotedVideo = quoted?.videoMessage;

        // Validate if it's view-once media
        if (!quotedImage && !quotedVideo) {
            await sock.sendMessage(chatId, { 
                text: `${ASCII_ART.error}\n\n` +
                      `❌ *Unsupported Media*\n\n` +
                      `🔍 *Analysis Report:*\n` +
                      `• No view-once media detected\n` +
                      `• Media type not supported\n` +
                      `• File may be corrupted\n\n` +
                      `💡 *Solution:*\n` +
                      `• Reply to actual view-once media\n` +
                      `• Ensure media is unviewed\n` +
                      `• Check media format\n\n` +
                      `_Please reply to view-once media..._`
            }, { quoted: message });
            return;
        }

        // Check if it's actually view-once
        const isViewOnce = (quotedImage?.viewOnce || quotedVideo?.viewOnce) !== false;
        if (!isViewOnce) {
            await sock.sendMessage(chatId, { 
                text: `${ASCII_ART.error}\n\n` +
                      `❌ *Not View-Once Media*\n\n` +
                      `📋 *Media Analysis:*\n` +
                      `• This is not view-once media\n` +
                      `• Media can be viewed multiple times\n` +
                      `• No recovery needed\n\n` +
                      `💡 *Note:*\n` +
                      `This command only works for:\n` +
                      `• View-once images\n` +
                      `• View-once videos\n` +
                      `• Disappearing media\n\n` +
                      `_Try with actual view-once media..._`
            }, { quoted: message });
            return;
        }

        // Send processing message
        const processingMsg = await sock.sendMessage(chatId, {
            text: getPremiumMessage('processing')
        });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            if (quotedImage) {
                // Download and recover image
                const stream = await downloadContentFromMessage(quotedImage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                // Delete processing message
                try {
                    await sock.sendMessage(chatId, { 
                        delete: processingMsg.key 
                    });
                } catch (deleteError) {
                    console.log('Could not delete processing message:', deleteError.message);
                }
                
                // Send success message
                await sock.sendMessage(chatId, { 
                    text: getPremiumMessage('success_image')
                });
                
                // Send recovered image
                await sock.sendMessage(chatId, { 
                    image: buffer, 
                    fileName: `recovered_image_${Date.now()}.jpg`,
                    caption: '🔓 *Recovered by Mavrix Bot MD*\n_⚡ Advanced Media Recovery Technology_',
                    ...channelInfo
                }, { quoted: message });
                
            } else if (quotedVideo) {
                // Download and recover video
                const stream = await downloadContentFromMessage(quotedVideo, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                // Delete processing message
                try {
                    await sock.sendMessage(chatId, { 
                        delete: processingMsg.key 
                    });
                } catch (deleteError) {
                    console.log('Could not delete processing message:', deleteError.message);
                }
                
                // Send success message
                await sock.sendMessage(chatId, { 
                    text: getPremiumMessage('success_video')
                });
                
                // Send recovered video
                await sock.sendMessage(chatId, { 
                    video: buffer, 
                    fileName: `recovered_video_${Date.now()}.mp4`,
                    caption: '🔓 *Recovered by Mavrix Bot MD*\n_⚡ Advanced Media Recovery Technology_',
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (recoveryError) {
            console.error('ViewOnce Recovery Error:', recoveryError);
            
            // Delete processing message
            try {
                await sock.sendMessage(chatId, { 
                    delete: processingMsg.key 
                });
            } catch (deleteError) {
                console.log('Could not delete processing message:', deleteError.message);
            }
            
            // Send error message
            await sock.sendMessage(chatId, { 
                text: `${ASCII_ART.error}\n\n` +
                      `❌ *Recovery Failed*\n\n` +
                      `🔧 *Technical Details:*\n` +
                      `• Error: ${recoveryError.message}\n` +
                      `• Code: V${Date.now().toString().slice(-4)}\n\n` +
                      `💡 *Troubleshooting:*\n` +
                      `• Check internet connection\n` +
                      `• Try with different media\n` +
                      `• Ensure media is accessible\n\n` +
                      `_Please try again later..._`
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('ViewOnce Command Error:', error);
        await sock.sendMessage(chatId, { 
            text: `${ASCII_ART.error}\n\n` +
                  `⚡ *System Error*\n\n` +
                  `❌ Command execution failed\n` +
                  `🔧 Please try again later\n` +
                  `💎 Contact support if persists\n\n` +
                  `_Error: ${error.message}_`
        }, { quoted: message });
    }
}

module.exports = { viewonceCommand };
