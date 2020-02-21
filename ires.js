const sharp = require('sharp');
const fs = require('fs');
const WIDTH = 3840;
const HEIGHT = 2160;
const FOLDER = "wqhd";
const QUALITY = 80;
const DEF_QUALITY = 80;

let resizeImage = async(src, output) => {
	let image = sharp(src);
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
		image.resize(WIDTH, null);
	}
	else {
		image.resize(null, HEIGHT);
	}

	if (QUALITY != DEF_QUALITY) {
		image.jpeg({
			quality: QUALITY
		});
	}
	
	image.toFile(output);
};

let main = async() => {
	let files = fs.readdirSync(".").filter(i => i.indexOf(".jpg") != -1 || i.indexOf(".jpeg") != -1);

	if (files.length) {
		try {
			fs.mkdirSync(FOLDER);
		}
		catch (e) {}
		
		for (let file of files) {
			try {
				console.log(`Processing file ${file}`);
				let start = Date.now();
				await resizeImage(file, require("path").join(FOLDER, file));
				let diff = Date.now() - start;
				console.log(`Time: ${diff > 1000 ? (diff / 1000).toFixed(2) + "s" : diff + "ms"}`);
			}
			catch (e) {
				console.log(e);
			}
		}
	}
};

main();
