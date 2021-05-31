import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from './../../environments/environment';
import {
  Client,
  cacheExchange,
  createClient,
  dedupExchange,
  fetchExchange,
  subscriptionExchange,
} from '@urql/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { pipe, toObservable } from 'wonka';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import 'isomorphic-unfetch';
import * as ws from 'ws';
import { AuthService } from './auth.service';
import { DgraphModule } from 'easy-dgraph';

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
})
export class UrqlModule {

  private client!: Client;

  private _type!: string;

  isServerSide!: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient,
    private auth: AuthService
  ) {

    // get token from user...
    const getHeaders = async () => {
      return {
        "X-Auth-Token": await this.auth.getToken()
      };
    };

    // Add ssr exchange here if not using subscriptions
    this.isServerSide = !isPlatformBrowser(platformId);

    const subscriptionClient = new SubscriptionClient(
      `wss://${environment.uri}`,
      {
        reconnect: true,
        lazy: true,
        connectionParams: async () => await getHeaders()
      },
      this.isServerSide ? ws : null
    );

    this.client = createClient({
      // replace fetch with httpclient for ssr
      fetch: async (url: any, q: any): Promise<any> => {
        const data = await this.http
          .post(
            url,
            JSON.parse(q.body),
            { headers: await getHeaders() }
          )
          .toPromise();
        return {
          json: () => data
        };
      },
      url: `https://${environment.uri}`,
      exchanges: [
        dedupExchange,
        cacheExchange,
        fetchExchange,
        subscriptionExchange({
          forwardSubscription(operation) {
            return subscriptionClient.request(operation);
          },
        }),
      ],
    });
  }

  type(type: string): this {
    this._type = type;
    return this;
  }

  query(q: any) {
    const { gql } = this.newDG().query(q).generateSub();
    return this._subscription(gql);
  }

  async add(q: any) {
    const { gql } = this.newDG().add(q).generate();
    return await this._mutation(gql);
  }

  async update(q: any) {
    const { gql } = this.newDG().update(q).generate();
    return await this._mutation(gql);
  }

  async delete(q: any) {
    const { gql } = this.newDG().delete(q).generate();
    return await this._mutation(gql);
  }

  private newDG() {
    return new DgraphModule(this._type);
  }

  private _subscription(q: any, vars?: any): Observable<any> {

    // server
    if (this.isServerSide) {
      return from(this._query(q));
    }
    // browser
    return new Observable((observer: any) => {
      pipe(
        this.client.subscription(q, vars),
        toObservable
      ).subscribe(observer);
    })
      .pipe(
        map((r: any) => {
          if (r.error) {
            console.error(r.error);
          }
          return r.data ? r.data[Object.keys(r.data)[0]] : null;
        })
      );
  }

  private async _query(q: any): Promise<any> {
    // get query
    return await this.client.query(q).toPromise()
      .then((r: any) => {
        if (r.error) {
          console.error(r.error);
        }
        return r.data ? r.data[Object.keys(r.data)[0]] : null;
      });
  }

  private async _mutation(q: any, vars?: any): Promise<any> {
    return await this.client.mutation(q, vars).toPromise()
      .then((r: any) => {
        if (r.error) {
          console.error(r.error);
        }
        return r.data ? r.data[Object.keys(r.data)[0]] : null;
      });
  }
}
