'use strict';

module.exports = newTask;

/*
 │  "newTask" can run in two different contexts:
 │  1. as a standalone function: newTask(totalSubTasks, callback)
 │  2. as a Task's method:       task.newTask(totalSubTasks)
 │
 │  In case 2, the childTask's callback function will call the parentTask's reportDone method.
*/
function newTask (totalSubTasks, callback) {
    validateTotalSubTasks(totalSubTasks);
    validateCallback(callback);

    return new Task(totalSubTasks, callback);
}

const NO_ARGS_ERR                     = 'newTask needs at least one argument to run: nnewTask (totalSubTasks, callback)';
const TOTALSUBTASKS_IS_NOT_NUMBER_ERR = 'newTask first argument should be a number: newTask (<totalSubTasks:number>, <callback:Task/function>)';
const CALLBACK_IS_NOT_FUNCTION_ERR    = 'newTask second argument should be a function: newTask (<totalSubTasks:number>, <callback:Task/function>)';
const EXTRA_REPORTED_DONE             = 'A Task has reported "done" too many times.';

function validateTotalSubTasks (totalSubTasks) {
    if (!totalSubTasks) {
        throw new ReferenceError(NO_ARGS_ERR);
    }

    if (typeof totalSubTasks !== 'number') {
        throw new TypeError(TOTALSUBTASKS_IS_NOT_NUMBER_ERR);
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
function Task (totalSubTasks, callback) {
    this.done = 0;
    this.data = {};
    this.totalSubTasks = totalSubTasks;
    this.callback = callback;
}

/* ----------- *
    Prototype
 * ----------- */
const TaskProto = Task.prototype;

TaskProto.newTask = function (totalSubTasks) {
    validateTotalSubTasks(totalSubTasks);

    const subTask = new Task(totalSubTasks, () => {
        this.reportDone();
    });

    subTask.data = this.data;

    return subTask;
};

TaskProto.reportDone = function () {
    this.done++;

    const done  = this.done;
    const total = this.totalSubTasks;

    if (done < total) {
        return;
    }
    else if (done === total) {
        this.callback(this.data);
    }
    else { // (done > total)
        throw new RangeError(`${EXTRA_REPORTED_DONE}\ntotalSubTasks:${this.totalSubTasks}\ndone:${this.done}`);
    }
};

