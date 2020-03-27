import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { Router } from '@angular/router';

interface LoginResponse {
    error?: firebase.auth.Error;
}

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export default class LoginComponent {
    constructor(private authService: AuthService, private router: Router) {}

    login = () => this.authService.login('_', '_');

    navigateToApp = () => this.router.navigate(['/']);
}
