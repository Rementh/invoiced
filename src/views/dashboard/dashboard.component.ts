import { Component } from '@angular/core';
import { makePdf } from '../../utils/pdf-maker';
import calculateInvoiceData from 'src/utils/invoice-calculator';
import makeDesignDoc from 'src/utils/design-doc-maker';
import { EntryInvoiceData } from 'src/models/invoice';
import { AuthService } from 'src/services/auth.service';
import { Observable, from } from 'rxjs';
import { getCurrencyRate } from 'src/api/external';
import { map } from 'rxjs/operators';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export default class DashboardComponent {
    constructor(private authService: AuthService) {}

    public logout = () => this.authService.logout();

    public async generatePdf(entryInvoiceData: EntryInvoiceData) {
        const invoice = calculateInvoiceData(entryInvoiceData);
        const designDoc = makeDesignDoc(invoice);
        makePdf(designDoc).download();
    }

    public prepareEntryInvoiceData = (): Observable<EntryInvoiceData> => {
        const currency = 'EUR';
        const dateOfIssue = new Date();

        return from(getCurrencyRate(currency, dateOfIssue)).pipe(
            map(exchangeRate => ({
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
                invoiceNumber: 2,
                products: [
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
            })),
        );
    };
}
