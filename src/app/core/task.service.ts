import { Injectable } from '@angular/core';
import { optimistic } from 'easy-dgraph';
import { DgraphService } from './dgraph.service';


export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  tasks: optimistic;

  constructor(private dgraph: DgraphService) {
    this.tasks = new optimistic();
  }

  subscription(): void {

    // get task subscription
    this.dgraph.type('task').query({
      id: 1,
      title: 1,
      completed: 1,
      user: {
        email: 1
      }
    }).buildSubscription().subscribe((r: any) => {
      this.tasks.data = r;
    });
  }

  async add(q: any): Promise<void> {

    // add optimistically
    this.tasks.add(q);

    // add to dgraph
    await this.dgraph.type('task').set(q).add({
      completed: 1
    }).build();
  }

  async update(id: string, q: any): Promise<void> {

    // update optimistically
    this.tasks.update(id, q);

    // add to dgraph
    await this.dgraph.type('task').filter(id).set(q).update().build();
  }

  async delete(id: string): Promise<void> {

    // delete optimistically
    this.tasks.delete(id);

  // delete from dgraph
    await this.dgraph.type('task').filter(id).delete().build();
  }

}
