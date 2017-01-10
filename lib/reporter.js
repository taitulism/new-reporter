'use strict';

const validate = require('./validators');

const {
    NO_ARGS_ERR,
    EXTRA_REPORTED_DONE_ERR,
    TOTALTASKS_IS_NOT_NUMBER_ERR,
    CALLBACK_IS_NOT_FUNCTION_ERR,
} = require('./error-constants');

module.exports = Reporter;

/* ------------- *
    Constructor
 * ------------- */
function Reporter (totalTasks, callback) {
    if (typeof totalTasks === 'function' && !callback) {
        callback = totalTasks;
        totalTasks = 1;
    }

    validate.totalTasks(totalTasks);
    validate.callback(callback);

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
    validate.totalTasks(totalTasks);

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
