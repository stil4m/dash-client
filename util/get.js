var request = require('request');
var Promise = require('promise');

var fetch = function (url) {
  var log = require('./common').log;
  return function (accept, reject) {
    request(url, function (error, response) {
      if (error) {
        log.debug("GET: Failed to fetch url '" + url + "' with error");
        reject("GET: Failed to fetch url '" + url + "' with error");
        return;
      }
      if (response.statusCode != 200) {
        log.debug("GET: Failed to fetch url '" + url + "' with response code: " + response.statusCode);
        reject("GET: Failed to fetch url '" + url + "' with response code: " + response.statusCode);
        return;
      }
      log.debug('GET to ' + url + "had successfull response");
        var responseObject = JSON.parse(response.body);
        accept(responseObject);
    });
  };
};

var doGet = function (url) {
  if (typeof(url) === 'string') {
    return new Promise(fetch(url));
  }

  var keys = Object.keys(url);
  var promises = keys.map(function (urlKey) {
    return new Promise(fetch(url[urlKey]));
  });
  return Promise.all(promises).then(function (input) {
    var answer = {};
    keys.forEach(function (k, index) {
      answer[k] = input[index];
    });
    return answer;
  });
};

module.exports = doGet;