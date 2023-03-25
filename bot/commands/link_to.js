const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { trim_str, to_upper, to_type_name, to_subject_name, fix_subject_dir, remove_unpopular_subjects } = require("../utils.js");
const {
	sidebar_colour, ZERO_WIDTH_SPACE,
	assignments_alt_names,
	STATUS_OK, STATUS_NOT_FOUND,
	MAX_FIELD_CHARS,
	year_list, resource_type_list, subject_list
} = require("../constants.js");


function parse_options(options, wasInteraction) {
	let args;
	if(wasInteraction) {
		args = [
			options.get("subject", true),
			options.get("year", false),
			options.get("type", false)
		];
		for(var arg_i in args) // Extract .value
			if(args[arg_i])
				args[arg_i] = args[arg_i].value;
	} else
		args = options; // TODO
	return args;
}

module.exports = {
	name: "link_to",
	aliases: [ "l2", "link" ],
	max_args: 3,
	min_args: 1,
	help: "link_to <subject> <year number?> <resource type?>", // NOTE: resource type is ignored if year number isn't given
	run: async function(client, octokit, options, wasInteraction) {
		const args = parse_options(options, wasInteraction);

		const subject_name = to_subject_name(args[0], subject_list);
		const year_name = `Year ${args[1]}`;
		const type_name = args[2] ? to_type_name(args[2]) : "";

		let subject_dir = args[0]; // TODO: validate
		const year_dir = `y${args[1]}`; // TODO: validate
		let type_dir = args[2] ? args[2] : "";

		subject_dir = fix_subject_dir(subject_dir); // Deal with english-lit

		let embed = new EmbedBuilder()
			.setColor(sidebar_colour);

		if(!args[1]) { // No year nor type
			embed.setTitle(`Link to: ${subject_name}`)
				.setURL(`${process.env.github_repourl}/resources/${subject_dir}`);
			if(type_dir !== "") // Provided type but not year
				embed.setDescription("Note that if you want to get resources of a specific type you must provide the year.")

		} else {
			embed.setTitle(`Link to: ${subject_name} > ${year_name}`);

			let content;

			try { // Confirm the year dir exists
				content = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
					owner: process.env.github_username,
					repo: process.env.github_reponame,
					path: `resources/${subject_dir}`
				});
			} catch(err) {
				embed.setDescription(err.status === STATUS_NOT_FOUND ? "Nothing found." : "Something went wrong.");
				return embed;
			}
			if(content.status !== STATUS_OK) {
				embed.setDescription("Nothing found.");
				return embed;
			}
			const year_folder_names = content.data
				.filter(folder => folder.type === "dir")
				.map(folder => folder.name);
			if(!year_folder_names.includes(year_dir)) {
				embed.setDescription("Nothing found.");
				return embed;
			}

			if(type_dir === "") { // Year, but no type
				embed.setURL(`${process.env.github_repourl}/resources/${subject_dir}/${year_dir}`);

			} else { // Year and type
				embed.setTitle(`Link to: ${subject_name} > ${year_name} > ${type_name}`);
	
				try { // Confirm the type dir exists
					content = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
						owner: process.env.github_username,
						repo: process.env.github_reponame,
						path: `resources/${subject_dir}/${year_dir}`
					});
				} catch(err) {
					embed.setDescription(err.status === STATUS_NOT_FOUND ? "Nothing found." : "Something went wrong.");
					return embed;
				}
				if(content.status !== STATUS_OK) {
					embed.setDescription("Nothing found.");
					return embed;
				}

				const folder_names = content.data
					.filter(folder => folder.type === "dir")
					.map(folder => folder.name);

				if(type_dir === "assignments") // Fix type_dir, might not be /assignments
					for(var alt_name of assignments_alt_names)
						if(folder_names.includes(alt_name)) {
							type_dir = alt_name;
							break;
						}

				if(!folder_names.includes(type_dir)) {
					embed.setDescription("Nothing found.");
					return embed;
				}

				embed.setURL(`${process.env.github_repourl}/resources/${subject_dir}/${year_dir}/${encodeURIComponent(type_dir)}`);
			}
		}

		return embed;
	},
	data: new SlashCommandBuilder()
		.setName("link_to")
		.setDescription("Links to the resources")
		.addStringOption(option =>
			option.setName("subject")
				.setDescription("Which subject to link to the resources for")
				.setRequired(true)
				.addChoices(...remove_unpopular_subjects(subject_list))
		)
		.addStringOption(option =>
			option.setName("year")
				.setDescription("Year 11 or 12")
				.setRequired(false)
				.addChoices(...year_list)
		)
		.addStringOption(option =>
			option.setName("type")
				.setDescription("What type of resources to fetch")
				.setRequired(false)
				.addChoices(...resource_type_list)
		)
}
