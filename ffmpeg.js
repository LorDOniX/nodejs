const { exec } = require('child_process');
const fs = require('fs');
const SKIP = ["$RECYCLE.BIN", "System Volume Information"];

class FFMpeg {
	constructor() {
		// max buffer error: -max_muxing_queue_size 4000
		this._mp4Nvidia720();
	}

	async _mp4Nvidia720() {
		let files = fs.readdirSync(".").filter(i => i.indexOf(".mp4") != -1);

		for (let file of files) {
			let oldFileName = `old_${file}`;
			this.rename(file, oldFileName);
			//await this.nvidiaEncode(oldFileName, file, { resize: "720x480", verbose: 1 });
			await this.nvidiaEncode(oldFileName, file, { resize: "1280x720", verbose: 1 });
		}
	}

	rename(file, newFileName) {
		fs.renameSync(file, newFileName);
	}

	remove(file) {
		fs.unlinkSync(file);
	}

	getDirectoriesFromPath(path) {
		let directories = [];

		try {
			fs.readdirSync(path).filter(item => {
				return SKIP.indexOf(item) == -1;
			}).forEach(item => {
				let stats = fs.statSync(pathObj.join(path, item));

				if (stats && stats.isDirectory()) {
					directories.push(item);
				}
			});
		}
		catch (err) {
		}

		return directories;
	}

	generateListFile(files) {
		return files.map(i => `file '${i}'`).join("\n");
	}

	async xyz(file, output) {
		await this._run(``);
	}

	async fixVideo(file, output) {
		await this._run(`ffmpeg -i \"${file}\" -c copy -movflags faststart \"${output}\"`);
	}

	async nvidiaEncode(file, output, optsArg) {
		let opts = Object.assign({
			resize: "", // 1280x720
			preset: "slow", // medium, fast,
			profile: "", // high
			probesize: false,
			special: false,
			params: "",
			verbose: false
		}, optsArg);

		let resize = opts.resize ? `-resize ${opts.resize} -deint 2` : "";
		let profile = opts.profile ? `-profile:v ${opts.profile}` : "";
		let probesizeParams = opts.probesize ? "-analyzeduration 2148M -probesize 2148M" : "";
		let specialParams = opts.special ? "-pix_fmt yuv420p -rc vbr_hq -b:v 8M -maxrate:v 10M" : "";
		let params = opts.params ? opts.params : "";

		await this._run(`ffmpeg -c:v h264_cuvid ${[resize, probesizeParams].join(" ")} -i "${file}" -vcodec h264_nvenc -preset ${[opts.preset, profile, specialParams, params].join(" ")} -c:a copy "${output}"`, opts.verbose);
	}

	// crf kvalita - 23 medium
	// r - pocet fps
	async resize720H264(file, output, r) {
		let r = typeof r === "number" ? `-r ${r}` : "";

		await this._run(`ffmpeg -i "${file}" -s hd720 ${r} -c:v libx264 -crf 23 -c:a aac -strict -2 ${output}`);
	}

	// file = xyz.mp4
	// output = xyz.mp3
	async audioExtract(file, output) {
		await this._run(`ffmpeg -i "${file}" -f mp3 -ab 192000 -vn "${output}"`);
	}

	async tsToMp4(file, output) {
		await this._run(`ffmpeg -i "${file}" -acodec copy -vcodec copy "${output}"`);
	}

	async normalizeAudio(file, output) {
		await this._run(`ffmpeg-normalize --normalization-type peak --target-level 0 -f "${file}" -c:a libmp3lame -b:a 320k -o "${output}"`);
	}

	// offset v [s] 1.5 napr.
	async audioOffset(file, offset, output) {
		await this._run(`ffmpeg -i "${file}" -itsoffset ${offset} -vcodec copy -acodec copy -map 0:0 -map 1:1 "${output}"`);
	}

	async concatAudio(audioFiles, output) {
		await this._run(`ffmpeg ${audioFiles.map(i => `-i "${i}"`).join(" ")} -filter_complex amix=inputs=${audioFiles.length}:duration=first:dropout_transition=0 -codec:a libmp3lame -q:a 0 "${output}"`);
	}

	async concatVideo(listFile, output, useH264) {
		let codec = useH264 ? "-vcodec libx264 -acodec copy -map 0:v -map 0:a:0" : "-c copy";

		await this._run(`ffmpeg -f concat -safe 0 -i ${listFile} ${codec} "${output}"`);
	}

	_run(command, verbose) {
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

new FFMpeg();
