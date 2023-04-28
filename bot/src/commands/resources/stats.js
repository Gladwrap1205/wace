const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { trim_str, fix_subject_dir } = require("../../utils.js");
const {
	sidebar_colour, ZERO_WIDTH_SPACE,
	assignments_alt_names,
	STATUS_OK, STATUS_NOT_FOUND,
	MAX_FIELD_CHARS,
	year_list, resource_type_list, subject_list
} = require("../../constants.json");

let cache = {};

function add_basic_data(embed, _cache) {
	embed.addFields(
		{ name: "Total Tests", value: _cache.total_tests.toLocaleString(), inline: true },
		{ name: "Stars", value: _cache.stars.toLocaleString(), inline: true },
		{ name: "Watchers", value: _cache.watchers.toLocaleString(), inline: true },
		{ name: "Commits", value: _cache.commits.toLocaleString(), inline: true },
		{ name: "Forks", value: _cache.forks.toLocaleString(), inline: true },
		{ name: ZERO_WIDTH_SPACE + ZERO_WIDTH_SPACE + ZERO_WIDTH_SPACE, value: ZERO_WIDTH_SPACE, inline: true },
	);
}
function add_top_schools(embed, data) {
	if(Object.keys(data).length === 0)
		return;
	const non_school_names = [ "", "idk", "WACE", "ETAWA", "PLEAWA", "insight", "EdWest", "Academic", "Curriculum", "achper", "AMS", "MAWA", "IMCC", "Catholic", "WAUPP", "aceto", "WATESOL", "SWETA", "TEE", "SIDE", "ViSN", "Step-Up", "EE", "joke", "OnTask" ]; // Don't need WATP, WAEP, BEWA

	let ordered_keys = Object.keys(data);
	ordered_keys = ordered_keys.sort((a, b) => data[b] - data[a])
		.filter(school_name => !non_school_names.includes(school_name));
	const length = ordered_keys.length;
	ordered_keys = ordered_keys.map((school_name, idx) => {
		switch(idx) {
			case 0:
				start = ":first_place:";
				break;
			case 1:
				start = ":second_place:";
				break;
			case 2:
				start = ":third_place:";
				break;
			case length - 1:
				start = ":poop:";
				break;
			default:
				start = `${idx+1}. `;
		}
		return `${start} ${school_name} (${data[school_name]})`;
	});

	if(length >= 20) {
		const third = Math.floor(length / 3);
		embed.addFields(
			{ name: "Top contributing schools", value: trim_str(ordered_keys.slice(0, third).join("\n"), MAX_FIELD_CHARS), inline: true },
			{ name: ZERO_WIDTH_SPACE, value: trim_str(ordered_keys.slice(third, third * 2).join("\n"), MAX_FIELD_CHARS), inline: true },
			{ name: ZERO_WIDTH_SPACE + ZERO_WIDTH_SPACE, value: trim_str(ordered_keys.slice(third * 2, length).join("\n"), MAX_FIELD_CHARS), inline: true }
		);
	} else if(length >= 10) {
		const half = Math.floor(length / 2);
		embed.addFields(
			{ name: "Top contributing schools", value: trim_str(ordered_keys.slice(0, half).join("\n"), MAX_FIELD_CHARS), inline: true },
			{ name: ZERO_WIDTH_SPACE, value: trim_str(ordered_keys.slice(half, length).join("\n"), MAX_FIELD_CHARS), inline: true }
		);
	} else
		embed.addFields({ name: "Top contributing schools", value: trim_str(ordered_keys.join("\n"), MAX_FIELD_CHARS) });
}

async function search_each_type_folder(octokit, _cache, subject_year_type_dir) {
	let test_folders_content;
	try {
		test_folders_content = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
			owner: process.env.github_username,
			repo: process.env.github_reponame,
			path: `resources/${subject_year_type_dir}`
		});
	} catch(err) {
		return;
	}
	if(test_folders_content.status !== STATUS_OK)
		return;
	test_folders_content.data.filter(folder => folder.type === "dir")
		.map(folder => folder.name)
		.forEach(test_name => {
			if(test_name.startsWith('_'))
				return;
			const school_name = test_name.split(' ')[0]
				.replace(/-?WAEP-?/g, "")
				.replace(/-?WATP-?/g, "")
				.replace(/-?BEWA-?/g, "");
			if(school_name in _cache.school_data)
				++_cache.school_data[school_name];
			else
				_cache.school_data[school_name] = 1;
			++_cache.total_tests;
		});
}
async function search_each_year_folder(octokit, _cache, subject_year_dir) {
	let type_folders_content;
	try {
		type_folders_content = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
			owner: process.env.github_username,
			repo: process.env.github_reponame,
			path: `resources/${subject_year_dir}`
		});
	} catch(err) {
		return;
	}
	if(type_folders_content.status !== STATUS_OK)
		return;
	const type_folders = type_folders_content.data.filter(folder => folder.type === "dir")
		.map(folder => folder.name)
		.filter(name => [ "tests", "sem1 exams", "sem2 exams", "assignments", ...assignments_alt_names ].includes(name));
	for(const type_dir of type_folders)
		await search_each_type_folder(octokit, _cache, `${subject_year_dir}/${type_dir}`);
}
async function search_each_subject_folder(octokit, _cache, subject_dir) {
	await search_each_year_folder(octokit, _cache, `${subject_dir}/y11`);
	await search_each_year_folder(octokit, _cache, `${subject_dir}/y12`);
}

module.exports = {
	name: "stats",
	aliases: [ "statistics" ],
	max_args: 0,
	min_args: 0,
	help: "stats",
	run: async function(client, octokit, options, wasInteraction) {
		let embed = new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle("Repository stats");

		let data = {};
		let content;
		try {
			content = await octokit.request("GET /repos/{owner}/{repo}/contributors", {
				owner: process.env.github_username,
				repo: process.env.github_reponame
			});
		} catch(err) {
			embed.setDescription(err.status === STATUS_NOT_FOUND ? "Nothing found." : "Something went wrong.");
			return embed;
		}
		if(content.status !== STATUS_OK) {
			embed.setDescription("Nothing found.");
			return embed;
		}
		let commits = 0;
		content.data.forEach(contributor => commits += contributor.contributions);

		if(!("commits" in cache) || cache.commits !== commits) { // Can't use cache
			cache.commits = commits;
			try {
				content = await octokit.request("GET /repos/{owner}/{repo}", {
					owner: process.env.github_username,
					repo: process.env.github_reponame
				});
			} catch(err) {
				embed.setDescription(err.status === STATUS_NOT_FOUND ? "Nothing found." : "Something went wrong.");
				return embed;
			}
			if(content.status !== STATUS_OK) {
				embed.setDescription("Nothing found.");
				return embed;
			}
			
			cache.forks = content.data.forks;
			cache.stars = content.data.stargazers_count;
			cache.watchers = content.data.subscribers_count;
			cache.total_tests = 0;
			cache.school_data = {};

			for(const subject of subject_list)
				await search_each_subject_folder(octokit, cache, fix_subject_dir(subject.value));
		}

		add_basic_data(embed, cache);
		add_top_schools(embed, cache.school_data);

		return embed;
	},
	data: (client) => new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Sends statistics about the repository")
}
