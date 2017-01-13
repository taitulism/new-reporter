'use strict';

function createNameGenerator (name, space) {
    let reportersIndex = 0;

    return function () {
        const generatedName = `${name}${space}${reportersIndex}`;

        reportersIndex++;

        return generatedName;
    };
}

module.exports = createNameGenerator('reporter', '_');
