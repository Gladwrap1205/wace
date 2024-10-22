const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { sidebar_colour } = require("../../constants.json");

module.exports = {
	name: "invite",
	aliases: [ "inv" ],
	max_args: 0,
	min_args: 0,
	help: "invite",
	run: function(client, octokit, options, wasInteraction) {
		const embed = new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle("Invite Link")
			.setDescription(process.env.discord_invite_link);

		return embed;
	},
	data: (client) => new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Sends an invite link to the server")
}
