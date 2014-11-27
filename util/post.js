var request = require('request');

module.exports = function (url, payload, cb) {
  request({method : 'POST', url : url, json : true, body : payload}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var responseObject = response.body;
      cb(responseObject);
    } else {
      if (response) {
        console.log(response.body);
        throw new Error('Invalid response: ' + response.statusCode);
      }
      throw new Error('Error: ' + error);
    }
  });
};
