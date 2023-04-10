const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { trim_str, to_upper } = require("../utils.js");
const {
	sidebar_colour, ZERO_WIDTH_SPACE,
	MAX_FIELD_CHARS
} = require("../constants.json");

let categories = {};


function parse_options(options, wasInteraction) {
	let args;
	if(wasInteraction) {
		args = [
			options.get("command", false)
		];
		for(var arg_i in args) // Extract .value
			if(args[arg_i])
				args[arg_i] = args[arg_i].value;
	} else
		args = options;
	return args;
}

module.exports = {
	name: "help",
	aliases: [],
	max_args: 1,
	min_args: 0,
	help: "help <command?>",
	init: function(client) {
		client.commands.forEach(com => {
			if(com.category === "")
				return;
			if(com.category in categories)
				categories[com.category].push(com.help);
			else
				categories[com.category] = [ com.help ];
		});
	},
	run: async function(client, octokit, options, wasInteraction) {
		const args = parse_options(options, wasInteraction);

		const command_name = args[0];

		let embed = new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle(command_name ? `Help: ${command_name}` : "Help");

		if(command_name) {
			const command = client.commands.find(com => com.name === command_name);
			if(command)
				embed.addFields({
					name: "Command usage",
					value: command.help
				});
			else
				embed.setDescription("Command not found");
		} else {
			for(var category_name in categories)
				embed.addFields({
					name: to_upper(category_name),
					value: trim_str(categories[category_name].join('\n'), MAX_FIELD_CHARS)
				});
			embed.setDescription("help <command?>");
		}
		
		return embed;
	},
	data: (client) => new SlashCommandBuilder()
		.setName("help")
		.setDescription("Explains how to use the bot")
		.addStringOption(option =>
			option.setName("command")
				.setDescription("Which command to provide help for")
				.setRequired(false)
				.addChoices(...client.commands.map((command, command_name) => {
					return {
						value: command_name,
						name: `${command_name}: ${command_name === "help" ? "Explains how to use the bot" : command.data(client).description}` // Prevent recursion
					};
				}))
		)
}
