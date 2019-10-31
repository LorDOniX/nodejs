const fs = require("fs");

let years = {};
let files = fs.readdirSync(".");
for (let file of files) {
	let stats = fs.statSync(file);
	let year = stats.mtime.getFullYear().toString();

	if (!(year in years)) {
		years[year] = 0;
	}
	years[year]++;

	try {
		fs.statSync(`./${year}`);
	}
	catch (e) {
		fs.mkdirSync(year);
	}
	
	fs.renameSync(file, `./${year}/${file}`);
}

console.log(years)
