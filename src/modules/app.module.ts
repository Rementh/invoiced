import { NgModule } from '@angular/core';

/* Prototype */
import '../utils/number-prototypes';
import '../utils/array-prototypes';
import '../utils/string-prototypes';

/* Imports */
import { BrowserModule } from '@angular/platform-browser';
import RoutingModule from './routing.module';

/* Declarations */
import AppComponent from '../views/app/app.component';
import DashboardComponent from '../views/dashboard/dashboard.component';

@NgModule({
    declarations: [AppComponent, DashboardComponent],
    imports: [BrowserModule, RoutingModule],
    providers: [],
    bootstrap: [AppComponent],
})
export default class AppModule {}
