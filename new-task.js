'use strict';

module.exports = newTask;

/*
 │  "newTask" can run in two different contexts:
 │  1. as a standalone function: newTask(len, callback)
 │  2. as a Task's method:       task.newTask(len)
 │
 │  In case 2, the childTask's callback function will call the parentTask's reportDone method.
*/
function newTask (len, callback) {
    validateLen(len);
    validateCallback(callback);

    return new Task(len, callback);
}

const NO_ARGS_ERR                  = 'newTask needs at least one argument to run: nnewTask (len, callback)';
const LEN_IS_NOT_NUMBER_ERR        = 'newTask first argument should be a number: newTask (<len:number>, <callback:Task/function>)';
const CALLBACK_IS_NOT_FUNCTION_ERR = 'newTask second argument should be a function: newTask (<len:number>, <callback:Task/function>)';

function validateLen (len) {
    if (!len) {
        throw new Error(NO_ARGS_ERR);
    }

    if (typeof len !== 'number') {
        throw new Error(LEN_IS_NOT_NUMBER_ERR);
    }
}

function validateCallback (callback) {
    if (typeof callback !== 'function') {
        throw new Error(CALLBACK_IS_NOT_FUNCTION_ERR);
    }
}


/* ------------- *
    Constructor
 * ------------- */
function Task (len, callback) {
    this.totalSubTasks = len;
    this.callback      = callback;
    this.done          = 0;
}

/* ----------- *
    Prototype
 * ----------- */
const TaskProto = Task.prototype;

TaskProto.newTask = function (len) {
    validateLen(len);

    return new Task(len, (...args) => {
        this.reportDone(...args);
    });
};

TaskProto.reportDone = function (...args) {
    this.done++;

    // if complete - run callback
    if (this.done === this.totalSubTasks) {
        this.callback(...args);
    }
};

