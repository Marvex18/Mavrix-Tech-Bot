// autoreact.js - Premium Auto React System
const fs = require('fs');
const path = require('path');

class PremiumAutoReact {
    constructor() {
        this.configPath = path.join(__dirname, '../data/autoreact.json');
        this.defaultConfig = {
            enabled: false,
            emoji: "🫂",
            target: "all", // all, admins, nonadmins, specific
            specificUsers: [],
            excludedUsers: [],
            groups: {}, // Group-specific settings
            cooldown: 0, // seconds
            chance: 100, // percentage
            lastReaction: new Map()
        };
        this.loadConfig();
    }

    loadConfig() {
        try {
            if (!fs.existsSync(this.configPath)) {
                this.saveConfig(this.defaultConfig);
                return this.defaultConfig;
            }
            const raw = fs.readFileSync(this.configPath, 'utf8');
            const config = JSON.parse(raw);
            
            // Ensure all fields exist
            return {
                ...this.defaultConfig,
                ...config,
                lastReaction: new Map() // Reset temporal data
            };
        } catch (error) {
            console.error('🔴 AutoReact config load error:', error);
            return this.defaultConfig;
        }
    }

    saveConfig(config) {
        try {
            const dir = path.dirname(this.configPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Convert Map to object for JSON serialization
            const saveableConfig = {
                ...config,
                lastReaction: {} // Don't save temporal data
            };
            
            fs.writeFileSync(this.configPath, JSON.stringify(saveableConfig, null, 2));
        } catch (error) {
            console.error('🔴 AutoReact config save error:', error);
        }
    }

    shouldReact(senderId, isAdmin, groupId, config) {
        // Check cooldown
        const now = Date.now();
        const lastReactTime = config.lastReaction.get(senderId) || 0;
        if (now - lastReactTime < (config.cooldown * 1000)) {
            return false;
        }

        // Check chance
        if (Math.random() * 100 > config.chance) {
            return false;
        }

        // Check if user is excluded
        if (config.excludedUsers.includes(senderId)) {
            return false;
        }

        // Check group-specific settings
        if (groupId && config.groups[groupId] === false) {
            return false;
        }

        // Check target criteria
        switch (config.target) {
            case "all":
                return true;
            case "admins":
                return isAdmin;
            case "nonadmins":
                return !isAdmin;
            case "specific":
                return config.specificUsers.includes(senderId);
            default:
                return true;
        }
    }

    async handleAutoReact(sock, message) {
        try {
            const config = this.loadConfig();
            if (!config.enabled) return;

            const chatId = message.key.remoteJid;
            const senderId = message.key.participant || message.key.remoteJid;
            
            // Don't react to bot's own messages
            if (message.key.fromMe) return;

            // Check if it's a group
            const isGroup = chatId.endsWith('@g.us');
            let isAdmin = false;

            if (isGroup) {
                try {
                    const metadata = await sock.groupMetadata(chatId);
                    const participant = metadata.participants.find(p => p.id === senderId);
                    isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                } catch (error) {
                    console.error('🔴 Group metadata error:', error);
                    return;
                }
            }

            if (this.shouldReact(senderId, isAdmin, isGroup ? chatId : null, config)) {
                await this.sendReaction(sock, chatId, message.key.id, config.emoji);
                
                // Update last reaction time
                config.lastReaction.set(senderId, Date.now());
            }

        } catch (error) {
            console.error('🔴 AutoReact error:', error);
        }
    }

    async sendReaction(sock, chatId, messageId, emoji) {
        try {
            await sock.sendMessage(chatId, {
                react: {
                    text: emoji,
                    key: {
                        remoteJid: chatId,
                        id: messageId,
                        participant: sock.user.id
                    }
                }
            });
        } catch (error) {
            console.error('🔴 Reaction send error:', error);
        }
    }

    async handleAutoReactCommand(sock, chatId, message, args) {
        try {
            const { isSudo } = require('../lib/index');
            const senderId = message.key.participant || message.key.remoteJid;
            const senderIsSudo = await isSudo(senderId);
            
            if (!message.key.fromMe && !senderIsSudo) {
                return sock.sendMessage(chatId, { 
                    text: '🔒 *Premium AutoReact*\n\nOnly the bot owner can use this command.' 
                }, { quoted: message });
            }

            const config = this.loadConfig();
            const argStr = (args || '').trim().toLowerCase();
            const [action, ...params] = argStr.split(' ');

            if (!action) {
                return this.showAutoReactMenu(sock, chatId, message, config);
            }

            switch (action) {
                case 'on':
                    config.enabled = true;
                    this.saveConfig(config);
                    return sock.sendMessage(chatId, { 
                        text: '✅ *AutoReact Enabled!*\n\nI will now automatically react to messages with ' + config.emoji 
                    }, { quoted: message });

                case 'off':
                    config.enabled = false;
                    this.saveConfig(config);
                    return sock.sendMessage(chatId, { 
                        text: '❌ *AutoReact Disabled!*\n\nI will no longer auto-react to messages.' 
                    }, { quoted: message });

                case 'emoji':
                    const emoji = params[0];
                    if (emoji) {
                        config.emoji = emoji;
                        this.saveConfig(config);
                        return sock.sendMessage(chatId, { 
                            text: `🎭 *Reaction Emoji Updated!*\n\nNew emoji: ${emoji}` 
                        }, { quoted: message });
                    }
                    break;

                case 'target':
                    const target = params[0];
                    if (['all', 'admins', 'nonadmins', 'specific'].includes(target)) {
                        config.target = target;
                        this.saveConfig(config);
                        return sock.sendMessage(chatId, { 
                            text: `🎯 *Target Updated!*\n\nNow reacting to: ${target}` 
                        }, { quoted: message });
                    }
                    break;

                case 'chance':
                    const chance = parseInt(params[0]);
                    if (chance >= 1 && chance <= 100) {
                        config.chance = chance;
                        this.saveConfig(config);
                        return sock.sendMessage(chatId, { 
                            text: `🎲 *Reaction Chance Updated!*\n\nNow reacting to ${chance}% of eligible messages` 
                        }, { quoted: message });
                    }
                    break;

                case 'cooldown':
                    const cooldown = parseInt(params[0]);
                    if (cooldown >= 0 && cooldown <= 3600) {
                        config.cooldown = cooldown;
                        this.saveConfig(config);
                        return sock.sendMessage(chatId, { 
                            text: `⏰ *Cooldown Updated!*\n\n${cooldown} seconds between reactions per user` 
                        }, { quoted: message });
                    }
                    break;

                case 'status':
                    return this.showStatus(sock, chatId, message, config);

                default:
                    return sock.sendMessage(chatId, { 
                        text: '❌ *Invalid Command!*\n\nUse `.autoreact` to see available commands.' 
                    }, { quoted: message });
            }

        } catch (error) {
            console.error('🔴 AutoReact command error:', error);
            await sock.sendMessage(chatId, { 
                text: '💥 *System Error*\n\nFailed to process command.' 
            }, { quoted: message });
        }
    }

    showAutoReactMenu(sock, chatId, message, config) {
        const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
        const targetNames = {
            all: 'Everyone',
            admins: 'Admins Only', 
            nonadmins: 'Non-Admins Only',
            specific: 'Specific Users'
        };

        const menuText = `🎭 *PREMIUM AUTO-REACT SYSTEM* 🎭

⚙️ *Current Status:* ${status}
🎯 *Target:* ${targetNames[config.target]}
😊 *Emoji:* ${config.emoji}
🎲 *Chance:* ${config.chance}%
⏰ *Cooldown:* ${config.cooldown}s

🔧 *Commands:*
• .autoreact on - Enable system
• .autoreact off - Disable system  
• .autoreact emoji <emoji> - Change reaction emoji
• .autoreact target <all|admins|nonadmins|specific> - Set who to react to
• .autoreact chance <1-100> - Set reaction chance percentage
• .autoreact cooldown <seconds> - Set cooldown between reactions
• .autoreact status - Show detailed status

💡 *Examples:*
.autoreact on
.autoreact emoji 🎉
.autoreact target admins
.autoreact chance 50
.autoreact cooldown 30`;

        return sock.sendMessage(chatId, { text: menuText }, { quoted: message });
    }

    showStatus(sock, chatId, message, config) {
        const targetNames = {
            all: 'Everyone',
            admins: 'Admins Only',
            nonadmins: 'Non-Admins Only', 
            specific: 'Specific Users'
        };

        const statusText = `📊 *AUTO-REACT STATUS*

🟢 *System:* ${config.enabled ? 'ACTIVE' : 'INACTIVE'}
🎯 *Target:* ${targetNames[config.target]}
😊 *Emoji:* ${config.emoji}
🎲 *Chance:* ${config.chance}%
⏰ *Cooldown:* ${config.cooldown} seconds
👥 *Specific Users:* ${config.specificUsers.length}
🚫 *Excluded Users:* ${config.excludedUsers.length}
📁 *Group Settings:* ${Object.keys(config.groups).length} groups

${config.enabled ? 
    `✅ *Auto-reacting is ACTIVE!*
I will react with ${config.emoji} to ${targetNames[config.target].toLowerCase()} ${config.chance}% of the time.` : 
    '❌ *Auto-reacting is INACTIVE*'
}`;

        return sock.sendMessage(chatId, { text: statusText }, { quoted: message });
    }
}

// Create singleton instance
const premiumAutoReact = new PremiumAutoReact();

module.exports = {
    handleAutoReact: premiumAutoReact.handleAutoReact.bind(premiumAutoReact),
    handleAutoReactCommand: premiumAutoReact.handleAutoReactCommand.bind(premiumAutoReact)
};
