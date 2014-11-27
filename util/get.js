var request = require('request');

module.exports = function(url, cb, errCb) {
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var responseObject = JSON.parse(response.body);
      cb(responseObject);
    } else {
      if (errCb) {
        errCb();
      } else {
        throw new Error('GET ' + url);
      }
    }
  });
};