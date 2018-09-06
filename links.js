#!/usr/bin/env node
"use strict";

var readline = require("readline");
var exec = require('child_process').exec;
var pathObj = require('path');

let allItems = [{
	name: "Abion",
	shortcut: "al",
	source: "$VOLUME_SOURCE:\\Dropbox\\Windows\\Savy her\\Albion",
	dest: "$VOLUME_DEST:\\Hry\\Albion86\\SAVES"
}, {
	name: "Diablo",
	shortcut: "di",
	source: "$VOLUME_SOURCE:\\Dropbox\\Windows\\Savy her\\Diablo",
	dest: "$VOLUME_DEST:\\Hry\\Diablo I HD\\Data\\player_save"
}, {
	name: "Documents",
	shortcut: "doc",
	source: "$VOLUME_SOURCE:\\Dropbox\\Windows\\LorD_OniX\\Documents\\",
	dest: "%USERPROFILE%\\Documents\\",
	items: ["Baldur's Gate - Enhanced Edition", "Baldur's Gate II - Enhanced Edition", "Icewind Dale - Enhanced Edition", "My Games", "OpenTTD", "Rockstar Games", "Ubisoft", "FreeFileSync", "BioshockHD", "Aspyr"]
}, {
	name: "Downloads",
	shortcut: "do",
	source: "$VOLUME_SOURCE:\\Download",
	dest: "%USERPROFILE%\\Downloads"
}, {
	name: "Vietcong: Fist Alpha",
	shortcut: "vif",
	source: "$VOLUME_SOURCE:\\Dropbox\\Windows\\Savy her\\FistAlpha",
	dest: "$VOLUME_DEST:\\Hry\\Vietcong\\Saves"
}, {
	name: "Heroes 3 Complete",
	shortcut: "he",
	source: "$VOLUME_SOURCE:\\Dropbox\\Windows\\Savy her\\Heroes 3 Complete",
	dest: "$VOLUME_DEST:\\Hry\\Heroes 3 Complete\\games"
}, {
	name: "Half-Life 2 ep.2",
	shortcut: "hl",
	source: "$VOLUME_SOURCE:\\Dropbox\\Windows\\Savy her\\Half-Life 2 EP2",
	dest: "$VOLUME_DEST:\\Hry\\Steam\\steamapps\\common\\Half-Life 2\\ep2\\save"
}, {
	name: "Mafia 2",
	shortcut: "ma2",
	source: "$VOLUME_SOURCE:\\Dropbox\\Windows\\LorD_OniX\\AppData\\Local\\2K Games",
	dest: "%USERPROFILE%\\AppData\\Local\\2K Games"
}, {
	name: "Mafia",
	shortcut: "ma",
	source: "$VOLUME_SOURCE:\\Dropbox\\Windows\\Savy her\\Mafia",
	dest: "$VOLUME_DEST:\\Hry\\Mafia\\savegame"
}, {
	name: "Minecraft",
	shortcut: "mi",
	source: "$VOLUME_SOURCE:\\Hry\\Minecraft",
	dest: "%USERPROFILE%\\AppData\\Roaming\\.minecraft"
}, {
	name: "Music",
	shortcut: "mu",
	source: "$VOLUME_SOURCE:\\Hudba",
	dest: "%USERPROFILE%\\Music"
}, {
	name: "Saved Games",
	shortcut: "sg",
	source: "$VOLUME_SOURCE:\\Dropbox\\Windows\\LorD_OniX\\Saved Games",
	dest: "%USERPROFILE%\\Saved Games"
}, {
	name: "Steam",
	shortcut: "st",
	source: "$VOLUME_SOURCE:\\Image her\\Steam",
	dest: "$VOLUME_DEST:\\Hry\\Steam\\Backups"
}, {
	name: "Sublime Text 3",
	shortcut: "st",
	source: "$VOLUME_SOURCE:\\Projekty\\sublime-text",
	dest: "%USERPROFILE%\\AppData\\Roaming\\Sublime Text 3"
}];

