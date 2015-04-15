var get = require('./util/get');
var post = require('./util/post');
var Promise = require('promise');
var log = require('./util/common').log;
module.exports = function (dashConfig) {

  function dashUrl(taskDef) {
    return dashConfig.url + '/api/data/' + taskDef.context + '-' + taskDef.entity;
  }

  this.getTimestamp = function (taskDef) {
    if (dashConfig.dev) {
      log.warn("DEV Mode. Return 0 timestamp for task def:", taskDef.name);
      return new Promise(function (accept) {
        accept(0)
      });
    }
    return get(dashUrl(taskDef) + '/last-timestamp');
  };

  this.saveResult = function (taskDef, result) {
    if (dashConfig.dev) {
      log.warn("DEV Mode. Will not post. Return successfull post for task def:", taskDef.name);
      return new Promise(function (accept) {
        accept()
      });
    }

    return post(dashUrl(taskDef), result);
  }
};