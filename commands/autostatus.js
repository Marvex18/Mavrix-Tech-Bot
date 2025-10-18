const fs = require('fs');
const path = require('path');

const MAVRIX_ASCII = `
╔══════════════════════════════════╗
║           🚀 MAVRIX BOT          ║
║         📱 AUTOSTATUS PRO        ║
║        PREMIUM AUTOMATION        ║
╚══════════════════════════════════╝
`;

const MAVRIX_SIGNATURE = `
✨ Developed by Mavrix Tech
🎯 Premium Features | ⚡ Lightning Fast
🔒 Secure | 🛠️ Error Free
`;

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'Mavrix Bot Premium',
            serverMessageId: -1
        }
    }
};

// Path to store auto status configuration
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false, 
        reactOn: false,
        version: "2.0",
        premium: true
    }));
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        // Check if sender is owner or sudo
        const { isSudo } = require('../lib/index');
        const senderId = msg.key.participant || msg.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = msg.key.fromMe || senderIsSudo;
        
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}\n*🚫 PREMIUM ACCESS DENIED!*\n\n❌ This command can only be used by the owner!\n🔒 Premium automation system\n\n${MAVRIX_SIGNATURE}`,
                ...channelInfo
            });
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? '🟢 ACTIVATED' : '🔴 DEACTIVATED';
            const reactStatus = config.reactOn ? '🟢 ACTIVATED' : '🔴 DEACTIVATED';
            await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}\n*📱 AUTOSTATUS PRO SETTINGS*\n\n*⚡ Current Configuration:*\n• 👁️ Auto Status View: ${status}\n• 💚 Status Reactions: ${reactStatus}\n• 🚀 Version: Premium v2.0\n\n*💡 Premium Commands:*\n.autostatus 🟢on - Enable auto status view\n.autostatus 🔴off - Disable auto status view\n.autostatus react 🟢on - Enable status reactions\n.autostatus react 🔴off - Disable status reactions\n\n${MAVRIX_SIGNATURE}`,
                ...channelInfo
            });
            return;
        }

        // Handle on/off commands
        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}\n*✅ AUTOSTATUS ACTIVATED!*\n\n⚡ Auto status view has been enabled!\n👁️ Bot will now automatically view all contact statuses\n💚 Premium automation active\n🚀 Mavrix Bot Technology\n\n${MAVRIX_SIGNATURE}`,
                ...channelInfo
            });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}\n*🔴 AUTOSTATUS DEACTIVATED!*\n\n❌ Auto status view has been disabled!\n🚫 Bot will no longer automatically view statuses\n💤 System in standby mode\n\n${MAVRIX_SIGNATURE}`,
                ...channelInfo
            });
        } else if (command === 'react') {
            // Handle react subcommand
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: `${MAVRIX_ASCII}\n*❌ MISSING PARAMETER!*\n\n💡 Please specify on/off for reactions!\nUsage: .autostatus react 🟢on/🔴off\n\n${MAVRIX_SIGNATURE}`,
                    ...channelInfo
                });
                return;
            }
            
            const reactCommand = args[1].toLowerCase();
            if (reactCommand === 'on') {
                config.reactOn = true;
                fs.writeFileSync(configPath, JSON.stringify(config));
                await sock.sendMessage(chatId, { 
                    text: `${MAVRIX_ASCII}\n*💚 STATUS REACTIONS ACTIVATED!*\n\n✅ Status reactions have been enabled!\n💚 Bot will now react to status updates\n⚡ Premium automation system\n🎯 Smart reaction technology\n\n${MAVRIX_SIGNATURE}`,
                    ...channelInfo
                });
            } else if (reactCommand === 'off') {
                config.reactOn = false;
                fs.writeFileSync(configPath, JSON.stringify(config));
                await sock.sendMessage(chatId, { 
                    text: `${MAVRIX_ASCII}\n*🚫 STATUS REACTIONS DEACTIVATED!*\n\n❌ Status reactions have been disabled!\n🚫 Bot will no longer react to status updates\n💤 Reaction system offline\n\n${MAVRIX_SIGNATURE}`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: `${MAVRIX_ASCII}\n*❌ INVALID REACTION COMMAND!*\n\n💡 Usage: .autostatus react 🟢on/🔴off\n🔧 Premium automation system\n\n${MAVRIX_SIGNATURE}`,
                    ...channelInfo
                });
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: `${MAVRIX_ASCII}\n*❌ INVALID COMMAND!*\n\n*💡 Available Commands:*\n.autostatus 🟢on/🔴off - Enable/disable auto status view\n.autostatus react 🟢on/🔴off - Enable/disable status reactions\n\n${MAVRIX_SIGNATURE}`,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('🎯 Mavrix Bot - Error in autostatus command:', error);
        await sock.sendMessage(chatId, { 
            text: `${MAVRIX_ASCII}\n*🚨 SYSTEM ERROR!*\n\n❌ Error occurred while managing auto status!\n💡 ${error.message}\n🔧 Mavrix Tech Support\n\n${MAVRIX_SIGNATURE}`,
            ...channelInfo
        });
    }
}

// Function to check if auto status is enabled
function isAutoStatusEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error checking auto status config:', error);
        return false;
    }
}

// Function to check if status reactions are enabled
function isStatusReactionEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.reactOn;
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error checking status reaction config:', error);
        return false;
    }
}

// Function to react to status using proper method
async function reactToStatus(sock, statusKey) {
    try {
        if (!isStatusReactionEnabled()) {
            return;
        }

        // Use the proper relayMessage method for status reactions
        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
        
        console.log('🎯 Mavrix Bot - Premium status reaction sent');
    } catch (error) {
        console.error('🎯 Mavrix Bot - Error reacting to status:', error.message);
    }
}

// Function to handle status updates
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) {
            return;
        }

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Handle status from messages.upsert
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    const sender = msg.key.participant || msg.key.remoteJid;
                    
                    // React to status if enabled
                    await reactToStatus(sock, msg.key);
                    
                    console.log('🎯 Mavrix Bot - Premium status viewed and reacted');
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('🎯 Mavrix Bot - Rate limit hit, waiting before retrying...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }

        // Handle direct status updates
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                const sender = status.key.participant || status.key.remoteJid;
                
                // React to status if enabled
                await reactToStatus(sock, status.key);
                
                console.log('🎯 Mavrix Bot - Premium direct status viewed');
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('🎯 Mavrix Bot - Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

        // Handle status in reactions
        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.reaction.key]);
                const sender = status.reaction.key.participant || status.reaction.key.remoteJid;
                
                // React to status if enabled
                await reactToStatus(sock, status.reaction.key);
                
                console.log('🎯 Mavrix Bot - Premium status reaction handled');
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('🎯 Mavrix Bot - Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.reaction.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

    } catch (error) {
        console.error('🎯 Mavrix Bot - Error in auto status view:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
};
