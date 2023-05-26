import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

admin.initializeApp();

sgMail.setApiKey(functions.config().sendgrid.key);

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
  // Define message for SendGrid email
  const msg = {
    to: email,
    from: 'welcome@codespeak.app', // Your verified sender
    subject: 'Welcome to CodeSpeak!',
    text: `
    Hello ${email},

    Welcome to CodeSpeak! We're thrilled to have you onboard.

    CodeSpeak is an intuitive web-based application designed to make your coding journey smoother. We help convert your inputted code into an easy-to-understand language, making the complex world of programming more accessible to you. Whether you're a novice just starting out, or an experienced programmer looking to understand your code better, CodeSpeak is here to help you.

    With our tool, you can select a programming language, input your code, and receive a human-readable interpretation of your code's logic. It's a great way to understand the intricacies of your code and build a solid foundation in coding principles.

    As a welcome gift, your account has been credited with 500 tokens to begin using the application.

    We're committed to constantly improving and expanding our services. As part of this commitment, we'll continually add new features and functionality to better serve your coding needs.

    We can't wait to help you grow and enhance your coding skills!

    Best,
    The CodeSpeak Team
  `,
  html: `
    <p>Hello ${email},</p>

    <p>Welcome to CodeSpeak! We're thrilled to have you onboard.</p>

    <p>CodeSpeak is an intuitive web-based application designed to make your coding journey smoother. We help convert your inputted code into an easy-to-understand language, making the complex world of programming more accessible to you. Whether you're a novice just starting out, or an experienced programmer looking to understand your code better, CodeSpeak is here to help you.</p>

    <p>With our tool, you can select a programming language, input your code, and receive a human-readable interpretation of your code's logic. It's a great way to understand the intricacies of your code and build a solid foundation in coding principles.</p>

    <p>As a welcome gift, your account has been credited with 500 tokens to begin using the application.</p>

    <p>We're committed to constantly improving and expanding our services. As part of this commitment, we'll continually add new features and functionality to better serve your coding needs.</p>

    <p>We can't wait to help you grow and enhance your coding skills!</p>

    <p>Best,<br/>The CodeSpeak Team</p>

    <p><img src="https://codespeak.app/logo.webp" alt="CodeSpeak Logo" width="200" height="200"/></p>

  `,
  };

  // Send the email
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent successfully');
    })
    .catch((error) => {
      console.error(`Error: Failed to send welcome email. ${error as string}`);
      throw new functions.https.HttpsError('internal', 'Failed to send welcome email');
  });
});
