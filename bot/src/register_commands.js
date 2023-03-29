const { REST, Routes } = require("discord.js");
const { readdirSync } = require("fs");

const slashCommands = [];

const REST_VERSION = "10";
const COMMANDS_DIR = "./commands";


async function register_from_folder(client, folder) {
	await readdirSync(folder).forEach(async f => {
		if(!f.endsWith(".js")) // Ignore non-scripts
			return;
		const file_data = require(folder + f);

		if(file_data.init)
			await file_data.init(client);
		if(file_data.name)
			client.commands.set(file_data.name, file_data);
		if(file_data.data)
			slashCommands.push(file_data.data(client).toJSON());

		if(file_data.aliases && Array.isArray(file_data.aliases)) 
			file_data.aliases.forEach(alias => client.aliases.set(alias, file_data.name));
	});
}

module.exports = async (client) => {
	await readdirSync(COMMANDS_DIR).forEach(async folder =>
		await register_from_folder(client, `${COMMANDS_DIR}/${folder}/`)
	);

	const rest = new REST({ version: REST_VERSION }).setToken(process.env.token);
	try {
		await rest.put(
			Routes.applicationCommands(process.env.app_id),
			{ body: slashCommands }
		);
	} catch(err) {
		console.error(err);
	}
}
