import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { Router } from '@angular/router';

interface LoginForm {
    login: string;
    password: string;
}

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export default class LoginComponent {
    constructor(private authService: AuthService, private router: Router) {}

    login = ({ login, password }: LoginForm) => () =>
        this.authService.login(login, password);

    navigateToApp = () => this.router.navigate(['/']);

    handleLoginError = error => {
        // TODO replace with notification service when implemented
        console.log(error);
    };
}
