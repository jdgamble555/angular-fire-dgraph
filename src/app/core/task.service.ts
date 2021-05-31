import { Injectable } from '@angular/core';
import { DgraphModule } from './dgraph';
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

    const { gql } = new DgraphModule('task').query({
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
    }).generateSub();

    this.urql.subscription(gql)
      .subscribe((r: any) => {
        this.tasks = r;
      });
  }

  async add(q: any): Promise<void> {

    // random string will be replaced with dgraph id
    const id = this.randString();

    // add task optimistically
    this.tasks = [...this.tasks, { ...q, id }];

    const { gql } = new DgraphModule('task').add({
      _set: q,
      _select: {
        completed: true
      }
    }).generate();

    await this.urql.mutation(gql);

  }

  async update(id: string, q: any): Promise<void> {

    // toggle completed task optimistically
    this.tasks = this.tasks.map((r: any) => {
      if (r['id'] === q['id']) {
        r['completed'] = q['completed'];
      }
      return r;
    });

    const { gql } = new DgraphModule('task').update({
      _find: {
        id
      },
      _set: q
    }).generate();

    await this.urql.mutation(gql);

  }

  async delete(id: string): Promise<void> {

    // delete task optimistically
    this.tasks = this.tasks.filter((r: any) => r['id'] !== id);

    const { gql } = new DgraphModule('task').delete({
      _find: {
        id
      }
    }).generate();

    await this.urql.mutation(gql);

  }

  private randString(): string {

    // generate random string
    return Math.random().toString(36).substr(2, 5);
  }

}
