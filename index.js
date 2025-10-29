/**
 * Mavrix Bot - A WhatsApp Bot
 * Premium Edition | © 2025 Mavrix Tech
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @whiskeysockets
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */

const PREMIUM_BANNER = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ███╗   ███╗ █████╗ ██╗   ██╗██████╗ ██╗██╗  ██╗███████╗    ║
║  ████╗ ████║██╔══██╗██║   ██║██╔══██╗██║╚██╗██╔╝██╔════╝    ║
║  ██╔████╔██║███████║██║   ██║██████╔╝██║ ╚███╔╝ █████╗      ║
║  ██║╚██╔╝██║██╔══██║╚██╗ ██╔╝██╔══██╗██║ ██╔██╗ ██╔══╝      ║
║  ██║ ╚═╝ ██║██║  ██║ ╚████╔╝ ██║  ██║██║██╔╝ ██╗███████╗    ║
║  ╚═╝     ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝    ║
║                                                              ║
║              🤖 P R E M I U M  E D I T I O N 💎            ║
║                                                              ║
║         🌿 Smart · Fast · Secure · Auto-Update 🎯          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, sleep, reSize } = require('./lib/myfunc')
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

// 🧠 Memory optimization
if (global.gc) {
    setInterval(() => {
        global.gc()
        console.log(chalk.blue('🧹 Premium Memory cleaned'))
    }, 60000)
}

// 🔁 Restart if memory too high
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 280) {
        console.log(chalk.red('⚠️ High memory usage (>280MB), restarting...'))
        process.exit(1)
    }
}, 30000)

const settings = require('./settings')

let phoneNumber = process.env.PHONE_NUMBER || "911234567890"
let owner = []

try {
    if (fs.existsSync('./data/owner.json')) {
        const ownerData = JSON.parse(fs.readFileSync('./data/owner.json'))
        owner = Array.isArray(ownerData) ? ownerData : [ownerData]
    } else {
        owner = [settings.ownerNumber + '@s.whatsapp.net']
        console.log(chalk.yellow('⚠️ owner.json not found, using settings ownerNumber'))
    }
} catch (error) {
    console.error('Error loading owner data:', error)
    owner = [settings.ownerNumber + '@s.whatsapp.net']
}

global.botname = "Mavrix Bot Premium"
global.themeemoji = "💎"
global.channelLink = "https://whatsapp.com/channel/0029Va4K0PZ5a245NkngBA2M"

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) return new Promise((resolve) => rl.question(text, resolve))
    else return Promise.resolve(settings.ownerNumber || phoneNumber)
}

async function startMavrixBot() {
    try {
        console.log(chalk.hex('#FFD700')(PREMIUM_BANNER))
        console.log(chalk.hex('#00FFAA')(`🌿📡 ʍǟʀʋɛʟօʊֆ 🌠🔬 | Mavrix Tech © 2025 | Premium Edition\n`))

        let { version } = await fetchLatestBaileysVersion()
        console.log(chalk.hex('#00D4FF')(`💎 Using Baileys version: ${version}`))

        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const MavrixBot = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,
            browser: ["Mavrix Premium", "Chrome", "3.0.0"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            getMessage: async (key) => ""
        })

        // 🧩 Dummy store for Baileys v7 (no makeInMemoryStore anymore)
        const store = {
            loadMessage: async () => null,
            contacts: {},
            chats: {},
            messages: {}
        }

        // 🌐 Message handler
        MavrixBot.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0]
                if (!mek.message) return

                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage')
                    ? mek.message.ephemeralMessage.message
                    : mek.message

                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    await handleStatus(MavrixBot, chatUpdate)
                    return
                }

                await handleMessages(MavrixBot, chatUpdate, true)
            } catch (err) {
                console.error('Error in messages.upsert:', err)
            }
        })

        // 🧩 Contact updates
        MavrixBot.ev.on('contacts.update', (update) => {
            for (let contact of update) {
                const id = contact.id
                store.contacts[id] = { id, name: contact.notify }
            }
        })

        // 📡 Connection handling
        MavrixBot.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect } = s
            if (connection === "open") {
                console.log(chalk.greenBright('✅ Premium Bot Connected Successfully!'))
            }
            if (connection === "close") {
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

        // 🧠 Other handlers
        MavrixBot.ev.on('creds.update', saveCreds)
        MavrixBot.ev.on('group-participants.update', async (update) => {
            await handleGroupParticipantUpdate(MavrixBot, update)
        })
        MavrixBot.ev.on('messages.upsert', async (m) => {
            if (m.messages[0].key.remoteJid === 'status@broadcast') await handleStatus(MavrixBot, m)
        })

        return MavrixBot
    } catch (error) {
        console.error('Fatal error in bot initialization:', error)
        throw error
    }
}

// 🚀 Start the bot
startMavrixBot().catch(error => {
    console.error('Failed to start bot:', error)
    console.log('Restarting in 10 seconds...')
    setTimeout(startMavrixBot, 10000)
})

// 🛡️ Global error handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
    console.log('Restarting bot...')
    setTimeout(startMavrixBot, 5000)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
})

// ♻️ Auto-reload on file change
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
