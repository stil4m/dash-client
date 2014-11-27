# Dash Client

This Dash Client can be used to add data to a Dash Server.

It can be used as 

## Simple run

```
//Setup runner
var Runner = new require('dash-client').Runner;
var runner = new Runner({ url : 'http://your-dash-url'});

//Add tasks
runner.addTask('context', 'entity', function(lastTimestamp, cb) {
  console.log("The last data in dash for the context", context ,"and entity", entity, "is: ", lastTimestamp);
  
  //Call the callback with an Array of the data that should be added to Dash (conform to the dash specified format)
  cb([{
    key : 'OVER',
    value : 9000,
    timestamp : new Date().getTime()
  }]);
});

//Start
runner.start();
```


## Cron

You can add the cron option to the start function to make the Runner execute as a cron and use the intervals.

```
var myTask = function(lastTimestamp, cb) {
	...
};

//Add a task with an interval of 5 minutes
runner.addTask('context', 'entity', myTask, { interval : 300});

//Start the runner as cron
runner.start({cron : true});
```