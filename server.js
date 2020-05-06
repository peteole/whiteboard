var http = require('http');
var https=require('https');
var url = require('url');
var fs = require('fs');
var nStatic = require('node-static');
var fileServer = new nStatic.Server('.');
http.createServer(function (req, res) {
  fileServer.serve(req, res);
  var response = '';
  console.log(url.parse(req.url, true).pathname);
})
  .listen(8080);
