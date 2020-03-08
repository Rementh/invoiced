import { Component, ViewChild, ElementRef } from '@angular/core';
import { makePdf } from '../../utils/pdf-maker';
import { Product, Invoice } from './models';
import { fetchProducts } from './data';

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
        products: products.map(toInvoiceProduct),
        taxRatesSummary,
        totalNetValue: taxRatesSummary.map(item => item.netValue).sum(),
        totalTaxValue: taxRatesSummary.map(item => item.taxValue).sum(),
        totalGrossValue: taxRatesSummary.map(item => item.grossValue).sum(),
    };
};

const pdfConsts = {
    margin: 20,
    fontSize: {
        text: 11,
        table: 9,
        header: 20,
    },
    labelBackground: '#dedede',
};

const makedd = (invoice: Invoice) => ({
    content: [
        {
            columns: [
                [],
                [
                    {
                        layout: 'companyLayout',
                        table: {
                            headerRows: 1,
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: 'Miejsce wystawienia',
                                        style: {
                                            alignment: 'center',
                                        },
                                    },
                                ],
                                ['Bielsko-Biała'],
                            ],
                        },
                    },
                    ' ',
                    {
                        layout: 'companyLayout',
                        table: {
                            headerRows: 1,
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: 'Data wystawienia',
                                        style: {
                                            alignment: 'center',
                                        },
                                    },
                                ],
                                ['03-02-2020'],
                            ],
                        },
                    },
                ],
            ],
            columnGap: pdfConsts.margin,
            style: {
                alignment: 'center',
            },
        },
        ' ',
        {
            columns: [
                {
                    layout: 'companyLayout',
                    table: {
                        headerRows: 1,
                        widths: ['*'],
                        body: [
                            [
                                {
                                    text: 'Sprzedawca',
                                    style: {
                                        alignment: 'center',
                                    },
                                },
                            ],
                            ['Solid Apps Filip Talaga'],
                            ['NIP: 6462850150'],
                            ['Jankowicka 52A'],
                            ['43-100 Tychy'],
                        ],
                    },
                },
                {
                    layout: 'companyLayout',
                    table: {
                        headerRows: 1,
                        widths: ['*'],
                        body: [
                            [
                                {
                                    text: 'Nabywca',
                                    style: {
                                        alignment: 'center',
                                    },
                                },
                            ],
                            ['Development-as-a-Service Sp. z. o.o'],
                            ['NIP: 5711719018'],
                            ['Piaskowa 19'],
                            ['13-200 Działdowo'],
                        ],
                    },
                },
            ],
            columnGap: pdfConsts.margin,
        },
        {
            text: 'Faktura VAT 01/03/2020',
            alignment: 'center',
            style: {
                fontSize: pdfConsts.fontSize.header,
                bold: true,
            },
            margin: [0, pdfConsts.margin],
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
                        'Lp.',
                        'Nazwa towaru lub usługi',
                        'Jm.',
                        'Ilość',
                        'Cena netto',
                        'Wartość netto',
                        'Stawka VAT',
                        'Wartość brutto',
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
                {
                    style: {
                        fontSize: pdfConsts.fontSize.table,
                        alignment: 'center',
                    },
                    layout: 'invoiceLayout',
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                'Stawka VAT',
                                'Wartość netto',
                                'Kwota VAT',
                                'Wartość brutto',
                            ],
                            ...invoice.taxRatesSummary.map(item => [
                                item.taxRate.toPercent(),
                                item.netValue.toCurrency(),
                                item.taxValue.toCurrency(),
                                item.grossValue.toCurrency(),
                            ]),
                            [
                                'Razem',
                                invoice.totalNetValue.toCurrency(),
                                invoice.totalTaxValue.toCurrency(),
                                invoice.totalGrossValue.toCurrency(),
                            ],
                        ],
                    },
                },
                [
                    'Nabywca',
                    'Development-as-a-Service Sp. z. o.o',
                    'NIP: 5711719018',
                    'Piaskowa 19',
                    '13-200 Działdowo',
                ],
            ],
            columnGap: pdfConsts.margin,
        },
    ],
    defaultStyle: {
        fontSize: pdfConsts.fontSize.text,
    },
});
