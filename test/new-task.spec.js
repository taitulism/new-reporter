'use strict';

const sinon   = require('sinon');
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

describe('newTask', () => {
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

describe('newTask instance', () => {
    it('does nothing if its last .reportDone() doesn\'t gets called', () => {
        const callbackSpy = sinon.spy();
        const task = newTask(2, callbackSpy);

        task.reportDone();

        expect(task.totalSubTasks).to.equal(2);
        expect(task.done).to.equal(1);
        expect(callbackSpy.notCalled).to.be.true;
    });

    it('runs a callback when its last .reportDone() gets called', () => {
        const callbackSpy = sinon.spy();
        const task = newTask(2, callbackSpy);

        task.reportDone();
        expect(callbackSpy.notCalled).to.be.true;

        task.reportDone();
        expect(callbackSpy.calledOnce).to.be.true;
    });

    it('also works for async tasks', (done) => {
        function callback () {
            expect(callbackSpy.calledOnce).to.be.true;
            done();
        }

        const callbackSpy = sinon.spy(callback);

        const task = newTask(2, callbackSpy);

        setTimeout(() => {
            task.reportDone();
        }, 2);

        setTimeout(() => {
            task.reportDone();
        }, 1);
    });

    it('can create sub-tasks', () => {
        const callbackSpy = sinon.spy();

        const mainTask = newTask(1, callbackSpy);
        const subTask1 = mainTask.newTask(1);
        const subTask2 = mainTask.newTask(1);

        const NewTaskConstructor = mainTask.constructor;

    });

    it('is done when its subTasks are all done', () => {
        const callbackSpy = sinon.spy();

        const mainTask = newTask(1, callbackSpy);
        const subTask = mainTask.newTask(1);


        subTask.reportDone();

        expect(callbackSpy.calledOnce).to.be.true;
    });
});

