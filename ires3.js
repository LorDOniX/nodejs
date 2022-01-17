const sharp = require('sharp');
const fs = require('fs');

function getFiles(path = ".") {
	return fs.readdirSync(path).filter(i => i.toLowerCase().indexOf(".jpg") != -1 || i.toLowerCase().indexOf(".png") != -1);
}

function createFolder(path) {
	try {
		fs.mkdirSync(path);
	}
	catch (e) {}
}

function fileExists(path) {
	try {
		fs.statSync(path);
		return true;
	} catch (ex) {
		return false;
	}
}

async function resizeImage(optsArg) {
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

	const resizeObj = {
		kernel: "mitchell"
	};

	if (size.width > size.height) {
		resizeObj.width = opts.width;
	}
	else {
		resizeObj.height = opts.height;
	}

	image.resize(resizeObj);
	image.sharpen();
	image.toFile(opts.output);
}

async function main() {
	createFolder("output");

	let images = getFiles(`./j`);

	for (let j = 0, imagesMax = images.length; j < imagesMax; j++) {
		await resizeImage({
			src: `./j/${images[j]}`,
			output: `./output/${images[j]}`,
			width: 2048,
			height: 2048
		});
	}
}

main();
