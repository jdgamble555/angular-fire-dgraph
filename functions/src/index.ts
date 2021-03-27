import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

// run once with ADMIN role, sign up, then re-deploy with your own RBA

exports.addUser = functions.auth
  .user()
  .onCreate(async (user) => {
    const uid = user.uid;
    return await admin
      .auth()
      .setCustomUserClaims(uid, {
        "https://dgraph.io/jwt/claims": {
          "USER": user.email,
          "ROLE": "ADMIN"
        }
      }).then(() => {
        return admin.auth().getUser(uid);
      }).then((user) => {
        console.log(uid);
        console.log(user.customClaims);
      })
      .catch((e: string) => {
        return e;
      });
  });
