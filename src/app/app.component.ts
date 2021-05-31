import { Component, ElementRef, ViewChild } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { TaskService } from './core/task.service';

interface User {
  displayName: string;
  photoURL: string;
  uid: string;
  email: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('title', { static: true }) title!: ElementRef;

  user!: User;

  constructor(
    public ts: TaskService,
    private afAuth: AngularFireAuth
  ) {

    // user logged in
    this.afAuth.onAuthStateChanged((user: any) => {
      this.user = user as User;
    });

    // run query subscription
    this.ts.subscription();

  }

  async signIn(): Promise<void> {
    await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  async signOut(): Promise<void> {
    await this.afAuth.signOut();
  }

  async remove(id: string) {

    // remove task
    this.ts.delete(id);
  }

  async add(title: string) {

    // add task
    this.ts.add({
      title,
      completed: false,
      user: { email: this.user.email },
    });

    // clear form field
    this.title.nativeElement.value = '';
  }

  async toggle(id: string, completed: boolean) {

    // update task
    this.ts.update(id, {
      completed: !completed
    });
  }
}
