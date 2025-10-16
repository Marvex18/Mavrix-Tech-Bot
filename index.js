/**
 * Mavrix Bot - A WhatsApp Bot
 * Copyright (c) 2025 Mavrix Tech
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// FIX: Correct store import for Baileys v7
const { makeInMemoryStore } = require("@whiskeysockets/baileys")
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

// Initialize settings
const settings = require('./settings')

// Memory optimization - Force garbage collection if available
setInterval(() => {
    if (global.gc) {
        global.gc()
        console.log('🧹 Garbage collection completed')
    }
}, 60_000) // every 1 minute

// Memory monitoring - Restart if RAM gets too high
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 400) {
        console.log('⚠️ RAM too high (>400MB), restarting bot...')
        process.exit(1) // Panel will auto-restart
    }
}, 30_000) // check every 30 seconds

// FIX: Better phone number handling
let phoneNumber = process.env.PHONE_NUMBER || "911234567890"
let owner = []

// FIX: Safe owner data loading
try {
    if (fs.existsSync('./data/owner.json')) {
        const ownerData = JSON.parse(fs.readFileSync('./data/owner.json'))
        owner = Array.isArray(ownerData) ? ownerData : [ownerData]
    } else {
        owner = [settings.ownerNumber + '@s.whatsapp.net']
        console.log('⚠️ owner.json not found, using settings ownerNumber')
    }
} catch (error) {
    console.error('Error loading owner data:', error)
    owner = [settings.ownerNumber + '@s.whatsapp.net']
}

global.botname = "Mavrix Bot"
global.themeemoji = "•"
global.channelLink = "https://whatsapp.com/channel/0029VahiFZQ4o7qN54LTzB17" // ✅ ADDED

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

// Only create readline interface if we're in an interactive environment
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve))
    } else {
        // In non-interactive environment, use ownerNumber from settings
        return Promise.resolve(settings.ownerNumber || phoneNumber)
    }
}

async function startMavrixBot() {
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion()
        console.log(chalk.blue(`Using Baileys version: ${version}`))
        
        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const MavrixBot = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false, // FIX: Set to false for better performance
            getMessage: async (key) => {
                try {
                    let jid = jidNormalizedUser(key.remoteJid)
                    let msg = await store.loadMessage(jid, key.id)
                    return msg?.message || ""
                } catch (error) {
                    return ""
                }
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
        })

        // FIX: Use the proper store binding
        store.bind(MavrixBot.ev)

        // Message handling
        MavrixBot.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0]
                if (!mek.message) return
                
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') 
                    ? mek.message.ephemeralMessage.message 
                    : mek.message
                    
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    await handleStatus(MavrixBot, chatUpdate);
                    return;
                }
                
                if (!MavrixBot.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

                // Clear message retry cache to prevent memory bloat
                if (MavrixBot?.msgRetryCounterCache) {
                    // Only clear if cache is getting too large
                    if (MavrixBot.msgRetryCounterCache.keys().length > 1000) {
                        MavrixBot.msgRetryCounterCache.clear()
                    }
                }

                try {
                    await handleMessages(MavrixBot, chatUpdate, true)
                } catch (err) {
                    console.error("Error in handleMessages:", err)
                    // Only try to send error message if we have a valid chatId
                    if (mek.key && mek.key.remoteJid) {
                        await MavrixBot.sendMessage(mek.key.remoteJid, {
                            text: '❌ An error occurred while processing your message.',
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363161513685998@newsletter',
                                    newsletterName: 'Mavrix Bot MD',
                                    serverMessageId: -1
                                }
                            }
                        }).catch(console.error);
                    }
                }
            } catch (err) {
                console.error("Error in messages.upsert:", err)
            }
        })

        // Add these event handlers for better functionality
        MavrixBot.decodeJid = (jid) => {
            if (!jid) return jid
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {}
                return decode.user && decode.server && decode.user + '@' + decode.server || jid
            } else return jid
        }

        MavrixBot.ev.on('contacts.update', update => {
            for (let contact of update) {
                let id = MavrixBot.decodeJid(contact.id)
                if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
            }
        })

        MavrixBot.getName = (jid, withoutContact = false) => {
            let id = MavrixBot.decodeJid(jid)
            withoutContact = MavrixBot.withoutContact || withoutContact
            let v
            if (id.endsWith("@g.us")) {
                return new Promise(async (resolve) => {
                    v = store.contacts[id] || {}
                    if (!(v.name || v.subject)) v = MavrixBot.groupMetadata(id) || {}
                    resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
                })
            } else {
                v = id === '0@s.whatsapp.net' ? {
                    id,
                    name: 'WhatsApp'
                } : id === MavrixBot.decodeJid(MavrixBot.user.id) ?
                    MavrixBot.user :
                    (store.contacts[id] || {})
                return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
            }
        }

        MavrixBot.public = true

        MavrixBot.serializeM = (m) => smsg(MavrixBot, m, store)

        // Handle pairing code
        if (pairingCode && !MavrixBot.authState.creds.registered) {
            if (useMobile) throw new Error('Cannot use pairing code with mobile api')

            let phoneNumber
            if (!!global.phoneNumber) {
                phoneNumber = global.phoneNumber
            } else {
                phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFormat: 6281376552730 (without + or spaces) : `)))
            }

            // Clean the phone number - remove any non-digit characters
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

            // Validate the phone number using awesome-phonenumber
            const pn = require('awesome-phonenumber');
            if (!pn('+' + phoneNumber).isValid()) {
                console.log(chalk.red('Invalid phone number. Please enter your full international number (e.g., 15551234567 for US, 447911123456 for UK, etc.) without + or spaces.'));
                process.exit(1);
            }

            setTimeout(async () => {
                try {
                    let code = await MavrixBot.requestPairingCode(phoneNumber)
                    code = code?.match(/.{1,4}/g)?.join("-") || code
                    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
                    console.log(chalk.yellow(`\nPlease enter this code in your WhatsApp app:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the code shown above`))
                } catch (error) {
                    console.error('Error requesting pairing code:', error)
                    console.log(chalk.red('Failed to get pairing code. Please check your phone number and try again.'))
                }
            }, 3000)
        }

        // Connection handling
        MavrixBot.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect } = s
            if (connection == "open") {
                console.log(chalk.magenta(` `))
                console.log(chalk.yellow(`🌿Connected to => ` + JSON.stringify(MavrixBot.user, null, 2)))

                // Auto-add owner's LID to sudo list
                try {
                    const { addSudo } = require('./lib/index');
                    const botLid = MavrixBot.user.lid; // Get LID from bot connection data
                    if (botLid) {
                        const cleanLid = botLid.replace(/:\d+@/, '@');
                        await addSudo(cleanLid);
                    }
                } catch (error) {
                    console.error('Error adding owner LID to sudo list:', error);
                }

                const botNumber = MavrixBot.user.id.split(':')[0] + '@s.whatsapp.net';
                await MavrixBot.sendMessage(botNumber, {
                    text: `🤖 Bot Connected Successfully!\n\n⏰ Time: ${new Date().toLocaleString()}\n✅ Status: Online and Ready!\n\n✅ Enjoy our bot`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: 'Mavrix MD',
                            serverMessageId: -1
                        }
                    }
                });

                await delay(1999)
                console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname} ]`)}\n\n`))
                console.log(chalk.cyan(`< ================================================== >`))
                console.log(chalk.magenta(`\n${global.themeemoji || '•'} YT CHANNEL: Mavrix Tech`))
                console.log(chalk.magenta(`${global.themeemoji || '•'} GITHUB: Marvex18`))
                console.log(chalk.magenta(`${global.themeemoji || '•'} WA NUMBER: ${owner[0]?.replace('@s.whatsapp.net', '') || 'Not set'}`))
                console.log(chalk.magenta(`${global.themeemoji || '•'} CREDIT: Mavrix Tech`))
                console.log(chalk.green(`${global.themeemoji || '•'} 🤖 Bot Connected Successfully! ✅`))
                console.log(chalk.blue(`Bot Version: ${settings.version}`))
            }
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode
                console.log(chalk.yellow(`Connection closed. Status: ${statusCode}`))
                
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                    try {
                        rmSync('./session', { recursive: true, force: true })
                        console.log(chalk.red('Session logged out. Cleaning session folder.'))
                    } catch (e) { 
                        console.log(chalk.red('Error cleaning session folder:', e.message))
                    }
                    console.log(chalk.red('Session logged out. Please re-authenticate.'))
                    setTimeout(startMavrixBot, 5000)
                } else {
                    console.log(chalk.yellow('Connection closed, attempting reconnect...'))
                    setTimeout(startMavrixBot, 5000)
                }
            }
        })

        // Track recently-notified callers to avoid spamming messages
        const antiCallNotified = new Set();

        // Anticall handler: block callers when enabled
        MavrixBot.ev.on('call', async (calls) => {
            try {
                const { readState: readAnticallState } = require('./commands/anticall');
                const state = readAnticallState();
                if (!state.enabled) return;
                
                for (const call of calls) {
                    const callerJid = call.from || call.peerJid || call.chatId;
                    if (!callerJid) continue;
                    
                    try {
                        // First: attempt to reject the call if supported
                        try {
                            if (typeof MavrixBot.rejectCall === 'function' && call.id) {
                                await MavrixBot.rejectCall(call.id, callerJid);
                            } else if (typeof MavrixBot.sendCallOfferAck === 'function' && call.id) {
                                await MavrixBot.sendCallOfferAck(call.id, callerJid, 'reject');
                            }
                        } catch (callError) {
                            console.log('Call rejection failed:', callError.message)
                        }

                        // Notify the caller only once within a short window
                        if (!antiCallNotified.has(callerJid)) {
                            antiCallNotified.add(callerJid);
                            setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                            await MavrixBot.sendMessage(callerJid, { text: '📵 Anticall is enabled. Your call was rejected and you will be blocked.' });
                        }
                    } catch (messageError) {
                        console.log('Failed to send anticall message:', messageError.message)
                    }
                    
                    // Then: block after a short delay to ensure rejection and message are processed
                    setTimeout(async () => {
                        try { 
                            await MavrixBot.updateBlockStatus(callerJid, 'block'); 
                            console.log(`Blocked caller: ${callerJid}`)
                        } catch (blockError) {
                            console.log('Failed to block caller:', blockError.message)
                        }
                    }, 800);
                }
            } catch (e) {
                console.error('Anticall system error:', e.message)
            }
        });

        MavrixBot.ev.on('creds.update', saveCreds)

        MavrixBot.ev.on('group-participants.update', async (update) => {
            await handleGroupParticipantUpdate(MavrixBot, update);
        });

        // Additional event handlers for status
        MavrixBot.ev.on('messages.upsert', async (m) => {
            if (m.messages[0].key && m.messages[0].key.remoteJid === 'status@broadcast') {
                await handleStatus(MavrixBot, m);
            }
        });

        return MavrixBot
        
    } catch (error) {
        console.error('Fatal error in bot initialization:', error)
        throw error
    }
}

// Start the bot with error handling
startMavrixBot().catch(error => {
    console.error('Failed to start bot:', error)
    console.log('Restarting in 10 seconds...')
    setTimeout(startMavrixBot, 10000)
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
    console.log('Restarting bot...')
    setTimeout(startMavrixBot, 5000)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
