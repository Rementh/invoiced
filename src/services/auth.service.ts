import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { CanActivate, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { User } from 'src/models/auth';
import 'firebase/auth';

@Injectable({
    providedIn: 'root',
})
export class AuthService implements CanActivate {
    constructor(private auth: AngularFireAuth, private router: Router) {}

    login = (email: string, password: string): Observable<User> =>
        from(this.auth.signInWithEmailAndPassword(email, password));

    logout = (): Observable<void> =>
        from(this.auth.signOut()).pipe(
            tap(() => this.router.navigate(['/login'])),
        );

    canActivate = (): Observable<boolean> =>
        this.auth.authState.pipe(
            map(user => !!user),
            tap(res => res || this.router.navigate(['/login'])),
        );
}
