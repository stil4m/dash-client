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
  var queue = {};

  var reports = {

  };

  function addTransaction(name, start, end, state, results) {
    var report = reports[name] || (reports[name] = {
      name : name,
      transactions : [],
      lastErrorState : null,
      lastSuccessState : null,
      lastResultState : null
    });
    var transactions = report.transactions;

    if (state == 'ERROR') {
      report.lastErrorState = start;
    }
    if (state == 'SUCCESS') {
      report.lastSuccessState = start;
    }
    if (results > 0) {
      report.lastResultState = start;
    }
    transactions.push({start : start, end : end, duration : end.getTime() - start.getTime(), state : state, results : results});
    if (transactions.length > 100) {
      transactions.shift();
    }
  }

  function addToQueue(taskDef) {
    if (queue[taskDef.name]) {
      return;
    }
    queue[taskDef.name] = taskDef;
    util.log.info('Add to queue:', taskDef.name);
    timestamps[taskDef.name] = new Date().getTime();

    var start = new Date();
    taskExecutor(dashIntegration, taskDef).then(function (result) {
      util.log.info('Finished task:', taskDef.name);
      delete queue[taskDef.name];
      console.log(result.state, result.results);
      addTransaction(taskDef.name, start, new Date(), result.state, result.results);
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
    opts = opts || { cron : false};
    if (opts.cron) {
      setInterval(updateTasks, 1000);
    }
    updateTasks();
  };
};
