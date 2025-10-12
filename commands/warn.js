const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

// Database paths
const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');
const premiumUsersPath = path.join(databaseDir, 'premium.json');

// 🎯 Premium Warning System
class PremiumWarningSystem {
  constructor() {
    this.initializeFiles();
  }

  initializeFiles() {
    // Create database directory
    if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir, { recursive: true });
    }
    
    // Initialize warnings file
    if (!fs.existsSync(warningsPath)) {
      fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
    }

    // Initialize premium users file
    if (!fs.existsSync(premiumUsersPath)) {
      fs.writeFileSync(premiumUsersPath, JSON.stringify([]), 'utf8');
    }
  }

  loadWarnings() {
    try {
      return JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    } catch {
      return {};
    }
  }

  saveWarnings(warnings) {
    fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2), 'utf8');
  }

  loadPremiumUsers() {
    try {
      return new Set(JSON.parse(fs.readFileSync(premiumUsersPath, 'utf8')));
    } catch {
      return new Set();
    }
  }

  isPremiumUser(userId) {
    const premiumUsers = this.loadPremiumUsers();
    return premiumUsers.has(userId);
  }

  async warnCommand(sock, chatId, senderId, mentionedJids, message) {
    try {
      // 🚫 Group check
      if (!chatId.endsWith('@g.us')) {
        await this.sendMessage(sock, chatId, 
          '❌ *Group Only!*\n\nThis command can only be used in groups!'
        );
        return;
      }

      // 👑 Admin check
      const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
      
      if (!isBotAdmin) {
        await this.sendMessage(sock, chatId,
          '❌ *Bot Admin Required!*\n\nPlease make the bot an admin first to use this command.'
        );
        return;
      }

      if (!isSenderAdmin) {
        await this.sendMessage(sock, chatId,
          '❌ *Admin Only!*\n\nOnly group admins can use the warn command.'
        );
        return;
      }

      // 👤 Get user to warn
      let userToWarn;
      if (mentionedJids?.length > 0) {
        userToWarn = mentionedJids[0];
      } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToWarn = message.message.extendedTextMessage.contextInfo.participant;
      }

      if (!userToWarn) {
        await this.sendMessage(sock, chatId,
          '❌ *User Required!*\n\nPlease mention the user or reply to their message to warn!\n\n💡 Example: .warn @username'
        );
        return;
      }

      // ⏳ Rate limiting protection
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 📊 Process warning
      const warnings = this.loadWarnings();
      const isUserPremium = this.isPremiumUser(userToWarn);

      // Initialize data structures
      if (!warnings[chatId]) warnings[chatId] = {};
      if (!warnings[chatId][userToWarn]) {
        warnings[chatId][userToWarn] = {
          count: 0,
          warnings: [],
          firstWarning: new Date().toISOString()
        };
      }

      const userWarnings = warnings[chatId][userToWarn];
      userWarnings.count++;
      
      // Add warning details
      userWarnings.warnings.push({
        number: userWarnings.count,
        warnedBy: senderId,
        timestamp: new Date().toISOString(),
        reason: this.extractReason(message) || 'No reason provided'
      });

      this.saveWarnings(warnings);

      // 📨 Send warning message
      const warningLevel = this.getWarningLevel(userWarnings.count);
      const warningMessage = this.createWarningMessage(userToWarn, senderId, userWarnings, warningLevel, isUserPremium);

      await sock.sendMessage(chatId, { 
        text: warningMessage,
        mentions: [userToWarn, senderId]
      });

      // 🚨 Auto actions based on warning count
      await this.handleAutoActions(sock, chatId, userToWarn, userWarnings.count, isUserPremium, warnings);

    } catch (error) {
      console.error('💥 Warn Command Error:', error);
      await this.handleError(sock, chatId, error);
    }
  }

  extractReason(message) {
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const parts = text.split(' ').slice(2); // Remove .warn and mention
    return parts.join(' ').trim() || null;
  }

  getWarningLevel(count) {
    if (count === 1) return { level: '🟡 First Warning', action: 'Be careful!' };
    if (count === 2) return { level: '🟠 Second Warning', action: 'Final warning!' };
    if (count >= 3) return { level: '🔴 Third Warning', action: 'Auto-kick!' };
    return { level: '⚪ No Warnings', action: '' };
  }

  createWarningMessage(userToWarn, senderId, userWarnings, warningLevel, isPremium) {
    const lastWarning = userWarnings.warnings[userWarnings.warnings.length - 1];
    
    return `╭━━━✦🚨✦━━━╮
       ⚠️ *WARNING ISSUED* ⚠️
╰━━━✦🚨✦━━━╯

👤 *Warned User:* @${userToWarn.split('@')[0]} ${isPremium ? '💎' : ''}
📊 *Warning Count:* ${userWarnings.count}/3
🎯 *Warning Level:* ${warningLevel.level}
👑 *Warned By:* @${senderId.split('@')[0]}

${lastWarning.reason ? `📝 *Reason:* ${lastWarning.reason}\n` : ''}
⏰ *Time:* ${new Date().toLocaleString()}
💡 *Action:* ${warningLevel.action}

${isPremium ? '💎 *Premium User - Special handling applied*' : ''}`;
  }

  async handleAutoActions(sock, chatId, userToWarn, warningCount, isPremium, warnings) {
    if (warningCount >= 3) {
      // Premium users get one more chance
      if (isPremium && warningCount === 3) {
        await sock.sendMessage(chatId, {
          text: `💎 *Premium Protection!*\n\n@${userToWarn.split('@')[0]} is a premium user and gets one additional warning.`,
          mentions: [userToWarn]
        });
        return;
      }

      // Auto-kick for 4+ warnings or 3 warnings for non-premium
      if ((isPremium && warningCount >= 4) || (!isPremium && warningCount >= 3)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          await sock.groupParticipantsUpdate(chatId, [userToWarn], "remove");
          delete warnings[chatId][userToWarn];
          this.saveWarnings(warnings);
          
          const kickMessage = `╭━━━✦🚫✦━━━╮
       🔴 *AUTO-KICK* 🔴
╰━━━✦🚫✦━━━╯

@${userToWarn.split('@')[0]} has been removed from the group! ⚠️

📊 *Reason:* Received ${warningCount} warnings
⏰ *Time:* ${new Date().toLocaleString()}
${isPremium ? '💎 *Premium user - Special case*' : ''}`;

          await sock.sendMessage(chatId, { 
            text: kickMessage,
            mentions: [userToWarn]
          });
        } catch (kickError) {
          console.error('Kick error:', kickError);
          await sock.sendMessage(chatId, {
            text: `❌ *Failed to auto-kick!*\n\nPlease remove @${userToWarn.split('@')[0]} manually.`,
            mentions: [userToWarn]
          });
        }
      }
    }
  }

  async sendMessage(sock, chatId, text) {
    await sock.sendMessage(chatId, { 
      text,
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363161513685998@newsletter',
          newsletterName: 'Knight Bot MD',
          serverMessageId: -1
        }
      }
    });
  }

  async handleError(sock, chatId, error) {
    if (error.data === 429) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.sendMessage(sock, chatId,
        '❌ *Rate Limit!*\n\nPlease wait a few seconds before trying again.'
      );
    } else {
      await this.sendMessage(sock, chatId,
        '❌ *System Error!*\n\nPlease ensure the bot has admin permissions and try again.'
      );
    }
  }
}

// Create singleton instance
const warningSystem = new PremiumWarningSystem();

// Export the command function
async function warnCommand(sock, chatId, senderId, mentionedJids, message) {
  await warningSystem.warnCommand(sock, chatId, senderId, mentionedJids, message);
}

module.exports = warnCommand;
