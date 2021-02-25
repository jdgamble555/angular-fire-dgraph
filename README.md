# URQL / Firebase Auth / Dgraph / Angular Universal

# Configuration

Configure **environments/environment.ts**

```typescript
environment = {
  production: false,
  firebase: {
    ...
    firebase data here
    ...
  },
  uri: 'Your endpoint'
}
```

# URQL NOTES

These were  installed:

- @urql/core graphql

- npm i subscriptions-transport-ws ws
- npm i --save-dev @types/ws

- npm i isomorphic-unfetch
- npm i --save-dev @types/node-fetch

- npm i utf-8-validate bufferutil

- ng add @nguniversal/express-engine
- ng add @angular/fire

- queries.ts - all dgraph queries

Added to allowedCommonJsDependencies
subscriptions-transport-ws
isomorphic-unfetch

- npm i zen-observable
- npm i --save-dev @types/zen-observable

Added HttpClientModule for fetch replacement
Added Firebase Modules

# AngularFireDgraph

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
