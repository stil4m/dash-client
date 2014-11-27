var get = require('./util/get');
var post = require('./util/post');

 module.exports = function (dashConfig, taskDef, cb) {

   function dashUrl(taskDef) {
     return dashConfig.url + '/api/data/' + taskDef.context + '/' + taskDef.entity;
   }

  function handleTaskResult(taskDef, result) {
    if (result.length == 0) {
      console.log('Done ' + taskDef.name + ': No results to send');
      return;
    }
    try {
      post(dashUrl(taskDef), result, function () {
        console.log('Done ' + taskDef.name + ': with ' + result.length + ' result(s)');
      });
    } catch (e) {
      throw new Error('Could insert data in dash: ' + e);
    }
  }

  function tearDown(error) {
    if (error) {
      console.log(error);
    }
    cb();
  }

  try {
    console.log();
    console.log('Starting task' + taskDef.name);
    get(dashUrl(taskDef) + '/last-timestamp', function (timestamp) {
      try {
        taskDef.execute(timestamp, function (result) {
          handleTaskResult(taskDef, result);
          tearDown();
        });
      } catch (e) {
        tearDown("Error: " + e.toString());
      }
    }, function () {
      tearDown("Failed to retrieve timestamp (Dash server problem)");
    });
  } catch (e) {
    tearDown("Error: " + e.toString());
  }

};