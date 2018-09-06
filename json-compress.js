let json = require("./data/test");

class Common {
	constructor() {
		// a 0....z 51
		this._alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		this._base = this._alphabet.length;
	}

	codeNumber(value) {
		let cur = value;

		if (value >= 0 && value <= 1) return this._alphabet[value];

		let exp = Math.ceil(Math.log(value) / Math.log(this._base));
		let output = [];

		for (let i = exp - 1; i >= 0; i--) {
			let curExp = Math.pow(this._base, i);
			let diff = Math.floor(cur / curExp);
			cur -= diff * curExp;

			output.push(this._alphabet[diff]);
		}

		return output.join("");
	}

	decodeNumber(value) {
		let len = value.length - 1;
		let output = 0;

		for (let i = 0; i <= len; i++) {
			let curExp = Math.pow(this._base, len - i);
			let cur = this._alphabet.indexOf(value[i]);

			if (cur == -1) {
				throw new Error("Unknown sign!");
			}

			output += cur * curExp;
		}

		return output;
	}

	clone(value) {
		return this._cloneValue(value, 0);
	}

	/**
	 * Clone value without references.
	 * 
	 * @param  {Object} value Input value
	 * @param  {Number} [lvl] Recursive threshold
	 * @return {Object} cloned value
	 * @private
	 * @member $common
	 */
	_cloneValue(value, lvl) {
		lvl = lvl || 0;

		// recursive call threshold
		if (lvl > 100) return null;

		switch (typeof value) {
			case "object":
				if (Array.isArray(value)) {
					// array
					let newArray = [];

					value.forEach(item => {
						newArray.push(this._cloneValue(item, lvl + 1));
					});

					return newArray;
				}
				else if (value && value instanceof Date) {
					// date
					return new Date(value.getTime());
				}
				else if (value) {
					// object
					let newObj = {};

					Object.keys(value).forEach(prop => {
						if (value.hasOwnProperty(prop)) {
							newObj[prop] = this._cloneValue(value[prop], lvl + 1);
						}
					});

					return newObj;
				}
				else {
					// null
					return null;
				}

			case "undefined":
			case "boolean":
			case "number":
			case "function":
			case "string":
				return value;
		}
	}

	getKeys(obj) {
		let keys = {};

		this._getKeys(obj, keys);

		return keys;
	}

	_getKeys(value, output) {
		switch (typeof value) {
			case "object":
				if (Array.isArray(value)) {
					// array
					value.forEach(item => {
						this._getKeys(item, output);
					});
					return;
				}
				else if (value && value instanceof Date) {
					// date
					return;
				}
				else if (value) {
					Object.keys(value).forEach(prop => {
						if (value.hasOwnProperty(prop)) {
							if (!(prop in output)) {
								output[prop] = 0;
							}

							output[prop]++;
							this._getKeys(value[prop], output);
						}
					});
					return;
				}
				else {
					// null
					return;
				}

			case "undefined":
			case "boolean":
			case "number":
			case "function":
			case "string":
				return;
		}
	}
}

class My {
	/**
	 * Analyza:
	 * - vsechny nazvy klicu, jejich pocet, seradime podle vyskytu, nejvic vyskytu 0..n, pak testujeme, jestli akt. id + original < delka, jestli se to vyplati,
	 * klice @a-zA-Z (52),
	 *
	 * vystup: "slovnik0,slovnik1,slovnik2{@ř:5,aaa:..."
	 * 
	 * @return {[type]} [description]
	 */
	constructor() {
		this._common = new Common();

		this.decode();
	}

	code() {
		let dict = {};
		let dictStr = [];
		let cur = 0;
		let curVal = this._common.codeNumber(cur);

		let input = require("./test2.json");
		let keys = this._common.getKeys(input);
		let a = Object.keys(keys);
		a.sort((a, b) => {
			let aV = keys[a];
			let bV = keys[b];

			return bV - aV;
		});
		a.forEach(key => {
			let count = keys[key];

			if (count <= 1) return;

			let newKey = "@" + curVal;

			if (newKey.length < key.length) {
				/*dict[key] = {
					cur,
					decode: newKey,
					count: count,
					compress: Math.round((1 - newKey.length / key.length) * 100)
				};*/
				dict[key] = newKey;
				dictStr.push(key);

				cur++;
				curVal = this._common.codeNumber(cur);
			}
		});

		//console.log(dictStr.join(","));
		//console.log(dict);

		let b = this.clone(input, dict);
		require("fs").writeFileSync("rom.txt", dictStr.join(",") + b, "utf8");
	}

