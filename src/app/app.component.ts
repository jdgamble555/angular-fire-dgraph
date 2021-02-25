import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { DgraphService } from './core/dgraph.service';
import {
  ADD_TASK,
  DEL_TASK,
  GET_TASKS,
  SUB_GET_TASKS,
  UPDATE_TASK,
} from "./core/queries";

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
export class AppComponent implements OnInit {

  @ViewChild('title', { static: true }) title!: ElementRef;

  tasks: any[] = [];

  user!: User;

  isBrowser!: boolean;

  constructor(
    public dg: DgraphService,
    @Inject(PLATFORM_ID) platformId: Object,
    public zone: NgZone,
    private afAuth: AngularFireAuth
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.afAuth.user.subscribe((user: any) => {
      this.user = user as User;
    });
  }

  async signIn(): Promise<void> {
    await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  async signOut(): Promise<void> {
    await this.afAuth.signOut();
  }

  async ngOnInit(): Promise<void> {

    if (!this.isBrowser) {
      await this.dg.query(GET_TASKS, false)
    } else {
      this.dg.query(SUB_GET_TASKS, true);
    }
  }


  async remove(id: string) {

    // first remove optimistically
    this.dg.delete(id);

    // remove task from db
    await this.dg.mutation(DEL_TASK, {
      id: [id]
    })
      .then((r: any) => {
        if (r.error) {
          console.log(r.error);
        }
      });
  }

  async add(title: string) {

    // new task
    const task = {
      title,
      completed: false,
      user: { username: this.user.email },
    };

    // first update optimistically
    this.dg.add(task);

    // add task to db
    await this.dg.mutation(ADD_TASK, {
      task
    })
      .then((r: any) => {
        if (r.error) {
          console.log(r.error);
        }
      });

    // clear form field
    this.title.nativeElement.value = '';
  }

  async toggle(id: string, completed: boolean) {

    // updated task
    const taskUpdate = {
      id,
      completed: !completed
    };

    // first update completed optimistically
    this.dg.update(taskUpdate);

    // toggle completed
    await this.dg.mutation(UPDATE_TASK, taskUpdate)
      .then((r: any) => {
        if (r.error) {
          console.log(r.error);
        }
      });
  }
}
