var express  = require('express');
var app      = express();
var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer();

app.all("/poiagg", function(req, res) {
	apiProxy.web(req, res, { target: "http://mapy.cz", changeOrigin: true });
});

app.get('/', function(req, res){
	//res.sendfile('./views/index.html');
	//res.send("Hello world From Server 1");
	apiProxy.web(req, res, { target: "http://frasier.dev:9211" });
});

app.listen(8001);
