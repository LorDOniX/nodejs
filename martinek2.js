const fs = require('fs');
const { exec } = require('child_process');

const INPUT_FOLDER = "./";
const OUTPUT_FOLDER = "./output/";

class VideoPreviews {
	constructor() {
		this._main();
	}

	async _main() {
		this._createFolder(OUTPUT_FOLDER);

		let videos = this._getFiles(`${INPUT_FOLDER}`);

		console.log(videos);
		
		for (let video of videos) {
			const outputImg = video.replace(/[.].*/, "") + ".jpg";

			await this._run(`ffmpeg -i ${video} -ss 1 -vframes 1 ${OUTPUT_FOLDER}${outputImg}`, false);
		}
	}

	_getFiles(path = ".") {
		return fs.readdirSync(path).filter(i => i.toLowerCase().indexOf(".mp4") != -1);
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

	_createFolder(path) {
		try {
			fs.mkdirSync(path);
		}
		catch (e) {}
	}
};

new VideoPreviews();
