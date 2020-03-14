import { Component, ViewChild, ElementRef } from '@angular/core';
import { makePdf } from '../../utils/pdf-maker';
import { Product, Invoice } from './models';
import { fetchProducts } from './data';
import * as moment from 'moment';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export default class DashboardComponent {
    @ViewChild('page') page: ElementRef;

    public async generatePdf() {
        const products = await fetchProducts().toPromise();
        const invoice = toInvoice(products);
        const dd = makedd(invoice);
        makePdf(dd).download();
    }
}

const toInvoice = (products: Product[]): Invoice => {
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
        ...new Set(products.map(product => product.taxRate)),
    ];

    /* Make array where each element represents group of products with the same tax value */
    const productsSortedByTax = distinctTaxValues.map(tax =>
        products.filter(product => tax.equals(product.taxRate)),
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

    return {
        placeOfIssue: 'Bielsko-Biała',
        dateOfIssue: new Date(),
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
        invoiceNumber: `01/${moment().format('MM/YYYY')}`,
        products: products.map(toInvoiceProduct),
        taxRatesSummary,
        totalNetValue: taxRatesSummary.map(item => item.netValue).sum(),
        totalTaxValue: taxRatesSummary.map(item => item.taxValue).sum(),
        totalGrossValue: taxRatesSummary.map(item => item.grossValue).sum(),
        totalGrossText: 'trzy tysiące trzysta dwadzieścia pięć',
        currency: 'EUR',
        paymentMethod: 'przelew',
        paymentDate: new Date(
            moment()
                .add(14, 'days')
                .format(),
        ),
        accountNumber: '06 2490 0005 0000 4000 2418 3585',
    };
};

const pdfConsts = {
    margin: 20,
    fontSize: {
        header: 20,
        text: 9,
        table: 9,
    },
    labelBackground: '#dedede',
};

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

const makedd = (invoice: Invoice) => ({
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
                    ...invoice.products.map(item => [
                        item.no,
                        item.name,
                        item.unit,
                        item.quantity,
                        item.unitNetValue.toCurrency(),
                        item.totalNetValue.toCurrency(),
                        item.taxRate.toPercent(),
                        item.totalGrossValue.toCurrency(),
                    ]),
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
                                    item.netValue.toCurrency(),
                                    item.taxValue.toCurrency(),
                                    item.grossValue.toCurrency(),
                                ]),
                                [
                                    ...[
                                        'Razem',
                                        invoice.totalNetValue.toCurrency(),
                                        invoice.totalTaxValue.toCurrency(),
                                        invoice.totalGrossValue.toCurrency(),
                                    ].map(text => ({
                                        text,
                                        style: {
                                            bold: true,
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
                                    moment(invoice.paymentDate).format(
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
                                                text: `${invoice.totalGrossValue.toCurrency()} ${
                                                    invoice.currency
                                                }`,
                                                style: {
                                                    bold: true,
                                                    fontSize: 12,
                                                },
                                            },
                                        ],
                                    },
                                ],
                                [
                                    {
                                        text: `Słownie: ${invoice.totalGrossText} 92/100 ${invoice.currency}`,
                                        margin: [0, 0, 0, pdfConsts.margin],
                                    },
                                ],
                                [
                                    `Przeliczono po kursie 1 EUR = 4,3010 PLN tabela kursów średnich NBP nr 021/A/NBP/2020 z dnia 31-01-2020`,
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
                                    `${invoice.totalNetValue.toCurrency()} ${
                                        invoice.currency
                                    }`,
                                    '11 629,90 PLN',
                                ],
                                [
                                    'Kwota VAT',
                                    `${invoice.totalTaxValue.toCurrency()} ${
                                        invoice.currency
                                    }`,
                                    '2 674,88 PLN',
                                ],
                                [
                                    'Wartość brutto',
                                    `${invoice.totalGrossValue.toCurrency()} ${
                                        invoice.currency
                                    }`,
                                    '14 304,78 PLN',
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
