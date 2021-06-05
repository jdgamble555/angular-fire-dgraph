import { Injectable } from '@angular/core';
import { dgraph } from './dgraph';
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

  private dgraph(t: string) {
    return new dgraph(this.urql).type(t);
  }

  subscription(): void {

    // get task subscription
    this.dgraph('task').query({
      id: 1,
      title: 1,
      completed: 1,
      user: {
        email: 1
      }
    }).buildSubscription().subscribe((r: any) => {
      this.tasks = r;
    });
  }

  async add(q: any): Promise<void> {

    // random string will be replaced with dgraph id
    const id = this.randString();

    // add task optimistically
    this.tasks = [...this.tasks, { ...q, id }];

    // add to dgraph
    await this.dgraph('task').set(q).add({
      completed: 1
    }).build();

  }

  async update(id: string, q: any): Promise<void> {

    // toggle completed task optimistically
    this.tasks = this.tasks.map((r: any) => {
      if (r['id'] === id) {
        r['completed'] = q['completed'];
      }
      return r;
    });

    // add to dgraph
    await this.dgraph('task').filter(id).set(q).update().build();

  }

  async delete(id: string): Promise<void> {

    // delete task optimistically
    this.tasks = this.tasks.filter((r: any) => r['id'] !== id);

    // delete from dgraph
    await this.dgraph('task').filter(id).delete().build();

  }

  private randString(): string {

    // generate random string
    return Math.random().toString(36).substr(2, 5);
  }

}
