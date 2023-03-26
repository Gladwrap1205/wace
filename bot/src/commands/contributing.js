const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { sidebar_colour } = require("../constants.js");

module.exports = {
	name: "contributing",
	aliases: [ "contribute" ],
	max_args: 0,
	min_args: 0,
	help: "contributing",
	run: async function(client, octokit, options, wasInteraction) {
		const embed = new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle("How to contribute")
			.setDescription("Coming soon");

		return embed;
	},
	data: new SlashCommandBuilder()
		.setName("contributing")
		.setDescription("Describes how to contribute to the GitHub repository")
}
