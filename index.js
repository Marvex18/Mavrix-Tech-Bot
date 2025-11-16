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

// 💎 PREMIUM ASCII ART
const PREMIUM_BANNER = `
╔══════════════════════════════════════╗
║                                      ║
║  ███╗   ███╗ █████╗ ██╗   ██╗██████╗ ║
║  ████╗ ████║██╔══██╗██║   ██║██╔══██╗║
║  ██╔████╔██║███████║██║   ██║██████╔╝║
║  ██║╚██╔╝██║██╔══██║╚██╗ ██╔╝██╔══██╗║
║  ██║ ╚═╝ ██║██║  ██║ ╚████╔╝ ██║  ██║║
║  ╚═╝     ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝║
║                                      ║
║         💎 PREMIUM EDITION 🚀       ║
║                                      ║
╚══════════════════════════════════════╝
`;

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { smsg } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    jidDecode,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { rmSync } = require('fs')

// Import lightweight store
const store = require('./lib/lightweight_store')

// Initialize store
store.readFromFile()
const settings = require('./settings')
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

// Memory optimization
setInterval(() => {
    if (global.gc) {
        global.gc()
        console.log(chalk.blue('🧹 Premium memory optimized'))
    }
}, 60_000)

// Memory monitoring
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 280) {
        console.log(chalk.red('⚠️ High memory usage, restarting...'))
        process.exit(1)
    }
}, 30_000)

let phoneNumber = process.env.PHONE_NUMBER || "911234567890"
let owner = []

try {
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data', { recursive: true })
    }

    if (fs.existsSync('./data/owner.json')) {
        const ownerData = JSON.parse(fs.readFileSync('./data/owner.json'))
        owner = Array.isArray(ownerData) ? ownerData : [ownerData]
    } else {
        owner = [settings.ownerNumber + '@s.whatsapp.net']
    }
} catch (error) {
    console.error('Error loading owner data:', error)
    owner = [settings.ownerNumber + '@s.whatsapp.net']
}

global.botname = "Mavrix Bot Premium"
global.themeemoji = "💎"

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve))
    } else {
        return Promise.resolve(settings.ownerNumber || phoneNumber)
    }
}

// Restart guard
let restartCount = 0
let lastRestartTime = 0
const MAX_RESTARTS = 5
const RESTART_WINDOW = 60000

