
A "Real Life" Use Case
----------------------
**getFolderTotalSize**:  
To do that you need:
1. `fs.readdir` to get the list of the files (to aviod recusion in this example, let's say there are 
no sub-folders, only files).
2. forEach file: `fs.stat` to get the size of each file and add to the total.

Doing this natively, you'll come across two problems:
1. how to track the last file stat action. 
2. how to pass data (`totalSize` in this case) between the two functions: `getFolderTotalSize` and `forEachFile` .

To address the first issue you'll need some kind of counter (to match the file list length).

(you'll need some kind 
of counter) 

```js
const fs   = require('fs');
const path = require('path');

const newReporter = require('new-reporter');

getFolderTotalSize('path/to/target/folder', (data) => {
    console.log(data.totalSize);
});

function getFolderTotalSize (folderPath, userCallback) {
    fs.readdir(folderPath, (err, files) => {
        const reporter = newReporter(files.length, userCallback);

        reporter.data.totalSize = 0;

        files.forEach((file) => {
            const filePath = path.join(folderPath, file);

            forEachFile(reporter, filePath);
        });
    });
}

function forEachFile (reporter, filePath) {
    fs.stat(filePath, (err, stat) => {
        reporter.data.totalSize += stat.size;
        reporter.taskDone();
    });
}
```
