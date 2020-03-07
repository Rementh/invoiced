import { Component, ViewChild, ElementRef } from '@angular/core';
import { makePdf } from '../../utils/pdf-maker';
import { Product } from './models';
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

        const productRows = products.map(toProductRow);
        const taxRows = toTaxTable(products);

        const dd = makedd(productRows, taxRows);
        makePdf(dd).download();
    }
}

const makedd = (productRows, taxRows) => ({
    content: [
        {
            columns: [
                [],
                [
                    'Miejsce wystawienia',
                    'Bielsko-Biała',
                    ' ',
                    'Data wystawienia',
                    '03-02-2020',
                ],
            ],
            columnGap: 30,
        },
        ' ',
        {
            columns: [
                [
                    'Sprzedawca',
                    'Solid Apps Filip Talaga',
                    'NIP: 6462850150',
                    'Jankowicka 52A',
                    '43-100 Tychy',
                ],
                [
                    'Nabywca',
                    'Development-as-a-Service Sp. z. o.o',
                    'NIP: 5711719018',
                    'Piaskowa 19',
                    '13-200 Działdowo',
                ],
            ],
            columnGap: 30,
        },
        {
            text: 'Faktura VAT 01/03/2020',
            alignment: 'center',
            style: {
                fontSize: 20,
                bold: true,
            },
            margin: [0, 20],
        },
        {
            style: {
                fontSize: 8,
                alignment: 'center',
            },
            margin: [0, 0, 0, 20],
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
                    ...productRows,
                ],
            },
        },
        {
            style: {
                fontSize: 8,
                alignment: 'center',
            },
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
                    ...taxRows,
                ],
            },
        },
    ],
    defaultStyle: {
        fontSize: 10,
    },
});

const toProductRow = (product: Product, index: number) => {
    const { name, unit, quantity, netUnitPrice, tax } = product;
    const lp = index + 1;
    const netTotalPrice = netUnitPrice * quantity;
    const taxPrice = netTotalPrice * tax;
    const grossTotalPrice = netTotalPrice + taxPrice;

    return [
        lp,
        name,
        unit,
        quantity,
        netUnitPrice.toCurrency(),
        netTotalPrice.toCurrency(),
        tax.toPercent(),
        grossTotalPrice.toCurrency(),
    ];
};

const toTaxTable = (products: Product[]) => {
    /* Find unique tax values within product list */
    const distinctTaxValues = [
        ...new Set(products.map(product => product.tax)),
    ];

    /* Make array where each element represents group of products with the same tax value */
    const productsSortedByTax = distinctTaxValues.map(tax =>
        products.filter(product => tax.equals(product.tax)),
    );

    /* Accumulate total net, tax, and gross of products for particular tax value */
    const taxSummaryRows = productsSortedByTax.map(items => {
        const tax = items[0].tax;
        const netTotalPrice = items
            .map(({ netUnitPrice, quantity }) => netUnitPrice * quantity)
            .reduce((prev, curr) => prev + curr, 0);
        const taxPrice = netTotalPrice * items[0].tax;
        const grossTotalPrice = netTotalPrice + taxPrice;

        return { tax, netTotalPrice, taxPrice, grossTotalPrice };
    });

    /* Helper function to calculate sum of given column */
    const sum = (key: string) =>
        taxSummaryRows
            .map(item => item[key])
            .reduce((prev, curr) => prev + curr, 0);

    /* Build tax table from formatted strings */
    return [
        ...taxSummaryRows.map(item => [
            item.tax.toPercent(),
            item.netTotalPrice.toCurrency(),
            item.taxPrice.toCurrency(),
            item.grossTotalPrice.toCurrency(),
        ]),
        [
            'Razem',
            sum('netTotalPrice').toCurrency(),
            sum('taxPrice').toCurrency(),
            sum('grossTotalPrice').toCurrency(),
        ],
    ];
};
