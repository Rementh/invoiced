import { Component } from '@angular/core';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export default class DashboardComponent {
    public generatePdf() {
        console.log('generating');
    }
}
