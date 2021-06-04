import { Injectable } from '@angular/core';
import { DgraphModule } from './dgraph.module';

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

  constructor(
    private dgraph: DgraphModule
  ) {
    this.tasks = [];
  }

  subscription(): void {

    // get task subscription
    this.dgraph.type('task').subscription({
      id: 1,
      title: 1,
      completed: 1,
      user: {
        email: 1
      }
    }).subscribe((r: any) => {
      this.tasks = r;
    });
  }

  async add(q: any): Promise<void> {

    // random string will be replaced with dgraph id
    const id = this.randString();

    // add task optimistically
    this.tasks = [...this.tasks, { ...q, id }];

    // add to dgraph
    await this.dgraph.type('task').set(q).add({
      completed: 1
    });

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
    await this.dgraph.type('task').filter(id).set(q).update();

  }

  async delete(id: string): Promise<void> {

    // delete task optimistically
    this.tasks = this.tasks.filter((r: any) => r['id'] !== id);

    // delete from dgraph
    await this.dgraph.type('task').filter(id).delete();

  }

  private randString(): string {

    // generate random string
    return Math.random().toString(36).substr(2, 5);
  }

}