const FOLDERS = {
	DROPBOX: ["Dropbox"],
	DROPBOX_SAVY: ["Dropbox", "Windows", "Savy her"],
	DROPBOX_PROFILE: ["Dropbox", "Windows", "LorD_OniX"],
	GAME_FOLDER: ["Hry"],
	USER_PROFILE: ["%USERPROFILE%"]
};
let allItems = [{
	name: "Albion",
	shortcut: "al",
	source: [FOLDERS.DROPBOX_SAVY, "Albion"],
	dest: [FOLDERS.GAME_FOLDER, "Albion86", "SAVES"]
}, {
	name: "Diablo",
	shortcut: "di",
	source: [FOLDERS.DROPBOX_SAVY, "Diablo"],
	dest: [FOLDERS.GAME_FOLDER, "Diablo I HD", "Data", "player_save"]
}, {
	name: "Downloads",
	shortcut: "do",
	source: [FOLDERS.USER_PROFILE, "Downloads"],
	dest: ["Download"],
	promptDest: true
}, {
	name: "Vietcong: Fist Alpha",
	shortcut: "vif",
	source: [FOLDERS.DROPBOX_SAVY, "FistAlpha"],
	dest: [FOLDERS.GAME_FOLDER, "Vietcong", "Saves"]
}, {
	name: "Heroes 3 Complete",
	shortcut: "he",
	source: [FOLDERS.DROPBOX_SAVY, "Heroes 3 Complete"],
	dest: [FOLDERS.GAME_FOLDER, "Heroes 3 Complete", "Heroes 3 Complete"]
}, {
	name: "Half-Life 2 ep.2",
	shortcut: "hl",
	source: [FOLDERS.DROPBOX_SAVY, "Half-Life 2 EP2"],
	dest: [FOLDERS.GAME_FOLDER, "Steam", "steamapps", "common", "Half-Life 2", "ep2", "save"]
}, {
	name: "Mafia 2",
	shortcut: "m2",
	source: [FOLDERS.DROPBOX_PROFILE, "AppData", "Local", "2K Games"],
	dest: [FOLDERS.GAME_FOLDER, "%USERPROFILE%", "AppData", "Local", "2K Games"]
}, {
	name: "Mafia",
	shortcut: "m1",
	source: [FOLDERS.DROPBOX_SAVY, "Mafia"],
	dest: [FOLDERS.GAME_FOLDER, "Mafia", "savegame"]
}, {
	name: "Minecraft",
	shortcut: "mi",
	source: [FOLDERS.GAME_FOLDER, "Minecraft"],
	dest: [FOLDERS.USER_PROFILE, "AppData", "Roaming", ".minecraft"]
}, {
	name: "Music",
	shortcut: "mu",
	source: [FOLDERS.USER_PROFILE, "Music"],
	dest: ["Hudba"],
	promptDest: true
}, {
	name: "Saved Games",
	shortcut: "sg",
	source: [FOLDERS.DROPBOX_PROFILE, "Saved Games"],
	dest: [FOLDERS.USER_PROFILE, "Saved Games"]
}, {
	name: "Sublime Text 3",
	shortcut: "st",
	source: ["Projekty", "sublime-text"],
	dest: [FOLDERS.USER_PROFILE, "AppData", "Roaming", "Sublime Text 3"],
	promptSource: true
}, {
	name: "NFS Underground 2",
	shortcut: "nf",
	source: [FOLDERS.DROPBOX_PROFILE, "AppData", "local", "Undeground2"],
	dest: [FOLDERS.USER_PROFILE, "AppData", "Local", "NFS Underground 2"]
}, {
	name: "Videos",
	shortcut: "vid",
	source: [FOLDERS.USER_PROFILE, "Videos"],
	dest: ["Videos"],
	promptDest: true
}, {
	name: "Vietcong",
	shortcut: "v",
	source: [FOLDERS.DROPBOX_SAVY, "Vietcong"],
	dest: [FOLDERS.GAME_FOLDER, "Vietcong", "Saves"]
}, {
	name: "VirtualBox",
	shortcut: "vb",
	source: [FOLDERS.USER_PROFILE, "VirtualBox VMs"],
	dest: [FOLDERS.PROMPT, "VirtualBox VMs"]
}, {
	name: "Documents",
	shortcut: "doc",
	isDocuments: true,
	items: ["Baldur's Gate - Enhanced Edition", "Baldur's Gate II - Enhanced Edition", "Icewind Dale - Enhanced Edition", "My Games", "OpenTTD", "Rockstar Games", "Ubisoft", "FreeFileSync", "BioshockHD", "Aspyr"],
	source: [FOLDERS.DROPBOX_PROFILE, "Documents"],
	dest: [FOLDERS.USER_PROFILE, "Documents"]
}];

