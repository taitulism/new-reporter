const fs   = require('fs');
const path = require('path');

const newReporter = require('../');

getFolderTotalSize('lib', ({totalSize}) => {
    console.log(totalSize);
});

// -----------------------------------------------------------------

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
