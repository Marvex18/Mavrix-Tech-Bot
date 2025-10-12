const fs = require('fs');

// 🎯 PREMIUM HANGMAN GAME
console.log(`
╔══════════════════════════════╗
║         🎮 HANGMAN PRO       ║
║      PREMIUM EDITION 🚀      ║
╚══════════════════════════════╝
`);

const words = ['javascript', 'premium', 'hangman', 'whatsapp', 'nodejs', 'knight', 'bot', 'elite', 'vip', 'coding'];
let hangmanGames = {};

function startHangman(sock, chatId) {
    const word = words[Math.floor(Math.random() * words.length)];
    const maskedWord = '_ '.repeat(word.length).trim();

    hangmanGames[chatId] = {
        word,
        maskedWord: maskedWord.split(' '),
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrongGuesses: 6,
        startTime: Date.now()
    };

    const premiumMessage = `
🎯 *PREMIUM HANGMAN GAME STARTED* 🎯

📝 *Word:* ${maskedWord}
💡 *Hint:* ${word.length} letters
🎮 *Guesses:* 6 attempts
⭐ *Premium Features:*
• Smart word selection
• Real-time tracking
• Enhanced gameplay

💎 *Type a letter to start guessing!*
    `;

    sock.sendMessage(chatId, { text: premiumMessage });
}

function guessLetter(sock, chatId, letter) {
    if (!hangmanGames[chatId]) {
        sock.sendMessage(chatId, { 
            text: '❌ *No active game!*\n\n💡 Start new game with .hangman\n⭐ Premium gaming experience awaits!' 
        });
        return;
    }

    const game = hangmanGames[chatId];
    const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;

    if (guessedLetters.includes(letter)) {
        sock.sendMessage(chatId, { 
            text: `⚠️ *Already Guessed!*\n\n"${letter}" was already tried.\n💡 Try a different letter!` 
        });
        return;
    }

    guessedLetters.push(letter);

    if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
                maskedWord[i] = letter;
            }
        }

        const progressBar = createProgressBar(maskedWord);
        
        sock.sendMessage(chatId, { 
            text: `✅ *Great Guess!*\n\n📝 ${maskedWord.join(' ')}\n${progressBar}\n🎯 Letters tried: ${guessedLetters.join(', ')}` 
        });

        if (!maskedWord.includes('_')) {
            const timeTaken = Math.floor((Date.now() - game.startTime) / 1000);
            sock.sendMessage(chatId, { 
                text: `🎉 *VICTORY!* 🎉\n\n🏆 You guessed: *${word}*\n⏱️ Time: ${timeTaken}s\n⭐ Wrong guesses: ${game.wrongGuesses}\n\n💎 *Premium Champion!*` 
            });
            delete hangmanGames[chatId];
        }
    } else {
        game.wrongGuesses += 1;
        const remaining = maxWrongGuesses - game.wrongGuesses;
        
        const hangmanArt = createHangmanArt(game.wrongGuesses);
        
        sock.sendMessage(chatId, { 
            text: `❌ *Wrong Guess!*\n\n${hangmanArt}\n💔 Attempts left: ${remaining}\n🎯 Letters tried: ${guessedLetters.join(', ')}` 
        });

        if (game.wrongGuesses >= maxWrongGuesses) {
            sock.sendMessage(chatId, { 
                text: `💀 *GAME OVER!*\n\nThe word was: *${word}*\n\n🔁 Type .hangman to play again!\n⭐ Better luck next time!` 
            });
            delete hangmanGames[chatId];
        }
    }
}

function createProgressBar(maskedWord) {
    const filled = maskedWord.filter(char => char !== '_').length;
    const total = maskedWord.length;
    const percentage = (filled / total) * 100;
    const bars = '█'.repeat(Math.floor(percentage / 10)) + '▒'.repeat(10 - Math.floor(percentage / 10));
    return `📊 Progress: [${bars}] ${percentage.toFixed(0)}%`;
}

function createHangmanArt(wrongGuesses) {
    const stages = [
        `
         ┌─────┐
         │     │
         │     
         │    
         │     
         │     
        ─┴─    `,
        `
         ┌─────┐
         │     │
         │     😮
         │    
         │     
         │     
        ─┴─    `,
        `
         ┌─────┐
         │     │
         │     😮
         │     │
         │     │
         │     
        ─┴─    `,
        `
         ┌─────┐
         │     │
         │     😮
         │    /│
         │     │
         │     
        ─┴─    `,
        `
         ┌─────┐
         │     │
         │     😮
         │    /│\\
         │     │
         │     
        ─┴─    `,
        `
         ┌─────┐
         │     │
         │     😮
         │    /│\\
         │     │
         │    / 
        ─┴─    `,
        `
         ┌─────┐
         │     │
         │     💀
         │    /│\\
         │     │
         │    / \\
        ─┴─    `
    ];
    return stages[wrongGuesses] || stages[0];
}

module.exports = { startHangman, guessLetter };
