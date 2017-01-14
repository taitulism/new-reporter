'use strict';

const sinon   = require('sinon');
const expect  = require('chai').expect;

const newReporter = require('../');

function noop () {}

const rootReporter = newReporter(noop);
const ReporterConstructor = rootReporter.constructor;

describe('new-reporter class', () => {
    it('is a function', () => {
        expect(newReporter).to.be.a.function;
    });

    it('throws a ReferenceError when invoked with no arguments', () => {
        try {
            newReporter();
        } 
        catch (err) {
            expect(err).to.be.a.ReferenceError;
        }
    });

    it('throws a TypeError when invoked with a non-function `callback` argument', () => {
        try {
            newReporter('name');
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
        
        try {
            newReporter('name', 2);
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
        
        try {
            newReporter('name', 2, 'not a function');
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
    });

    it('throws a TypeError when invoked with a NaN `totalTasks` argument', () => {
        try {
            newReporter('name', 'NaN', noop);
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
    });

    it('returns a Reporter instance', () => {
        expect((newReporter(noop)) instanceof ReporterConstructor).to.be.true;
    });
});

describe('Reporter Instance', () => {
    it('is an instance of Reporter constructor', () => {
        expect(rootReporter instanceof ReporterConstructor).to.be.true;
    });

    describe('props', () => {
        const reporter = newReporter(2, noop);
        
        describe('.name', () => {
            it('is an optional argument', () => {
                expect(reporter.name).to.equal('reporter_1');
            });
            it('is a string', () => {
                expect(reporter.name).to.be.a.string;
            });
        });
        
        describe('.totalTasks', () => {
            it('is a number', () => {
                expect(reporter.totalTasks).to.be.a.number;
            });
            it('an optional argument', () => {
                expect(rootReporter.totalTasks).to.be.a.number;
            });
            it('its default value is 1', () => {
                expect(rootReporter.totalTasks).to.equal(1);
            });
        });

        describe('.callback', () => {
            it('is a function', () => {
                expect(reporter.callback).to.be.a.function;
            });
            it('passed as an argument', () => {
                expect(reporter.callback).to.equal(noop);
            });
        });

        describe('.data', () => {
            it('is an empty object', () => {
                expect(reporter.data).to.be.an.object;
                expect(reporter.data).to.deep.equal({});
            });            
        });

        describe('.done', () => {
            it('is a number', () => {
                expect(reporter.done).to.be.a.number;
            });
            it('starts at 0', () => {
                expect(reporter.done).to.equal(0);
            });
        });
    });

    describe('methods', () => {
        const reporter = newReporter(2, noop);

        it('.taskDone()', () => {
            expect(reporter.taskDone).to.be.a.function;
        });

        it('.subReporter()', () => {
            expect(reporter.subReporter).to.be.a.function;
        });            
    });

    describe('behavior', () => {
        it('its `.done` prop increments by 1 for every .taskDone() call', () => {
            const reporter = newReporter(2, noop);
            
            expect(reporter.done).to.equal(0);
            reporter.taskDone();
            expect(reporter.done).to.equal(1);
            reporter.taskDone();
            expect(reporter.done).to.equal(2);
        });

        it('throws a RangeError when .taskDone() is called more then its `.totalTasks`', () => {
            const reporter = newReporter(2, noop);

            reporter.taskDone();
            reporter.taskDone();

            try {
                reporter.taskDone();
            }
            catch (err) {
                expect(err).to.be.a.RangeError;
            }
        });
        
        it('runs its `.callback()` function when its `.done` prop value reaches its `.totalTasks` prop value', () => {
            const callbackSpy = sinon.spy();
            const reporter = newReporter(2, callbackSpy);
            
            expect(reporter.totalTasks).to.equal(2);

            reporter.taskDone();
            expect(reporter.done).to.equal(1);
            expect(callbackSpy.notCalled).to.be.true;

            reporter.taskDone();
            expect(reporter.done).to.equal(2);
            expect(callbackSpy.calledOnce).to.be.true;
        });

        it('can creates sub-reporters', () => {
            const mainReporter = newReporter(2, noop);

            const subReporter1 = mainReporter.subReporter('subName');
            const subReporter2 = mainReporter.subReporter(2);

            expect(subReporter1.name).to.equal('subName');
            expect(subReporter2.name).to.equal('reporter_9');

            expect(subReporter1.totalTasks).to.equal(1);
            expect(subReporter2.totalTasks).to.equal(2);

            expect(subReporter1 instanceof ReporterConstructor).to.be.true;
            expect(subReporter2 instanceof ReporterConstructor).to.be.true;
        });

        it('its `.taskDone()` method is called by one of its completed sub-reporter', (done) => {
            const callback = sinon.spy(() => {
                expect(callback.calledOnce).to.be.true;
                expect(taskDoneSpy.calledOnce).to.be.true;
                done();
            });

            const mainReporter = newReporter(1, callback);
            
            const taskDoneSpy = sinon.spy(mainReporter, 'taskDone');

            const subReporter      = mainReporter.subReporter();
            const grandSubReporter = subReporter.subReporter();

            grandSubReporter.taskDone();
        });

        it('is done when all of its sub-reporters are done', (done) => {
            function callback () {
                expect(subReporter2.done).to.equal(2);
                expect(callbackSpy.calledOnce).to.be.true;
                done();
            }

            const callbackSpy = sinon.spy(callback);

            const mainReporter = newReporter(2, callbackSpy);
            const subReporter1 = mainReporter.subReporter(1);
            const subReporter2 = mainReporter.subReporter(2);

            setTimeout(() => {
                subReporter1.taskDone();
            }, 2);

            const ary = ['a', 'b'];

            ary.forEach(() => {
                setTimeout(() => {
                    subReporter2.taskDone();
                }, 2);
            });
        });  

        it('its `data` prop is shared between reporters and their sub-reporters for the user to use', () => {
            const MY_VALUE_1 = 'myValue1';
            const MY_VALUE_2 = 'myValue2';

            const mainReporter = newReporter(noop);
            const subReporter  = mainReporter.subReporter();

            mainReporter.data.myKey1 = MY_VALUE_1;
            subReporter.data.myKey2  = MY_VALUE_2;

            expect(mainReporter.data).to.deep.equal({
                myKey1: MY_VALUE_1,
                myKey2: MY_VALUE_2,
            });

            expect(mainReporter.data).to.deep.equal(subReporter.data);
        });

        it('runs its callback with the data object as an argument', (done) => {
            const dataObj = {key:'value'};

            function callback (data) {
                expect(callbackSpy.calledWith(data)).to.be.true;
                done();
            }

            const callbackSpy = sinon.spy(callback);
            const mainReporter = newReporter(callbackSpy);

            mainReporter.data = dataObj;
            mainReporter.taskDone();
        });

        it('its `.taskDone(key, value)` can set stuff on the shared data object ', (done) => {
            function callback (data) {
                expect(data).to.deep.equal({'myKey':'myValue'});
                done();
            }

            const callbackSpy = sinon.spy(callback);
            const mainReporter = newReporter(callbackSpy);
            const subReporter = mainReporter.subReporter();

            subReporter.taskDone('myKey', 'myValue');
        });
    });
});
