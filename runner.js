var get = require('./util/get');
var post = require('./util/post');

module.exports = function (dashConfig) {
  if (!dashConfig.url) {
    throw new Error("Missing dash url");
  }

  function dashUrl(taskDef) {
    return dashConfig.url + '/api/data/' + taskDef.context + '/' + taskDef.entity;
  }

  var taskDefs = [];
  var timestamps = {};
  var queue = [];
  var inProgress = false;
  var active = [];

  function addToQueue(taskDef) {
    if (queue.indexOf(taskDef) == -1 && active.indexOf(taskDef) == -1) {
      queue.push(taskDef);
    }
  }

  function triggerQueue() {
    if (inProgress) {
      return;
    }
    inProgress = true;
    handleTasksInQueue();
  }

  function handleTasksInQueue() {
    var next = queue.shift();
    active.push(next);
    if (!next) {
      inProgress = false;
      return;
    }
    handleTask(next, handleTasksInQueue);
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

  function handleTask(taskDef, cb) {
    function tearDown() {
      timestamps[taskDef.name] = new Date().getTime();
      active.splice(active.indexOf(taskDef), 1);
      cb();
    }

    try {
      console.log();
      console.log('Starting task' + taskDef.name);
      get(dashUrl(taskDef)+'/last-timestamp', function (timestamp) {
        try {
          taskDef.execute(timestamp, function (result) {
            handleTaskResult(taskDef, result);
            tearDown();
          });
        } catch (e) {
          console.log("Error: " + e);
          tearDown();
        }
      }, function() {
        console.log("Failed to retrieve timestamp (Dash server problem)");
        tearDown();
      });
    } catch (e) {
      console.log("Error: " + e);
      tearDown();
    }
  }

  function updateTasks() {
    taskDefs.forEach(function (taskDef) {
      if (!timestamps[taskDef.name]) {
        addToQueue(taskDef);
      } else if ((timestamps[taskDef.name] + taskDef.interval * 1000) < new Date().getTime()) {
        addToQueue(taskDef);
      }
    });

    triggerQueue();
    console.log('Update Tasks...');
  }


  this.addTask = function (context, entity, trigger, opts) {
    opts = opts || {};
    opts.interval = opts.interval || 300;

    taskDefs.push({
      context : context,
      entity : entity,
      name : opts.name || (context + '/' + entity),
      trigger : trigger
    })
  };

  this.start = function (opts) {
    opts = opts || { cron  : false};
    if (opts.cron) {
      setInterval(updateTasks, 5000);
    }
    updateTasks();
  }
};