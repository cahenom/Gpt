const apikey = require("../controller/apikey.json")

const {
	Configuration,
	OpenAIApi
} = require("openai")
const axios = require("axios")
const chalk = require("chalk")
const fs = require("fs")

module.exports = async (client, messages) => {
    const body = (messages.mtype === 'conversation') ? messages.message.conversation : (messages.mtype == 'extendedTextMessage') ? messages.message.extendedTextMessage.text : ''
    const budy = (typeof messages.text == 'string' ? messages.text : '')
    const args = body.trim().split(/ +/).slice(1)
    const text = args.join(" ")
	const message = messages
	const messageType = messages.mtype
	const messageKey = message.key
    const pushName = messages.pushName || "Undefined"
    const chat = from = messages.chat
	const reply = messages.reply
	const sender = messages.sender
	
	// readMessages
	if (message.message) {
        client.readMessages([messageKey])
        console.log(chalk.magentaBright('Chat with:'), chalk.blueBright(pushName), chalk.greenBright(sender))
    }
    
    // OpenAI Feature
    if (body === "Siapa namamu?") {
		return reply("Namaku dani")
	}
	if (!text) return reply(`Hai *${pushName}*, ada yang bisa saya bantu?`)
    reply("Wait a moment...")
    const configuration = new Configuration({
		apiKey: apikey
	})
	const openai = new OpenAIApi(configuration)
	async function getChatGptResponse(request) {
		try {
    		const response = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: body }],
			});
			reply(response.data.choices[0].message.content);
			return response.data.choices[0].message.content;
		} catch (err) {
    		reply('Error: ' + err);
    		console.log('Error: ' + err);
    		return err;
		}
	}
	getChatGptResponse();
	// End
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.greenBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})