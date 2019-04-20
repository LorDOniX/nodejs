const cheerio = require('cheerio')
const fetch = require('node-fetch');
const Url = require('url');
const fs = require('fs');
const Path = require('path');
const { exec } = require('child_process');

const OUTPUT_FOLDER = "output";
// https://acavalin.com/p/images_to_a4pdf

class App {
	constructor() {
		this._main();
	}

	async _main() {
		let urls = [];
		for (let i = 1; i <= 45; i++) {
			let url = `https://www.oldgames.sk/mag/score-${i}/`;
			urls.push(url);
		}

		for (let url of urls) {
			await this._getImages(url);
		}
	}

	async _getImages(url) {
		let parsedPath = Url.parse(url);
		let urlDomain = `${parsedPath.protocol}//${parsedPath.host}`;
		let galleryName = url.match(/([^/]+)\/$/);
		galleryName = galleryName[1];

		try {
			fs.mkdirSync(Path.join(OUTPUT_FOLDER, galleryName));
		}
		catch (e) {
			console.log(e);
		}

		let text = await this._getText(url);
		let w = cheerio.load(text);
		let images = w("a[data-fancybox='magazine']");
		let urls = [];
		let photoID = 1;
		
		images.each(function() {
			let hrefUrl = w(this).attr("href");
			let ext = hrefUrl.replace(/^.*[.]/, "");
			let path = Path.join(OUTPUT_FOLDER, galleryName, `${galleryName}-${photoID.toString().padStart(3, "0")}.${ext}`);

			urls.push({
				path,
				url: `${urlDomain}${hrefUrl}`
			});

			photoID++;
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

		console.log(`Creating pdf...`);
		await this._run(`magick ${Path.join(OUTPUT_FOLDER, galleryName, "*.jpg")} -quality 100 -resize 1240x1754 -extent 1240x1754 -gravity center -units PixelsPerInch -density 150x150 ${Path.join(OUTPUT_FOLDER, galleryName, `${galleryName}.pdf`)}`);
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

	_run(command, verbose = true) {
		return new Promise((resolve, reject) => {
			let time = Date.now();
			console.log(`Running command: ${command}`);

			let newProc = exec(command, (error, stdout, stderr) => {
				let timeDiff = Date.now() - time;
				let diff = timeDiff / 1000;

				console.log(`Duration ${diff.toFixed(2)}s`);

				if (error) {
					console.log("chyba");
					console.log(error);
					reject(error);
				}
				else {
					console.log("OK");
					resolve(timeDiff);
				}
			});

			if (verbose) {
				newProc.stdout.on('data', data => {
					console.log(data.toString())
				});

				newProc.stderr.on('data', data => {
					console.log(data.toString())
				});
			}
		});
	}
}

new App();
