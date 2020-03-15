interface Array<T> {
    sum: () => number;
    last: () => T;
}

Array.prototype.sum = function() {
    return this.reduce((prev: number, curr: number) => prev + curr, 0);
};

Array.prototype.last = function() {
    return this[this.length - 1];
};
