
module.exports = function (dashConfig) {
  if (!dashConfig.url) {
    throw new Error("Missing dash url");
  }

  var util = require('./util/common');
  var taskExecutor = require('./task-executor');
  var DashIntegration = require('./dash-integration');
  var dashIntegration = new DashIntegration(dashConfig);

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

    taskExecutor(dashIntegration, next).then(function() {
      timestamps[next.name] = new Date().getTime();
      active.splice(active.indexOf(next), 1);
      handleTasksInQueue();
    });
  }

  function shouldQueueTask(taskDef) {
    return !timestamps[taskDef.name] || (timestamps[taskDef.name] + taskDef.interval * 1000) < new Date().getTime();
  }

  function updateTasks() {
    taskDefs.forEach(function (taskDef) {
      if (shouldQueueTask(taskDef)) {
        util.log.info('Add to queue:', taskDef.name);
        addToQueue(taskDef);
      }
    });

    util.log.info('Start update tasks');
    triggerQueue();
  }


  this.addTask = function (context, entity, trigger, opts) {
    opts = opts || {};
    opts.interval = opts.interval || 300;

    taskDefs.push({
      context : context,
      entity : entity,
      name : opts.name || (context + '-' + entity),
      trigger : trigger,
      interval : opts.interval
    })
  };

  this.start = function (opts) {
    opts = opts || { cron  : false};
    if (opts.cron) {
      setInterval(updateTasks, 1000);
    }
    updateTasks();
  }
};
