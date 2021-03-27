import { Component, ElementRef, ViewChild } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { TaskService } from './core/task.service';
import {
  ADD_TASK,
  DEL_TASK,
  //GET_TASKS,
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
export class AppComponent {

  @ViewChild('title', { static: true }) title!: ElementRef;

  user!: User;

  constructor(
    public ts: TaskService,
    private afAuth: AngularFireAuth
  ) {

    // user logged in
    this.afAuth.user.subscribe((user: any) => {
      this.user = user as User;
    });

    // run query
    this.ts.query(SUB_GET_TASKS);
  }

  async signIn(): Promise<void> {
    await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  async signOut(): Promise<void> {
    await this.afAuth.signOut();
  }

  async remove(id: string) {

    const delId = {
      id: [id]
    };

    // first remove optimistically
    this.ts.delete(id);

    // remove task from db
    await this.ts.mutation(DEL_TASK, delId);

  }

  async add(title: string) {

    // new task
    const newTask = {
      task: [{
        title,
        completed: false,
        user: { username: this.user.email },
      }]
    };

    // first update optimistically
    this.ts.add(newTask.task[0]);

    // add task to db
    await this.ts.mutation(ADD_TASK, newTask);

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
    this.ts.update(taskUpdate);

    // toggle completed
    await this.ts.mutation(UPDATE_TASK, taskUpdate);

  }
}
