'use strict';

module.exports = {
    nameIsNotAString,
    totalTasksIsNotANumber,
    callbackIsNotAFunction,
    extraReportedDone
};

const NEW_REPORTER_ERR      = 'new-reporter ERROR:';
const CONSTRUCTOR_SIGNATURE = 'reporter([name:string], [totalTasks:number], callback:function)';

function nameIsNotAString (reporter) {
    const {name} = reporter;

    throw new TypeError(NAME_IS_NOT_STRING_ERR);
}



const TOTALTASKS_IS_NOT_NUMBER_ERR = `'totalTasks' should be a number`;

function totalTasksIsNotANumber (reporter) {
    const {name, totalTasks} = reporter;

    const errMsg = `
        ${NEW_REPORTER_ERR}
        ${TOTALTASKS_IS_NOT_NUMBER_ERR}
            reporter.name: ${name}
            totalTasks: typeof ${typeof totalTasks}
            ${totalTasks}
        ${CONSTRUCTOR_SIGNATURE}
    `;

    throw new TypeError(errMsg);
}



const CALLBACK_IS_NOT_FUNCTION_ERR = `'callback' should be a function.`;

function callbackIsNotAFunction (reporter) {
    const {name, callback} = reporter;

    const errMsg = `
        ${NEW_REPORTER_ERR}
        ${CALLBACK_IS_NOT_FUNCTION_ERR}
            reporter.name: ${name}
            callback: ${callback}
        ${CONSTRUCTOR_SIGNATURE}
    `;

    throw new TypeError(errMsg);
}



const EXTRA_REPORTED_DONE_ERR = 'A reporter has reported "done" too many times.';

function extraReportedDone (reporter, caller) {
    const {name, totalTasks, done} = reporter;

    const errMsg = `
        ${NEW_REPORTER_ERR}
        ${EXTRA_REPORTED_DONE_ERR}
            reporter.name: ${name}
            totalTasks: ${totalTasks}
            done: ${done}
    `;

    throw new RangeError(errMsg);
}


const NO_ARGS_ERR                  = `A reporter needs at least one argument to run : ${CONSTRUCTOR_SIGNATURE}`;
const NAME_IS_NOT_STRING_ERR       = `A reporter first argument should be a string\n    ${CONSTRUCTOR_SIGNATURE}\n`;
