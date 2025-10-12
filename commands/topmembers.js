const fs = require('fs');
const path = require('path');

// 🏆 PREMIUM TOP MEMBERS SYSTEM
console.log(`
╔══════════════════════════════╗
║        🏆 TOP MEMBERS PRO    ║
║      PREMIUM ANALYTICS 📊    ║
╚══════════════════════════════╝
`);

const dataFilePath = path.join(__dirname, '..', 'data', 'messageCount.json');

function loadMessageCounts() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath);
        return JSON.parse(data);
    }
    return {};
}

function saveMessageCounts(messageCounts) {
    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

function incrementMessageCount(groupId, userId) {
    const messageCounts = loadMessageCounts();

    if (!messageCounts[groupId]) {
        messageCounts[groupId] = {};
    }

    if (!messageCounts[groupId][userId]) {
        messageCounts[groupId][userId] = {
            count: 0,
            firstSeen: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
    }

    messageCounts[groupId][userId].count += 1;
    messageCounts[groupId][userId].lastActive = new Date().toISOString();

    saveMessageCounts(messageCounts);
}

function topMembers(sock, chatId, isGroup) {
    if (!isGroup) {
        sock.sendMessage(chatId, { 
            text: '❌ *Premium Group Feature Only*\n\nThis command works exclusively in group chats! 🏆' 
        });
        return;
    }

    const messageCounts = loadMessageCounts();
    const groupCounts = messageCounts[chatId] || {};

    const sortedMembers = Object.entries(groupCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 8); // Premium: Top 8 members

    if (sortedMembers.length === 0) {
        sock.sendMessage(chatId, { 
            text: '📊 *No Activity Data Yet*\n\nStart chatting to see leaderboard rankings! 💬' 
        });
        return;
    }

    let message = `╔══════════════════════════╗
🏆 *PREMIUM LEADERBOARD* 🏆
╚══════════════════════════╝

📊 *Group Activity Analytics*
👥 Total Tracked: ${Object.keys(groupCounts).length} members
📈 Period: All-time statistics

🏅 *TOP CONTRIBUTORS* 🏅
\n`;

    sortedMembers.forEach(([userId, data], index) => {
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
        const rankIcon = medals[index] || '🔹';
        const activeDays = Math.floor((new Date() - new Date(data.firstSeen)) / (1000 * 60 * 60 * 24));
        
        message += `${rankIcon} *${index + 1}.* @${userId.split('@')[0]}\n`;
        message += `   📨 Messages: *${data.count}*\n`;
        message += `   📅 Active: ${activeDays} days\n`;
        message += `   ⏰ Last: ${new Date(data.lastActive).toLocaleDateString()}\n\n`;
    });

    message += `✨ *Powered by Premium Analytics*\n⭐ Real-time tracking • Smart ranking • VIP insights`;

    sock.sendMessage(chatId, { 
        text: message, 
        mentions: sortedMembers.map(([userId]) => userId) 
    });
}

// 🆕 Premium Feature: Weekly Stats
function getWeeklyStats(groupId) {
    const messageCounts = loadMessageCounts();
    const groupData = messageCounts[groupId] || {};
    
    const weeklyData = Object.entries(groupData)
        .filter(([, data]) => {
            const lastActive = new Date(data.lastActive);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return lastActive > weekAgo;
        })
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5);

    return weeklyData;
}

module.exports = { incrementMessageCount, topMembers, getWeeklyStats };
