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

  private dg!: Dgraph;

  constructor(private urql: UrqlModule) { }

  type(type: string): this {
    this.dg = new Dgraph(type);
    return this;
  }

  set(q: any) {
    this.dg = this.dg.set(q);
    return this;
  }

  filter(q: any) {
    this.dg = this.dg.filter(q);
    return this;
  }

  subscription(q: any) {
    const gql = this.dg.query(q).buildSubscription();
    return this.urql.subscription(gql);
  }

  async get(q: any) {
    const gql = this.dg.get(q).build();
    return this.urql.query(gql);
  }

  async query(q: any) {
    const gql = this.dg.query(q).build();
    return this.urql.query(gql);
  }

  async add(q: any) {
    const gql = this.dg.add(q).build();
    return await this.urql.mutation(gql);
  }

  async update(q?: any) {
    const gql = this.dg.update(q).build();
    return await this.urql.mutation(gql);
  }

  async delete(q?: any) {
    const gql = this.dg.delete(q).build();
    return await this.urql.mutation(gql);
  }

}
