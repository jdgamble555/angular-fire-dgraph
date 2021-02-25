import { Injectable, OnDestroy } from '@angular/core';
import { UrqlModule } from './urql.module';
import { pipe, subscribe } from 'wonka';


interface Task {
  id: string;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DgraphService implements OnDestroy {

  tasks: Task[];

  unsubscribe: any;

  constructor(public urql: UrqlModule) {
    this.tasks = [];
  }

  /**
   * Note: to just return an RXJS Observable
   * for use in the template directly...
   *
   * const sub = new BehaviorSubject<any>([]);
   * pipe(
   * this.urql.client.subscription(q),
   * map((r: any) => {
   * return r.data.queryTask
   * }),
   * subscribe((r: any) => {
   * sub.next(r);
   * })
   * );
   * return sub;
   *
   */
  async query(q: any, subscription = true): Promise<any> {

    // client
    if (subscription) {
      this.unsubscribe = pipe(
        this.urql.client.subscription(q),
        subscribe((r: any) => {
          this.tasks = r.data.queryTask;
        })
      );
      // server
    } else {
      const d = await this.urql.client.query(q).toPromise();
      this.tasks = d.data.queryTask;
    }

  }

  async mutation(q: any, vars: any): Promise<any> {

    // run graphql mutation
    return await this.urql.client.mutation(q, vars).toPromise();
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

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
