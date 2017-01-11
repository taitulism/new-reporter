'use strict';

const createNameGenerator = require('./name-generator');
const generateName        = createNameGenerator('reporter', '_');

module.exports = function (name, totalTasks, callback) {
    const typeofName       = typeof name;
    const typeofTotalTasks = typeof totalTasks;

    totalTasks = totalTasks || 1;

    if (typeofName === 'function') {
        callback = name;
    }
    else if (typeofTotalTasks === 'function') {
        callback = totalTasks;

        if (typeofName === 'number') {
            totalTasks = name;            
        }
    }
    
    if (typeofName !== 'string') {
        name = generateName();
    }

    totalTasks = totalTasks || 1;

    return [name, totalTasks, callback];
};
