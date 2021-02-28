import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from './../../environments/environment';
import {
  cacheExchange,
  Client,
  createClient,
  dedupExchange,
  fetchExchange,
  ssrExchange,
  subscriptionExchange,
} from '@urql/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import 'isomorphic-unfetch';
import * as ws from 'ws';
import { SSRExchange } from '@urql/core/dist/types/exchanges/ssr';
import { HttpClient } from '@angular/common/http';
import { pipe, toObservable } from 'wonka';
import { from } from 'zen-observable';
import { Observable } from 'rxjs';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class UrqlModule {

  private client!: Client;

  ssr!: SSRExchange;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient
  ) {

    const isServerSide = !isPlatformBrowser(platformId);

    const ssr = ssrExchange({
      isClient: !isServerSide,
      initialState: !isServerSide ? (window as any).__URQL_DATA__ : undefined,
    });

    const subscriptionClient = new SubscriptionClient(
      `wss://${environment.uri}`,
      {
        reconnect: true,
        lazy: true,
      },
      isServerSide ? ws : null
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
        ssr,
        fetchExchange,
        subscriptionExchange({
          forwardSubscription(operation) {
            return subscriptionClient.request(operation);
          },
        }),
      ],
    });
  }

  subscription(q: any): Observable<any[]> {
    return from(
      pipe(
        this.client.subscription(q),
        toObservable
      ) as any) as any;
  }

  async query(q: any): Promise<any> {
    return await this.client.query(q).toPromise();
  }

  async mutation(q: any, vars: any): Promise<any> {
    return await this.client.mutation(q, vars).toPromise();
  }
}
