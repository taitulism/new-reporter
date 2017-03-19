'use strict';

const sinon   = require('sinon');
const expect  = require('chai').expect;

const newReporter = require('../');

function noop () {}

const rootReporter = newReporter(noop);
const ReporterConstructor = rootReporter.constructor;

describe('Reporter Instance', () => {
    it('is an instance of Reporter constructor', () => {
        expect(rootReporter instanceof ReporterConstructor).to.be.true;
    });

    require('./props-and-methods');

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
        
        it('runs its callback function when `done` prop value reaches `totalTasks` prop value', () => {
            const callbackSpy = sinon.spy();
            const reporter = newReporter(callbackSpy);
            
            expect(reporter.totalTasks).to.equal(2);

            reporter.taskDone();
            expect(reporter.done).to.equal(1);
            expect(callbackSpy.notCalled).to.be.true;

            reporter.taskDone();
            expect(reporter.done).to.equal(2);
            expect(callbackSpy.calledOnce).to.be.true;
        });

        it('can creates sub-reporters', () => {
            const mainReporter = newReporter(noop);

            const subReporter1 = mainReporter.subReporter('subName', 1);
            const subReporter2 = mainReporter.subReporter();

            expect(subReporter1.name).to.equal('subName');
            expect(subReporter2.name).to.equal('reporter_11');

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

            const subReporter      = mainReporter.subReporter(1);
            const grandSubReporter = subReporter.subReporter(1);

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

            function callback (err, data) {
                expect(callbackSpy.calledWith(null, data)).to.be.true;
                done();
            }

            const callbackSpy = sinon.spy(callback);
            const mainReporter = newReporter(1, callbackSpy);

            mainReporter.data = dataObj;
            mainReporter.taskDone();
        });

        it('its `.taskDone(key, value)` can set a key-value pair on the shared data object ', (done) => {
            function callback (err, data) {
                expect(err).to.be.null;
                expect(data).to.deep.equal({'myKey':'myValue'});
                done();
            }

            const callbackSpy = sinon.spy(callback);
            const mainReporter = newReporter(1, callbackSpy);
            const subReporter = mainReporter.subReporter(1);

            subReporter.taskDone('myKey', 'myValue');
        });

        it('its `.taskDone(obj)` can spread an object on the shared data object ', (done) => {
            const dataObj1 = {
                key1:'value1',
                key2:'value2'
            };

            const dataObj2 = {
                key0:'value0',
                key1:'value1',
                key2:'value2'
            };
            
            function callback (err, data) {
                expect(err).to.be.null;
                expect(data).to.deep.equal(dataObj2);
                done();
            }

            const callbackSpy = sinon.spy(callback);
            const mainReporter = newReporter(1, callbackSpy);
            const subReporter = mainReporter.subReporter(1);

            mainReporter.data.key0 = 'value0';
            subReporter.taskDone(dataObj1);
        });

        it('its `.taskFail(err)` method calls the callback with an error immediately', (done) => {
            function callback (err, data) {
                expect(callbackSpy.calledOnce).to.be.true;
                expect(err).not.to.be.null;
                expect(data).to.be.null;
            }

            const callbackSpy = sinon.spy(callback);
            const reporter = newReporter(2, callbackSpy);
            const error = new Error('an error');

            reporter.taskFail(error);
            reporter.taskDone();
            reporter.taskDone();
            
            done();
        });
    });
});
