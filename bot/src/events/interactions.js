//const { } = require("discord.js");

module.exports = {
	interactionCreate: async function(client, octokit, interaction) {
		if(!interaction.isChatInputCommand())
			return;

		let { commandName } = interaction;
		await interaction.deferReply();

		if(!client.commands.has(commandName)) {
			if(!client.aliases.has(commandName))
				return;
			else
				commandName = client.aliases.get(commandName);
		}

		const embed = await client.commands.get(commandName).run(client, octokit, interaction.options, true);
		return interaction.editReply({ embeds: [ embed ] });
	}
};
