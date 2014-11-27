var Runner = require('./runner');
var runner = new Runner({ url : 'http://vm267.insight.sbp.avisi.nl:8080/dash'});
runner.addTask('more', 'weekly-by-customer', 300, require('./tasks/weekly-by-customer'));

runner.start(true);
