# URQL / Firebase Auth / Dgraph / Angular Universal

# Configuration

Create a [Slash Dgraph](https://slash.dgraph.io/) project.

Add this [schema.graphql](schema.graphql) to the project with **Audience** containing your firebase project id.

Configure **environments/environment.ts**

```typescript
environment = {
  production: false,
  firebase: {
    ...
    firebase config here
    ...
  },
  uri: 'Your endpoint'
}
```

Also create a file **functions/src/config.ts**

```typescript
export const config = {
  firebase: {
    ...
    firebase config here
    ...
  },
  uri: 'Your endpoint',
  admin_email: 'Your admin email address'
};

```

Note: The endpoint should not contain the scheme (http://)

Deploy the firebase function **addUser** to your firebase project

Goto: https://console.cloud.google.com/iam-admin/

Make sure you add the role 'Service Account Token Creator' in your project to both:
- YOUR-PROJECT@appspot.gserviceaccount.com
- your google user member account

# URQL NOTES

These were installed to regular package:

- npm i @urql/core graphql

- npm i subscriptions-transport-ws ws
- npm i --save-dev @types/ws

- npm i isomorphic-unfetch
- npm i --save-dev @types/node-fetch

- npm i utf-8-validate bufferutil

- ng add @nguniversal/express-engine
- ng add @angular/fire

- npm i zen-observable
- npm i --save-dev @types/zen-observable

Added to allowedCommonJsDependencies in angular.json
- subscriptions-transport-ws
- isomorphic-unfetch
- zen-observable

queries.ts - all dgraph queries

Added HttpClientModule for fetch replacement
Added Firebase Modules

Firebase Functions Package:

- npm i --save firebase

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
