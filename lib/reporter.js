'use strict';

const validateParams = require('./validate-params');
const error          = require('./errors');

const validateParamsMain = validateParams.main;
const validateParamsSub  = validateParams.sub;

module.exports = newReporter;

function newReporter (_name, _totalTasks, _callback) {
    const [name, totalTasks, callback] = validateParamsMain(_name, _totalTasks, _callback);

    return new Reporter(name, totalTasks, callback);
}

/* ------------- *
    Constructor
 * ------------- */
function Reporter (name, totalTasks, callback) {
    this.name       = name;
    this.totalTasks = totalTasks;
    this.callback   = callback;

    this.done = 0;
    this.data = Object.create(null);

    this.complete = false;
}

/* ----------- *
    Prototype
 * ----------- */
const ReporterProto = Reporter.prototype;

ReporterProto.subReporter = function (_name, _totalTasks) {
    const [name, totalTasks] = validateParamsSub(_name, _totalTasks);

    const subReporter = new Reporter(name, totalTasks, () => {
        this.taskDone();
    });

    subReporter.data = this.data;

    return subReporter;
};

ReporterProto.taskDone = function (key, value) {
    if (this.complete) {
        return;
    }

    this.done++;
    
    const data  = this.data;
    const done  = this.done;
    const total = this.totalTasks;
    
    if (key) {
        if (typeof key === 'string') {
            data[key] = value;
        }
        else if (typeof key === 'object') {
            for (const prop in key) {
                if (Object.hasOwnProperty.call(key, prop)) {
                    data[prop] = key[prop];
                }
            }
        }
    }

    if (done === total) {
        this.complete = true;
        this.callback(null, this.data);
    }
};

ReporterProto.taskFail = function (err) {
    this.complete = true;
    this.callback(err, null);
};
