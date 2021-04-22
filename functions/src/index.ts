import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import firebase from "firebase/app";
import "firebase/auth";
import fetch from 'node-fetch';
import { config } from "./config";

admin.initializeApp();
firebase.initializeApp(config.firebase);

exports.addUser = functions.auth
  .user()
  .onCreate(async (user: admin.auth.UserRecord) => {
    const claims = {
      "https://dgraph.io/jwt/claims": {
        "EMAIL": user.email,
        "ROLE": user.email === config.admin_email ? 'ADMIN' : 'USER'
      }
    };
    return admin
      .auth()
      .setCustomUserClaims(user.uid, claims)
      // create user in dgraph
      .then(async () => {

        // get firebase token
        const token: any = await admin.auth().createCustomToken(user.uid, claims)
          .then((customToken: string) =>
            // use temp custom token to get firebase token
            firebase.auth().signInWithCustomToken(customToken)
              .then((cred: firebase.auth.UserCredential) => cred.user?.getIdToken()))
          .catch((e: string) => console.error(e));

        // add the user to dgraph
        return await fetch(config.uri, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token
          },
          body: JSON.stringify({
            query: `mutation addUser($user: AddUserInput!) {
              addUser(input: [$user]) {
                user {
                  email
                  displayName
                  createdAt
                }
              }
            }`,
            variables: {
              user: {
                email: user.email,
                displayName: user.displayName,
                createdAt: new Date().toISOString()
              }
            }
          })
        })
          .then((r) => r.json())
          .then((r) => console.log(JSON.stringify(r)))
          .catch((e: string) => console.error(e));
      });
  });
