import * as moment from 'moment';
import numberToWords from './number-to-words-converter';
import { EntryInvoiceData, Invoice, Product } from 'src/models/invoice';

const calculateInvoiceData = (entryInvoiceData: EntryInvoiceData): Invoice => {
    const toInvoiceProduct = (product: Product, index: number) => {
        const { name, unit, quantity, unitNetValue, taxRate } = product;
        const no = index + 1;
        const totalNetValue = unitNetValue * quantity;
        const totalTaxValue = totalNetValue * taxRate;
        const totalGrossValue = totalNetValue + totalTaxValue;

        return {
            no,
            name,
            unit,
            quantity,
            unitNetValue,
            totalNetValue,
            taxRate,
            totalGrossValue,
        };
    };

    /* Find unique tax values within product list */
    const distinctTaxValues = [
        ...new Set(entryInvoiceData.products.map(product => product.taxRate)),
    ];

    /* Make array where each element represents group of products with the same tax value */
    const productsSortedByTax = distinctTaxValues.map(tax =>
        entryInvoiceData.products.filter(product =>
            tax.equals(product.taxRate),
        ),
    );

    /* Accumulate total net, tax, and gross of products for particular tax value */
    const taxRatesSummary = productsSortedByTax.map(items => {
        const taxRate = items[0].taxRate;
        const netValue = items
            .map(({ unitNetValue, quantity }) => unitNetValue * quantity)
            .reduce((prev, curr) => prev + curr, 0);
        const taxValue = netValue * taxRate;
        const grossValue = netValue + taxValue;

        return { taxRate, netValue, taxValue, grossValue };
    });

    /* Calculate total net, tax and gross values */
    const grossValueTotal = taxRatesSummary.map(item => item.grossValue).sum();
    const total = {
        netValue: taxRatesSummary.map(item => item.netValue).sum(),
        taxValue: taxRatesSummary.map(item => item.taxValue).sum(),
        grossValue: grossValueTotal,
        grossText: `${numberToWords(Math.floor(grossValueTotal))} ${(
            (grossValueTotal % 1) *
            100
        ).toDigits()}/100`,
    };

    const {
        invoiceNumber,
        products,
        paymentDeadlineInDays,
        exchangeRate,
        ...rest
    } = entryInvoiceData;

    /* Calculate total net, tax and gross values for the foreign exchange */
    const exchangeProps = exchangeRate
        ? {
              exchangeRate,
              totalExchanged: {
                  netValue: total.netValue * exchangeRate.mid,
                  taxValue: total.taxValue * exchangeRate.mid,
                  grossValue: total.grossValue * exchangeRate.mid,
              },
          }
        : {};

    return {
        taxRatesSummary,
        total,
        invoiceNumber: `${invoiceNumber.toDigits()}/${moment(
            entryInvoiceData.dateOfIssue,
        ).format('MM/YYYY')}`,
        products: products.map(toInvoiceProduct),
        paymentDeadline: new Date(
            moment(entryInvoiceData.dateOfIssue)
                .add(paymentDeadlineInDays, 'days')
                .format(),
        ),
        ...exchangeProps,
        ...rest,
    };
};

export default calculateInvoiceData;
