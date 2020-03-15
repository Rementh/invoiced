interface String {
    trimWhole: () => string;
}

String.prototype.trimWhole = function() {
    return this.replace(/\s\s+/g, ' ').trim();
};
