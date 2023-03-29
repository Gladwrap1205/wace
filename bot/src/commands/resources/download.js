const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { to_subject_name, combine_subject_dir, remove_unpopular_subjects } = require("../../utils.js");
const {
	sidebar_colour,
	STATUS_OK, STATUS_NOT_FOUND,
	subject_list
} = require("../../constants.json");


function parse_options(options, wasInteraction) {
	let args;
	if(wasInteraction) {
		args = [ options.get("subject", false) ];
		if(args[0])
			args[0] = args[0].value;
	} else
		args = options; // TODO
	return args;
}

module.exports = {
	name: "download",
	aliases: [ "dl", "download_link" ],
	max_args: 1,
	min_args: 0,
	help: "download <subject?>",
	run: async function(client, octokit, options, wasInteraction) {
		const args = parse_options(options, wasInteraction);

		const subject_name = args[0] ? to_subject_name(args[0], subject_list) : "";
		let subject_dir = args[0];
		if(args[0])
			subject_dir = combine_subject_dir(subject_dir); // Deal with english and lit

		let embed = new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle(subject_dir ? `Download link for ${subject_name}` : "Download links");

		if(!subject_dir) {
			embed.setURL(`${process.env.github_base_repourl}/releases/latest`); // TODO: no check that there are any releases
			return embed;
		}

		let release;
		try { // Get the latest release's info
			release = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
				owner: process.env.github_username,
				repo: process.env.github_reponame
			});
		} catch(err) {
			embed.setDescription(err.status === STATUS_NOT_FOUND ? "No releases found." : "Something went wrong.");
			return embed;
		}
		if(release.status !== STATUS_OK) {
			embed.setDescription("No releases found.");
			return embed;
		}

		const assets = release.data.assets;
		const asset = assets.find(({ name }) => name === `${subject_dir}.zip`);
		if(asset)
			embed.setURL(asset.browser_download_url);
		else {
			const y11_asset = assets.find(({ name }) => name === `${subject_dir}_y11.zip`);
			const y12_asset = assets.find(({ name }) => name === `${subject_dir}_y12.zip`);
			if(y11_asset && y12_asset) {
				embed.setDescription(`[Year 11 download](${y11_asset.browser_download_url})\n[Year 12 download](${y12_asset.browser_download_url})`);
			} else
				embed.setDescription(assets.find(({ name }) => name === `_FAILED_${subject_dir}.txt`)
					? "The ZIP for that subject was too large to be released. Try downloading it with https://download-directory.github.io/"
					: "ZIP for that subject wasn't found."
				);
		}

		return embed;
	},
	data: (client) => new SlashCommandBuilder()
		.setName("download")
		.setDescription("Sends the download link for a subject")
		.addStringOption(option =>
			option.setName("subject")
				.setDescription("Which subject to download resources for")
				.setRequired(false)
				.addChoices(...remove_unpopular_subjects(subject_list))
		)
}
