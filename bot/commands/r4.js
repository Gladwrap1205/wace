const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { trim_str, to_upper, to_type_name, to_subject_name } = require("../utils.js");

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;

module.exports = {
	name: "r4",
	aliases: [ "resources_for", "resources" ],
	run: async function(client, octokit, args) {
		const year_name = `Year ${args[0].value}`;
		const subject_name = to_subject_name(args[1].value);
		const type_name = args[2] ? to_type_name(args[2].value) : "";

		const year_dir = `y${args[0].value}`;
		let subject_dir = args[1].value;
		let type_dir = args[2] ? args[2].value : "";

		if(subject_dir === "english")
			subject_dir = "english-lit/english";
		else if(subject_dir === "lit")
			subject_dir = "english-lit/lit";

		let embed = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle(`${year_name} > ${subject_name}${type_name !== "" ? " > " + type_name : ""}`)
			.setURL(`${process.env.github_repourl}/resources/${encodeURIComponent(subject_dir)}/${year_dir}${type_dir !== "" ? "/" + encodeURIComponent(type_dir) : ""}`);

		// First search subject/year. Required incase type_dir isn't assignments
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

			if(type_dir === "assignments") { // Fix type_dir, might not be /assignments
				if(folder_names.includes("investigations"))
					type_dir = "investigations";
				else if(folder_names.includes("validations"))
					type_dir = "validations";
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
			if(parent_content.status !== STATUS_OK) {
				embed.setDescription("Nothing found.");
				return embed;
			}
		}

		let filtered_data = content.data;
		if(type_dir !== "" && type_dir !== "notes" && type_dir !== "revision" && type_dir !== "textbooks") // Include files for notes, revision, textbooks
			filtered_data = filtered_data.filter(folder => folder.type === "dir");
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
			embed.addFields({ name: `List (${length})`, value: trim_str(names.slice(0, third).join("\n"), 1024) });
			embed.addFields({ name: "\u200B", value: trim_str(names.slice(third, third * 2).join("\n"), 1024) });
			embed.addFields({ name: "\u200B\u200B", value: trim_str(names.slice(third * 2, length).join("\n"), 1024) });
		} else if(length >= 10) {
			const half = Math.floor(length / 2);
			embed.addFields({ name: `List (${length})`, value: trim_str(names.slice(0, half).join("\n"), 1024) });
			embed.addFields({ name: "\u200B", value: trim_str(names.slice(half, length).join("\n"), 1024) });
		} else
			embed.addFields({ name: `List (${length})`, value: trim_str(names.join("\n"), 1024) });

		return embed;
	},
	data: new SlashCommandBuilder()
		.setName("r4")
		.setDescription("Lists available resources")
		.addStringOption(option =>
			option.setName("year")
				.setDescription("Year 11 or 12")
				.setRequired(true)
				.addChoices(
					{ name: "Year 11", value: "11" },
					{ name: "Year 12", value: "12" }
				)
		)
		.addStringOption(option =>
			option.setName("subject")
				.setDescription("Which subject to list resources for")
				.setRequired(true)
				.addChoices(
					{ name: "Accounting and Finance", value: "accounting" },
					{ name: "AIT", value: "ait" },
					{ name: "Applications", value: "applications" },
					{ name: "Biology", value: "biology" },
					{ name: "Careers", value: "careers" },
					{ name: "Chemistry", value: "chemistry" },
					{ name: "Computer Science", value: "compsci" },
					{ name: "Dance", value: "dance" },
					{ name: "EALD", value: "eald" },
					{ name: "Economics", value: "economics" },
					{ name: "English", value: "english" },
					{ name: "Literature", value: "lit" },
					{ name: "French", value: "french" },
					{ name: "Geography", value: "geography" },
					{ name: "Health", value: "health" },
					{ name: "History", value: "history" },
					{ name: "Human Biology", value: "human bio" },
					{ name: "Media Production and Analysis", value: "media" },
					{ name: "Methods", value: "methods" },
					{ name: "Music", value: "music" },
					{ name: "Philosophy and Ethics", value: "philosophy" },
					{ name: "Physical Education Studies", value: "pe" },
					{ name: "Physics", value: "physics" },
					{ name: "Politics and Law", value: "politics" },
					{ name: "Psychology", value: "psychology" },
					{ name: "Specialist", value: "specialist" }
				)
		)
		.addStringOption(option =>
			option.setName("type")
				.setDescription("What type of resources to fetch")
				.setRequired(false)
				.addChoices(
					{ name: "Tests", value: "tests" },
					{ name: "Semester 1 exams", value: "sem1 exams" },
					{ name: "Semester 2 exams", value: "sem2 exams" },
					{ name: "Textbooks", value: "textbooks" },
					{ name: "Notes", value: "notes" },
					{ name: "Revision", value: "revision" },
					{ name: "Assignments", value: "assignments" }
				)
		)
}
