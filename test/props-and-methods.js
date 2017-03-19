const sinon   = require('sinon');
const expect  = require('chai').expect;

const newReporter = require('../');

function noop () {}

const rootReporter = newReporter(noop);
const ReporterConstructor = rootReporter.constructor;

describe('props', () => {
    const reporter = newReporter(noop);
    
    describe('.name', () => {
        it('is an optional argument', () => {
            expect(reporter.name).to.equal('reporter_3');
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

        it('its default value is 2', () => {
            expect(rootReporter.totalTasks).to.equal(2);
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
        expect(reporter.taskDone).to.be.a('function');
    });

    it('.taskFail()', () => {
        expect(reporter.taskFail).to.be.a('function');
    });

    it('.subReporter()', () => {
        expect(reporter.subReporter).to.be.a('function');
    });            
});
