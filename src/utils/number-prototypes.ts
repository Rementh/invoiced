interface Number {
    toRounded: (precision?: number) => string;
    toCurrency: (symbol?: {
        prefix?: string;
        suffix?: string;
        precision?: number;
    }) => string;
    toPercent: () => string;
    equals: (match: number, precision?: number) => boolean;
    toDigits: (precision?: number) => string;
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
Number.prototype.toCurrency = function({ prefix, suffix, precision } = {}) {
    return (
        (prefix ? `${prefix}` : '') +
        this.toRounded(precision)
            .replace('.', ',')
            .split(',')
            .map((item: string, index: number) =>
                /* insert spaces every 3 digits of base number */
                index === 0
                    ? item
                          .reverse()
                          .replace(/(\d{3})/g, '$1 ')
                          .reverse()
                    : item,
            )
            .join(',')
            .trim() +
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
/* 0.23 => equals(0.23) => true                                   */
/* 0.231 => equals(0.234) => true                                  */
/* 0.231 => equals(0.234, 3) => false                              */
/*******************************************************************/
Number.prototype.equals = function(match: number, precision = 2): boolean {
    return this.toRounded(precision) === match.toRounded(precision);
};

/*******************************************************************/
/* 1 => toDigits() => '01'                                         */
/* 123.456 => toDigits() => '123'                                  */
/* 123.456 => toDigits(5) => '00123'                               */
/*******************************************************************/
Number.prototype.toDigits = function(minDigits = 2) {
    const digits = this.toRounded(0);
    const missingDigits = minDigits - digits.length;
    return missingDigits > 0
        ? `${new Array(missingDigits).fill('0').join('')}${digits}`
        : digits;
};
