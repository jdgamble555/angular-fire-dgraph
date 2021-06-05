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
    return await new Promise((resolve: any, reject: any) =>
      this.afa.onAuthStateChanged((user: firebase.User | null) => {
        if (user) {
          user?.getIdTokenResult()
            .then(async (r: firebase.auth.IdTokenResult) => {
              const token = (r.claims["https://dgraph.io/jwt/claims"])
                ? r.token
                : await user.getIdToken(true);
              resolve(token);
            }, (e: any) => reject(e));
        }
      })
    );
  }

  async loginWithGoogle() {
    await this.afa.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  async logout() {
    await this.afa.signOut();
  }

}


