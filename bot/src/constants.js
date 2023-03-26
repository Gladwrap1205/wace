module.exports = {
	sidebar_colour: 0xFF0000,
	ZERO_WIDTH_SPACE: '\u200B',

	STATUS_OK: 200,
	STATUS_NOT_FOUND: 404,

	MAX_FIELD_CHARS: 1024,

	assignments_alt_names: [
		"investigations",
		"validations"
	],

	year_list: [
		{ name: "Year 11", value: "11" },
		{ name: "Year 12", value: "12" }
	],
	resource_type_list: [
		{ name: "Tests", value: "tests" },
		{ name: "Semester 1 exams", value: "sem1 exams" },
		{ name: "Semester 2 exams", value: "sem2 exams" },
		{ name: "Textbooks", value: "textbooks" },
		{ name: "Notes", value: "notes" },
		{ name: "Revision", value: "revision" },
		{ name: "Assignments", value: "assignments" } // Only a default
	],
	subject_list: [ // NOTE: API limits this to only 25
		{ name: "Accounting and Finance", value: "accounting" },
		{ name: "AIT", value: "ait" },
		{ name: "Biology", value: "biology" },
		{ name: "Business Management and Enterprise", value: "business" },
		{ name: "Careers", value: "careers" },
		{ name: "Chemistry", value: "chemistry" },
		{ name: "Children, Family and the Community", value: "childcare" },
		{ name: "Computer Science", value: "compsci" },
		{ name: "Dance", value: "dance" },
		{ name: "EALD", value: "eald" },
		{ name: "Economics", value: "economics" },
		{ name: "Engineering Studies", value: "engineering" },
		{ name: "English", value: "english" },
		{ name: "Literature", value: "lit" },
		{ name: "French", value: "french" },
		{ name: "Geography", value: "geography" },
		{ name: "Health", value: "health" },
		{ name: "History", value: "history" },
		{ name: "Human Biology", value: "human_bio" },
		{ name: "Mathematics Applications", value: "applications" },
		{ name: "Mathematics Methods", value: "methods" },
		{ name: "Mathematics Specialist", value: "specialist" },
		{ name: "Media Production and Analysis", value: "media" },
		{ name: "Music", value: "music" },
		{ name: "Philosophy and Ethics", value: "philosophy" },
		{ name: "Physical Education Studies", value: "pe" },
		{ name: "Physics", value: "physics" },
		{ name: "Politics and Law", value: "politics" },
		{ name: "Psychology", value: "psychology" },
		{ name: "Religion and Life", value: "religion" }
	]
}
