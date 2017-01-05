'use strict';

module.exports = newTask;

function newTask (len, callback) {
    // "newTask" can run as a standalone function or as a Task's method.
    const parentTask = this;

    if (!callback && parentTask.whois === '_TASK_') {
        return new Task(len, (...args) => {
            parentTask.callback(...args);
        });
    }

    return new Task(len, callback);
}

function Task (len, callback) {
    this.totalSubTasks = len;
    this.callback      = callback;
    this.done          = 0;
}

const TaskProto = Task.prototype;

TaskProto.whois = '_TASK_';

TaskProto.newTask = newTask;

TaskProto.reportDone = function (...args) {
    this.checkDone(...args);
};

TaskProto.checkDone = function (...args) {
    this.done++;

    if (this.done === this.totalSubTasks) {
        this.callback(...args);
    }
};
