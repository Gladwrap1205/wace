const { REST, Routes } = require("discord.js");
const { readdirSync } = require("fs");

const slashCommands = [];

const REST_VERSION = "10";
const COMMANDS_DIR = "./commands";


async function register_file(client, file_dir, command_category) {
	const file_data = require(file_dir);
	file_data.category = command_category;

	if(file_data.init)
		await file_data.init(client);
	if(file_data.name)
		client.commands.set(file_data.name, file_data);
	if(file_data.data)
		slashCommands.push(file_data.data(client).toJSON());

	if(file_data.aliases && Array.isArray(file_data.aliases)) 
		file_data.aliases.forEach(alias => client.aliases.set(alias, file_data.name));
}

async function register_from_folder(client, folder, command_category) {
	await readdirSync(folder).forEach(async f => {
		if(f.endsWith(".js")) // Ignore non-scripts
			await register_file(client, folder + f, command_category);
	});
}

module.exports = async (client) => {
	// First deal with the folders, then the uncategorised ones
	// This is because help command needs all others registered first
	await readdirSync(COMMANDS_DIR).forEach(async folder => {
		if(!folder.endsWith(".js"))
			await register_from_folder(client, `${COMMANDS_DIR}/${folder}/`, folder)
	});
	await readdirSync(COMMANDS_DIR).forEach(async file => {
		if(file.endsWith(".js"))
			await register_file(client, `${COMMANDS_DIR}/${file}`, ""); // Uncategorised
	});

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
