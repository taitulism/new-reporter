(A work in progress...)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/taitulism/newTask.svg?branch=develop)](https://travis-ci.org/taitulism/newTask)

new-reporter
============
A politically-incorrect alternative to orchestrate callback hell.  
But hey! It's easier to debug!



Usage
-----
```js
const newReporter = require('new-reporter');

function myCallback (data) {
  console.log('all done');
}

const myReporter = newReporter(3, myCallback);

// sometime later...
myReporter.taskDone(); // 1
// ...
myReporter.taskDone(); // 2
// ...
myReporter.taskDone(); // 3 --> runs myCallback
```
A reporter will run its callback function when it has been reported done as many times as its given limit.



Params
------
```js
newReporter(reporterName, totalTasks, callback);
```

* **reporterName** - String, optional.  
Default value = `'reporter_[i]'` ("i" is an incrementing number, without the square brackets)  
Give a reporter a name (e.g. `'main-reporter'`).  
Good for debugging.

* **totalTasks** - Number, optional.  
Default value = `2`  
The number of tasks to complete before calling the `callback`.

* **callback** - Function, required.  
A function to run when all of the reporter's tasks reported done.  
This function follows Node's known ["Error-First"](#http://fredkschott.com/post/2014/03/understanding-error-first-callbacks-in-node-js/) callback convention: it gets called with two arguments: `(error, data)`. If everything is ok then `error=null` and data is a data object.



Reporter API
------------
* **taskDone(key, value)**  
Call this method N times to make the reporter run its `callback` function, where "N" is the reporter's given `totalTasks` param.  
The `key` & `value` are optional arguments. Passing them to `.taskDone()` will set them on the reporter's shared `data` object.
  * **key** - String.
  * **value** - Any type.

* **taskFail(error)**  
Calls the reporter's callback function with `error` as its first argument and `null` as its second argument (`data=null`).

* **subReporter(reporterName, totalTasks)**  
Creates a sub-reporter. Use a sub-reporter when a task can be splitted into sub-tasks.



Sub-Reporter
------------
A Reporter can have sub-reporters:
```js
const parentReporter = newReporter(callback);
const childReporter1 = parentReporter.subReporter(2); 
const childReporter2 = parentReporter.subReporter( ); // also 2
```

>**NOTE**: *`totalTasks` default value is `2`*   

A sub-reporter doesn't need a callback because when it's done it calls its parent's `.taskDone()` method:

```js
const newReporter = require('new-reporter');

function callback () {
  console.log('all done');
}

const grandReporter  = newReporter(callback);
const parentReporter = grandReporter.subReporter(1);
const childReporter  = parentReporter.subReporter(1);

childReporter.taskDone();
// this will call parentReporter.taskDone() and then grandReporter.taskDone()
```

>**NOTE**: *Creating a sub-reporter for only one job is a redundant overhead.* 

**When to use sub-reporters?**  
When your async task can be split into sub-tasks.

A use case: Your main reporter is expecting 2 tasks to be done: one is a simple task but the second needs to do two things. In this case, create a sub-reporter for the second task. Call `mainReporter.taskDone()` when the simple task is done, and call `subReporter.taskDone()` twice, one for each of the second task's sub-tasks.

[See some real life use-cases](./docs/use-cases/getFolderTotalSize.md)



Shared Data
-----------
Each reporter starts with a `data` property which is an empty object:

```js
const newReporter = require('new-reporter');

const reporter = newReporter();

console.log(reporter.data) // {}

```

This object is shared between reporters and their sub-reporters and passed to the callback function when all tasks are done.  

Use it to pass your own props:

```js
const newReporter = require('new-reporter');

function callback (data) {
  console.log('log:', data);
}

const grandReporter  = newReporter(callback);
const parentReporter = grandReporter.subReporter(1);
const childReporter  = parentReporter.subReporter(1);

grandReporter.data.myKey = 'myValue';

parentReporter.data.myKey === 'myValue' // true

// you could also do: 
childReporter.taskDone('myKey', 'myValue');

/*
  log: {myKey:'myValue'}
*/
```


*REMEMBER: By using `new-reporter` you choose data sharing over repeatative argument passing. You only take what you need.*



.taskFail(err)
--------------
Use this method to call the callback function immediately with an error:
```js
const fs = require('fs');

const reporter = require('new-reporter');

const fileReporter = reporter(callback);

fs.readFile('NON/EXIST/FILE.ext', (err, content) => {
  if (err) {
    fileReporter.taskFail(err);
  }
  else {
    fileReporter.taskDone('fileContent', content);
  }
});

// ...
```
