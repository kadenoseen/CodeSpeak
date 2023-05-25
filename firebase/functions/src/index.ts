import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const { uid, email } = user;

  try {
    await admin.database().ref(`/users/${uid}`).set({
      email: email,
      tokens: 500,
    });
    console.log(`User ${uid} has been added to the database.`);
  } catch (error) {
    console.error(`Error: Failed to create user document. ${error as string}`);
    throw new functions.https.HttpsError('internal', 'Failed to create user document');
  }
});
