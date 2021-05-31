import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dgraph } from 'easy-dgraph';
import { UrqlModule } from './urql.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class DgraphModule {

  private _type!: string;

  constructor(private urql: UrqlModule) {}

  type(type: string): this {
    this._type = type;
    return this;
  }

  subscription(q: any) {
    const { gql } = this.newDG().query(q).generateSub();
    return this.urql.subscription(gql);
  }

  async add(q: any) {
    const { gql } = this.newDG().add(q).generate();
    return await this.urql.mutation(gql);
  }

  async update(q: any) {
    const { gql } = this.newDG().update(q).generate();
    return await this.urql.mutation(gql);
  }

  async delete(q: any) {
    const { gql } = this.newDG().delete(q).generate();
    return await this.urql.mutation(gql);
  }

  private newDG() {
    return new Dgraph(this._type);
  }

}
