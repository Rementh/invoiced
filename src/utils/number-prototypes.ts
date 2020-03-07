interface Number {
    toRounded: (precision?: number) => {};
    toCurrency: (symbol?: { prefix?: string; suffix?: string }) => {};
    toPercent: () => {};
    equals: (match: number, precision?: number) => boolean;
}

/* --------------------------------------------------------------- */
/* 0.51555 => toRoundedString() => "0.52"                          */
/* 0.51555 => toRoundedString(3) => "0.516"                        */
/* 0.51555 => toRoundedString(5) => "0.51555"                      */
/* --------------------------------------------------------------- */
Number.prototype.toRounded = function(precision = 2) {
    return (
        Math.round(this * Math.pow(10, precision)) / Math.pow(10, precision)
    ).toFixed(precision);
};

/* --------------------------------------------------------------- */
/* 123 => toCurrencyString() => "123,00"                           */
/* 123 => toCurrencyString({prefix: '€'}) => "€123,00"             */
/* 123 => toCurrencyString({suffix: ' zł'}) => "123,00 zł"         */
/* --------------------------------------------------------------- */
Number.prototype.toCurrency = function({ prefix, suffix } = {}) {
    return (
        (prefix ? `${prefix}` : '') +
        this.toRounded().replace('.', ',') +
        (suffix ? `${suffix}` : '')
    );
};

/* --------------------------------------------------------------- */
/* 0.08 => toPercentString() => "8%"                               */
/* 0.23 => toPercentString() => "23%"                              */
/* 1.23 => toPercentString() => "123%"                             */
/* --------------------------------------------------------------- */
Number.prototype.toPercent = function() {
    return this * 100 + '%';
};

/* --------------------------------------------------------------- */
/*  0.23 => isEqual(0.23) => true                                  */
/* 0.231 => isEqual(0.234) => true                                 */
/* 0.231 => isEqual(0.234, 3) => false                             */
/* --------------------------------------------------------------- */
Number.prototype.equals = function(match: number, precision = 2): boolean {
    return this.toRounded(precision) === match.toRounded(precision);
};
