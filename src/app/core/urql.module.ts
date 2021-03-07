import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from './../../environments/environment';
import {
  cacheExchange,
  Client,
  createClient,
  dedupExchange,
  fetchExchange,
  subscriptionExchange,
} from '@urql/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { HttpClient } from '@angular/common/http';
import { pipe, toObservable } from 'wonka';
import { from, Observable } from 'rxjs';
import 'isomorphic-unfetch';
import * as ws from 'ws';
import { map } from 'rxjs/operators';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class UrqlModule {

  private client!: Client;

  isServerSide!: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient
  ) {

    // Add ssr exchange here if not using subscriptions

    this.isServerSide = !isPlatformBrowser(platformId);

    const subscriptionClient = new SubscriptionClient(
      `wss://${environment.uri}`,
      {
        reconnect: true,
        lazy: true,
      },
      this.isServerSide ? ws : null
    );

    this.client = createClient({
      // replace fetch with httpclient for ssr
      fetch: async (url: any, q: any): Promise<any> => {
        const b = JSON.parse(q.body);
        const opts = {
          headers: q.headers,
          operationName: b.operationName,
          query: b.query,
          variables: b.variables
        };
        const data = await this.http
          .post(url, opts)
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

  subscription(q: any): Observable<any> {

    // server
    if (this.isServerSide) {
      return from(this.query(q));
    }
    // browser
    return new Observable((observer: any) => {
      pipe(
        this.client.subscription(q),
        toObservable
      ).subscribe(observer);
    })
      .pipe(
        map((r: any) => r.data[Object.keys(r.data)[0]])
      );
  }

  async query(q: any): Promise<any> {
    // get query
    return await this.client.query(q).toPromise()
      .then((r: any) => r.data[Object.keys(r.data)[0]]);
  }

  async mutation(q: any, vars: any): Promise<any> {
    return await this.client.mutation(q, vars).toPromise();
  }
}
