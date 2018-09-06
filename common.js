var fs = require("fs");
var https = require("https");
var stringSimilarity = require('string-similarity');

const PATH_SEP = require('path').sep;

/**
 * Size to KB/MB.
 * 
 * @param  {Number} size
 * @return {String}
 */

function formatSize(size) {
	if (typeof size !== "number") {
		return "null";
	}

	let lv = size > 0 ? Math.floor(Math.log(size) / Math.log(1024)) : 0;
	let sizes = ["", "K", "M", "G", "T"];
	lv = Math.min(sizes.length, lv);
	let value = lv > 0 ? (size / Math.pow(1024, lv)).toFixed(2) : size;

	return value + " " + sizes[lv] + "B";
}

exports.formatSize = formatSize;

exports.walk = (path, fileExt, maxLvl) => {
	let data = {};

	_walk(path, "root", fileExt, data, 0, maxLvl);

	return data;
};

exports.strCompare = (str1, str2) => {
	return stringSimilarity.compareTwoStrings(_replaceDiac(str1), _replaceDiac(str2));
}

exports.request = (url, getParams) => {
	return new Promise((resolve, reject) => {
		url = url || "";
		let strParams = _objToURL(getParams || {});

		let wholeUrl = url + (strParams.length ? "?" : "") + strParams;
		let parsedUrl = require('url').parse(wholeUrl);

		let options = {
			hostname: parsedUrl.hostname,
			path: parsedUrl.path,
			method: "GET",
			headers: {}
		};

		let req = https.request(options, function(res) {
			let chunks = [];

			res.setEncoding('utf8');

			res.on('data', chunk => {
				chunks.push(chunk);
			});

			res.on('end', () => {
				let data = chunks.join("");

				if (res.headers["content-type"].indexOf("application/json") != -1) {
					data = JSON.parse(data);
				}

				let outObj = {
					status: res.statusCode,
					data: data
				};

				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(outObj);
				}
				else {
					reject(outObj);
				}
			});
		});

		req.on('error', e => {
			reject({
				status: 500,
				data: e
			});
		});

		req.end();
	});
}

exports.onlyFiles = walkData => {
	let files = [];

	_onlyFiles(walkData, files);

	return files;
};

exports.mkDir = path => {
	try {
		fs.mkdirSync(path);
	}
	catch (err) {
	}
};

exports.rename = (oldPath, newPath) => {
	try {
		fs.renameSync(oldPath, newPath);
	}
	catch (err) {
	}
};

exports.getRandom = (start = 0, end = 1) => {
	return Math.floor(Math.random() * end) + start;
};

function _walk(path, name, fileExt, output, lvl, maxLvl) {
	try {
		let list = [];
		output.list = list;
		output.name = name;
		output.path = path;
		output.type = "dir";

		if (typeof maxLvl === "number" && lvl >= maxLvl) {
			return;
		}

		fs.readdirSync(path).forEach(item => {
			let stats = fs.statSync(path + PATH_SEP + item);

			if (!stats) return;

			if (stats.isFile() && (!fileExt || (fileExt && item.indexOf(fileExt) != -1))) {
				list.push({
					name: item,
					type: "file",
					size: formatSize(stats.size)
				});
			}
			else if (stats.isDirectory()) {
				let newDir = {};

				_walk(path + PATH_SEP + item, item, fileExt, newDir, lvl + 1, maxLvl);

				list.push(newDir);
			}
		});
	}
	catch (err) {
	}
}

function _objToURL(obj) {
	let url = [];

	if (Array.isArray(obj)) {
		obj.forEach(item => {
			url.push(encodeURIComponent(item.name) + "=" + encodeURIComponent(item.value));
		});
	}
	else if (typeof obj === "object") {
		Object.keys(obj).forEach(key => {
			url.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
		});
	}

	return url.join("&");
}

function _replaceDiac(value) {
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

function _onlyFiles(walkData, files) {
	walkData.list.forEach(item => {
		if (item.type == "file") {
			let path = walkData.path + (walkData.path[walkData.path.length - 1] != PATH_SEP ? PATH_SEP : "");

			files.push({
				name: item.name,
				size: item.size,
				path,
				fullPath: path + item.name
			});
		}
		else if (item.type == "dir") {
			_onlyFiles(item, files);
		}
	});
}
