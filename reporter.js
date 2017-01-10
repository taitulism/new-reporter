'use strict';

module.exports = newReporter;

function newReporter (totalTasks, callback) {
    if (typeof totalTasks === 'function' && !callback) {
        callback = totalTasks;
        totalTasks = 1;
    }

    validateTotalTasks(totalTasks);
    validateCallback(callback);

    return new Reporter(totalTasks, callback);
}

const NO_ARGS_ERR                  = 'newReporter needs at least one argument to run: newReporter (totalTasks, callback)';
const EXTRA_REPORTED_DONE_ERR      = 'A Reporter has reported "done" too many times.';
const TOTALTASKS_IS_NOT_NUMBER_ERR      = 'newReporter first argument should be a number: newReporter (<totalTasks:number>, <callback:Task/function>)';
const CALLBACK_IS_NOT_FUNCTION_ERR = 'newReporter second argument should be a function: newReporter (<totalTasks:number>, <callback:Task/function>)';

function validateTotalTasks (totalTasks) {
    if (!totalTasks) {
        throw new ReferenceError(NO_ARGS_ERR);
    }

    if (typeof totalTasks !== 'number') {
        throw new TypeError(TOTALTASKS_IS_NOT_NUMBER_ERR);
    }
}

function validateCallback (callback) {
    if (typeof callback !== 'function') {
        throw new TypeError(CALLBACK_IS_NOT_FUNCTION_ERR);
    }
}


/* ------------- *
    Constructor
 * ------------- */
function Reporter (totalTasks, callback) {
    this.done = 0;
    this.data = {};
    this.totalTasks = totalTasks;
    this.callback   = callback;
}

/* ----------- *
    Prototype
 * ----------- */
const ReporterProto = Reporter.prototype;

ReporterProto.subReporter = function (totalTasks = 1) {
    validateTotalTasks(totalTasks);

    const subReporter = new Reporter(totalTasks, () => {
        this.taskDone();
    });

    subReporter.data = this.data;

    return subReporter;
};

ReporterProto.taskDone = function () {
    this.done++;

    const done  = this.done;
    const total = this.totalTasks;

    if (done < total) {
        return;
    }
    else if (done === total) {
        this.callback(this.data);
    }
    else { // (done > total)
        throw new RangeError(`${EXTRA_REPORTED_DONE_ERR}\nTotal Tasks:${this.totalTasks}\nDone:${this.done}`);
    }
};
