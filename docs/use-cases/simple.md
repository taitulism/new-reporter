
getFolderTotalSize
------------------
Let's say you want to create an async `getFolderTotalSize()` function in node. It will get two 
params: the target folder path, and a callback to run when the total size is ready:
```js
getFolderTotalSize(folderPath, (totalSize) => {
    console.log(totalSize);
});
```

To do that you need to sum up the file size of all files inside the target folder.

***NOTE**: To avoid handling recusion in this example, let's say there are no sub-folders in the folder, only files.*

You do this by:
1. declaring `totalSize = 0;`
2. running `fs.readdir` to get the list of the files.
3. decalring a `countDown = files.length;`
4. forEach file: `fs.stat` to get the size of each file and add to the `totalSize`.
    1. decrease the `countDown` by 1.
    2. check if `countDown` reaches 0 to run the callback.

```js
const fs   = require('fs');
const path = require('path');

function getFolderTotalSize (folderPath, userCallback) {
    let totalSize = 0;

    fs.readdir(folderPath, (err, files) => {
        // always handle errors

        let countDown = files.length;

        files.forEach((file, index) => {
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

**Why use a countDown counter and not the file's index?**  
Because with async code running inside a sync `forEach` loop, the index will reach the end before 
all the files have been stated.

Now we want to make our lives a bit easier and take care of this [callback hell](http://callbackhell.com) by 
splitting our code into pieces (named function instead of anonymous functions).

Trying to do so, you'll find yourself with something like:

```js
function getFolderTotalSize (folderPath, userCallback) {
    let totalSize = 0;

    fs.readdir(folderPath, (err, files) => {
        /* 
            because you need the `files` to iterate over, `folderPath` to resolve each file path with, 
            the `totalSize` to update and of course the final `userCallback` to run when you're done.
        */
        sumUpAllFilesSize(files, folderPath, totalSize, userCallback);
    });
}

function sumUpAllFilesSize (folderPath, files, totalSize, userCallback) {
    let countDown = files.length;

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);

        forEachFile(filePath, totalSize, countDown);
    });
}

function forEachFile (filePath, totalSize, countDown) {
    fs.stat(filePath, (err, stat) => {
        totalSize += stat.size;

        countDown--;

        if (countDown === 0) {
            userCallback(totalSize);
        }
    });
}
```
But, hey! wait a minute!  
Even if I'm ok with all of the arguments flying all over the place, I still can't update `totalSize` and `countDown` 
because primitive data types like numbers are passed by value so they will only change in `forEachFile()`'s scope.

So here are our two main issues:
1. how to track the last file stat action, to call the final callback. 
2. how to share data easily between nested scopes without passing too many arguments?

Enter New-Reporter!
-------------------
A reporter is like a manager that waits for its tasks to report done. When the last task reports done, it runs
its callback. It also has a data object for you to store your props on.

```js
const fs   = require('fs');
const path = require('path');

const newReporter = require('new-reporter');

function getFolderTotalSize (folderPath, userCallback) {
    fs.readdir(folderPath, (err, files) => {
        // always handle errors

        const reporter = newReporter(files.length, userCallback);

        reporter.data.totalSize  = 0;
        reporter.data.folderPath = folderPath;

        sumUpAllFilesSize(files, reporter);
    });
}

function sumUpAllFilesSize (files, reporter) {
    const folderPath = reporter.data.folderPath;

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);

        forEachFile(filePath, reporter);
    });
}

function forEachFile (filePath, reporter) {
    fs.stat(filePath, (err, stat) => {
        // always handle errors

        reporter.data.totalSize += stat.size;
        reporter.taskDone();
    });
}
```

On creation, it gets a total tasks number and a callback:
```js
const reporter = newReporter(files.length, userCallback);
```
This `files.length` number is for the counter functionality.

And as for the data, it hold a `.data` object (starts as an empty object `{}`).  
You can cache the `data` as a variable and use es6 spread feature to keep stuff DRY:

```js
const data = reporter.data;

data.totalSize  = 0;
data.folderPath = folderPath;
```
```js
const {totalSize, folderPath} = reporter.data;
```

*REMEMBER: By using `new-reporter` you choose data sharing over repeatative argument passing. You only take what you need.*