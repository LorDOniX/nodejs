/**
 * File: reload-server.js
 */
(function(w){
	if ("reloadServer" in w) return;

	var refreshPage = function() {
		window.location.reload();
	};

	var refreshCSS = function(file) {
		var ts = new Date().getTime().toString(16);
		var links = document.head.querySelectorAll("link");

		if (links) {
			for (var i = 0; i < links.length; i++) {
				var item = links[i];

				if (item.href.indexOf(file) != -1) {
					item.href = item.href.replace(/[?].*$/g, "") + "?ts=" + ts;
				}
			}
		}
	};

	document.addEventListener("DOMContentLoaded", function() {
		try {
			var ws = new WebSocket("ws://{SERVER}:{PORT_NUMBER}");

			ws.onmessage = function(evt) {
				var obj = JSON.parse(evt.data);

				if (obj.operation == "refresh-css") {
					refreshCSS(obj.data.file);
				}
				else if (obj.operation == "refresh-page") {
					refreshPage();
				}
			};
		}
		catch (err) {
			console.error("Reload server error");
			console.error(err);
		}
	});

	w.reloadServer = {
		refreshPage: refreshPage,
		refreshCSS: refreshCSS
	};
})(window);
