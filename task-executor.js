var Promise = require('promise');
var log = require('./util/common').log;

module.exports = function (dashIntegration, taskDef) {

  function handleTaskResult(taskDef, result) {
    return new Promise(function (accept, reject) {
      if (result.length == 0) {
        log.info('No results for', taskDef.name);
        accept();
        return;
      }

      dashIntegration.saveResult(taskDef, result).then(function () {
        log.info('Posted results for', taskDef.name, ':', result.length, 'result(s)');
        accept();
      }, reject)
    });
  }

  function tearDown(result) {
    if (!result.success) {
      if (result && result.error) {
        log.warn("Failed due to error:", result.error);
      } else {
        log.warn("Task rejected result:", result.data);
      }
    }
  }

  function doExecute(timestamp) {
    return new Promise(function (resolve, reject) {
      taskDef.trigger(timestamp, resolve, reject);
    });
  }

  log.info('Starting task:', taskDef.name);

  return dashIntegration.getTimestamp(taskDef)
    .then(doExecute)
    .then(function (result) {
      return handleTaskResult(taskDef, result);
    })
    .then(function () {
      tearDown({success : true});
    }, function (e) {
      if (typeof(e) == Error) {
        tearDown({success : false, error : e});
      } else {
        tearDown({success : false, data : e});
      }
    });

};
