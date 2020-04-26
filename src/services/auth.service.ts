import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { CanActivate, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { User, UserCredential } from 'src/models/auth';
import 'firebase/auth';

@Injectable({
    providedIn: 'root',
})
export class AuthService implements CanActivate {
    private currentUser: User;

    constructor(private auth: AngularFireAuth, private router: Router) {}

    public login = (email: string, password: string): Observable<UserCredential> =>
        from(this.auth.signInWithEmailAndPassword(email, password));

    public logout = (): Observable<void> =>
        from(this.auth.signOut()).pipe(tap(() => this.router.navigate(['/login'])));

    public canActivate = (): Observable<boolean> =>
        this.auth.authState.pipe(
            tap(user => (this.currentUser = user)),
            map(user => !!user),
            tap(canActivate => canActivate || this.router.navigate(['/login'])),
        );

    public get user() {
        return this.currentUser;
    }
}
