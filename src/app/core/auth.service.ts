import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user!: any;

  constructor(public afa: AngularFireAuth, private router: Router) {
    this.user = this.afa.authState.pipe(
      shareReplay(),
    );
  }

  async getToken(): Promise<any> {
    return await new Promise((resolve: any) => {
      this.afa.user.subscribe((user) => {
        if (user) {
          user.getIdToken(true).then((token) => {
            resolve(token);
          });
        }
      });
    });
  }

  async loginWithGoogle() {
    await this.afa.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.router.navigate(['/dashboard']);
  }

  async logout() {
    await this.afa.signOut();
    this.router.navigate(['/']);
  }
}
