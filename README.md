(A work in progress...)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/taitulism/newTask.svg?branch=develop)](https://travis-ci.org/taitulism/newTask)

newTask
=======
Create tasks and sub-tasks to help your async code.

A non-elegant alternative to EventEmitter/PubSub but easier to debug with.

Usage
-----
A task will run its callback function when it has been reported done (`Task.reportDone()`) as many times as its given limit:
```js
const newTask = require('newTask');

function callback (data) {
  console.log('all done');
}

const mainTask = newTask(3, callback});

mainTask.reportDone(); // 1
mainTask.reportDone(); // 2
mainTask.reportDone(); // 3 --> runs callback
```


Sub-Task
--------
When a sub-task is done it calls its parent's `.reportDone()` method.
```js
const newTask = require('newTask');

function callback (data) {
  console.log(data); // --> {myKey:'myValue'}
}

const mainTask   = newTask(1, callback});
const subTask    = mainTask.newTask(1);
const subSubTask = subTask.newTask(1);

subSubTask.data.myKey = 'myValue';

subSubTask.reportDone();
```



Task.data
---------
The `data` prop is shared between a task and all of its sub-tasks and their sub-tasks.
```js
const newTask = require('newTask');

function callback (data) {
  console.log(data); // --> {myKey:'myValue'}
}

const mainTask   = newTask(1, callback});
const subTask    = mainTask.newTask(1);
const subSubTask = subTask.newTask(1);

subSubTask.data.myKey = 'myValue';

subSubTask.reportDone();
```

A "Real Life" Use Case
----------------------
The callback gets called after an ajax request and reading all files in a certain folder:
```js
const newTask = require('newTask');

function fetchData (mainTask) {
  const requestUrl = mainTask.data.url;

  ajax.get(requestUrl, (response) => { // made up async function
    mainTask.data.response = response;
    mainTask.reportDone();
  });
}

function getAllFilesContents (mainTask) {
  const folderPath = mainTask.data.folder;
  
  getFilesList(folderPath, (files) => { // made up async function
    const subTask = mainTask.newTask(files.length);
    
    subTask.data.contents = [];

    files.forEach((file) => {
      readFileContent(file, subTask);
    });
  });
}

function readFileContent (file, subTask) {
  readFile(file, (content) => { // made up async function
    subTask.data.contents.push(content);
    subTask.reportDone();
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
    const mainTask = newTask(2, callback);

    mainTask.data = {
        url: '/url',
        folder: '/path/to/folder'
    };

    fetchData(mainTask);           // 1
    getAllFilesContents(mainTask); // 2
}

getAllData();
```

