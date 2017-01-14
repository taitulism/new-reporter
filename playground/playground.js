const fs   = require('fs');
const path = require('path');

const newReporter = require('../');

getFolderTotalSize('lib', (data) => {
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


