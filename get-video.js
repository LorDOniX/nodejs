#!/usr/bin/env node
"use strict";

const VIDEOS = ["mp4", "wmv", "mov", "mpg", "mpeg", "mkv"];
var { walk, onlyFiles, getRandom } = require("./common");

class App {
	constructor() {
		console.log("Top 3:");
		console.log("------");

		this._getTop3().forEach((i, ind) => {
			console.log(`${ind + 1}) ${i}`);
		});
	}

	_getTop3() {
		let walkData = walk(".");
		let files = onlyFiles(walkData).filter(i => {
			for (let video of VIDEOS) {
				if (i.name.indexOf("." + video) != -1) return true;
			}

			return false;
		});
		let random = [];
		let output = [];

		while (true) {
			if (random.length == 3) break;

			let number = getRandom(0, files.length - 1);

			if (random.indexOf(number) == -1) {
				random.push(number);
				output.push(files[number].fullPath.replace("./", "").replace(".\\", ""));
			}
		}

		return output;
	}
}

new App();
