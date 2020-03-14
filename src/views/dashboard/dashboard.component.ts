import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { makePdf } from '../../utils/pdf-maker';
import { Product, Invoice, EntryInvoiceData, ExchangeRate } from './models';
import { fetchProducts } from './data';
import * as moment from 'moment';

const getCurrencyRate = async (
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

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export default class DashboardComponent implements OnInit {
    @ViewChild('page') page: ElementRef;
    private entryInvoiceData: EntryInvoiceData;

    async ngOnInit() {
        const dateOfIssue = new Date(
            moment('03-02-2020', 'DD-MM-YYYY').toString(),
        );
        const currency = 'EUR';
        const exchangeRate = await getCurrencyRate(currency, dateOfIssue);
        console.log(exchangeRate);

        this.entryInvoiceData = {
            placeOfIssue: 'Bielsko-Biała',
            dateOfIssue,
            seller: {
                name: 'Solid Apps Filip Talaga',
                taxIdNumber: '6462850150',
                address: {
                    street: 'Jankowicka 52A',
                    city: 'Tychy',
                    postCode: '43-100',
                },
            },
            buyer: {
                name: 'Development-as-a-Service Sp. z. o.o',
                taxIdNumber: '5711719018',
                address: {
                    street: 'Piaskowa 19',
                    city: 'Działdowo',
                    postCode: '13-200',
                },
            },
            invoiceNumber: 1,
            products: [
                {
                    name: 'Monitoring antywłamaniowy',
                    unit: 'szt.',
                    quantity: 1,
                    unitNetValue: 16.67,
                    taxRate: 0.23,
                },
                {
                    name: 'Internet światłowód',
                    unit: 'szt.',
                    quantity: 1,
                    unitNetValue: 40,
                    taxRate: 0.23,
                },
                {
                    name: 'Gaz',
                    unit: 'szt.',
                    quantity: 1,
                    unitNetValue: 179.61,
                    taxRate: 0.23,
                },
                {
                    name: 'Energia elektryczna wspólna',
                    unit: 'szt.',
                    quantity: 1,
                    unitNetValue: 8.22,
                    taxRate: 0.23,
                },
                {
                    name: 'Energia elektryczna własna',
                    unit: 'szt.',
                    quantity: 1,
                    unitNetValue: 179.3,
                    taxRate: 0.23,
                },
                {
                    name: 'Dostarczanie wody',
                    unit: 'szt.',
                    quantity: 1,
                    unitNetValue: 63.36,
                    taxRate: 0.08,
                },
                {
                    name: 'Odprowadzanie ścieków',
                    unit: 'szt.',
                    quantity: 1,
                    unitNetValue: 58.14,
                    taxRate: 0.08,
                },
                {
                    name: 'Usługa programistyczna',
                    unit: 'godz.',
                    quantity: 104,
                    unitNetValue: 26,
                    taxRate: 0.23,
                },
            ],
            currency,
            paymentMethod: 'przelew',
            paymentDeadlineInDays: 30,
            accountNumber: '06 2490 0005 0000 4000 2418 3585',
            exchangeRate,
        };
    }

    public async generatePdf() {
        const invoice = calculateInvoiceData(this.entryInvoiceData);
        const designDoc = makeDesignDoc(invoice);
        makePdf(designDoc).download();
    }
}

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
        grossText: `---- ---- ---- ---- ${(
            (grossValueTotal % 1) *
            100
        ).toDigits()}/100`,
    };

    /* Calculate total net, tax and gross values for the foreign exchange */
    const totalExchanged = {
        netValue: total.netValue * entryInvoiceData.exchangeRate.mid,
        taxValue: total.taxValue * entryInvoiceData.exchangeRate.mid,
        grossValue: total.grossValue * entryInvoiceData.exchangeRate.mid,
    };

    const {
        invoiceNumber,
        products,
        paymentDeadlineInDays,
        ...rest
    } = entryInvoiceData;

    return {
        taxRatesSummary,
        total,
        totalExchanged,
        invoiceNumber: `${invoiceNumber.toDigits()}/${moment(
            entryInvoiceData.dateOfIssue,
        ).format('MM/YYYY')}`,
        products: products.map(toInvoiceProduct),
        paymentDeadline: new Date(
            moment(entryInvoiceData.dateOfIssue)
                .add(paymentDeadlineInDays, 'days')
                .format(),
        ),
        ...rest,
    };
};

const pdfConsts = {
    margin: 20,
    fontSize: {
        upperColumns: 10,
        header: 20,
        table: 9,
        totalPayment: 11,
        exchangeRate: 10,
        text: 9,
    },
    labelBackground: '#dedede',
};

