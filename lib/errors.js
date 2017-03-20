'use strict';

module.exports = {
    noArgs,
    wrongArgs,
    totalTasksIsNotANumber,
    callbackIsNotAFunction,
};

const NEW_REPORTER_ERR       = 'new-reporter ERROR:';
const CONSTRUCTOR_SIGNATURE  = 'reporter([name:string], [totalTasks:number], callback:function)';


const NO_ARGS = 'A reporter needs at least a callback function to run.';

function noArgs () {
    const errMsg = `
        ${NEW_REPORTER_ERR}
        ${NO_ARGS}
        ${CONSTRUCTOR_SIGNATURE}
    `;

    throw new ReferenceError(errMsg);
}


const WRONG_ARGS = 'Unknown Arguments.';

function wrongArgs (name, totalTasks) {
    throw new TypeError(`
        ${NEW_REPORTER_ERR}
        ${WRONG_ARGS}
            reporter.name: typeof ${typeof name}
            ${name}
            totalTasks: typeof ${typeof totalTasks}
            ${totalTasks}            
        ${CONSTRUCTOR_SIGNATURE}
    `);
}


const TOTALTASKS_IS_NOT_NUMBER = '`totalTasks` should be a number.';

function totalTasksIsNotANumber (name, totalTasks) {
    throw new TypeError(`
        ${NEW_REPORTER_ERR}
        ${TOTALTASKS_IS_NOT_NUMBER}
            reporter.name: ${name}
            totalTasks: typeof ${typeof totalTasks}
            ${totalTasks}
        ${CONSTRUCTOR_SIGNATURE}
    `);
}


const CALLBACK_IS_NOT_FUNCTION = '`callback` should be a function.';

function callbackIsNotAFunction (name, callback) {
    throw new TypeError(`
        ${NEW_REPORTER_ERR}
        ${CALLBACK_IS_NOT_FUNCTION}
            reporter.name: ${name}
            callback: ${callback}
        ${CONSTRUCTOR_SIGNATURE}
    `);
}
