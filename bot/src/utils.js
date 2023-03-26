const { EmbedBuilder } = require("discord.js");

function to_upper(str) {
	return str
		.toLowerCase()
		.split(" ")
		.map(word => word[0].toUpperCase() + word.substr(1))
		.join(" ");
}

module.exports = {
	trim_str: function(str, max) { // Prevent going over max char limits
		return str.length > max ? str.slice(0, max - 3) + "..." : str;
	},
	to_upper,
	to_type_name: function(str) {
		str = to_upper(str);
		if(str === "Sem1 Exams")
			return "Semester 1 Exams";
		else if(str === "Sem2 Exams")
			return "Semester 2 Exams";
		else
			return str;
	},
	to_subject_name: function(str, s_list) { // Convert value into name (from subject_list)
		const subject_name = s_list.find(({ value }) => value === str);
		
		if(subject_name === undefined)
			return to_upper(str);
		else
			return subject_name.name;
	},
	fix_subject_dir: function(str) { // Deal with english-lit
		if(str === "english")
			return "english-lit/english";
		else if(str === "lit")
			return "english-lit/lit";
		else
			return str;
	},
	combine_subject_dir: function(str) { // Convert both english and lit into english-lit
		if(str === "english" || str === "lit")
			return "english-lit";
		else
			return str;
	},
	remove_unpopular_subjects: function(s_list) { // Can only list 25 subjects in slash application. Others are still accessible by typing the command
		return s_list.filter(({ value }) => value !== "careers"
			&& value !== "business"
			&& value !== "eald"
			&& value !== "french"
			&& value !== "childcare"
		);
	},
	create_help_embed: function(str) {
		return new EmbedBuilder()
			.setColor(sidebar_colour)
			.setTitle("Incorrect command usage")
			.setDescription(str);
	}
};
