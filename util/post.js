var request = require('request');
var Promise = require('promise');

module.exports = function (url, payload) {
  return new Promise(function (accept, reject) {
    var log = require('./common').log;

    request({method : 'POST', url : url, json : true, body : payload}, function (error, response) {
      if (!error && response.statusCode == 200) {
        log.debug('POST: ' + url + "had successfull response");
        var responseObject = response.body;
        accept(responseObject);
      } else {
        if (response) {
          log.debug("POST: Failed to post to url '" + url + "' with response code: " + response.statusCode);
          reject('Invalid response: ' + response.statusCode);
        } else {
          log.debug("POST: Failed to post to url '" + url + "' with error");
          reject('Error: ' + error);
        }
      }
    });
  });
};
