import { Injectable } from '@angular/core';
import { Dgraph } from 'easy-dgraph';
import { UrqlModule } from './urql.module';

@Injectable({
  providedIn: 'root'
})
export class DgraphService {

  constructor(private urql: UrqlModule) { }

  type(t: string) {
    return new dgraph(this.urql).type(t);
  }
}

// extend the original dgraph module
export class dgraph extends Dgraph {

  constructor(private urql: UrqlModule) {
    super();
  }

  async build() {
    const gql = super.build();
    if (this._operation === 'mutation') {
      return await this.urql.mutation(gql);
    }
    return await this.urql.query(gql);
  }

  buildSubscription() {
    this.operation('subscription');
    const gql = super.build();
    return this.urql.subscription(gql);
  }

}
