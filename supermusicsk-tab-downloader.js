const cheerio = require('cheerio')
const fetch = require('node-fetch');
const Url = require('url');
const fs = require('fs');
const Path = require('path');

const OUTPUT_FOLDER = "output";
const MAX_STARS = 5;

class App {
	constructor(url) {
		this._url = url;
		this._usedTitles = {};

		let parsed = Url.parse(url);

		this._domain = parsed.protocol + "//" + parsed.host;

		this._run();
	}

	async _run() {
		let text = await this._getText(this._url);
		let w = cheerio.load(text);
		let scope = this;
		let songs = w(".skupinaobsah tr");
		let pages = [];
		songs.each(function() {
			if (w(this).attr("bgcolor")) {
				let link = w("a.sm", w(this));
				let title = link.text().trim();
				let url = link.attr("href");
				let stars = w("img[src='images/star1.gif']", link).length;
				let halfStar = w("img[src='images/star05.gif']", link).length;

				if (halfStar) {
					stars += 0.5;
				}

				if (url) {
					pages.push({
						title,
						perc: Math.round(stars / MAX_STARS * 100),
						stars,
						url: scope._domain + "/" + url
					});
				}
			}
		});

		for (let page of pages) {
			await this._processPage(page);
		}
	}

	_getText(url) {
		return new Promise((res, rej) => {
			fetch(url).then(obj => {
				res(obj.text());
			}, e => {
				rej(e);
			});
		});
	}

	async _processPage(pageObj) {
		let text = await this._getText(pageObj.url);
		let w = cheerio.load(text);
		let data = w("pre pre").text().trim();

		if (!data) {
			data = w("pre").text().trim();
		}

		if (data) {
			data = data.replace(/(\r*\n){3,}/g, "\n\n");

			try {
				let title = pageObj.title;

				if (title in this._usedTitles) {
					this._usedTitles[title]++;
				}
				else {
					this._usedTitles[title] = 1;
				}

				if (this._usedTitles[title] > 1) {
					title += `_${this._usedTitles[title]}`;
				}

				title = `${title} ${pageObj.perc}%.txt`;

				fs.writeFileSync(Path.join(OUTPUT_FOLDER, title), data, "utf-8");

				console.log(`Song ${title} was written to the file.`);
			}
			catch (e) {
				console.log(e);
			}
		}
		else {
			console.log(`No data for title ${pageObj.title}`);
		}
	}
}

// 152 Horkyze, 35 Kabat
const BANDS = {
	HORKYZE: 152,
	KABAT: 35
};

new App(`http://www.supermusic.cz/skupina.php?idskupiny=${BANDS.KABAT}&action=piesne&typ=taby`);
