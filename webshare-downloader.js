const axios = require('axios');
var convert = require('xml-js');

const SERIES = 11;
const EPISODES = 24;
const WEBSHARE = "https://webshare.cz/api/search/";

class App {
	constructor() {
		this._run();
	}

	async _run() {
		let links = [];
		let missed = [];

		for (let s = 1; s <= SERIES; s++) {
			for (let e = 1; e <= EPISODES; e++) {
				let xID = `${s}x${(e < 10 ? "0" : "") + e}`;
				let otherID = `s${(s < 10 ? "0" : "") + s}e${(e < 10 ? "0" : "") + e}`;
				let linkUrl = await this._getLink(xID, otherID);

				if (linkUrl) {
					links.push(linkUrl);
				}
				else {
					missed.push(otherID);
				}
			}
		}

		let uniqLinks = [...new Set(links)];

		//require("fs").writeFileSync("output.json", JSON.stringify({ links, missed }, 4, "\t"), "utf-8");
		require("fs").writeFileSync("output.json", uniqLinks.join("\n") + "\n" + missed.join("|"), "utf-8");
	}

	_getLink(xID, otherID) {
		return new Promise(resolve => {
			axios({
				url: WEBSHARE,
				method: "POST",
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				data: `what=${encodeURIComponent('frasier ' + xID)}&offset=0&limit=25&wst=4pJ6ku2Qd5eF4bW1`
			})
			.then((res) => {
				let jsonStr = convert.xml2json(res.data, {compact: true, spaces: 4});
				let json = JSON.parse(jsonStr);
				let output = [];
				let rest = [];
		
				json.response.file.forEach(item => {
					let name = item.name["_text"];
					let url = `https://webshare.cz/#/file/${item.ident["_text"]}/${name.replace(/[.]/g, "-").replace(/\s/g, "-")}`;

					if (name.indexOf("mkv") != -1 && (name.indexOf(xID) != -1 || name.indexOf(otherID) != -1)) {
						output.push(url);
					}
					else if (name.indexOf("SK") != -1 && (name.indexOf(xID) != -1 || name.indexOf(otherID) != -1)) {
						rest.push(url);
					}
				});

				resolve (output.length ? output[0] : (rest.length ? rest[0] : ""));
			});
		});
	}
}

new App();
