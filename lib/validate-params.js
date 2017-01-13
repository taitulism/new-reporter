'use strict';

const generateName = require('./name-generator');
const error        = require('./errors');

module.exports = {
    main (...args) {
        const [name, totalTasks, callback] = handleOptionalParams.main(...args);

        validate.totalTasks(name, totalTasks);
        validate.callback(name, callback);

        return [name, totalTasks, callback];
    },

    sub (...args) {
        const [name, totalTasks] = handleOptionalParams.sub(...args);

        validate.totalTasks(name, totalTasks);

        return [name, totalTasks];
    }
};


const handleOptionalParams = {
    main (...args) {
        let name, totalTasks, callback;

        args = removeFalsyItems(args);

        const argsLen = args.length;

        if (!argsLen) {
            return error.noArgs();
        }

        if (argsLen === 1) {
            name       = generateName();
            totalTasks = 1;
            callback   = args[0];
        }
        else if (argsLen === 2) {
            [name, totalTasks] = getNameAndTotalTasks(args[0]);
            callback = args[1];
        }
        else {
            name       = args[0];
            totalTasks = args[1];
            callback   = args[2];
        }

        return [name, totalTasks, callback];
    },

    sub (...args) {
        let name, totalTasks;

        args = removeFalsyItems(args);

        const argsLen = args.length;

        if (!argsLen) {
            return [generateName(), 1];
        }
        
        if (argsLen === 1) {
           [name, totalTasks] = getNameAndTotalTasks(args[0]);
        }
        else { // (argsLen >= 2)
            name       = args[0];
            totalTasks = args[1];
        }

        return [name, totalTasks];
    }
};

function getNameAndTotalTasks (arg) {
    let name, totalTasks;

    const typeofArg = typeof arg;

    if (typeofArg === 'string') {
        name       = arg;
        totalTasks = 1;
    }
    else if (typeofArg === 'number') {
        name       = generateName();
        totalTasks = arg;
    }
    else {
        return error.wrongArgs(name, totalTasks);
    }

    return [name, totalTasks];
}

const validate = {
    totalTasks (name, totalTasks) {
        if (typeof totalTasks !== 'number') {
            return error.totalTasksIsNotANumber(name, totalTasks);
        }
    },
    
    callback (name, callback) {
        if (typeof callback !== 'function') {
            error.callbackIsNotAFunction(name, callback);
        }
    }
};

function removeFalsyItems (ary) {
    return ary.filter((item) => item);
}
