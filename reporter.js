'use strict';

module.exports = newReporter;

function newReporter (tasks, callback) {
    if (typeof tasks === 'function' && !callback) {
        callback = tasks;
        tasks = 1;
    }

    validateTotalTasks(tasks);
    validateCallback(callback);

    return new Reporter(tasks, callback);
}

const NO_ARGS_ERR                  = 'newReporter needs at least one argument to run: newReporter (tasks, callback)';
const EXTRA_REPORTED_DONE_ERR      = 'A Reporter has reported "done" too many times.';
const TASKS_IS_NOT_NUMBER_ERR      = 'newReporter first argument should be a number: newReporter (<tasks:number>, <callback:Task/function>)';
const CALLBACK_IS_NOT_FUNCTION_ERR = 'newReporter second argument should be a function: newReporter (<tasks:number>, <callback:Task/function>)';

function validateTotalTasks (tasks) {
    if (!tasks) {
        throw new ReferenceError(NO_ARGS_ERR);
    }

    if (typeof tasks !== 'number') {
        throw new TypeError(TASKS_IS_NOT_NUMBER_ERR);
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
function Reporter (tasks, callback) {
    this.done = 0;
    this.data = {};
    this.totalTasks = tasks;
    this.callback   = callback;
}

/* ----------- *
    Prototype
 * ----------- */
const ReporterProto = Reporter.prototype;

ReporterProto.subReporter = function (tasks = 1) {
    validateTotalTasks(tasks);

    const subReporter = new Reporter(tasks, () => {
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
