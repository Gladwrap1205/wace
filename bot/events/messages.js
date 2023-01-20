//const { } = require("discord.js");

module.exports = {
	messageCreate: async function(client, octokit, message) { /* Unused
		if(message.author.bot)
			return;
		if(!message.guild)
			return;
		const content = message.content.toLowerCase();
		if(!content.startsWith(prefix))
			return;
		if(!message.member)
			message.member = await message.guild.members.fetch();

		let commandName = content.split(" ")[0];
		
		if(!client.commands.has(commandName)) {
			if(!client.aliases.has(commandName))
				return;
			else
				commandName = client.aliases.get(commandName);
		}

		const args = [];

		const embed = await client.commands.get(commandName).run(client, octokit, args);
		return message.reply(embed);
	*/ }
};
