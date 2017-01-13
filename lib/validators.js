'use strict';

const error = require('./errors');

module.exports = {
    name (reporter) {
        const name = reporter.name;

        if (typeof name !== 'string') {
            error.nameIsNotAString(reporter);
        }
    },

    totalTasks (reporter) {
        const totalTasks = reporter.totalTasks;

        if (typeof totalTasks !== 'number') {
            error.totalTasksIsNotANumber(reporter);
        }
    },
    
    callback (reporter) {
        const callback = reporter.callback;

        if (typeof callback !== 'function') {
            error.callbackIsNotAFunction(reporter);
        }
    }
};
