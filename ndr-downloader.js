const cheerio = require('cheerio')
const fetch = require('node-fetch');
const Url = require('url');
const fs = require('fs');
const Path = require('path');

class App {
	constructor() {
		this._run();
	}

	async _run() {
		let all = [
			"https://navratdoreality.cz/nahe-amaterky-33-5296.html",
			"https://navratdoreality.cz/holky-kolo-5289.html",
			"https://navratdoreality.cz/kozy-kozy-kozicky-93-5282.html",
			"https://navratdoreality.cz/nahe-amaterky-32-foto-video-5181.html",
			"https://navratdoreality.cz/kozy-kozy-kozicky-92-5102.html",
			"https://navratdoreality.cz/cernovlasky-brunety-38-5094.html",
			"https://navratdoreality.cz/kozy-kozy-kozicky-91-5034.html",
			"https://navratdoreality.cz/nahe-amaterky-31-5032.html",
			"https://navratdoreality.cz/kozy-kozy-kozicky-90-4987.html",
			"https://navratdoreality.cz/erotic-mix-454-4947.html",
			"https://navratdoreality.cz/nahe-amaterky-30-4897.html",
			"https://navratdoreality.cz/kozy-kozy-kozicky-89-4860.html",
			"https://navratdoreality.cz/cernovlasky-brunety-37-4810.html",
			"https://navratdoreality.cz/prdelky-137-4800.html",
			"https://navratdoreality.cz/kozy-kozy-kozicky-88-4782.html",
			"https://navratdoreality.cz/nahe-amaterky-29-4767.html",
			"https://navratdoreality.cz/nahe-amaterky-28-4709.html",
			"https://navratdoreality.cz/nahe-amaterky-27-4457.html",
			"https://navratdoreality.cz/nahe-amaterky-26-foto-video-4278.html",
			"https://navratdoreality.cz/nahe-amaterky-25-3784.html",
			"https://navratdoreality.cz/nahe-amaterky-24-3650.html",
			"https://navratdoreality.cz/nahe-amaterky-23-3385.html",
			"https://navratdoreality.cz/nahe-amaterky-22-foto-video-2940.html",
			"https://navratdoreality.cz/nahe-amaterky-21-2783.html",
			"https://navratdoreality.cz/nahe-amaterky-20-2621.html",
			"https://navratdoreality.cz/nahe-amaterky-19-foto-video-2110.html",
			"https://navratdoreality.cz/nahe-amaterky-18-1904.html",
			"https://navratdoreality.cz/nahe-amaterky-17-165.html",
			"https://navratdoreality.cz/nahe-amaterky-16-811.html",
			"https://navratdoreality.cz/nahe-amaterky-15-1126.html",
			"https://navratdoreality.cz/nahe-amaterky-14-1344.html",
			"https://navratdoreality.cz/kozy-kozy-kozicky-87-4704.html",
			"https://navratdoreality.cz/cernovlasky-brunety-36-4633.html",
			"https://navratdoreality.cz/prdelky-136-4632.html",
			"https://navratdoreality.cz/zrzky-6-4561.html",
			"https://navratdoreality.cz/kozy-kozy-kozicky-85-4529.html",
			"https://navratdoreality.cz/kozy-kozy-kozicky-84-4442.html",
			"https://navratdoreality.cz/cernovlasky-brunety-35-4440.html"
		];

		//all = all.slice(0, 1);

		for (let item of all) {
			await this._getImages(item);
		}
	}

	_replaceDiac(value) {
		let output = "";
		let pre = 'áäčďéěëíµňôóöŕřšťúůüýžÁÄČĎÉĚËÍĄŇÓÖÔŘŔŠŤÚŮÜÝŽ';
		let post = 'aacdeeeilnooorrstuuuyzaacdeeelinooorrstuuuyz'

		for (let i = 0; i < value.length; i++) {
			let sign = value[i];
			let ind = pre.indexOf(sign);
			
			output += ind != -1 ? post[ind] : sign;
		}

		return output;
	}

	async _getImages(url) {
		let path = Url.parse(url).path;
		let galleryName = this._replaceDiac(path.replace(/.*\//g, "").replace(/-\d+\.html$/, "").replace(/[&#]/g, ""));

		try {
			fs.mkdirSync(galleryName);
		}
		catch (e) {
			console.log(e);
		}

		let text = await this._getText(url);
		let w = cheerio.load(text);
		let images = w(".list-gallery-flex-item a");
		let urls = [];
		
		images.each(function() {
			let url = w(this).attr("href");
			let path = Path.join(galleryName, url.replace(/.*\//, ""));

			urls.push({
				galleryName,
				path,
				url
			});
		});

		for (let item of urls) {
			try {
				console.log(`Fetching image ${item.url.replace(/.*\//, "")} gallery ${item.galleryName}`);
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
