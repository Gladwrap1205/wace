require("dotenv").config();
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { ready } = require("./events/ready");
const { interactionCreate } = require("./events/interactions");
const { messageCreate } = require("./events/messages");
const { Octokit } = require("octokit");

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds
	]
});

const octokit = new Octokit({
	auth: process.env.github_token
});

client.commands = new Collection();
client.aliases = new Collection();

require("./register_commands")(client);

client.once(Events.ClientReady, ready);
client.on(Events.InteractionCreate, async interaction => interactionCreate(client, octokit, interaction));
client.on(Events.MessageCreate, async message => messageCreate(client, octokit, message));

client.login(process.env.token);
