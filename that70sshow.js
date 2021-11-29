const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

function getFilesFromDirectory(startPath, exts, output) {
	if (!output) {
		output = [];
	}

	if (!fs.existsSync(startPath)){
		console.log("no dir ", startPath);
		return output;
	}

	const files = fs.readdirSync(startPath);
	files.forEach(file => {
		const fileName = path.join(startPath, file);
		const stat = fs.lstatSync(fileName);

		if (!stat.isDirectory() && exts.filter(item => fileName.indexOf(item) != -1).length) {
			output.push(fileName);
		}
	});

	return output;
}

function readFile(file) {
	try {
		return fs.readFileSync(file, 'utf8');
	} catch (ex) {
		return "";
	}
}

function writeFile(file, data) {
	try {
		return fs.writeFileSync(file, data, 'utf8');
	} catch (ex) {
		return "";
	}
}

function ffmpeg(args = []) {
	try {
		spawnSync(`ffmpeg`, args, { encoding : 'utf8' });
	} catch (ex) {
		console.log(ex);
	}
}

function extractSubtitle(file, subFile) {
	ffmpeg(["-y", "-i", file, subFile]);
}

function replaceSubtitle(file, subFile, output) {
	ffmpeg(["-y", "-hide_banner", "-i", file, "-i", subFile, "-map", "0:V:0", "-map", "0:a", "-map", "1:s:0", "-map_metadata", "0", "-map_chapters", "0", "-c", "copy", "-f", "matroska", "-default_mode", "infer", output]);
}

function makeDirectory(path) {
	try {
		fs.mkdirSync(path);
	} catch (ex) {
		return "";
	}
}

function removeFile(path) {
	try {
		fs.rmSync(path);
	} catch (ex) {
		return "";
	}
}

function updateSubtitle(srtData) {
	const lines = srtData.split("\n");
	const output = [];
	let skipUpperCase = false;

	for (let line of lines) {
		const isTextLine = line.match(/[a-zA-Z]+/);

		if (isTextLine) {
			// vsechno na male
			line = line.toLowerCase();

			// projdeme
			let newLine = "";
			let useUpperCase = true;

			if (skipUpperCase) {
				useUpperCase = false;
				skipUpperCase = false;
			}

			for (let i = 0, max = line.length; i < max; i++) {
				let sign = line[i];

				if (sign.match(/[a-zA-Z]/) && useUpperCase) {
					sign = sign.toUpperCase();
					useUpperCase = false;
				}
				else if (sign == "." || sign == "?" || sign == "!") {
					useUpperCase = true;
				}

				newLine += sign;
			}

			line = newLine;

			let onlyLine = line.trim();
			let lastChar = onlyLine[onlyLine.length - 1];
			skipUpperCase = !(lastChar == "." || lastChar == "?" || lastChar == "!");
		}
		else {
			skipUpperCase = false;
		}

		output.push(line);
	}

	return output.join("\n");
}

function upperCase(str, index) {
	return `${str.substr(0, index)}${str[index].toUpperCase()}${str.substr(index + 1, str.length)}`;
}

async function main() {
	const outputDirectory = "output";
	makeDirectory(outputDirectory);
	const files = getFilesFromDirectory(".", [".mkv"]);

	for (let file of files) {
		const name = file.replace(/[.][a-zA-Z0-9]+$/, "");
		const subtitleFile = `${name}.srt`;
		console.log(`File ${file}, extract subtitle`);
		extractSubtitle(file, subtitleFile);
		const subtitleData = readFile(subtitleFile);
		console.log(`Update srt file`);
		const newSubtitleData = updateSubtitle(subtitleData);
		writeFile(subtitleFile, newSubtitleData);
		console.log(`Replace subtitle in video file`);
		replaceSubtitle(file, subtitleFile, `${outputDirectory}/${file}`);
		console.log(`Remove subtitle`);
		removeFile(subtitleFile);
	}
}

main();
