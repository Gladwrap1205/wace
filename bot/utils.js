function to_upper(str) {
	return str
		.toLowerCase()
		.split(" ")
		.map(word => word[0].toUpperCase() + word.substr(1))
		.join(" ");
}

module.exports = {
	trim_str: function(str, max) {
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
	to_subject_name: function(str) {
		if(str === "human bio")
			return "Human Biology";
		else if(str === "eald")
			return "EALD";
		else if(str === "ait")
			return "AIT";
		else if(str === "media")
			return "Media Production and Analysis";
		else if(str === "politics")
			return "Politics and Law";
		else if(str === "accounting")
			return "Accounting and Finance";
		else if(str === "lit")
			return "Literature";
		else if(str === "pe")
			return "Physical Education Studies";
		else if(str === "compsci")
			return "Computer Science";
		else
			return to_upper(str);
	}
};