const makeExchangeLine = (exchangeRate: ExchangeRate, currency: string) => [
    `Przeliczono po kursie `,
    {
        text: `1 ${currency} = ${exchangeRate.mid.toCurrency({
            precision: 4,
            suffix: ` ${exchangeRate.currency}`,
        })}`,
        style: {
            bold: true,
            fontSize: pdfConsts.fontSize.exchangeRate,
        },
    },
    `. Tabela kursów średnich NBP nr ${exchangeRate.no} z dnia ${moment(
        exchangeRate.effectiveDate,
        'YYYY-MM-DD',
    ).format('DD-MM-YYYY')}`,
];

const makeColumn = (header: string, content: string[]) => [
    {
        layout: 'labelLayout',
        table: {
            widths: ['*'],
            body: [
                [
                    {
                        text: header,
                        style: {
                            bold: true,
                            alignment: 'center',
                        },
                    },
                ],
            ],
        },
    },
    {
        layout: 'detailsLayout',
        margin: [0, 0, 0, pdfConsts.margin],
        table: {
            widths: ['*'],
            body: content.map(item => [item]),
        },
    },
];

const makeDesignDoc = (invoice: Invoice) => ({
    content: [
        {
            columns: [
                [],
                [
                    makeColumn('Miejsce wystawienia', [invoice.placeOfIssue]),
                    makeColumn('Data wystawienia', [
                        moment(invoice.dateOfIssue).format('DD-MM-YYYY'),
                    ]),
                ],
            ],
            columnGap: pdfConsts.margin,
            style: {
                fontSize: pdfConsts.fontSize.upperColumns,
                alignment: 'center',
            },
        },
        {
            columns: [
                makeColumn('Sprzedawca', [
                    invoice.seller.name,
                    `NIP: ${invoice.seller.taxIdNumber}`,
                    invoice.seller.address.street,
                    `${invoice.seller.address.postCode} ${invoice.seller.address.city}`,
                ]),
                makeColumn('Nabywca', [
                    invoice.buyer.name,
                    `NIP: ${invoice.buyer.taxIdNumber}`,
                    invoice.buyer.address.street,
                    `${invoice.buyer.address.postCode} ${invoice.buyer.address.city}`,
                ]),
            ],
            columnGap: pdfConsts.margin,
            style: {
                fontSize: pdfConsts.fontSize.upperColumns,
            },
        },
        {
            text: `Faktura VAT ${invoice.invoiceNumber}`,
            alignment: 'center',
            style: {
                fontSize: pdfConsts.fontSize.header,
                bold: true,
            },
            margin: [0, 0, 0, pdfConsts.margin],
        },
        {
            style: {
                fontSize: pdfConsts.fontSize.table,
                alignment: 'center',
            },
            margin: [0, 0, 0, pdfConsts.margin],
            layout: 'invoiceLayout',
            table: {
                headerRows: 1,
                widths: [
                    'auto',
                    '*',
                    'auto',
                    'auto',
                    'auto',
                    'auto',
                    'auto',
                    'auto',
                ],
                body: [
                    [
                        ...[
                            'Lp.',
                            'Nazwa towaru lub usługi',
                            'Jm.',
                            'Ilość',
                            'Cena netto',
                            'Wartość netto',
                            'Stawka VAT',
                            'Wartość brutto',
                        ].map(text => ({
                            text,
                            style: {
                                bold: true,
                            },
                        })),
                    ],
                    ...invoice.products.map(item =>
                        [
                            item.no,
                            item.name,
                            item.unit,
                            item.quantity,
                            item.unitNetValue.toCurrency(),
                            item.totalNetValue.toCurrency(),
                            item.taxRate.toPercent(),
                            item.totalGrossValue.toCurrency(),
                        ].map((text, index) => ({
                            text,
                            style: {
                                alignment:
                                    index === 1
                                        ? 'left'
                                        : index === 2
                                        ? 'center'
                                        : 'right',
                            },
                        })),
                    ),
                ],
            },
        },
        {
            columns: [
                [
                    {
                        style: {
                            fontSize: pdfConsts.fontSize.table,
                            alignment: 'center',
                        },
                        layout: 'invoiceLayout',
                        margin: [0, 0, 0, pdfConsts.margin],
                        table: {
                            headerRows: 1,
                            widths: ['auto', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    ...[
                                        'Stawka VAT',
                                        'Wartość netto',
                                        'Kwota VAT',
                                        'Wartość brutto',
                                    ].map(text => ({
                                        text,
                                        style: {
                                            bold: true,
                                        },
                                    })),
                                ],
                                ...invoice.taxRatesSummary.map(item => [
                                    item.taxRate.toPercent(),
                                    {
                                        text: item.netValue.toCurrency(),
                                        style: { alignment: 'right' },
                                    },
                                    {
                                        text: item.taxValue.toCurrency(),
                                        style: { alignment: 'right' },
                                    },
                                    {
                                        text: item.grossValue.toCurrency(),
                                        style: { alignment: 'right' },
                                    },
                                ]),
                                [
                                    ...[
                                        'Razem',
                                        invoice.total.netValue.toCurrency(),
                                        invoice.total.taxValue.toCurrency(),
                                        invoice.total.grossValue.toCurrency(),
                                    ].map((text, index) => ({
                                        text,
                                        style: {
                                            bold: true,
                                            alignment:
                                                index === 0
                                                    ? 'center'
                                                    : 'right',
                                        },
                                    })),
                                ],
                            ],
                        },
                    },
                    {
                        layout: 'detailsLayout',
                        table: {
                            widths: ['auto', 'auto'],
                            body: [
                                ['Sposób płatności', invoice.paymentMethod],
                                [
                                    'Termin płatności',
                                    moment(invoice.paymentDeadline).format(
                                        'DD-MM-YYYY',
                                    ),
                                ],
                                ['Numer konta', invoice.accountNumber],
                            ],
                        },
                    },
                ],
                [
                    {
                        layout: 'detailsLayout',
                        table: {
                            body: [
                                [
                                    {
                                        text: [
                                            'Do zapłaty: ',
                                            {
                                                text: `${invoice.total.grossValue.toCurrency()} ${
                                                    invoice.currency
                                                }`,
                                                style: {
                                                    bold: true,
                                                    fontSize:
                                                        pdfConsts.fontSize
                                                            .totalPayment,
                                                },
                                            },
                                        ],
                                    },
                                ],
                                [
                                    {
                                        text: `Słownie: ${invoice.total.grossText} ${invoice.currency}`,
                                    },
                                ],
                                [
                                    {
                                        text: [
                                            ...makeExchangeLine(
                                                invoice.exchangeRate,
                                                invoice.currency,
                                            ),
                                        ],
                                        margin: [
                                            0,
                                            pdfConsts.margin * 0.25,
                                            0,
                                            pdfConsts.margin * 0.25,
                                        ],
                                    },
                                ],
                            ],
                        },
                    },
                    {
                        layout: 'detailsLayout',
                        table: {
                            widths: ['*', '*', '*'],
                            body: [
                                [
                                    'Wartość netto',
                                    {
                                        text: invoice.total.netValue.toCurrency(
                                            {
                                                suffix: ` ${invoice.currency}`,
                                            },
                                        ),
                                        style: {
                                            alignment: 'right',
                                        },
                                    },
                                    {
                                        text: invoice.totalExchanged.netValue.toCurrency(
                                            {
                                                suffix: ` ${invoice.exchangeRate.currency}`,
                                            },
                                        ),
                                        style: {
                                            alignment: 'right',
                                        },
                                    },
                                ],
                                [
                                    'Kwota VAT',
                                    {
                                        text: invoice.total.taxValue.toCurrency(
                                            {
                                                suffix: ` ${invoice.currency}`,
                                            },
                                        ),
                                        style: {
                                            alignment: 'right',
                                        },
                                    },
                                    {
                                        text: invoice.totalExchanged.taxValue.toCurrency(
                                            {
                                                suffix: ` ${invoice.exchangeRate.currency}`,
                                            },
                                        ),
                                        style: {
                                            alignment: 'right',
                                        },
                                    },
                                ],
                                [
                                    'Wartość brutto',
                                    {
                                        text: invoice.total.grossValue.toCurrency(
                                            {
                                                suffix: ` ${invoice.currency}`,
                                            },
                                        ),
                                        style: {
                                            alignment: 'right',
                                        },
                                    },
                                    {
                                        text: invoice.totalExchanged.grossValue.toCurrency(
                                            {
                                                suffix: ` ${invoice.exchangeRate.currency}`,
                                            },
                                        ),
                                        style: {
                                            alignment: 'right',
                                        },
                                    },
                                ],
                            ],
                        },
                    },
                ],
            ],
            columnGap: pdfConsts.margin,
        },
    ],
    defaultStyle: {
        fontSize: pdfConsts.fontSize.text,
    },
});
