'use strict';

module.exports = newTask;

/*
 │  "newTask" can run as a standalone function or as a Task's method.
 │  If it's a Task's method - "this" is the parent Task, 
 │  const parentTask = this;
*/
function newTask (len, callback) {
    if (!len) {
        throw new Error('newTask needs at least one argument to run: nnewTask (len, callback)');
    }

    if (!callback && isTask(this)) {
        return new Task(len, (...args) => {
            // a subTask's end callback is its parentTask's .reportDone() method
            this.reportDone(...args);
        });
    }

    return new Task(len, callback);
}

function isTask (obj) {
    return obj instanceof Task;
}

/* CONSTRUCTOR */
function Task (len, callback) {
    this.totalSubTasks = len;
    this.callback      = callback;
    this.done          = 0;
}

const TaskProto = Task.prototype;

TaskProto.newTask = newTask;

TaskProto.reportDone = function (...args) {
    this.done++;

    // check if complete (all done)
    if (this.done === this.totalSubTasks) {
        this.callback(...args);
    }
};

