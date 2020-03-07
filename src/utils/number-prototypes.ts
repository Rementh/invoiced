interface Number {
    toRounded: (precision?: number) => {};
    toCurrency: (symbol?: { prefix?: string; suffix?: string }) => {};
    toPercent: () => {};
    equals: (match: number, precision?: number) => boolean;
}

/*******************************************************************/
/* 0.51555 => toRounded() => "0.52"                                */
/* 0.51555 => toRounded(3) => "0.516"                              */
/* 0.51555 => toRounded(5) => "0.51555"                            */
/*******************************************************************/
Number.prototype.toRounded = function(precision = 2) {
    return (
        Math.round(this * Math.pow(10, precision)) / Math.pow(10, precision)
    ).toFixed(precision);
};

/*******************************************************************/
/* 123 => toCurrency() => "123,00"                                 */
/* 123 => toCurrency({prefix: '€'}) => "€123,00"                   */
/* 123 => toCurrency({suffix: ' zł'}) => "123,00 zł"               */
/*******************************************************************/
Number.prototype.toCurrency = function({ prefix, suffix } = {}) {
    return (
        (prefix ? `${prefix}` : '') +
        this.toRounded().replace('.', ',') +
        (suffix ? `${suffix}` : '')
    );
};

/*******************************************************************/
/* 0.08 => toPercent() => "8%"                                     */
/* 0.23 => toPercent() => "23%"                                    */
/* 1.23 => toPercent() => "123%"                                   */
/*******************************************************************/
Number.prototype.toPercent = function() {
    return this * 100 + '%';
};

/*******************************************************************/
/*  0.23 => equals(0.23) => true                                   */
/* 0.231 => equals(0.234) => true                                  */
/* 0.231 => equals(0.234, 3) => false                              */
/*******************************************************************/
Number.prototype.equals = function(match: number, precision = 2): boolean {
    return this.toRounded(precision) === match.toRounded(precision);
};
