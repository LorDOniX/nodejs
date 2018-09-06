"use strict";
var process = require('process');
var cheerio = require('cheerio');
var http = require('./http');

class Common {
	static str() {
		let args = Array.prototype.slice.call(arguments);
		let output = "";
		let params = {};

		args.forEach((arg, ind) => {
			if (ind == 0) {
				output = arg;
			}
			else {
				params["[{]" + (ind - 1) + "[}]"] = arg;
			}
		});

		Object.keys(params).forEach((param) => {
			output = output.replace(new RegExp(param, "g"), params[param]);
		});

		return output;
	}

	static col() {
		let args = Array.prototype.slice.call(arguments);

		console.log(this.str.apply(this, args));
	}

	static prompt(txt) {
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
};

class IqMenu {
	constructor() {
		this._const = {
			URL: "http://www.iqrestaurant.cz/brno/getData.svc?type=brnoMenuHTML"
		};

		this._load();
	}

	_load() {
		http.createRequest({
			url: this._const.URL
		}).then(data => {
			this._process(data.data);
		});
	}

	_process(data) {
		var ctx = cheerio.load(data);

		let dates = this._getDates(ctx);
		let allDays = ctx(".menuDayItems");
		
		let grill = this._getDayData(ctx, allDays[1]);
		let start = 0;
		let days = [];

		dates.forEach(date => {
			days.push({
				date: date,
				items: this._getDayData(ctx, allDays[start])
			});

			start += 2;
		});

		let date = new Date();
		let curDay = date.getDate();
		let today = days.filter(i => i.date == curDay);
		let currentDay = date.getDay() - 1;
		if (currentDay < 0) currentDay += 7;
		// 1 pondeli
		let dayText = "";

		switch (currentDay) {
			case 0: dayText = "neděle"; break;
			case 1: dayText = "pondělí"; break;
			case 2: dayText = "úterý"; break;
			case 3: dayText = "středa"; break;
			case 4: dayText = "čtvrtek"; break;
			case 5: dayText = "pátek"; break;
			case 6: dayText = "sobota"; break;
		}

		//console.log("Menu IQ Brno [" + dayText + "]");
		//console.log("");

		let header = ["cena", "nazev"];
		today[0].items.push({
			price: "",
			title: ""
		});
		let rawRows = today[0].items.concat(grill);
		let rows = [];

		rawRows.forEach(row => {
			rows.push([row.price, row.title]);
		});

		this._printTable(header, rows, line => {
			console.log(line);
		});
	}

	_getDates(ctx) {
		let dates = [];

		let hDates = ctx(".date");

		for (let i = 0; i < hDates.length; i++) {
			let item = hDates[i];
			let day = ctx(item).find(".day").text();

			dates.push(day);
		}

		return dates;
	}

	_getDayData(ctx, day) {
		let dt = ctx(day).find("dt");
		let dd = ctx(day).find("dd");
		let dayData = []

		for (let i = 0; i < dt.length; i++) {
			let item = ctx(dt[i]);
			item.find("span").remove();
			item.find("img").remove();
			let title = item.text();

			let price = ctx(dd[i]);
			price = price.text().split(" ")[0];

			dayData.push({
				price: price,
				title: title
			});
		}

		return dayData;
	}

	_printTable(header, rows, stdout) {
		header = header || [];
		rows = rows || [];

		if (typeof stdout !== "function") {
			stdout = line => {};
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
					line += "|" + this._leftAlignText(column, columnsMaxCount[columnInd]);

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

	_leftAlignText(txt, size) {
		txt = txt || "";
		size = size || 0;

		if (txt.length > size) {
			return txt.substr(0, size);
		}
		else {
			let diff = Math.floor((size - txt.length) / 2);
			let output = txt;

			output += this._repeatStr(" ", size - output.length);

			return output;
		}
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
};

new IqMenu();
