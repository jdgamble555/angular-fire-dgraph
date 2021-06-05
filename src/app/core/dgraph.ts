import { Dgraph } from "easy-dgraph";
import { UrqlModule } from "./urql.module";

export class dgraph extends Dgraph {


  constructor(private urql: UrqlModule) {
    super();
  }

  // allows you to build your gql and load it immediately
  async build() {

    if (this._operation === 'mutation') {
      return await this.urql.mutation(super.build());
    }
    return await this.urql.query(super.build());
  }

  buildSubscription() {
    this.operation('subscription');
    return this.urql.subscription(super.build());
  }

}
