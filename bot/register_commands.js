const { REST, Routes } = require("discord.js");
const { readdirSync } = require("fs");
let slashCommands = [];

const REST_VERSION = "10";

module.exports = (client) => {
	readdirSync("./commands/").forEach(f => {
		const file_data = require("./commands/" + f);

		if(file_data.name)
			client.commands.set(file_data.name, file_data);
		if(file_data.data)
			slashCommands.push(file_data.data.toJSON());

		if(file_data.aliases && Array.isArray(file_data.aliases)) 
			file_data.aliases.forEach(alias => client.aliases.set(alias, file_data.name));
	});

	const rest = new REST({ version: REST_VERSION }).setToken(process.env.token);

	(async () => {
		try {
			await rest.put(
				Routes.applicationCommands(process.env.app_id),
				{ body: slashCommands }
			);
		} catch(err) {
			console.error(err);
		}
	})();
}