	decode() {
		let a = require("fs").readFileSync("./rom.txt", "utf8");
		let dict = {};
		let test = a.match(/^[^{]+/);

		if (test) {
			a = a.replace(test[0], "");

			let all = test[0].split(",");
			all.forEach((item, ind) => {
				let newKey = "@" + this._common.codeNumber(ind);
				
				dict[newKey] = item;
			});
		}

		//let obj = this._parse(a, dict);
		let tokens = this._getTokens(a);

		console.log(a);
		console.log(tokens);
	}

	clone(value, dict) {
		return this._cloneValue(value, 0, dict);
	}

	_cloneValue(value, lvl, dict) {
		lvl = lvl || 0;

		// recursive call threshold
		if (lvl > 100) return "null";

		switch (typeof value) {
			case "object":
				if (Array.isArray(value)) {
					// array
					let newArray = [];

					value.forEach(item => {
						newArray.push(this._cloneValue(item, lvl + 1, dict));
					});

					return "[" + newArray.join(",") + "]";
				}
				else if (value && value instanceof Date) {
					// date
					return new Date(value.getTime());
				}
				else if (value) {
					// object
					let newObj = "{";
					let keys = [];

					Object.keys(value).forEach(prop => {
						if (value.hasOwnProperty(prop)) {
							let key = prop in dict ? dict[prop] : prop;
							keys.push(key + ":" + this._cloneValue(value[prop], lvl + 1, dict));
						}
					});

					newObj += keys.join(",") + "}";
					return newObj;
				}
				else {
					// null
					return "null";
				}

			case "undefined":
				return "undefined";

			case "boolean":
				return (value ? "#true" : "#false");

			case "number":
				let parts = value.toString().split(".");

				if (parts.length == 1) {
					return this._common.codeNumber(value);
				}
				else if (parts.length == 2) {
					return (this._common.codeNumber(parts[0]) + "." + this._common.codeNumber(parts[1]));
				}

			case "function":
				return value.toString();

			case "string":
				return ("\"" + value + "\"");
		}
	}

	/**
	 * xyz
	 * 
	 * {@a:{@a:{a:tm,bbb:"dsasadsa",c:#true},a:["5adssad",null,k.f]},rom:[{a:f},{a:g}]}
	 */
	_parse(input, dict) {
		let output = {};
		let len = input.length - 1;
		let stack = [];
		let value = "";

		for (let i = 0; i < len; i++) {
			let cur = input[i];

			if (cur == "{") {
				value = "";

				stack.push({
					type: "obj",
					data: {}
				});
			}
			else if (cur == "}") {
				let items = [];

				for (let i = 0; i < stack.length; i++) {
					let item = stack[i];

					if (item.type != "obj") {
						items.push(item);
					}
					else {
						stack.splice(0, i + 1);
					}
				}

				console.log(items);
			}
			else if (cur == "[") {
				value = "";

				stack.push({
					type: "array",
					data: []
				});
			}
			else if (cur == "]") {
				let items = [];

				for (let i = 0; i < stack.length; i++) {
					let item = stack[i];

					if (item.type != "array") {
						items.push(item);
					}
					else {
						stack.splice(0, i + 1);
					}
				}

				console.log(items);
			}
			else if (cur == ":") {
				stack.push({
					type: "key",
					data: value
				});

				value = "";
			}
			else if (cur == ",") {
				stack.push({
					type: "comma",
					data: value
				});

				value = "";
			}
			else {
				value += cur;
			}
		}

		//console.log(stack);

		return output;
	}

	_getTokens(input) {
		let output = [];
		let len = input.length - 1;
		let STATES = { EMPTY: 0, STRING: 1, NUMBER: 2, REST: 3 };
		let state = STATES.EMPTY;
		let data = "";
		let ptr = 0;

		while (true) {
			let item = input[ptr];
			ptr++;

			switch (state) {
				case STATES.EMPTY:
					if (item.indexOf("{}[]:,") != -1) {
						output.push(item);
					}
					else if (item == "\"") {
						state = STATES.STRING;
						data = "";
					}
					else if (item.match(/\d/) || item == "-") {
						state = STATES.NUMBER;
						data = item;
					}
					else {
						state = STATES.REST;
						data = item;
					}
					break;

				case STATES.STRING:
					if (item == "\"") {
						state = STATES.EMPTY;
						output.push(data);
						data = "";
					}
					else {
						data += item;
					}
					break;

				case STATES.NUMBER:
					if (item.match(/\d/) || item == "." || item == "e") {
						data += item;
					}
					else {
						state = STATES.EMPTY;
						output.push(data);
						data = "";
					}
					break;

				case STATES.REST:
					if (item.indexOf("{}[]:, ") == -1) {
						data += item;
					}
					else {
						state = STATES.EMPTY;
						output.push(data);
						data = "";
					}
					break;
			}

			if (ptr == len) break;
		}

		if (data.length) {
			output.push(data);
		}

		return output;
	}
}

new My();
