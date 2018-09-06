#!/usr/bin/env node
"use strict";

class MyScript {
	constructor() {
		let args = this._getArgs();
		let time = args[0] || "1:39:60";
		let parts = args[1] || "3";
		let skip = args[2] || "0:0:0";
		let seconds = this._getSeconds(time);
		skip = this._getSeconds(skip);

		console.log(`${time}h split to ${parts} parts, ${seconds}s, skipped ${skip}s`);
		console.log(this._getPartsTime(seconds - skip, parts, skip));
	}

	_getArgs() {
		return Array.prototype.slice.call(process.argv, 2).map(arg => {
			return arg.trim();
		});
	}

	_getSeconds(time) {
		let parts = time.split(":");
		let hours = parseFloat(parts[0]);
		let minutes = parseFloat(parts[1]);
		let seconds = parseFloat(parts[2]);

		return (hours * 60 * 60 + minutes * 60 + seconds);
	}
	_getPartsTime(seconds, parts, skip) {
		let partTime = Math.round(seconds / parts);
		let start = 0;
		let output = [];

		for (let i = 0; i < parts; i++) {
			let end = Math.min(start + partTime, seconds);
			output.push({
				start: this._secToHours(start + skip),
				end: this._secToHours(end + skip)
			});

			start = end;
		}

		return output;
	}

	_secToHours(seconds) {
		let hours = Math.floor(seconds / (60 * 60));
		seconds -= hours * 60 * 60;
		let minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;

		return (hours + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0"));
	}
}

new MyScript();
