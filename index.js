const config = require("./controller/config.json")

const {
	default:
	WAConnect,
	DisconnectReason,
	useSingleFileAuthState,
	fetchLatestBaileysVersion,
	makeInMemoryStore,
	jidDecode
} = require("@adiwajshing/baileys");
const {
Boom
} = require('@hapi/boom');
const qrcode = require("qrcode-terminal");
const chalk = require('chalk');
const pino = require('pino');

const { smsg } = require('./lib/function');

// Session
const {
state,
saveState
} = useSingleFileAuthState(config.sessionName + ".json");

// Store Memory
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

// Console
function konsol() {
      console.clear()
      console.log(chalk.bold.cyan('WhatsApp Bot - ChatGPT'))
console.log((`
${chalk.greenBright('Creator')}: ${chalk.whiteBright('Danzz Coding')}
${chalk.greenBright('Version')}: ${chalk.whiteBright('1.0.0')}
${chalk.greenBright('Donate')}: ${chalk.whiteBright('Donate to me so that the bot can develop more.\n\nDana: 089512545999\nGopay: 089512545999\n\nDonasi seihklas nya!')}`))
}

// After Scanning
const connectToWhatsapp = async () => {
	const client = WAConnect({
		printQRInTerminal: true,
		logger: pino({ level: 'silent' }),
		browser: ["WA Bot - ChatGPT","Chrome","3.0.0"],
		auth: state
	})
konsol()
store.bind(client.ev)
client.ev.on('messages.upsert', async chatUpdate => {
	try {
        mek = chatUpdate.messages[0]
        if (!mek.message) return
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        if (!client.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
        messages = smsg(client, mek, store)
        require("./response/client.js")(client, messages)
        } catch (err) {
            console.log(err)
        }
    }
)

client.public = config.publicMode

client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update	    
        if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); client.logout(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); connectToWhatsapp(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); connectToWhatsapp(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); client.logout(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Scan Again And Run.`); client.logout(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); connectToWhatsapp(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); connectToWhatsapp(); }
            else client.end(`Unknown DisconnectReason: ${reason}|${connection}`)
        }
        console.log('Connected...', update)
    }
)
client.ev.on('creds.update', saveState)

decodeJid = client.decodeJid = (jid) => {
	if (!jid) return jid
	if (/:\d+@/gi.test(jid)) {
		let decode =jidDecode(jid) || {}
		return decode.user && decode.server && decode.user + '@' + decode.server || jid
	} else return jid
}

sendText = client.sendText = (jid, text, quoted = '', options) => client.sendMessage(jid, { text: text, ...options }, { quoted })

return client
}
connectToWhatsapp()