const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { trim_str, to_type_name, to_subject_name, fix_subject_dir, remove_unpopular_subjects } = require("../../utils.js");
const {
	sidebar_colour, ZERO_WIDTH_SPACE,
	assignments_alt_names,
	STATUS_OK, STATUS_NOT_FOUND,
	MAX_FIELD_CHARS,
	year_list, resource_type_list, subject_list
} = require("../../constants.json");


function parse_options(options, wasInteraction) {
	let args;
	if(wasInteraction) {
		args = [
			options.get("subject", true),
			options.get("year", true),
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
	name: "r4",
	aliases: [ "resources_for", "resources" ],
	max_args: 3,
	min_args: 2,
	help: "r4 <subject> <year number> <resource type?>",
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
			.setColor(sidebar_colour)
			.setTitle(`Resources for: ${subject_name} > ${year_name}${type_name !== "" ? " > " + type_name : ""}`);

		// First search subject/year. Required in case type_dir isn't assignments
		let parent_content, content;
		try {
			parent_content = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
				owner: process.env.github_username,
				repo: process.env.github_reponame,
				path: `resources/${subject_dir}/${year_dir}`
			});
		} catch(err) {
			embed.setDescription(err.status === STATUS_NOT_FOUND ? "Nothing found." : "Something went wrong.");
			return embed;
		}
		if(parent_content.status !== STATUS_OK) {
			embed.setDescription("Nothing found.");
			return embed;
		}

		content = parent_content;

		if(type_dir !== "") { // Get specific type
			const folder_names = parent_content.data
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

			try {
				content = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
					owner: process.env.github_username,
					repo: process.env.github_reponame,
					path: `resources/${subject_dir}/${year_dir}/${type_dir}`
				});
			} catch(err) {
				embed.setDescription(err.status === STATUS_NOT_FOUND ? "Nothing found." : "Something went wrong.");
				return embed;
			}
			if(content.status !== STATUS_OK) {
				embed.setDescription("Nothing found.");
				return embed;
			}
		}

		let filtered_data = content.data;
		if(type_dir !== "" && type_dir !== "notes" && type_dir !== "revision" && type_dir !== "textbooks") // Include files for notes, revision, textbooks
			filtered_data = filtered_data.filter(folder => folder.type === "dir") // But not for tests, exams, assignments
				.filter(folder => !folder.name.startsWith('_')); // Also don't include test names starting with _
		let names = filtered_data.map(folder => folder.name);

		const length = names.length;
		if(length === 0) {
			embed.setDescription("Nothing found.");
			return embed;
		}

		if(type_dir === "")
			names = names.map(name => to_type_name(name));

		if(length >= 20) {
			const third = Math.floor(length / 3);
			embed.addFields(
				{ name: `List (${length})`, value: trim_str(names.slice(0, third).join("\n"), MAX_FIELD_CHARS), inline: true },
				{ name: ZERO_WIDTH_SPACE, value: trim_str(names.slice(third, third * 2).join("\n"), MAX_FIELD_CHARS), inline: true },
				{ name: ZERO_WIDTH_SPACE + ZERO_WIDTH_SPACE, value: trim_str(names.slice(third * 2, length).join("\n"), MAX_FIELD_CHARS), inline: true }
			);
		} else if(length >= 10) {
			const half = Math.floor(length / 2);
			embed.addFields(
				{ name: `List (${length})`, value: trim_str(names.slice(0, half).join("\n"), MAX_FIELD_CHARS), inline: true },
				{ name: ZERO_WIDTH_SPACE, value: trim_str(names.slice(half, length).join("\n"), MAX_FIELD_CHARS), inline: true }
			);
		} else
			embed.addFields({ name: `List (${length})`, value: trim_str(names.join("\n"), MAX_FIELD_CHARS) });

		embed.setURL(`${process.env.github_repourl}/resources/${subject_dir}/${year_dir}${type_dir !== "" ? "/" + encodeURIComponent(type_dir) : ""}`);
		return embed;
	},
	data: (client) => new SlashCommandBuilder()
		.setName("r4")
		.setDescription("Lists available resources")
		.addStringOption(option =>
			option.setName("subject")
				.setDescription("Which subject to list resources for")
				.setRequired(true)
				.addChoices(...remove_unpopular_subjects(subject_list))
		)
		.addStringOption(option =>
			option.setName("year")
				.setDescription("Year 11 or 12")
				.setRequired(true)
				.addChoices(...year_list)
		)
		.addStringOption(option =>
			option.setName("type")
				.setDescription("What type of resources to fetch")
				.setRequired(false)
				.addChoices(...resource_type_list)
		)
}
