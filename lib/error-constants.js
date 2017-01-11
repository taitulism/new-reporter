'use strict';

const CONSTRUCTOR_SIGNATURE = 'new Reporter ([name:string], [totalTasks:number], callback:function)';

module.exports = {
    NO_ARGS_ERR: `A reporter needs at least one argument to run: ${CONSTRUCTOR_SIGNATURE}`,
    NAME_IS_NOT_STRING_ERR: `A reporter first argument should be a string\n    ${CONSTRUCTOR_SIGNATURE}\n`,
    TOTALTASKS_IS_NOT_NUMBER_ERR: `A reporter second argument should be a number\n    ${CONSTRUCTOR_SIGNATURE}\n`,
    CALLBACK_IS_NOT_FUNCTION_ERR: `A reporter third argument should be a function:\n    ${CONSTRUCTOR_SIGNATURE}\n`,
    EXTRA_REPORTED_DONE_ERR: 'A reporter has reported "done" too many times.',
};
