import { NgModule } from '@angular/core';

/* Prototypes */
import './utils/number-prototypes';
import './utils/array-prototypes';
import './utils/string-prototypes';

/* Imports */
import { BrowserModule } from '@angular/platform-browser';
import RoutingModule from './modules/routing.module';
import { AngularFireModule } from '@angular/fire';
import config from './configs/firebase.config.json';

/* UI Components */
import AsyncButtonComponent from './components/async-button/async-button.component';

/* Views */
import AppComponent from './views/app/app.component';
import DashboardComponent from './views/dashboard/dashboard.component';
import LoginComponent from './views/login/login.component';

@NgModule({
    declarations: [
        AsyncButtonComponent,
        AppComponent,
        DashboardComponent,
        LoginComponent,
    ],
    imports: [
        BrowserModule,
        RoutingModule,
        AngularFireModule.initializeApp(config),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export default class AppModule {}
