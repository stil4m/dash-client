var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "dash-client"});

module.exports = {
  'get' : require('./get'),
  'post' : require('./post'),
  log : log
}