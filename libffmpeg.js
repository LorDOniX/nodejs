const { exec } = require('child_process');
const fs = require('fs');
const pathObj = require('path');

const SKIP = ["$RECYCLE.BIN", "System Volume Information"];
const EXTS = [".mkv", ".mp4", ".avi", ".flv"];
const OUTPUT = "output";

// ffmpeg -c:v h264_cuvid -f concat -safe 0 -i file.txt -vcodec h264_nvenc -preset slow -b:v 4M -c:a copy output.mp4
// ffmpeg -c:v h264_cuvid ${[resize, probesizeParams].join(" ")} -i "${file}" -vcodec h264_nvenc -preset ${[opts.preset, profile, specialParams, params].join(" ")} -c:a copy "${output}"
// ffmpeg -c:v h264_cuvid ${resize} -i "${file}" -vcodec h264_nvenc -preset ${opts.preset} ${profile} ${specialParams} -c:a copy "${output}"

class FFMpeg {
	constructor(file) {
		this._files = [];
		this._listFile = "";
		this._params = {
			banner: "",
			cuda: false,
			codec: "-c:v libx264",
			audio: "-c:a copy",
			preset: "",
			resize: "",
			quality: "",
			aspect: "",
			audioStreams: "",
			bitrate: 0
		};
		/**
		 * -profile:v high
		 * -analyzeduration 2148M
		 * -probesize 2148M
		 * -pix_fmt yuv420p
		 * -rc vbr_hq
		 * -b:v 8M
		 * -maxrate:v 10M
		 * -map 0:v -map 0:a
		 * -c:v h264_cuvid
		 * -c:v libx264
		 * -vcodec h264_nvenc
		 * -c:a copy
		 * -c:a aac
		 * -crf 23
		 * -strict -2
		 */

		if (file) {
			this._files.push(file);
		}

		try {
			fs.mkdirSync(OUTPUT);
		}
		catch (e) {}
	}

	/* parameters start */

	hideBanner() {
		this._params.banner = "-hide_banner";
		return this;
	}

	cuda() {
		this._params.cuda = true;
		//this._params.codec = "-c:v h264_nvenc";
		this._params.codec = "-vcodec h264_nvenc -c:v h264_cuvid";
		return this;
	}

	audioStreams() {
		// mapuju video na vystup (to hlavni), vsechny ostatni resource prekopirovat; jinak se bere od kazdeho 1
		this._params.audioStreams = "-map 0:v -map 0:a";
		return this;
	}

	// slow, medium, fast
	preset(value) {
		this._params.preset = `-preset ${value}`;
		return this;
	}

	// 1280x720
	resize(value) {
		this._params.resize = `-resize ${value} -deint 2`;
		return this;
	}

	quality(value) {
		this._params.quality = `-crf ${value}`;
		return this;
	}

	// 16:9, 3:4 16:9, 16:10, 5:4, 2:21:1, 2:35:1, 2:39:1
	aspect(value) {
		this._params.aspec = `-aspect ${value}`;
		return this;
	}

	// v [M]
	bitrate(value) {
		this._params.bitrate = value || 0;
		return this;
	}

	/* parameters end */

	readAllVideos() {
		fs.readdirSync(".").forEach(file => {
			EXTS.every(ext => {
				if (file.indexOf(ext) != -1) {
					this._files.push(file);
				}
				else return true;
			});
		});

		return this;
	}

	listFile(files, output) {
		let data = files.map(i => `file '${i}'`).join("\n");
		fs.writeFileSync(output, data, "utf-8");

		this._listFile = output;

		return this;
	}

	async audioExtract(bitrate) {
		let bitrateValue = 0;

		if (typeof bitrate === "boolean" && bitrate) {
			bitrateValue = 192;
		}
		else if (typeof bitrate === "number" && bitrate > 0) {
			bitrateValue = bitrate;
		}

		for (let file of this._files) {
			let output = pathObj.join(OUTPUT, this._replaceExt(file, "mp3"));
			await this._run(`ffmpeg -i "${file}" -f mp3 ${bitrateValue > 0 ? `-ab ${bitrateValue}` : ""}-vn "${output}"`);
		}

		return this;
	}

	async audioNormalize() {
		for (let file of this._files) {
			let output = pathObj.join(OUTPUT, file);
			await this._run(`ffmpeg-normalize --normalization-type peak --target-level 0 -f "${file}" -c:a libmp3lame -b:a 320k -o "${output}"`);
		}

		return this;
	}

	async audioConcat(output) {
		await this._run(`ffmpeg ${this._files.map(i => `-i "${i}"`).join(" ")} -filter_complex amix=inputs=${this._files.length}:duration=first:dropout_transition=0 -codec:a libmp3lame -q:a 0 "${output}"`);

		return this;
	}

	// [s]
	async videoAudioOffset(offset) {
		for (let file of this._files) {
			let output = pathObj.join(OUTPUT, file);
			await this._run(`ffmpeg -i "${file}" -itsoffset ${offset} -vcodec copy -acodec copy -map 0:0 -map 1:1 "${output}"`);
		}

		return this;
	}

	async videoFix() {
		for (let file of this._files) {
			let output = pathObj.join(OUTPUT, file);
			await this._run(`ffmpeg -i \"${file}\" -c copy -movflags faststart \"${output}\"`);
		}

		return this;
	}

	async videoConvert(ext) {
		for (let file of this._files) {
			let output = pathObj.join(OUTPUT, this._replaceExt(file, ext));
			await this._run(`ffmpeg -i "${file}" -acodec copy -vcodec copy "${output}"`);
		}

		return this;
	}

	async videoConcat(encode, output) {
		if (this._listFile) {
			let codec = encode ? "-vcodec libx264 -acodec copy -map 0:v -map 0:a:0" : "-c copy";

			await this._run(`ffmpeg -f concat -safe 0 -i ${this._listFile} ${codec} "${output}"`);
		}

		return this;
	}

	// pres parametry
	async videoEncode(ext = "mp4") {
		let paramsArg = [this._params.codec];

		["banner", "audioStreams", "resize", "preset", "quality", "aspect", "audio", "bitrate"].forEach(name => {
			let value = this._params[name];
			
			if (!value || (name == "quality" && this._params.cuda)) return;
			if (name == "bitrate") value = `-b:v ${value}M`;

			paramsArg.push(value);
		});

		let params = paramsArg.join(" ");

		for (let file of this._files) {
			let output = pathObj.join(OUTPUT, this._replaceExt(file, ext));
			// poskladame url
			await this._run(`ffmpeg -i "${file}" ${params} "${output}"`); //  -hwaccel cuvid
		}

		return this;
	}

	// *.srt
	async videoSubtitle(subtitle) {
		for (let file of this._files) {
			let output = pathObj.join(OUTPUT, file);
			await this._run(`ffmpeg -i \"${file}\" -i \"${subtitle}\" -map 0 -map 1 -c copy "${output}"`);
		}

		return this;
	}

	_rename(file, newFileName) {
		fs.renameSync(file, newFileName);
	}

	_remove(file) {
		fs.unlinkSync(file);
	}

	// ext = mp4, mp3
	_replaceExt(value, ext) {
		return (value.replace(/\.\w+$/, "." + ext));
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

//let ffmpeg = new FFMpeg("Video.mp4");
//ffmpeg.cuda().resize("1280x720").videoEncode();
// full hd tak 6M, 720 4-5M
(new FFMpeg("aaa.mp4")).cuda().resize("1920x1080").bitrate(6).videoEncode();