class Table {
	print(header, rows, stdout) {
		header = header || [];
		rows = rows || [];

		if (typeof stdout !== "function") {
			stdout = line => console.log(line);
		}

		let columnsCount = header.length;
		let columnsMaxCount = [];

		rows = [header].concat(rows);
		rows.forEach((row, rowInd) => {
			let rowColumnsCount = row.length;

			row.forEach((column, columnInd) => {
				let curSize = columnsMaxCount[columnInd];

				if (typeof curSize === "undefined") {
					columnsMaxCount[columnInd] = 0;
					curSize = 0;
				}

				let columnSize = column.length;

				columnsMaxCount[columnInd] = Math.max(columnSize, curSize);
			});

			columnsCount = Math.max(rowColumnsCount, columnsCount);
		});

		if (header.length != columnsCount) {
			console.log("Rows|columns mismatch!");
		}
		else {
			let innerWidth = 0;

			columnsMaxCount.forEach(val => {
				innerWidth += val;
			})

			let wholeLine = "|";

			columnsMaxCount.forEach(val => {
				wholeLine += this._repeatStr("-", val) + "|";
			});

			rows.forEach((row, rowInd) => {
				if (rowInd === 0) {
					stdout(wholeLine);
				}

				let line = "";

				row.forEach((column, columnInd) => {
					line += "|" + this._centerText(column, columnsMaxCount[columnInd]);

					if (columnInd == row.length - 1) {
						line += "|";
					}
				});

				stdout(line);

				if (rowInd === 0 || rowInd === rows.length - 1) {
					stdout(wholeLine);
				}
			});
		}
	}

	_repeatStr(str, count) {
		let output = "";

		for (let i = 0; i < count; i++) {
			output += str || "";
		}

		return output;
	}

	_centerText(txt, size) {
		txt = txt || "";
		size = size || 0;

		if (txt.length > size) {
			return txt.substr(0, size);
		}
		else {
			let diff = Math.floor((size - txt.length) / 2);
			let output = "";

			output += this._repeatStr(" ", diff);
			output += txt;
			output += this._repeatStr(" ", size - output.length);

			return output;
		}
	}
}

class Links {
	constructor() {
		this._processItems();
		this._table = new Table();
		console.log(allItems)
		// dropbox, game location
	}

	_processItems() {
		allItems.forEach(i => {
			i.source = this._setPath(i.source);
			i.dest = this._setPath(i.dest);
		});
	}

	_setPath(items) {
		let output = [];

		items.forEach(i => {
			if (Array.isArray(i)) {
				i.forEach(j => {
					output.push(j);
				});
			}
			else {
				output.push(i);
			}
		});

		return pathObj.join.apply(this, output);
	}

	_shell(order) {
		return new Promise((resolve, reject) => {
			if (!order) {
				reject();
				return;
			}

			console.log(`Run order: \"${order}\"`);

			exec(order, (error, stdout, stderr) => {
				if (stdout.length) {
					console.log(stdout);
				}

				if (error) {
					if (stderr.length) {
						console.log(stderr);
					}

					reject();
				}
				else {
					resolve();
				}
			});
		});
	}

	_prompt(txt) {
		return new Promise(resolve => {
			let rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			rl.question(txt || "", answer => {
				rl.close();
				resolve(answer);
			});
		});
	}
}

new Links();
