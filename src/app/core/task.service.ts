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

  constructor(
    private urql: UrqlModule
  ) {
    this.tasks = [];
  }

  query(): void {

    // get task subscription
    this.urql.type('task').query({
      _select: {
        id: true,
        title: true,
        completed: true,
        user: {
          _select: {
            email: true
          }
        }
      }
    })
      .subscribe((r: any) => {
        this.tasks = r;
      });
  }

  async add(q: any): Promise<void> {

    // random string will be replaced with dgraph id
    const id = this.randString();

    // add task optimistically
    this.tasks = [...this.tasks, { ...q, id }];

    // add to dgraph
    await this.urql.add({
      _set: q,
      _select: {
        completed: true
      }
    });

  }

  async update(id: string, q: any): Promise<void> {

    // toggle completed task optimistically
    this.tasks = this.tasks.map((r: any) => {
      if (r['id'] === q['id']) {
        r['completed'] = q['completed'];
      }
      return r;
    });

    // add to dgraph
    await this.urql.update({
      _find: {
        id
      },
      _set: q
    });

  }

  async delete(id: string): Promise<void> {

    // delete task optimistically
    this.tasks = this.tasks.filter((r: any) => r['id'] !== id);

    // delete from dgraph
    await this.urql.delete({
      _find: {
        id
      }
    });

  }

  private randString(): string {

    // generate random string
    return Math.random().toString(36).substr(2, 5);
  }

}
