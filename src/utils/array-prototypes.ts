interface Array<T> {
    sum: () => number;
}

Array.prototype.sum = function() {
    return this.reduce((prev: number, curr: number) => prev + curr, 0);
};
