(A work in progress...)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/taitulism/newTask.svg?branch=develop)](https://travis-ci.org/taitulism/newTask)

new-reporter
============
A politically-incorrect alternative to orchestrate callback hell.




Usage
-----
###Basic:
```js
const newReporter = require('new-reporter');

const mainReporter = newReporter(reporterName, totalTasks, callback}); // "totalTasks" default is: 1
```

Params
------
* **reporterName** - String, optional. default = `'reporter_i'` ("i" is an incrementing number)  
Give a reporter a name (e.g. `'main-reporter'`).  
Good for debugging.

* **totalTasks** - Number, optional. default = `1`  
How many tasks should this reporter expects to be done before calling the `callback`?

* **callback** - Function, must.  
A function to run when all of the reporter's tasks reported done.  
This function gets called with the reporter's `data` object.




API
---
* **.taskDone()**  
Call this method N times to make the reporter run its `callback` function, where "N" is the 
reporter's`totalTasks`.
This function gets no arguments.

* **.subReporter(name, totalTasks)**
Returns a sub-reporter that when it's done, will run the current reporter's `.taskDone()` method.  
Use a sub-reporter when a task can be splitted into sub-tasks.  
For example: Your main reporter is expecting 2 tasks to be done: one is a simple task but the second
needs to do two things (two sub-tasks). In this case, create a sub-reporter for the second task. Call `mainReporter.taskDone()` 
when the simple task is done, and call `subReporter.taskDone()` twice, one for each of the second task's
sub-tasks.




Examples
--------
A reporter will run its callback function when it has been reported done with `.taskDone()` as many times as 
its given limit (`totalTasks`):
```js
const newReporter = require('new-reporter');

function callback (data) {
  console.log('all done');
}

const mainReporter = newReporter(3, callback});

mainReporter.taskDone(); // 1
mainReporter.taskDone(); // 2
mainReporter.taskDone(); // 3 --> runs callback
```




Sub-Reporter
------------
A Reporter can have sub-reporters:
```js
const mainReporter = newReporter(3, callback);
const subReporter1 = mainReporter.subReporter(1); 
const subReporter2 = mainReporter.subReporter(1);
const subReporter3 = mainReporter.subReporter(1);
```

***NOTE 1**: `totalTasks`'s default value is 1*   
***NOTE 2**: Creating a sub-reporter for only one job is a redundant overhead.* 

A a sub-reporter doesn't need a callback because when it's done, it calls its parent's `.taskDone()` method:
```js
const newReporter = require('new-reporter');

function callback (data) {
  console.log('all done');
}

const mainReporter = newReporter(callback);
const subReporter = mainReporter.subReporter();
const grandSubReporter = subReporter.subReporter();

grandSubReporter.taskDone(); // calls subReporter.taskDone() and eventually mainReporter.taskDone()
```




Reporter.data
-------------
The `data` prop is shared between a reporter and all of its sub-reporters and their sub-reporters.  
It starts as an empty object so you could load it with your own props:
```js
const newReporter = require('new-reporter');

function callback (data) {
  console.log(data); // --> {myKey:'myValue'}
}

const mainReporter   = newReporter(1, callback});
const subReporter    = mainReporter.subReporter(1);
const grandSubReporter = subReporter.subReporter(1);

grandSubReporter.data.myKey = 'myValue';

mainReporter.data.myKey === 'myValue' // true

grandSubReporter.taskDone();
```




A "Real Life" Use Case
----------------------
The callback gets called after an ajax request and reading all files in a certain folder:
```js
const newReporter = require('new-reporter');

function fetchData (mainReporter) {
  const requestUrl = mainReporter.data.url;

  ajax.get(requestUrl, (response) => { // made up async function
    mainReporter.data.response = response;
    mainReporter.taskDone();
  });
}

function getAllFilesContents (mainReporter) {
  const folderPath = mainReporter.data.folder;
  
  getFilesList(folderPath, (files) => { // made up async function
    const subReporter = mainReporter.subReporter(files.length);
    
    subReporter.data.contents = [];

    files.forEach((file) => {
      readFileContent(file, subReporter);
    });
  });
}

function readFileContent (file, subReporter) {
  readFile(file, (content) => { // made up async function
    subReporter.data.contents.push(content);
    subReporter.taskDone();
  });
}

function callback (data) {
  console.log(data);
}


function getAllData () {
    const mainReporter = newReporter(2, callback);

    mainReporter.data = {
        url: '/url',
        folder: '/path/to/folder'
    };

    fetchData(mainReporter);           // 1
    getAllFilesContents(mainReporter); // 2
}

getAllData();

/*
  callback's data: 
  {
    url: '/url',
    folder: '/path/to/folder',
    response: {...},
    contents: [...]
  }
*/
```

