
How to get folder size in Node
==============================
Let's say you want to create an async function to calculate a given folder's size. It basically needs two arguments: the target folder path, and a callback to run when the total size is ready:

```js
getFolderTotalSize(folderPath, (totalSize) => {
    console.log(totalSize);
});
```

To do that in Node.js you'll need to sum up the size of all files inside the target folder individually.

***NOTE**: To avoid handling recusion in this example, let's say there are no sub-folders in the folder, only files.*

You do this by:  
1. Initiating `totalSize = 0;`. You will add each file size to this total.  
2. Running `fs.readdir` to get the list of the files.  
3. Creating a files counter like: `countDown = files.length`.  
4. Do forEach file: `fs.stat` to get the file size and add to `totalSize`. 
    1. decrement the `countDown` by 1.  
    2. if `countDown` reached 0 - run the callback.

```js
const fs   = require('fs');
const path = require('path');

function getFolderTotalSize (folderPath, userCallback) {
    let totalSize = 0;

    fs.readdir(folderPath, (err, files) => {
        // always handle errors

        let countDown = files.length;

        files.forEach((file) => {
            const filePath = path.join(folderPath, file);

            fs.stat(filePath, (err, stat) => {
                totalSize += stat.size;

                countDown--;

                if (countDown === 0) {
                    userCallback(totalSize);
                }
            });
        });
    });
}
```

Why use a counter and not the file's index?
-------------------------------------------
Because with async code (`fs.stat`) running inside a synced `forEach` loop, the index will reach the end before all the files have been actually stated. Node is like: "Tell me what to do and I'll get back to you on this". You send Node to stat your files individually, but you don't know when it's done with all of them so each file stat callback needs a check to see if it's the last callback.


Callback Hell
-------------
Now we want to make our lives a bit easier and take care of this [callback hell](http://callbackhell.com) by splitting our code into pieces (named functions instead of anonymous functions).

Trying to do so, you'll find yourself with something like:

```js
/* (THIS CODE DOESN'T WORK) */

const fs   = require('fs');
const path = require('path');

function getFolderTotalSize (folderPath, callback) {
    let totalSize = 0;

    fs.readdir(folderPath, (err, files) => {
        // always handle errors

        /* 
            we need the to pass:
              * `files`      - to iterate over,
              * `folderPath` - to resolve each file path with,
              * `totalSize`  - to update
              * `callback`   - to run when we're done.
        */
        sumUpAllFilesSize(files, folderPath, totalSize, callback);
    });
}

function sumUpAllFilesSize (files, folderPath, totalSize, callback) {
    let countDown = files.length;

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);

        forEachFile(filePath, totalSize, countDown);
    });
}

function forEachFile (filePath, totalSize, countDown) {
    fs.stat(filePath, (err, stat) => {
        // always handle errors

        totalSize += stat.size;

        countDown--;

        if (countDown === 0) {
            callback(totalSize);
        }
    });
}
```
**But, hey! wait a minute!**  
Even if we're ok with all of the arguments flying all over the place, we still can't update `totalSize` and `countDown` because primitive data types like numbers are passed by value so they will only change in `forEachFile()`'s scope.

You could expose those variables to the outer scope but then you'll have to wrap it with another scope, otherwise `totalSize` and `countDown` will be shared between multiple `getFolderTotalSize` calls. Not good.

So here are our two main issues:
1. how to track the last action to call the final callback?  
2. how to share data easily between functions without passing too many arguments?



Enter New-Reporter!
-------------------
A reporter waits for all of its tasks to report done. When the last task reports done, it runs its callback. It also has a data object for you to store your props on.

That's how reporters address the issues mention above.

```js
const fs   = require('fs');
const path = require('path');

const newReporter = require('new-reporter');

function getFolderTotalSize (folderPath, callback) {
    fs.readdir(folderPath, (err, files) => {
        // always handle errors

        const reporter = newReporter(files.length, callback);

        reporter.data.totalSize  = 0;
        reporter.data.folderPath = folderPath;

        sumUpAllFilesSize(files, reporter);
    });
}

function sumUpAllFilesSize (files, reporter) {
    const {folderPath} = reporter.data;

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);

        forEachFile(filePath, reporter);
    });
}

function forEachFile (filePath, reporter) {
    fs.stat(filePath, (err, stat) => {
        if (err) {
            reporter.taskFail(err);
            return;
        }

        reporter.data.totalSize += stat.size;
        reporter.taskDone();
    });
}
```

On creation, a reporter gets a total tasks number and a callback:
```js
const reporter = newReporter(files.length, callback);
```
The `files.length` number is for the counter functionality.

And as for the data, it hold a `data` object (starts as an empty object `{}`).  

```js
const data = reporter.data;

data.totalSize  = 0;
data.folderPath = folderPath;
```



Now you can call your `getFolderTotalSize` like:
```js
getFolderTotalSize('path/to/folder', (err, data) => {
    // always handle errors

    console.log(data.totalSize);
});
```