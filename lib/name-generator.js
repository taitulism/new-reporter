'use strict';

function createNameGenerator (name, space) {
    let reportersIndex = 0;

    return function () {
        const generatedName = `${name}${space}${reportersIndex}`;

        reportersIndex++;

        return generatedName;
    };
}

const nameGenerator = createNameGenerator('reporter', '_');

module.exports = nameGenerator;
