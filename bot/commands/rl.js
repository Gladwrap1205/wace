const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { sidebar_colour } = require("../constants.js");

module.exports = {
	name: "rl",
	aliases: [ "repo_link", "github_link" ],
	run: async function(client, octokit, options, wasInteraction) {
		const embed = new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle("Repo Links")
			.setDescription(`[Repository link](${process.env.github_repourl}/resources)\n[Link to latest ZIP downloads](${process.env.github_base_repourl}/releases/latest)`);

		return embed;
	},
	data: new SlashCommandBuilder()
		.setName("rl")
		.setDescription("Links to the GitHub repository")
}
