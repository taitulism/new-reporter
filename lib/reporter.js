'use strict';

const figureOutParams = require('./figure-out-params');
const generateName    = require('./name-generator');
const validate        = require('./validators');

const error = require('./errors');

module.exports = newReporter;

function newReporter (_name, _totalTasks, _callback) {
    const [name, totalTasks, callback] = figureOutParams(_name, _totalTasks, _callback);

    return new Reporter(name, totalTasks, callback);
}

/* ------------- *
    Constructor
 * ------------- */
function Reporter (name, totalTasks, callback) {
    this.name = name;
    this.done = 0;
    this.data = {};
    this.totalTasks = totalTasks;
    this.callback   = callback;

    validate.totalTasks(this);
    validate.callback(this);
}

/* ----------- *
    Prototype
 * ----------- */
const ReporterProto = Reporter.prototype;

ReporterProto.subReporter = function (name, totalTasks = 1) {
    if (typeof name === 'number') {
        totalTasks = name;
        name = generateName();
    }

    validate.totalTasks(this);

    const subReporter = new Reporter(name, totalTasks, () => {
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
        // throw new RangeError(`${EXTRA_REPORTED_DONE_ERR}\nTotal Tasks:${this.totalTasks}\nDone:${this.done}`);
        error.extraReportedDone(this);
    }
};
