'use strict';

const figureOutParams     = require('./figure-out-params');
const validate            = require('./validators');
const createNameGenerator = require('./name-generator');

const generateName = createNameGenerator('reporter', '_');

const {EXTRA_REPORTED_DONE_ERR} = require('./error-constants');

module.exports = Reporter;

/* ------------- *
    Constructor
 * ------------- */
function Reporter (_name, _totalTasks, _callback) {
    const [name, totalTasks, callback] = figureOutParams(_name, _totalTasks, _callback);

    validate.totalTasks(totalTasks);
    validate.callback(callback);

    this.name = name;
    this.done = 0;
    this.data = {};
    this.totalTasks = totalTasks;
    this.callback   = callback;
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