async function startMavrixBot() {
    try {
        console.log(chalk.hex('#FFD700')(PREMIUM_BANNER))
        console.log(chalk.hex('#00FFAA')(`💎 Mavrix Tech © 2025 | Premium Edition\n`))
        
        let { version } = await fetchLatestBaileysVersion()
        console.log(chalk.hex('#00D4FF')(`🚀 Baileys version: ${version}`))
        
        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const MavrixBot = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,
            browser: ["Mavrix Premium", "Chrome", "3.0.0"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid)
                let msg = await store.loadMessage(jid, key.id)
                return msg?.message || ""
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        })

        MavrixBot.ev.on('creds.update', saveCreds)
        store.bind(MavrixBot.ev)

        // Message handling
        MavrixBot.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0]
                if (!mek.message) return
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
                
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    await handleStatus(MavrixBot, chatUpdate)
                    return
                }
                
                if (!MavrixBot.public && !mek.key.fromMe && chatUpdate.type === 'notify') {
                    const isGroup = mek.key?.remoteJid?.endsWith('@g.us')
                    if (!isGroup) return
                }
                
                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

                if (MavrixBot?.msgRetryCounterCache) {
                    MavrixBot.msgRetryCounterCache.clear()
                }

                try {
                    await handleMessages(MavrixBot, chatUpdate, true)
                } catch (err) {
                    console.error("Error in handleMessages:", err)
                    if (mek.key && mek.key.remoteJid) {
                        await MavrixBot.sendMessage(mek.key.remoteJid, {
                            text: '❌ An error occurred while processing your message.',
                        }).catch(console.error)
                    }
                }
            } catch (err) {
                console.error("Error in messages.upsert:", err)
            }
        })

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
            if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
                v = store.contacts[id] || {}
                if (!(v.name || v.subject)) v = MavrixBot.groupMetadata(id) || {}
                resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
            })
            else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === MavrixBot.decodeJid(MavrixBot.user.id) ?
                MavrixBot.user :
                (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
        }

        MavrixBot.public = true
        MavrixBot.serializeM = (m) => smsg(MavrixBot, m, store)

        // Pairing code handling
        if (pairingCode && !MavrixBot.authState.creds.registered) {
            if (useMobile) throw new Error('Cannot use pairing code with mobile api')

            let phoneNumber
            if (!!global.phoneNumber) {
                phoneNumber = global.phoneNumber
            } else {
                phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number:\nFormat: 6281376552730 (without + or spaces) : `)))
            }

            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

            const pn = require('awesome-phonenumber')
            if (!pn('+' + phoneNumber).isValid()) {
                console.log(chalk.red('Invalid phone number. Please enter your full international number.'))
                process.exit(1)
            }

            setTimeout(async () => {
                try {
                    let code = await MavrixBot.requestPairingCode(phoneNumber)
                    code = code?.match(/.{1,4}/g)?.join("-") || code
                    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code: `)), chalk.black(chalk.white(code)))
                    console.log(chalk.yellow(`\nPlease enter this code in your WhatsApp app:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the code shown above`))
                } catch (error) {
                    console.error('Error requesting pairing code:', error)
                    console.log(chalk.red('Failed to get pairing code. Please check your phone number and try again.'))
                }
            }, 3000)
        }

        // Connection handling
        MavrixBot.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s
            
            if (qr) {
                console.log(chalk.yellow('📱 QR Code generated. Please scan with WhatsApp.'))
            }
            
            if (connection === 'connecting') {
                console.log(chalk.yellow('🔄 Connecting to WhatsApp...'))
            }
            
            if (connection == "open") {
                console.log(chalk.hex('#00FFAA')(`\n💎 PREMIUM BOT CONNECTED SUCCESSFULLY! ✅\n`))
                console.log(chalk.yellow(`Connected to: ${JSON.stringify(MavrixBot.user, null, 2)}`))

                try {
                    const botNumber = MavrixBot.user.id.split(':')[0] + '@s.whatsapp.net'
                    await MavrixBot.sendMessage(botNumber, {
                        text: `🤖 *Premium Bot Connected!*\n\n⏰ Time: ${new Date().toLocaleString()}\n💎 Status: Premium Online\n🚀 Performance: Optimal\n\n⭐ Enjoy our premium bot experience!`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363161513685998@newsletter',
                                newsletterName: 'Mavrix MD',
                                serverMessageId: -1
                            }
                        }
                    })
                } catch (error) {
                    console.error('Error sending connection message:', error.message)
                }

                await delay(1999)
                console.log(chalk.yellow(`\n               ${chalk.bold.hex('#FFD700')(`[ ${global.botname} ]`)}\n`))
                console.log(chalk.cyan(`< ================================= >`))
                console.log(chalk.hex('#FF6B6B')(`\n${global.themeemoji} YT CHANNEL: Mavrix Tech`))
                console.log(chalk.hex('#FF6B6B')(`${global.themeemoji} GITHUB: Marvex18`))
                console.log(chalk.hex('#FF6B6B')(`${global.themeemoji} WA NUMBER: ${owner[0]?.replace('@s.whatsapp.net', '') || 'Not set'}`))
                console.log(chalk.hex('#FF6B6B')(`${global.themeemoji} CREDIT: Mavrix Tech`))
                console.log(chalk.hex('#00FFAA')(`${global.themeemoji} 🤖 Premium Bot Connected! ✅`))
                console.log(chalk.hex('#00D4FF')(`Bot Version: ${settings.version}`))
                
                restartCount = 0
                lastRestartTime = 0
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
                const statusCode = lastDisconnect?.error?.output?.statusCode
                
                console.log(chalk.red(`Connection closed due to ${lastDisconnect?.error}, reconnecting ${shouldReconnect}`))
                
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                    try {
                        rmSync('./session', { recursive: true, force: true })
                        console.log(chalk.yellow('Session folder deleted. Please re-authenticate.'))
                    } catch (error) {
                        console.error('Error deleting session:', error)
                    }
                    console.log(chalk.red('Session logged out. Please re-authenticate.'))
                }
                
                if (shouldReconnect) {
                    console.log(chalk.yellow('Reconnecting...'))
                    await delay(5000)
                    startMavrixBot()
                }
            }
        })

        // Anticall handler
        const antiCallNotified = new Set()

        MavrixBot.ev.on('call', async (calls) => {
            try {
                const { readState: readAnticallState } = require('./commands/anticall')
                const state = readAnticallState()
                if (!state.enabled) return
                
                for (const call of calls) {
                    const callerJid = call.from || call.peerJid || call.chatId
                    if (!callerJid) continue
                    
                    try {
                        try {
                            if (typeof MavrixBot.rejectCall === 'function' && call.id) {
                                await MavrixBot.rejectCall(call.id, callerJid)
                            } else if (typeof MavrixBot.sendCallOfferAck === 'function' && call.id) {
                                await MavrixBot.sendCallOfferAck(call.id, callerJid, 'reject')
                            }
                        } catch {}

                        if (!antiCallNotified.has(callerJid)) {
                            antiCallNotified.add(callerJid)
                            setTimeout(() => antiCallNotified.delete(callerJid), 60000)
                            await MavrixBot.sendMessage(callerJid, { text: '📵 Anticall is enabled. Your call was rejected and you will be blocked.' })
                        }
                    } catch {}
                    
                    setTimeout(async () => {
                        try { await MavrixBot.updateBlockStatus(callerJid, 'block') } catch {}
                    }, 800)
                }
            } catch (e) {}
        })

        MavrixBot.ev.on('group-participants.update', async (update) => {
            await handleGroupParticipantUpdate(MavrixBot, update)
        })

        return MavrixBot
        
    } catch (error) {
        console.error('Error in startMavrixBot:', error)
        await delay(5000)
        startMavrixBot()
    }
}

// Enhanced start function with restart guard
async function startBotWithGuard() {
    const now = Date.now()
    
    if (now - lastRestartTime < RESTART_WINDOW) {
        restartCount++
    } else {
        restartCount = 1
    }
    lastRestartTime = now
    
    if (restartCount > MAX_RESTARTS) {
        console.log(chalk.red(`🚨 Too many restarts, waiting 30 seconds...`))
        setTimeout(startMavrixBot, 30000)
        return
    }
    
    console.log(chalk.yellow(`🔄 Restart attempt ${restartCount}/${MAX_RESTARTS}`))
    await startMavrixBot()
}

// Start the bot
startBotWithGuard().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
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
