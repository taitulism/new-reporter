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
const Reporter = require('new-reporter');

const mainReporter = new Reporter(totalTasks, callback}); // "totalTasks" default is: 1
```

A reporter will run its callback function when it has been reported done with `.taskDone()` as many times as its given limit (`totalTasks`):
```js
const new Reporter = require('new-reporter');

function callback (data) {
  console.log('all done');
}

const mainReporter = new Reporter(3, callback});

mainReporter.taskDone(); // 1
mainReporter.taskDone(); // 2
mainReporter.taskDone(); // 3 --> runs callback
```




Sub-Reporter
------------
A Reporter can have sub-reporters:
```js
const mainReporter = new Reporter(3, callback});
const subReporter1 = mainReporter.subReporter(1);
const subReporter2 = mainReporter.subReporter(1);
const subReporter3 = mainReporter.subReporter(1);
```

When a sub-reporter is done, it calls its parent's `.taskDone()` method so it doesn't need a callback:
```js
const Reporter = require('new-reporter');

function callback (data) {
  console.log('all done');
}

const mainReporter   = new Reporter(callback});
const subReporter    = mainReporter.subReporter();
const subSubReporter = subReporter.subReporter();

subSubReporter.taskDone(); // calls subReporter.taskDone() and eventually mainReporter.taskDone()
```




Reporter.data
-------------
The `data` prop is shared between a reporter and all of its sub-reporters and their sub-reporters.  
It starts as an empty object so you could load it with your own props:
```js
const Reporter = require('new-reporter');

function callback (data) {
  console.log(data); // --> {myKey:'myValue'}
}

const mainReporter   = new Reporter(1, callback});
const subReporter    = mainReporter.subReporter(1);
const subSubReporter = subReporter.subReporter(1);

subSubReporter.data.myKey = 'myValue';

subSubReporter.taskDone();
```




A "Real Life" Use Case
----------------------
The callback gets called after an ajax request and reading all files in a certain folder:
```js
const Reporter = require('new-reporter');

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
  /*
    {
      url: '/url',
      folder: '/path/to/folder',
      response: {...},
      contents: [...]
    }
  */
}


function getAllData () {
    const mainReporter = new Reporter(2, callback);

    mainReporter.data = {
        url: '/url',
        folder: '/path/to/folder'
    };

    fetchData(mainReporter);           // 1
    getAllFilesContents(mainReporter); // 2
}

getAllData();
```

