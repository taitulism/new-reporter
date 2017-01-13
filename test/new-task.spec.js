'use strict';

const sinon   = require('sinon');
const expect  = require('chai').expect;

const Reporter = require('../');

function noop () {}

const rootReporter = new Reporter(noop);
const ReporterConstructor = rootReporter.constructor;

describe('new-reporter class', () => {
    it('is a function', () => {
        expect(Reporter).to.be.a.function;
    });

    it('throws an error when invoked with no arguments', () => {
        try {
            new Reporter();
        } 
        catch (err) {
            expect(err).to.be.a.ReferenceError;
        }
    });

    it('throws an error when invoked with a non-function "callback" argument', () => {
        try {
            new Reporter('name');
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
        
        try {
            new Reporter('name', 2);
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
        
        try {
            new Reporter('name', 2, 'not a function');
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
    });

    it('throws an error when invoked with a NaN "totalTasks" argument', () => {
        try {
            new Reporter('name', 'NaN', noop);
        } 
        catch (err) {
            expect(err).to.be.a.TypeError;
        }
    });

    it('returns a Reporter instance', () => {
        expect((new Reporter(noop)) instanceof ReporterConstructor).to.be.true;
    });
});

describe('Reporter Instance', () => {
    it('is an instance of Reporter constructor', () => {
        expect(rootReporter instanceof ReporterConstructor).to.be.true;
    });

    describe('props', () => {
        const reporter = new Reporter(2, noop);
        
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
        const reporter = new Reporter(2, noop);

        it('.taskDone()', () => {
            expect(reporter.taskDone).to.be.a.function;
        });

        it('.subReporter()', () => {
            expect(reporter.subReporter).to.be.a.function;
        });            
    });

    describe('behavior', () => {
        it('throws an error when .taskDone() is called more then its ".totalTasks"', () => {
            const reporter = new Reporter(2, noop);

            reporter.taskDone();
            reporter.taskDone();

            try {
                reporter.taskDone();
            }
            catch (err) {
                expect(err).to.be.a.RangeError;
            }
        });

        describe('state changes', () => {
            it('its "done" prop increments by 1 for every .taskDone() call', () => {
                const reporter = new Reporter(2, noop);
                
                expect(reporter.done).to.be.equal(0);
                reporter.taskDone();
                expect(reporter.done).to.be.equal(1);
                reporter.taskDone();
                expect(reporter.done).to.be.equal(2);
            });
        });
        
        describe('actions', () => {
            it('runs its "callback" function when its "done" prop value reaches its "totalTasks" prop value', () => {
                const callbackSpy = sinon.spy();
                const reporter = new Reporter(2, callbackSpy);

                reporter.taskDone();
                expect(reporter.done).to.equal(1);
                expect(callbackSpy.notCalled).to.be.true;

                reporter.taskDone();
                expect(reporter.done).to.equal(2);
                expect(callbackSpy.calledOnce).to.be.true;
            });

            it('works for async tasks', (done) => {
                function callback () {
                    expect(callbackSpy.calledOnce).to.be.true;
                    done();
                }

                const callbackSpy = sinon.spy(callback);

                const reporter = new Reporter(2, callbackSpy);

                setTimeout(() => {
                    reporter.taskDone();
                }, 2);

                setTimeout(() => {
                    reporter.taskDone();
                }, 1);
            });

            it('can creates sub-reporters', () => {
                const mainReporter = new Reporter(2, noop);
                const subReporter1 = mainReporter.subReporter();
                const subReporter2 = mainReporter.subReporter();

                expect(subReporter1.totalTasks).to.equal(1);

                expect(subReporter1 instanceof ReporterConstructor).to.be.true;
                expect(subReporter2 instanceof ReporterConstructor).to.be.true;
            });

            it('is done when all of its sub-reporters are done', (done) => {
                function callback () {
                    expect(subReporter2.done).to.equal(2);
                    expect(callbackSpy.calledOnce).to.be.true;
                    done();
                }

                const callbackSpy = sinon.spy(callback);

                const mainReporter = new Reporter(2, callbackSpy);
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

            it('its "data" prop is shared between reporters and their sub-reporters for the user to use', () => {
                const MY_VALUE_1 = 'myValue1';
                const MY_VALUE_2 = 'myValue2';

                const mainReporter = new Reporter(noop);
                const subReporter  = mainReporter.subReporter();

                mainReporter.data.myKey1 = MY_VALUE_1;
                subReporter.data.myKey2  = MY_VALUE_2;

                expect(mainReporter.data).to.deep.equal({
                    myKey1: MY_VALUE_1,
                    myKey2: MY_VALUE_2,
                });

                expect(mainReporter.data).to.deep.equal(subReporter.data);
            });

            it('run its callback with the data object as an argument', (done) => {
                const dataObj = {key:'value'};

                function callback (data) {
                    expect(callbackSpy.calledWith(data)).to.be.true;
                    done();
                }

                const callbackSpy = sinon.spy(callback);
                const mainReporter = new Reporter(callbackSpy);

                mainReporter.data = dataObj;
                mainReporter.taskDone();
            });

        });
    });
});
