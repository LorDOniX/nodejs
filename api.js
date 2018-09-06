var { request } = require("./common");
var { CHANNELS, DONT_RESOLVE } = require("./channels");

exports.downloadChannel = (channelName, apiKey) => {
	return new Promise((resolve, reject) => {
		// id channelu
		getChannelId(channelName, apiKey).then(channelId => {
			getChannelPlaylistId(channelId, apiKey).then(playlistId => {
				// id playlistu, stahneme vsechno API do souboru
				downYoutubeChannel(playlistId, apiKey).then(videos => {
					resolve(videos);
				}, e => {
					reject(e);
				});
			}, e => {
				reject(e);
			});
		}, e => {
			reject(e);
		});
	});
};

exports.channelNews = (channelName, apiKey) => {
	return new Promise((resolve, reject) => {
		// id channelu
		getChannelId(channelName, apiKey).then(channelId => {
			getChannelPlaylistId(channelId, apiKey).then(playlistId => {
				// id playlistu, stahneme vsechno API do souboru
				downYoutubeChannel(playlistId, apiKey, true).then(videos => {
					resolve(videos);
				}, e => {
					reject(e);
				});
			}, e => {
				reject(e);
			});
		}, e => {
			reject(e);
		});
	});
};

function getChannelId(name, apiKey) {
	return new Promise((resolve, reject) => {
		// ohack pro kanaly, co se neresolvi
		if (DONT_RESOLVE.indexOf(name) != -1) {
			resolve(name);
			return;
		}

		request("https://www.googleapis.com/youtube/v3/channels", {
			forUsername: name,
			part: "id",
			key: apiKey
		}).then(data => {
			let ids = [];
			let mainData = data.data;

			mainData.items.forEach(item => {
				ids.push(item.id);
			});

			if (ids.length) {
				resolve(ids[0]);
			}
			else {
				reject(null);
			}
		}, e => {
			console.log(e);
			reject(null);
		});
	});
}

function getChannelPlaylistId(channelId, apiKey) {
	return new Promise((resolve, reject) => {
		let requestParams = {
			part: "contentDetails",
			id: channelId,
			key: apiKey
		};

		request("https://www.googleapis.com/youtube/v3/channels", requestParams).then(data => {
			let playlists = [];
			let mainData = data.data;

			mainData.items.forEach(item => {
				playlists.push(item.contentDetails.relatedPlaylists.uploads);
			});

			if (playlists.length) {
				resolve(playlists[0]);
			}
			else {
				reject(null);
			}
		}, e => {
			reject(null);
		});
	});
}

function downYoutubeChannel(playlistId, apiKey, onlyLatest) {
	return new Promise(resolve => {
		let videos = [];
		let params = {
			playlistId,
			key: apiKey
		};

		_downYoutubeChannelInner(resolve, videos, params, onlyLatest);
	});
}

exports.getChannelId = getChannelId;
exports.getChannelPlaylistId = getChannelPlaylistId;
exports.downYoutubeChannel = downYoutubeChannel;

function _downYoutubeChannelInner(resolve, videos, params, onlyLatest) {
	_getPlaylistVideos(params).then(data => {
		let mainData = data.data;

		try {
			mainData.items.forEach(item => {
				let d = new Date(item.snippet.publishedAt);
				let m = d.getMonth() + 1;
				let day = d.getDate();

				videos.push({
					name: item.snippet.title.replace(/[|●#"'\/]/g, "").replace(/  +/g, ' '),
					orig: item.snippet.title,
					create: [d.getFullYear(), (m < 10 ? "0" : "") + m, (day < 10 ? "0" : "") + day].join("_")
				})
			});
		}
		catch (err) {
			console.log(err);
		}

		if (mainData.nextPageToken && mainData.items.length && !onlyLatest) {
			params.pageToken = mainData.nextPageToken;

			_downYoutubeChannelInner(resolve, videos, params, onlyLatest);
		}
		else {
			resolve(videos);
		}
	}, e => {
		resolve(videos);
	});
}

function _getPlaylistVideos(params = {}) {
	let requestParams = Object.assign({
		part: "snippet",
		order: "date",
		maxResults: 50
	}, params);

	return request("https://www.googleapis.com/youtube/v3/playlistItems", requestParams);
}

function _getSearchVideos(params = {}) {
	let requestParams = Object.assign({
		part: "snippet,id",
		order: "date",
		maxResults: 50/*,
		type: "video"*/
	}, params);

	return request("https://www.googleapis.com/youtube/v3/search", requestParams);
}
