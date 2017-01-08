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
    });

    it('throws an error when invoked with no arguments', () => {
        expect(newTask).to.throw(ReferenceError);
    });

    it('throws an error when invoked with a non-numeric "totalSubTasks" argument (first)', () => {
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

describe('Task instance', () => {
    describe('structure', () => {
        const task = newTask(2, noop);

        it('is an instance of Task constructor', () => {
            expect(task instanceof NewTaskConstructor).to.be.true;
        });

        it('has a prop: "done" which is a number', () => {
            expect(task.done).to.be.a.number;
        });

        it('has a prop: "totalSubTasks" which is a number', () => {
            expect(task.totalSubTasks).to.be.a.number;
        });

        it('has a prop: "callback" which is a function', () => {
            expect(task.callback).to.be.a.function;
        });

        it('has a prop: "data" which is an object', () => {
            expect(task.data).to.be.an.object;
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

        it('its "totalSubTasks" prop is passed as its first argument', () => {
            expect(task.totalSubTasks).to.be.equal(2);
        });

        it('its "callback" prop is passed as its second argument', () => {
            expect(task.callback).to.be.equal(noop);
        });

        it('its "data" prop starts as an empty object', () => {
             expect(task.data).to.deep.equal({});
        });
    });

    describe('behavior', () => {
        it('throws an error when .reportDone() is called more then "totalSubTasks"', () => {
            const task = newTask(2, noop);

            task.reportDone();
            task.reportDone();

            try {
                task.reportDone();
            }
            catch (err) {
                expect(err).to.be.a.RangeError;
            }
        });

        describe('state changes', () => {
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
            it('runs its "callback" function when its "done" prop value reaches its "totalSubTasks" prop value', () => {
                const callbackSpy = sinon.spy()
                const task = newTask(2, callbackSpy);

                task.reportDone();
                expect(task.done).to.equal(1);
                expect(callbackSpy.notCalled).to.be.true;

                task.reportDone();
                expect(task.done).to.equal(2);
                expect(callbackSpy.calledOnce).to.be.true;
            });

            it('works for async tasks', (done) => {
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

            it('can creates sub-tasks', () => {
                const mainTask = newTask(2, noop);
                const subTask1 = mainTask.newTask(1);
                const subTask2 = mainTask.newTask(1);

                expect(subTask1 instanceof NewTaskConstructor).to.be.true;
                expect(subTask2 instanceof NewTaskConstructor).to.be.true;
            });

            it('is done when all of its subTasks are done', (done) => {
                function callback () {
                    expect(subTask2.done).to.equal(2);
                    expect(callbackSpy.calledOnce).to.be.true;
                    done();
                }

                const callbackSpy = sinon.spy(callback);

                const mainTask = newTask(2, callbackSpy);
                const subTask1 = mainTask.newTask(1);
                const subTask2 = mainTask.newTask(2);

                setTimeout(() => {
                    subTask1.reportDone();
                }, 2);

                const ary = ['a', 'b'];

                ary.forEach(() => {
                    setTimeout(() => {
                        subTask2.reportDone();
                    }, 2);
                });
            });

            it('its "data" prop is shared between tasks and their sub-tasks for the user to use', () => {
                const MY_VALUE_1 = 'myValue1';
                const MY_VALUE_2 = 'myValue2';

                const mainTask = newTask(1, noop);
                const subTask  = mainTask.newTask(1);

                mainTask.data.myKey1 = MY_VALUE_1;
                subTask.data.myKey2  = MY_VALUE_2;

                expect(mainTask.data).to.deep.equal({
                    myKey1: MY_VALUE_1,
                    myKey2: MY_VALUE_2,
                });

                expect(mainTask.data).to.deep.equal(subTask.data);
            });

            it('run its callback with the data object as an argument', (done) => {
                const dataObj = {key:'value'};

                function callback (dataObj) {
                    expect(callbackSpy.calledWith(dataObj)).to.be.true;
                    done();
                }

                const callbackSpy = sinon.spy(callback);
                const mainTask = newTask(1, callbackSpy);

                mainTask.data = dataObj;
                mainTask.reportDone();
            });

        });
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