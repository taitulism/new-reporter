'use strict';

module.exports = {
    NO_ARGS_ERR: 'newReporter needs at least one argument to run: newReporter (totalTasks, callback)',
    EXTRA_REPORTED_DONE_ERR: 'A Reporter has reported "done" too many times.',
    TOTALTASKS_IS_NOT_NUMBER_ERR: 'newReporter first argument should be a number: newReporter (<totalTasks:number>, <callback:Task/function>)',
    CALLBACK_IS_NOT_FUNCTION_ERR: 'newReporter second argument should be a function: newReporter (<totalTasks:number>, <callback:Task/function>)',
};
