const sharp = require('sharp');
const fs = require('fs');

const SIZES = {
	small: {
		name: "small",
		width: 300,
		height: 300
	},
	// puvodni 1024x768
	large: {
		name: "large",
		width: 4096,
		height: 4096
	}
};
const INPUT_FOLDER = "./";
const OUTPUT_FOLDER = "./output/";

class IRes {
	constructor() {
		this._main();
	}

	async _main() {
		this._createFolder(OUTPUT_FOLDER);

		let images = this._getFiles(`${INPUT_FOLDER}`);

		console.log(images);

		for (let j = 0, imagesMax = images.length; j < imagesMax; j++) {
			const smallOutput = `${OUTPUT_FOLDER}/${images[j]}`;
			const extensionMatch = images[j].match(/[.][a-zA-Z0-9]+$/);
			const extension = extensionMatch[0];
			const largeOutput = `${OUTPUT_FOLDER}/${images[j].replace(extension, `-large${extension}`)}`;

			if (!this._fileExists(smallOutput)) {
				// small
				console.log(`Image ${images[j]} - small`);
				await this._resizeImage({
					src: `${INPUT_FOLDER}/${images[j]}`,
					output: smallOutput,
					width: SIZES.small.width,
					height: SIZES.small.height
				});
			} else {
				console.log(`[SKIP] Image ${images[j]} - small`);
			}

			if (!this._fileExists(largeOutput)) {
				// large
				console.log(`Image ${images[j]} - large`);
				await this._resizeImage({
					src: `${INPUT_FOLDER}/${images[j]}`,
					output: largeOutput,
					width: SIZES.large.width,
					height: SIZES.large.height
				});
			} else {
				console.log(`[SKIP] Image ${images[j]} - large`);
			}
		}
	}

	_getFiles(path = ".") {
		return fs.readdirSync(path).filter(i => i.toLowerCase().indexOf(".jpg") != -1 || i.toLowerCase().indexOf(".jpeg") != -1);
	}

	async _resizeImage(optsArg) {
		let opts = Object.assign({
			src: "",
			output: "",
			width: 100,
			height: 100,
			quality: 80
		}, optsArg);
		let image = sharp(opts.src);
		let metaData = await image.metadata();
		// http://sylvana.net/jpegcrop/exif_orientation.html 5, 6, 7, 8 -> prohozeni rozmeru
		let switchSide = metaData.orientation >= 5 && metaData.orientation <= 8;
		let size = {
			width: switchSide ? metaData.height : metaData.width,
			height: switchSide ? metaData.width : metaData.height
		};

		image.rotate();
		image.withMetadata();

		if (size.width > size.height) {
			image.resize(opts.width, null);
		}
		else {
			image.resize(null, opts.height);
		}

		image.jpeg({
			quality: opts.quality
		});
		image.toFile(opts.output);
	}

	_createFolder(path) {
		try {
			fs.mkdirSync(path);
		}
		catch (e) {}
	}

	_fileExists(path) {
		try {
			fs.statSync(path);
			return true;
		} catch (ex) {
			return false;
		}
	}
};

new IRes();
