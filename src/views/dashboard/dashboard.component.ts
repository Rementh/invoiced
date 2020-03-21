import { Component, ViewChild, ElementRef } from '@angular/core';
import { makePdf } from '../../utils/pdf-maker';
import * as moment from 'moment';
import calculateInvoiceData from 'src/utils/invoice-calculator';
import makeDesignDoc from 'src/utils/design-doc-maker';
import { EntryInvoiceData } from 'src/models/invoice';
import { getCurrencyRate } from 'src/api/external';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export default class DashboardComponent {
    @ViewChild('page') page: ElementRef;
    public isLoading = false;

    public async generatePdf(entryInvoiceData: EntryInvoiceData) {
        const invoice = calculateInvoiceData(entryInvoiceData);
        const designDoc = makeDesignDoc(invoice);
        makePdf(designDoc).download();
    }

    public async prepareEntryInvoiceData(): Promise<EntryInvoiceData> {
        const dateOfIssue = new Date(
            moment('03-02-2020', 'DD-MM-YYYY').toString(),
        );
        const currency = 'EUR';
        const exchangeRate = await getCurrencyRate(currency, dateOfIssue);

        return {
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
}
