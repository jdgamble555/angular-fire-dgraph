import { Injectable } from '@angular/core';
import { UrqlModule } from './urql.module';


export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  tasks: Task[];

  constructor(private urql: UrqlModule) {
    this.tasks = [];
  }

  mutation(q: any, vars: any): Promise<any> {
    return this.urql.mutation(q, vars);
  }

  async query(q: any): Promise<void> {

    if (this.urql.isServerSide) {
      this.tasks = await this.urql.query(q);
    } else {
      this.urql.subscription(q).subscribe((r: any) => {
        this.tasks = r;
      });
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
