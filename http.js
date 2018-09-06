"use strict";
var http = require("http");
var url = require('url');

module.exports = {
	/**
	 * Http methods.
	 * @type {Object}
	 */
	METHOD: {
		POST: "POST",
		GET: "GET",
		DELETE: "DELETE",
		PATCH: "PATCH"
	},

	createRequest: function(config) {
		return new Promise((resolve, reject) => {
			let parsedUrl = url.parse(config.url || "");
			let port = parsedUrl.port || config.port || 80;

			let options = {
				hostname: parsedUrl.hostname,
				port: port,
				path: parsedUrl.path,
				method: config.method || this.METHOD.GET,
				headers: {}
			};

			let req = http.request(options, function(res) {
				let chunks = [];

				res.setEncoding('utf8');

				res.on('data', function (chunk) {
					chunks.push(chunk);
				});

				res.on('end', function () {
					let data = chunks.join("");

					if (res.headers["content-type"].indexOf("application/json") != -1) {
						data = JSON.parse(data);
					}

					let outObj = {
						status: res.statusCode,
						headers: JSON.stringify(res.headers),
						data: data,
						url: config.url,
						method: options.method
					};

					if (res.statusCode >= 200 && res.statusCode < 300) {
						resolve(outObj);
					}
					else {
						reject(outObj);
					}

					resolve();
				});
			});

			req.on('error', function(e) {
				reject(e);
			});

			req.end();
		});
	}
};
