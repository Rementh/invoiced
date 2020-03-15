const numerals = {
    units: [
        'zero',
        'jeden',
        'dwa',
        'trzy',
        'cztery',
        'pięć',
        'sześć',
        'siedem',
        'osiem',
        'dziewięć',
        'dziesięć',
        'jedenaście',
        'dwanaście',
        'trzynaście',
        'czternaście',
        'piętnaście',
        'szesnaście',
        'siedemnaście',
        'osiemnaście',
        'dziewiętnaście',
    ],
    decimals: [
        'dwadzieścia',
        'trzydzieści',
        'czterdzieści',
        'pięćdziesiąt',
        'sześćdziesiąt',
        'siedemdziesiąt',
        'osiemdziesiąt',
        'dziewięćdziesiąt',
    ],
    hundredths: [
        'sto',
        'dwieście',
        'trzysta',
        'czterysta',
        'pięćset',
        'sześćset',
        'siedemset',
        'osiemset',
        'dziewięćset',
    ],
};

const sectionNames = [
    ['tysiąc', 'tysiące', 'tysięcy'],
    ['milion', 'miliony', 'milionów'],
    ['miliard', 'miliardy', 'miliardów'],
];

const getSectionName = (value: string, names: string[]) => {
    /* Get only decimal part (last two digits) */
    value = value.length > 2 ? value.substring(value.length - 2) : value;

    /* 1 */
    if (value === '1') {
        return names[0];
    }

    /* 5-21 */
    const numeric = +value;
    if (numeric >= 5 && numeric <= 21) {
        return names[2];
    }

    /* x2-x4 */
    const unit = +value.split('').last();
    if (unit >= 2 && unit <= 4) {
        return names[1];
    }

    /* Rest */
    return names[2];
};

const getSectionInWords = (value: string) => {
    const reversed = value.split('').reverse();

    const hundredth = +reversed[2];
    const decimal = +reversed[1];
    const unit = +reversed[0];

    const hundredthWord =
        hundredth > 0 ? numerals.hundredths[hundredth - 1] : '';
    const decimalWord = decimal > 1 ? numerals.decimals[decimal - 2] : '';
    const unitWord =
        decimal === 1
            ? numerals.units[+('' + decimal + unit)]
            : unit > 0
            ? numerals.units[unit]
            : '';

    return `${hundredthWord} ${decimalWord} ${unitWord}`.trimWhole();
};

const sectionToWords = (section: string, order: number) => {
    const words = getSectionInWords(section);

    return order !== 0 && words
        ? `${words} ${getSectionName(section, sectionNames[order - 1])}`
        : words;
};

const convertToWords = (value: number) =>
    value === 0
        ? numerals.units[0]
        : value
              .toRounded(0)
              .split('')
              .reverse()
              .map((digit, index) =>
                  index % 3 === 0 && index !== 0 ? digit + ',' : digit,
              )
              .reverse()
              .join('')
              .split(',')
              .reverse()
              .map(sectionToWords)
              .reverse()
              .join(' ')
              .trimWhole();

export default convertToWords;
