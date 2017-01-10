'use strict';

module.exports = {
    totalTasks (totalTasks) {
        if (!totalTasks) {
            throw new ReferenceError(NO_ARGS_ERR);
        }

        if (typeof totalTasks !== 'number') {
            throw new TypeError(TOTALTASKS_IS_NOT_NUMBER_ERR);
        }
    },
    
    callback (callback) {
        if (typeof callback !== 'function') {
            throw new TypeError(CALLBACK_IS_NOT_FUNCTION_ERR);
        }
    }
};
