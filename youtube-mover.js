#!/usr/bin/env node
"use strict";

var { walk, onlyFiles, strCompare, mkDir, rename } = require("./common");
var { channelNews, downloadChannel } = require("./api");
var { CHANNELS } = require("./channels");

const API_KEY = "";
const EXT = "mp4";
const HD_EXT = "(1).mp4";
const LQ_FOLDER = "lq";
const HD_FOLDER = "hd";
const PATH_SEP = require('path').sep;

class MyScript {
	constructor() {
		let args = this._getArgs();
		let wholeChannel = false;

		if (args.length >= 1 && args[0] in CHANNELS) {
			wholeChannel = args.filter(i => i == "--whole" || i == "-w").length == 1;

			this._makeChannel(args[0], wholeChannel);
		}
		else {
			console.log("variant [options]");
			console.log("variants: " + Object.keys(CHANNELS).join(", "));
			console.log("-w | --whole stahnout cely kanal");
		}
	}

	_getArgs() {
		return Array.prototype.slice.call(process.argv, 2).map(arg => {
			return arg.trim();
		});
	}

	_makeChannel(name, wholeChannel) {
		let sourceData = wholeChannel ? downloadChannel : channelNews;
		sourceData(CHANNELS[name], API_KEY).then(videos => {
			let files = onlyFiles(walk(".", EXT, 1));
			let chg = this._makeChanges(files, videos);

			if (chg.changes.length) {
				if (chg.hdCount) {
					mkDir(HD_FOLDER);
				}

				if (chg.lqCount) {
					mkDir(LQ_FOLDER);
				}

				chg.changes.forEach(item => {
					rename(item.fullPath, item.newPath);
				});
			}
			
			if (chg.same.length) {
				console.log(chg.same);
			}
		}, e => {
			console.log(e);
		});
	}

	_makeChanges(files, videos) {
		let output = {
			changes: [],
			same: [],
			hdCount: 0,
			lqCount: 0
		};

		files.forEach(file => {
			let matched = [];
			let fileName = file.name.replace(HD_EXT, "").replace("." + EXT, "").trim();

			videos.forEach(video => {
				let ratio = strCompare(video.name, fileName);

				if (ratio > 0.8) {
					matched.push({
						ratio,
						name: video.name,
						date: video.create
					});
				}
			});

			if (matched.length) {
				matched.sort((a, b) => {
					if (a.ratio < b.ratio) return 1;
					else if (a.ratio > b.ratio) return -1;
					else return 0;
				});

				let findVideo = matched[0];
				let isHD = file.name.indexOf(HD_EXT) != -1;

				if (isHD) {
					output.hdCount++;
				}
				else {
					output.lqCount++;
				}

				output.changes.push(Object.assign({}, file, {
					newPath: file.path + (isHD ? HD_FOLDER : LQ_FOLDER) + PATH_SEP + findVideo.date + " " + fileName + "." + EXT
				}));
			}
			else {
				output.same.push(file);
			}
		});

		return output;
	}
}

new MyScript();
