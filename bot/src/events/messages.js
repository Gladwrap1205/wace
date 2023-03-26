//const { } = require("discord.js");
const { create_help_embed } = require("../utils.js");

module.exports = {
	messageCreate: async function(client, octokit, message) {
		if(message.author.bot)
			return;
		if(!message.guild)
			return;
		const content = message.content.toLowerCase();
		if(!content.startsWith(prefix))
			return;
		if(!message.member)
			message.member = await message.guild.members.fetch();

		let options = content.split(' ');
		let commandName = options[0];
		options.shift(); // Remove command name
		
		if(!client.commands.has(commandName)) {
			if(!client.aliases.has(commandName))
				return;
			else
				commandName = client.aliases.get(commandName);
		}

		const command = client.commands.get(commandName);
		let embed;
		if(options.length > command.max_args || options.length < command.min_args)
			embed = create_help_embed(`Incorrect command usage.\n> ${command.help}`);
		else
			embed = await command.run(client, octokit, options, false);
		return message.reply(embed);
	}
};
