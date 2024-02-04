var http = require("http");
var fs = require("fs");
var index = fs.readFileSync("public/index.html");

http
  .createServer(function (req, res) {
    res.writeHead(200);
    res.end(index);
  })
  .listen(1337);
