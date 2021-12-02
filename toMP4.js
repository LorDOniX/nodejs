#!/usr/bin/env node
"use strict";
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

function getFilesFromDirectory(startPath, nonExts, output) {
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

		if (!stat.isDirectory() && fileName.indexOf(nonExts) == -1) {
			output.push(fileName);
		}
	});

	return output;
}

function ffmpeg(args = []) {
	try {
		spawnSync(`ffmpeg`, args, { encoding : 'utf8' });
	} catch (ex) {
		console.log(ex);
	}
}

async function main() {
	const files = getFilesFromDirectory(".", ".mp4");

	console.log(`Todo files: ${files.join(", ")}`);

	for (let file of files) {
		const name = file.replace(/[.][a-zA-Z0-9]+$/, "");
		console.log(`File ${file} to mp4`);
		ffmpeg(["-y", "-hwaccel_device", 0, "-hwaccel", "cuda", "-i", file, "-c:v", "h264_nvenc", "-preset", "slow", `${name}.mp4`])
		console.log(`File was created, done ${(100 * (files.indexOf(file) + 1) / files.length).toFixed(2)}%`);
	}

	console.log(`Conversion is done!`);
}

main();
