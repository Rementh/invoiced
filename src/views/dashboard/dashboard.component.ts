import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { makePdf } from '../../utils/pdf-maker';
import { EntryInvoiceData, ExchangeRate } from './models';
import * as moment from 'moment';
import numberToWords from 'src/utils/number-to-words-converter';
import calculateInvoiceData from 'src/utils/invoice-calculator';
import makeDesignDoc from 'src/utils/design-doc-maker';

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
        const words = numberToWords(12331.24124);
        console.log(words);

        const dateOfIssue = new Date(
            moment('03-02-2020', 'DD-MM-YYYY').toString(),
        );
        const currency = 'EUR';
        const exchangeRate = await getCurrencyRate(currency, dateOfIssue);

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
