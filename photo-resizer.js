const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_FOLDER = "Obrazky"; // fotky
const OUTPUT_FOLDER = "output";
const WIDTH = 1920 * 2;
const HEIGHT = WIDTH;
const QUALITY = 80;

process.on('unhandledRejection', (e, p) => {
	console.log([e,p]);
});

function resizeImage(src, output) {
	return new Promise(async(resolve) => {
		let image = sharp(src);
		let metaData = null;
		const promiseOutput = {
			error: false,
			skip: false
		};

		try {
			metaData = await image.metadata();
		} catch (ex) {
			output.error = ex;
			resolve(promiseOutput);
		}

		/*if (metaData.width < WIDTH && metaData.height < HEIGHT) {
			promiseOutput.skip = true;
			resolve(promiseOutput);
			return;
		}*/

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

		image.jpeg({
			quality: QUALITY
		});
		image.toFile(output, err => {
			if (err) {
				promiseOutput.error = err;
				resolve(promiseOutput);
			} else {
				resolve(promiseOutput);
			}
		});

	});
}

function getFilesFromDirectory(startPath, output) {
	if (!output) {
		output = [];
	}

	if (!fs.existsSync(startPath)){
		console.log("no dir ", startPath);
		return output;
	}

	const files = fs.readdirSync(startPath);
	files.forEach(file => {
		const fileName = path.join(startPath, file);
		const stat = fs.lstatSync(fileName);

		if (stat.isDirectory()) {
			getFilesFromDirectory(fileName, output);
		}
		else {
			output.push(fileName);
		}
	});

	return output;
}

function createDirectory(pathItems) {
	fs.mkdirSync(pathItems.join(path.sep), {
		recursive: true
	});
}

async function main() {
	const files = getFilesFromDirectory(INPUT_FOLDER).filter(file => {
		const ext = path.parse(file).ext.toLowerCase();

		return [".jpeg", ".jpg", ".png", ".gif"].indexOf(ext) != -1;
	});
	createDirectory([OUTPUT_FOLDER]);

	const logLines = [];

	for (let ind = 0, max = files.length; ind < max; ind++) {
		const file = files[ind];
		const parsed = path.parse(file);
		const dirs = parsed.dir.split(path.sep);
		createDirectory([OUTPUT_FOLDER].concat(dirs));
		const outputFile = path.join(OUTPUT_FOLDER, file);

		const fileMsg = `File ${file} is processing...`;
		logLines.push(fileMsg);
		console.log(fileMsg);

		const riData = await resizeImage(file, outputFile);

		if (riData.error) {
			const errorMsg = `Resize image error ${riData.error}`;
			logLines.push(errorMsg);
			console.log(errorMsg);
			fs.copyFileSync(file, outputFile);
		} else if (riData.skip) {
			const skipMsg = `Skip image via dimensions`;
			logLines.push(skipMsg);
			console.log(skipMsg);
			fs.copyFileSync(file, outputFile);
		} else {
			const doneMsg = `File was resized`;
			logLines.push(doneMsg);
			console.log(doneMsg);
		}
	}

	console.log("Done, log file will be written...");
	fs.writeFileSync("log.txt", logLines.join("\n"));
}

main();
