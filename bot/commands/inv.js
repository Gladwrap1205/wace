const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { sidebar_colour } = require("../constants.js");

module.exports = {
	name: "inv",
	aliases: [ "invite" ],
	run: async function(client, octokit, options, wasInteraction) {
		const embed = new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle("Invite Link")
			.setDescription(process.env.discord_invite_link);

		return embed;
	},
	data: new SlashCommandBuilder()
		.setName("inv")
		.setDescription("Sends an invite link to the server")
}
