'use strict';

module.exports = function (name, space) {
    const reportersIndex = 0;

    return function () {
        return `${name}${space}${reportersIndex}`;
    };
};
