const fs   = require('fs');
const path = require('path');

const newReporter = require('../');


function getFolderTotalSize1 (folderPath, callback) {
    // const x = path.resolve(folderPath)
    // console.log(x);
    fs.readdir(folderPath, (err, files) => {
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

getFolderTotalSize1('/home/taitu/code/repos/new-reporter/test', (err, {totalSize}) => {
    console.log(err);
    console.log(totalSize);
});

// -----------------------------------------------------------------


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

// getFolderTotalSize('/home/taitu/code/repos/new-reporter/test', (data) => {
//     console.log(data);
// })
