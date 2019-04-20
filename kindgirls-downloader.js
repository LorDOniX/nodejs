const cheerio = require('cheerio')
const fetch = require('node-fetch');
const Url = require('url');
const fs = require('fs');
const Path = require('path');

const OUTPUT_FOLDER = "output";

class App {
	constructor() {
		// https://www.kindgirls.com/girls/yarina-a/1114
		this._run("https://www.kindgirls.com/girls/yarina-a/1114");
	}

	async _run(galleryUrl) {
		let text = await this._getText(galleryUrl);
		let parsed = Url.parse(galleryUrl);
		let domain = parsed.protocol + "//" + parsed.host;
		let w = cheerio.load(text);
		let galleries = w(".gal_list a");
		let urls = [];
		
		galleries.each(function() {
			urls.push(domain + w(this).attr("href").replace("gallery", "gallery-full"));
		});

		for (let url of urls) {
			await this._getImages(url);
		}
	}

	async _getImages(url) {
		let path = Url.parse(url).path;
		let galleryName = path.replace("gallery-full", "").replace(/\//g, "");

		try {
			fs.mkdirSync(Path.join(OUTPUT_FOLDER, galleryName));
		}
		catch (e) {
			console.log(e);
		}

		let text = await this._getText(url);
		let w = cheerio.load(text);
		let images = w(".gal_full a img");
		let urls = [];
		
		images.each(function() {
			let url = w(this).attr("src");
			let path = Path.join(OUTPUT_FOLDER, galleryName, url.replace(/.*\//, ""));

			urls.push({
				path,
				url
			});
		});

		console.log(`Fetching gallery ${galleryName}`);

		for (let item of urls) {
			try {
				console.log(`Fetching image ${item.url}`);
				await this._fetchPhoto(item.url, item.path);
			}
			catch (e) {
				console.log(e);
			}
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

	_fetchPhoto(url, path) {
		return new Promise((resolve, reject) => {
			fetch(url).then(res => {
				const dest = fs.createWriteStream(path);
				res.body.pipe(dest);
				res.body.on('error', err => {
					reject(err);
				});
				dest.on('finish', () => {
					resolve();
				});
				dest.on('error', err => {
					reject(err);
				});
			});
		});
	}
}

new App();
