const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { sidebar_colour } = require("../../constants.json");

module.exports = {
	name: "contributing",
	aliases: [ "contribute" ],
	max_args: 0,
	min_args: 0,
	help: "contributing",
	run: function(client, octokit, options, wasInteraction) {
		const embed = new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle("How to contribute")
			.setDescription(`Check out [the guide](${process.env.github_base_repourl}/blob/main/resources/CONTRIBUTING.md) for information on how to contribute.`);

		return embed;
	},
	data: (client) => new SlashCommandBuilder()
		.setName("contributing")
		.setDescription("Describes how to contribute to the GitHub repository")
}
