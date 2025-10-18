/**
 * 🚀 Mavrix Bot - PREMIUM EDITION
 * ⌨️ Autotyping Command - Premium Typing Indicators
 * 🔧 Developed by Mavrix Tech
 */

const fs = require('fs');
const path = require('path');

const MAVRIX_ASCII = `
╔══════════════════════════════════╗
║           🚀 MAVRIX BOT          ║
║         ⌨️ AUTOTYPING PRO        ║
║        PREMIUM INDICATORS        ║
╚══════════════════════════════════╝
`;

const MAVRIX_SIGNATURE = `
✨ Developed by Mavrix Tech
🎯 Premium Features | ⚡ Lightning Fast
🔒 Secure | 🛠️ Error Free
`;

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ 
            enabled: false,
            version: "2.0",
            premium: true 
        }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Toggle autotyping feature
async function autotypingCommand(sock, chatId, message) {
    try {
        // Check if sender is the owner or sudo
        const { isSudo } = require('../lib/index');
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = message.key.fromMe || senderIsSudo;
        
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: `${MAVRIX_ASCII}\n*🚫 PREMIUM ACCESS DENIED!*\n\n❌ This command is only available for the owner!\n🔒 Premium typing system\n\n${MAVRIX_SIGNATURE}`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'Mavrix Bot Premium',
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
                    text: `${MAVRIX_ASCII}\n*❌ INVALID OPTION!*\n\n💡 Usage: .autotyping 🟢on/🔴off\n🔧 Premium typing system\n\n${MAVRIX_SIGNATURE}`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: 'Mavrix Bot Premium',
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
        
        // Send premium confirmation message
        const status = config.enabled ? '🟢 ACTIVATED' : '🔴 DEACTIVATED';
        const emoji = config.enabled ? '⌨️' : '🚫';
        const features = config.enabled ? 
            '• ⚡ Smart typing indicators\n• 🎯 Realistic timing\n• 🔥 Premium algorithm\n• 🚀 Enhanced user experience' :
            '• 💤 System standby\n• 🚫 Typing indicators disabled';
        
        await sock.sendMessage(chatId, {
            text: `${MAVRIX_ASCII}\n*${emoji} AUTOTYPING ${status}*\n\n${features}\n\n${MAVRIX_SIGNATURE}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'Mavrix Bot Premium',
                    serverMessageId: -1
                }
            }
        });
        
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error in autotyping command:', error);
        await sock.sendMessage(chatId, {
            text: `${MAVRIX_ASCII}\n*🚨 SYSTEM ERROR!*\n\n❌ Error processing autotyping command!\n🔧 Mavrix Tech Support\n\n${MAVRIX_SIGNATURE}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'Mavrix Bot Premium',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Function to check if autotyping is enabled
function isAutotypingEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error checking autotyping status:', error);
        return false;
    }
}

// Function to handle autotyping for regular messages
async function handleAutotypingForMessage(sock, chatId, userMessage) {
    if (isAutotypingEnabled()) {
        try {
            console.log('🎯 Mavrix Bot - Premium typing indicator activated');
            
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Then send the composing status
            await sock.sendPresenceUpdate('composing', chatId);
            
            // Simulate typing time based on message length with increased minimum time
            const typingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
            await new Promise(resolve => setTimeout(resolve, typingDelay));
            
            // Send composing again to ensure it stays visible
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            console.log('✅ Mavrix Bot - Premium typing sequence completed');
            return true; // Indicates typing was shown
        } catch (error) {
            console.error('🎯 Mavrix Bot - Error sending typing indicator:', error);
            return false; // Indicates typing failed
        }
    }
    return false; // Autotyping is disabled
}

// Function to handle autotyping for commands - BEFORE command execution
async function handleAutotypingForCommand(sock, chatId) {
    if (isAutotypingEnabled()) {
        try {
            console.log('🎯 Mavrix Bot - Premium command typing activated');
            
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Then send the composing status
            await sock.sendPresenceUpdate('composing', chatId);
            
            // Keep typing indicator active for commands with increased duration
            const commandTypingDelay = 3000;
            await new Promise(resolve => setTimeout(resolve, commandTypingDelay));
            
            // Send composing again to ensure it stays visible
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            console.log('✅ Mavrix Bot - Premium command typing completed');
            return true; // Indicates typing was shown
        } catch (error) {
            console.error('🎯 Mavrix Bot - Error sending command typing indicator:', error);
            return false; // Indicates typing failed
        }
    }
    return false; // Autotyping is disabled
}

// Function to show typing status AFTER command execution
async function showTypingAfterCommand(sock, chatId) {
    if (isAutotypingEnabled()) {
        try {
            console.log('🎯 Mavrix Bot - Premium post-command typing activated');
            
            // This function runs after the command has been executed and response sent
            // So we just need to show a brief typing indicator
            
            // Subscribe to presence updates
            await sock.presenceSubscribe(chatId);
            
            // Show typing status briefly
            await sock.sendPresenceUpdate('composing', chatId);
            
            // Keep typing visible for a short time
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Then pause
            await sock.sendPresenceUpdate('paused', chatId);
            
            console.log('✅ Mavrix Bot - Premium post-command typing completed');
            return true;
        } catch (error) {
            console.error('🎯 Mavrix Bot - Error sending post-command typing indicator:', error);
            return false;
        }
    }
    return false; // Autotyping is disabled
}

module.exports = {
    autotypingCommand,
    isAutotypingEnabled,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand
};
