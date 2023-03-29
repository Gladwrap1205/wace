const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { sidebar_colour } = require("../../constants.json");

module.exports = {
	name: "link",
	aliases: [ "rl", "repo_link", "github_link" ],
	max_args: 0,
	min_args: 0,
	help: "link",
	run: function(client, octokit, options, wasInteraction) {
		const embed = new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle("Repo Links")
			.setDescription(`[Repository link](${process.env.github_repourl}/resources)\n[Link to latest ZIP downloads](${process.env.github_base_repourl}/releases/latest)`);

		return embed;
	},
	data: (client) => new SlashCommandBuilder()
		.setName("link")
		.setDescription("Links to the GitHub repository")
}
