module.exports = function (dashConfig) {
  var taskExecutor = require('./task-executor');
  if (!dashConfig.url) {
    throw new Error("Missing dash url");
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

    taskExecutor(dashConfig, next, function() {
      timestamps[taskDef.name] = new Date().getTime();
      active.splice(active.indexOf(taskDef), 1);
      handleTasksInQueue();
    });
  }

  function shouldQueueTask(taskDef) {
    return !timestamps[taskDef.name] || (timestamps[taskDef.name] + taskDef.interval * 1000) < new Date().getTime();
  }

  function updateTasks() {
    taskDefs.forEach(function (taskDef) {
      if (shouldQueueTask(taskDef)) {
        addToQueue(taskDef);
      }
    });

    console.log('Update Tasks...');
    triggerQueue();
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