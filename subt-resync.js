#!/usr/bin/env node
"use strict";

var fs = require("fs");
var iconv = require('iconv-lite');

const EOL = require("os").EOL;
const ARROW = "-->";
const TABLE = {
	hours: 3600 * 1000,
	minutes: 60 * 1000,
	seconds: 1000,
	ms: 1
};

class SubtSync {
	constructor() {
		let args = process.argv;

		if (args.length < 5) {
			console.error("Missing: file name, output name, file offset");
		}
		else {
			let input = args[2];
			let output = args[3];
			let time = args[4]; // [ms]
			let decode = args[5];
			let buffer = null;

			try {
				time = parseInt(time, 10) || 0;
				buffer = fs.readFileSync(input);
			}
			catch (err) {
				console.error(err);
				return;
			}

			let data = "";

			if (decode) {
				data = iconv.decode(buffer, decode).toString();
			}
			else {
				data = buffer.toString();
			}

			let outputData = [];
			let lines = data.split(EOL);
			lines.forEach(line => {
				if (line.indexOf(ARROW) != -1) {
					let parts = line.split(ARROW);
					let start = this._parseTime(parts[0]);
					let end = this._parseTime(parts[1]);

					start += time;
					end += time;
					start = start < 0 ? 0 : start;
					end = end < 0 ? 0 : end;

					line = [
						this._formatTime(start),
						ARROW,
						this._formatTime(end)
					].join(" ");
				}

				outputData.push(line);
			});

			let outputDataTxt = outputData.join(EOL);

			fs.writeFileSync(output, outputDataTxt, {
				encoding: "utf8"
			});
		}
	}

	// get [ms]
	_parseTime(time) {
		let output = 0;
		let parts = time.split(":");

		if (parts.length == 3) {
			let hours = parseInt(parts[0], 10);
			let minutes = parseInt(parts[1], 10);

			let rest = parts[2].split(",");

			if (rest.length == 2) {
				let seconds = parseInt(rest[0], 10);
				let ms = parseInt(rest[1], 10);

				output = hours * TABLE.hours + minutes * TABLE.minutes + seconds * TABLE.seconds + ms * TABLE.ms;
			}
		}

		return output;
	}

	_formatTime(time) {
		let parts = ["hours", "minutes", "seconds", "ms"];
		let output = [];

		parts.forEach((part, ind) => {
			let partValue = TABLE[part];
			let value = (time / partValue) >>> 0;
			let joiner = "";
			let count = 2;

			switch (ind) {
				case 0:
				case 1:
					joiner = ":"
					break;
				case 2:
					joiner = ",";
					break;

				case 3:
					count = 3;
					break;
			}

			output.push(this._zpad(value, count) + joiner);

			time -= value * partValue;
		});

		return output.join("");
	}

	_zpad(value, count) {
		value = value.toString();

		let diff = Math.max(count - value.length, 0);
		let zero = "";

		for (let i = 0; i < diff; i++) {
			zero += "0";
		}

		return (zero + value);
	}
}

new SubtSync();
