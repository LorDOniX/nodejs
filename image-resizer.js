//var Jimp = require("jimp");
var fs = require("fs");
var gm = require('gm').subClass({imageMagick: true});
var PATH = require("path");

const INPUT = "img";
const OUTPUT = "outputX";
const SIZE = {
	width: 2560,
	height: 1440
};
const QUALITY = 80;

class Test {
	constructor() {
		this._gmVersion();
		//this._jimpVersion();
	}

	_gmVersion() {
		let files = fs.readdirSync(INPUT);
		files.forEach(filename => {
			let file = filename.toLowerCase();

			if (file.indexOf("jpg") != -1 || file.indexOf("png") != -1) {
				let gmInst = gm(INPUT + PATH.sep + filename);

				gmInst.size((err, size) => {
					let width = 0;
					let height = 0;

					if (size.width >= size.height) {
						width = SIZE.width;
						height = null;
					}
					else {
						width = null;
						height = SIZE.height;
					}

					gmInst.resize(width, height).quality(QUALITY).write(OUTPUT + PATH.sep + filename, err => {
						if (err) {
							console.log(err);
						}
					});
				});
			}
		});
	}

	_jimpVersion() {
		let files = fs.readdirSync(INPUT);
		let count = 0;
		let done = 0;
		let st = Date.now();

		let testFn = () => {
			if (count == done) {
				let df = ((Date.now() - st) / 1000).toFixed(2);

				console.log(`Script finish at ${df} s`);
			}
		};

		files.forEach(filename => {
			let file = filename.toLowerCase();

			if (file.indexOf("jpg") != -1 || file.indexOf("png") != -1) {
				count++;

				this._get(INPUT + PATH.sep + file).then(data => {
					let width = 0;
					let height = 0;

					if (data.width >= data.height) {
						width = SIZE.width;
						height = Jimp.AUTO;
					}
					else {
						width = Jimp.AUTO;
						height = SIZE.height;
					}

					data.image.resize(width, height).quality(QUALITY).write(OUTPUT + PATH.sep + filename);
					done++;
					let progress = (done / count * 100).toFixed(2);
					console.log(`progress ${progress} %`);
					testFn();
				}, () => {
					done++;
					testFn();
				});
			}
		});
	}

	_get(path) {
		return new Promise((resolve, reject) => {
			Jimp.read(path, (err, image) => {
				if (err) {
					reject();
				}
				else {
					resolve({
						width: image.bitmap.width,
						height: image.bitmap.height,
						image
					});
				}
			});
		});
	}
}

new Test();
