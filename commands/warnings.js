const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '../data/warnings.json');
const premiumUsersPath = path.join(__dirname, '../data/premium.json');

// Load premium users
function loadPremiumUsers() {
    if (!fs.existsSync(premiumUsersPath)) {
        fs.writeFileSync(premiumUsersPath, JSON.stringify([]), 'utf8');
    }
    const data = fs.readFileSync(premiumUsersPath, 'utf8');
    return new Set(JSON.parse(data));
}

// Enhanced warnings system
function loadWarnings() {
    if (!fs.existsSync(warningsFilePath)) {
        fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
    }
    const data = fs.readFileSync(warningsFilePath, 'utf8');
    return JSON.parse(data);
}

function saveWarnings(warnings) {
    fs.writeFileSync(warningsFilePath, JSON.stringify(warnings, null, 2), 'utf8');
}

async function warningsCommand(sock, chatId, mentionedJidList) {
    const warnings = loadWarnings();
    const premiumUsers = loadPremiumUsers();

    if (mentionedJidList.length === 0) {
        // Show warnings list for the group
        const groupWarnings = Object.entries(warnings)
            .filter(([user]) => user.includes(chatId))
            .map(([user, count]) => {
                const userId = user.split('@')[0];
                return `• @${userId}: ${count} warning(s) ${premiumUsers.has(user) ? '💎' : ''}`;
            });

        const warningText = groupWarnings.length > 0 ? 
            `⚠️ *Group Warnings* ⚠️\n\n${groupWarnings.join('\n')}\n\n💎 = Premium User` :
            `✅ *No warnings in this group!*\n\nKeep up the good behavior! 🎉`;

        await sock.sendMessage(chatId, { 
            text: warningText,
            mentions: mentionedJidList
        });
        return;
    }

    const userToCheck = mentionedJidList[0];
    const warningCount = warnings[userToCheck] || 0;
    const isPremium = premiumUsers.has(userToCheck);

    const warningMessage = `⚠️ *Warning Status* ⚠️\n\n👤 User: @${userToCheck.split('@')[0]}\n🚨 Warnings: ${warningCount}\n${isPremium ? '💎 Premium User' : '🆓 Standard User'}\n\n${getWarningLevel(warningCount)}`;

    await sock.sendMessage(chatId, { 
        text: warningMessage,
        mentions: [userToCheck]
    });
}

function getWarningLevel(count) {
    if (count === 0) return '✅ Clean record!';
    if (count === 1) return '⚠️ First warning';
    if (count === 2) return '🚨 Second warning - Be careful!';
    if (count >= 3) return '🔴 Multiple warnings - Risk of ban!';
    return '';
}

// Premium feature: Clear warnings
async function clearWarnings(sock, chatId, mentionedJidList, isAdmin) {
    if (!isAdmin) {
        await sock.sendMessage(chatId, { 
            text: '❌ *Admin Only!*\n\nOnly admins can clear warnings.'
        });
        return;
    }

    if (mentionedJidList.length === 0) {
        await sock.sendMessage(chatId, { 
            text: '❌ *Mention Required!*\n\nPlease mention a user to clear warnings.\nExample: .clearwarns @user'
        });
        return;
    }

    const userToClear = mentionedJidList[0];
    const warnings = loadWarnings();

    if (warnings[userToClear]) {
        delete warnings[userToClear];
        saveWarnings(warnings);
        
        await sock.sendMessage(chatId, { 
            text: `✅ *Warnings Cleared!*\n\nAll warnings removed for @${userToClear.split('@')[0]}`,
            mentions: [userToClear]
        });
    } else {
        await sock.sendMessage(chatId, { 
            text: `ℹ️ *No Warnings Found*\n\n@${userToClear.split('@')[0]} has no warnings to clear.`,
            mentions: [userToClear]
        });
    }
}

module.exports = { warningsCommand, clearWarnings };
