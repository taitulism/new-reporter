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
