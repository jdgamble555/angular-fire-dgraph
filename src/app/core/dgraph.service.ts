import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UrqlModule } from './urql.module';
import { map } from 'rxjs/operators';


export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DgraphService {

  tasks: Task[];

  constructor(public urql: UrqlModule) {
    this.tasks = [];
  }

  query(q: any): void {

    this.urql.subscription(q).subscribe((r: any) => {
      this.tasks = r.data.queryTask;
    });

  }

  add(q: any): void {

    // random string will be replaced with dgraph id
    const id = this.randString();

    // add task optimistically
    this.tasks = [...this.tasks, { ...q, id }];
  }

  update(q: any): void {

    // toggle completed task optimistically
    this.tasks = this.tasks.map((r: any) => {
      if (r['id'] === q['id']) {
        r['completed'] = q['completed'];
      }
      return r;
    });
  }

  delete(id: string): void {

    // delete task optimistically
    this.tasks = this.tasks.filter((r: any) => r['id'] !== id);
  }

  private randString(): string {

    // generate random string
    return Math.random().toString(36).substr(2, 5);
  }

}
