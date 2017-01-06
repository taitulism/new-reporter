'use strict';

const expect  = require('chai').expect;
const newTask = require('../new-task');

function do_something (obj, mainTask) {
    setTimeout(function() {
        obj.a = 1;
        mainTask.reportDone(null, obj);
    }, 10);
}

function do_anotherThing (obj, mainTask) {
    obj.files = [];

    setTimeout(() => {
        const entries = ['file1', 'file2', 'file3'];
        const subTask = mainTask.newTask(entries.length);

        entries.forEach((file) => {
            do_stuff(subTask, obj, file);
        });

    }, 5);
}

function do_stuff (subTask, obj, file) {
    setTimeout(() => {
        obj.files.push(file);
        subTask.reportDone(null, obj);
    }, 0)
}


function fn(param, callback) {
    const obj = {};

    const mainTask = newTask(2, callback);

    do_something(obj, mainTask);
    do_anotherThing(obj, mainTask);
}

// ------------------------------------------
// console.log('wait 4 seconds...');
// fn('param', (err, obj) => {
//     console.log('--- gr8 sxs! ---');
//     console.log('err:', err);
//     console.log('return', obj);
// });



const NO_ARGS_ERR = 'newTask needs at least one argument to run: nnewTask (len, callback)';

describe('newTask', (done) => {
    it('is a function', () => {
        expect(newTask).to.be.a.function;
    });

    it('returns a Task instance', () => {
        const task = newTask(1);

        expect(task).to.be.an.object;
        expect(task.totalSubTasks).to.equal(1);
        expect(task.callback).to.be.undefined;
        expect(task.done).to.equal(0);
        expect(task.newTask).to.be.a.function;
        expect(task.reportDone).to.be.a.function;
    });

    it('throws an error when invoked with no arguments', () => {
        expect(newTask).to.throw(NO_ARGS_ERR);
    });
});

