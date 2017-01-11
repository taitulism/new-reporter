'use strict';

function createNameGenerator (name, space) {
    const reportersIndex = 0;

    return function () {
        return `${name}${space}${reportersIndex}`;
    };
}

module.exports = createNameGenerator('reporter', '_');
