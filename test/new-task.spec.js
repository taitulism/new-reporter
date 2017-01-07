'use strict';

const sinon   = require('sinon');
const expect  = require('chai').expect;
const newTask = require('../new-task');

function noop () {}

const NewTaskConstructor = newTask(1, noop).constructor;

describe('newTask', () => {
    it('is a function', () => {
        expect(newTask).to.be.a.function;
    });

    it('returns a Task instance', () => {
        const task = newTask(1, noop);

        expect(task instanceof NewTaskConstructor).to.be.true;

        expect(task).to.be.an.object;
        expect(task.totalSubTasks).to.equal(1);
        expect(task.callback).to.equal(noop);
        expect(task.done).to.equal(0);
        expect(task.newTask).to.be.a.function;
        expect(task.reportDone).to.be.a.function;
    });

    it('throws an error when invoked with no arguments', () => {
        expect(newTask).to.throw(ReferenceError);
    });

    it('throws an error when invoked with a non-numeric "len" argument (first)', () => {
        try {
            newTask('not a number', noop);
            expect(true).to.be.false;
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
    });

    it('throws an error when invoked with a non-function "callback" argument (second)', () => {
        try {
            newTask(2, 'not a function');
            expect(true).to.be.false;
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
    });
});

describe('newTask instance', () => {
    
    describe('structure', () => {
        const task = newTask(2, noop);

        it('is an instance of Task constructor', () => {
            expect(task instanceof NewTaskConstructor).to.be.true;
        });

        it('has a prop: "done" which is a number, starting at 0', () => {
            expect(task.done).to.be.a.number;
            expect(task.done).to.be.equal(0);
        });

        it('has a prop: "totalSubTasks" which is a number, passed as the first argument "len"', () => {
            expect(task.totalSubTasks).to.be.a.number;
            expect(task.totalSubTasks).to.be.equal(2);
        });

        it('has a prop: "callback" which is a function, passed as the second argument "callback"', () => {
            expect(task.callback).to.be.a.function;
            expect(task.callback).to.be.equal(noop);
        });

        it('has a method: "reportDone"', () => {
            expect(task.reportDone).to.be.a.function;
        });

        it('has a method: "newTask', () => {
            expect(task.newTask).to.be.a.function;
        });
    });

    describe('starting state', () => {
        const task = newTask(2, noop);

        it('its "done" prop starts at 0', () => {
            expect(task.done).to.be.equal(0);
        });

        it('its "totalSubTasks" prop starts at "len", its first argument', () => {
            expect(task.totalSubTasks).to.be.equal(2);
        });
    });

    describe('behavior', () => {
        describe('newTask instance state changes', () => {
            it('its "done" prop increments by 1 for every .reportDone() call', () => {
                const task = newTask(2, noop);
                
                expect(task.done).to.be.equal(0);
                task.reportDone();
                expect(task.done).to.be.equal(1);
                task.reportDone();
                expect(task.done).to.be.equal(2);
            });
        });
        
        describe('actions', () => {
            it('its runs its "callback" function when its "done" prop vlue reaches its "totalSubTasks" prop value on a .reportDone() call', () => {
                const callbackSpy = sinon.spy()
                const task = newTask(2, callbackSpy);
                
                task.reportDone();
                task.reportDone();

                expect(callbackSpy.calledOnce).to.be.true;
            });
        });
    });
    
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

        expect(subTask1 instanceof NewTaskConstructor).to.be.true;
        expect(subTask2 instanceof NewTaskConstructor).to.be.true;
    });

    it('is done when its subTasks are all done', () => {
        const callbackSpy = sinon.spy();

        const mainTask = newTask(1, callbackSpy);
        const subTask = mainTask.newTask(1);

        subTask.reportDone();

        expect(callbackSpy.calledOnce).to.be.true;
    });
});

/*
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
*/