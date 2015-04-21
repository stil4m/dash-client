var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

var Server = function (runner, config) {
  //config
  app.use(bodyParser.json());

  app.get('/data', function (req, res) {
    res.json(runner.getReport());
  });

  //////////
  // Setup static content
  //////////
  app.use(express.static(path.join(__dirname, 'public')));

  //////////
  // Start Server
  //////////
  var server = app.listen(config.port || 3000, function () {
    config.silent || console.log("Server has started on port: ", config.port);
  });

};

module.exports = Server;