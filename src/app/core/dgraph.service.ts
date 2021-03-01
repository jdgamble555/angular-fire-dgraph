import { Injectable } from '@angular/core';
import { UrqlModule } from './urql.module';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';


interface Task {
  id: string;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DgraphService {

  //tasks: Task[];
  tasks: any;

  constructor(public urql: UrqlModule) {
    //this.tasks = [];
  }

  async query(q: any, subscription = true): Promise<any> {

    //this.tasks = this.urql.subscription(q).map((r: any) => r.data.queryTask);

    // client
    if (subscription) {
      this.urql.subscription(q)
        .subscribe((r: any) => {
          this.tasks = r.data.queryTask
        });
      // server
    } else {
      this.tasks = await this.urql.query(q)
        .then((r: any) => r.data.queryTask);
    }

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
