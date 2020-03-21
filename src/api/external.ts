import * as moment from 'moment';
import { ExchangeRate } from 'src/models/invoice';

export const getCurrencyRate = async (
    code: string,
    paymentDate: Date,
): Promise<ExchangeRate> => {
    const date = moment(paymentDate).subtract(1, 'days');
    const table = 'a';
    const endDate = date.format('YYYY-MM-DD');
    const startDate = date.subtract(7, 'days').format('YYYY-MM-DD');
    const url = `https://api.nbp.pl/api/exchangerates/rates/${table}/${code}/${startDate}/${endDate}`;
    const result = await fetch(url).then(res => res.json());

    return { ...result.rates.reverse()[0], currency: 'PLN' };
};
