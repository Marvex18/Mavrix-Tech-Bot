/**
 * 🚀 Mavrix Bot - PREMIUM EDITION v2.0
 * 👁️ Autoread Command - Advanced Message Management
 * 🔧 Developed by Mavrix Tech
 */

const fs = require('fs');
const path = require('path');

const MAVRIX_ASCII = `
╔══════════════════════════════════╗
║           🚀 MAVRIX BOT          ║
║           👁️ AUTOREAD           ║
║        PREMIUM EDITION v2.0      ║
╚══════════════════════════════════╝
`;

const MAVRIX_SIGNATURE = `
✨ Developed by Mavrix Tech
🎯 Premium Features | ⚡ Lightning Fast
🔒 Secure | 🛠️ Error Free
`;

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        const premiumConfig = { 
            enabled: false,
            version: "2.0",
            premium: true,
            features: ["smart_mentions", "selective_reading", "advanced_detection"]
        };
        fs.writeFileSync(configPath, JSON.stringify(premiumConfig, null, 2));
        return premiumConfig;
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Toggle autoread feature
async function autoreadCommand(sock, chatId, message) {
    try {
        // Check if sender is the owner or sudo
        const { isSudo } = require('../lib/index');
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = message.key.fromMe || senderIsSudo;
        
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: `${MAVRIX_ASCII}*🚫 PREMIUM ACCESS DENIED!*\n\n📛 This command is exclusive for the owner!\n\n${MAVRIX_SIGNATURE}`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'Mavrix Bot',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Get command arguments
        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        // Initialize or read config
        const config = initConfig();
        
        // Toggle based on argument or toggle current state if no argument
        if (args.length > 0) {
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'enable') {
                config.enabled = true;
            } else if (action === 'off' || action === 'disable') {
                config.enabled = false;
            } else {
                await sock.sendMessage(chatId, {
                    text: `${MAVRIX_ASCII}*❌ INVALID OPTION!*\n\n💡 Usage: .autoread 🟢on/🔴off\n\n${MAVRIX_SIGNATURE}`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: 'Mavrix Bot',
                            serverMessageId: -1
                        }
                    }
                });
                return;
            }
        } else {
            // Toggle current state
            config.enabled = !config.enabled;
        }
        
        // Save updated configuration
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        // Premium status message
        const status = config.enabled ? '🟢 ACTIVATED' : '🔴 DEACTIVATED';
        const emoji = config.enabled ? '👁️' : '🚫';
        const features = config.enabled ? 
            '🎯 *Premium Features Active:*\n• 👁️ Smart Mention Detection\n• ⚡ Selective Reading\n• 🔥 Premium Algorithm\n• 🛡️ Advanced Filtering\n• 🎨 Enhanced UI' :
            '💤 *System Standby Mode*';
        
        await sock.sendMessage(chatId, {
            text: `${MAVRIX_ASCII}*${emoji} AUTOREAD ${status}*\n\n${features}\n\n${MAVRIX_SIGNATURE}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'Mavrix Bot',
                    serverMessageId: -1
                }
            }
        });
        
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error in autoread command:', error);
        await sock.sendMessage(chatId, {
            text: `${MAVRIX_ASCII}*🚨 PREMIUM SYSTEM ERROR!*\n\n❌ Failed to process autoread command!\n\n${MAVRIX_SIGNATURE}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'Mavrix Bot',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Function to check if autoread is enabled
function isAutoreadEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error checking autoread status:', error);
        return false;
    }
}

// Enhanced function to check if bot is mentioned in a message
function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;
    
    console.log('🎯 Mavrix Bot - Scanning for bot mentions...');
    
    // Check for mentions in contextInfo (works for all message types)
    const messageTypes = [
        'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage',
        'documentMessage', 'audioMessage', 'contactMessage', 'locationMessage'
    ];
    
    // Check for explicit mentions in mentionedJid array
    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some(jid => jid === botNumber)) {
                console.log('✅ Mavrix Bot explicitly mentioned!');
                return true;
            }
        }
    }
    
    // Enhanced text content extraction
    const textContent = 
        message.message.conversation || 
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption || '';
    
    if (textContent) {
        // Enhanced @mention detection
        const botUsername = botNumber.split('@')[0];
        if (textContent.includes(`@${botUsername}`)) {
            console.log('✅ Mavrix Bot mentioned via @tag!');
            return true;
        }
        
        // Advanced bot name detection
        const botNames = [
            global.botname?.toLowerCase(), 
            'mavrix', 'mavrix bot', 'bot', 'assistant', 'helper'
        ];
        const words = textContent.toLowerCase().split(/\s+/);
        if (botNames.some(name => words.includes(name))) {
            console.log('✅ Mavrix Bot name detected in message!');
            return true;
        }
    }
    
    console.log('❌ No Mavrix Bot mentions detected');
    return false;
}

// Premium autoread functionality
async function handleAutoread(sock, message) {
    if (isAutoreadEnabled()) {
        // Get bot's ID
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        console.log('🎯 Mavrix Bot - Premium Autoread Active - Scanning message...');
        
        // Check if bot is mentioned using premium detection
        const isBotMentioned = isBotMentionedInMessage(message, botNumber);
        
        if (isBotMentioned) {
            console.log('⚡ Mavrix Bot mentioned - Skipping read receipt for priority handling');
            return false; // Message stays unread in UI for priority attention
        } else {
            // Premium message reading with enhanced handling
            const key = { 
                remoteJid: message.key.remoteJid, 
                id: message.key.id, 
                participant: message.key.participant 
            };
            await sock.readMessages([key]);
            console.log(`✅ Mavrix Bot - Premium Autoread: Marked message as read from ${(message.key.participant || message.key.remoteJid).split('@')[0]}`);
            return true; // Message marked as read
        }
    }
    console.log('🚫 Mavrix Bot - Premium Autoread Inactive');
    return false; // Autoread is disabled
}

module.exports = {
    autoreadCommand,
    isAutoreadEnabled,
    isBotMentionedInMessage,
    handleAutoread
};
