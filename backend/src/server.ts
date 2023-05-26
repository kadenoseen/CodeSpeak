// server.ts

// Import necessary modules
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import { config } from 'dotenv';
import path from 'path';
import * as admin from 'firebase-admin';
import serviceAccount from './service-account.json'; // get service account from service-account.json
import { Stripe } from 'stripe';

// Initialize Firebase Admin SDK with service account and database URL
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://codespeak-387722-default-rtdb.firebaseio.com'
});

// Load environmental variables
config();

// Setup server configuration
const port = process.env.PORT || 3001;
const app = express();
app.use(cors());

// Initialize Stripe instance
const stripeAPIKey = process.env.STRIPE_KEY;
if (!stripeAPIKey) throw new Error('Missing Stripe API key');
const stripeInstance = new Stripe(stripeAPIKey, { apiVersion: "2022-11-15" });

// POST endpoint to handle Stripe webhooks
app.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  // Extract the Stripe signature from the request headers
  const sig = req.headers['stripe-signature'];

  // Check if the signature exists and is not an array (it should be a string)
  if (!sig || Array.isArray(sig)) {
    console.log("Invalid signature");
    // Return an error response
    return res.status(400).send(`Webhook Error: Invalid signature`);
  }

  // Get the Stripe webhook secret from environment variables
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK;
  // If the secret is not defined, throw an error
  if (!stripeWebhookSecret) throw new Error('Missing Stripe webhook secret');

  let event: Stripe.Event;

  // Try to construct the event using the received payload, signature and the webhook secret
  try {
    event = stripeInstance.webhooks.constructEvent(req.body.toString(), sig, stripeWebhookSecret);
  } catch (err) {
    console.log("Error constructing event");
    // If the event cannot be constructed, return an error response
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  // If the event type is 'checkout.session.completed' (which means the payment was successful)
  if (event.type === 'checkout.session.completed') {
    // Cast the event data object to a Stripe Checkout Session object
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve the client reference id and the total amount from the session
    const uid = session.client_reference_id;
    const amount = session.amount_total; // Convert back to dollar amount

    // If uid or amount does not exist, throw an error
    if (!uid || !amount) throw new Error('Missing client reference id or amount');
    console.log("ADDING TOKENS TO USER", uid, amount)
    // Call the addTokens function to add the purchased tokens to the user's account
    await addTokens(uid, amount);
  }

  // Send a response indicating that the webhook has been received
  res.json({ received: true });
});

// Parse body as JSON for all other routes after the webhook route
app.use(bodyParser.json());

// Interface for request body when submitting code
interface SubmitRequestBody {
  code: string;
  language: string;
  userId: string;
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start server and listen on port
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// POST endpoint to handle code submission and translation
app.post('/submit', async (req: Request<{}, {}, SubmitRequestBody & { uid: string }>, res: Response) => {
  try {
    // Destructure the incoming request body for code, language, and user id (uid)
    const { code, language, uid } = req.body;
    console.log(`User ID: ${uid}`);
    // Calculate token count based on code length and some constants
    const charged = Math.ceil((code.length / 3) + 350);
    const tokenCount = Math.ceil(((code.length / 3) + 350 ) / 35);
    console.log(`Charged token count: ${charged}`);
    // Try to deduct the calculated token count from the user's account
    try {
      await removeTokens(uid, tokenCount);
    } catch (error) {
      // If the user doesn't have enough tokens, send an error message and end the request
      if (error instanceof Error && error.message === 'Insufficient tokens') {
        res.status(400).send({ message: "Insufficient tokens" });
        return;
      }
      // If any other error occurs, rethrow it
      throw error;
    }

    console.log(`${language} code received.\nProcessing...`);
    
    let codeSpeak;
    try {
      // Attempt to translate the submitted code
      codeSpeak = await translateCode(code, language);
    } catch (error) {
      console.log(error);
      // If an error occurs during translation, refund the tokens back to the user
      await addTokens(uid, tokenCount);
      // Send an error response with the specific error message or a general failure message
      if (error instanceof Error) {
        res.status(500).send({ message: `Failed to translate code: ${error.message}` });
      } else {
        res.status(500).send({ message: "Failed to translate code" });
      }
      return;
    }

    // Send a success response with the translated code
    res.status(200).send({ message: codeSpeak });
  } catch (error) {
    // If any other error occurs, log it and send a general error response
    console.log(error);
    res.status(500).send({ message: "An unexpected error occurred" });
  }
});

const configuration: Configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai: OpenAIApi = new OpenAIApi(configuration);

const systemMessage: string = "Transform code to spoken language, 'CodeSpeak'. \
  For syntax, map basic operators to phrases: '==', 'if', 'for'. \
  Name variables based on function: 'i' could be 'index'. \
  Describe flow, hierarchy, and error handling using phrases. \
  Use analogies for complex ideas rather than including code snippets.\
  Ensure clarity and understanding. If no code is provided, tell a joke.";


// Asynchronous function to translate code using OpenAI
async function translateCode(code: string, language: string): Promise<string> {
  
  // Use OpenAI's createChatCompletion method to translate the provided code
  // The method takes an object that specifies the model (in this case "gpt-4") and a series of messages
  // The system message gives the model instructions, and the user message contains the code to be translated
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{role: "system", content: systemMessage}, { role: "user", content: `Convert the following ${language} code: ${code}`}],
  })

  // Log the number of tokens used by the prompt and in total
  const tokensUsed = completion.data.usage?.total_tokens;
  const promptUsed = completion.data.usage?.prompt_tokens;
  console.log(`Prompt tokens used: ${promptUsed}`);
  console.log(`Actual tokens used: ${tokensUsed}`);

  // Retrieve the translated message from the API response
  const messageContent = completion.data.choices[0].message?.content;

  // If the translation failed (i.e., there's no message content), throw an error
  if (messageContent === undefined) {
    throw new Error("Failed to translate code");
  }

  // If the translation was successful, return the translated message
  return messageContent;
}


// Function to remove tokens from a user's account
async function removeTokens(uid: string, tokenCount: number) {
  // Reference to the user in the database
  const userRef = admin.database().ref('users/' + uid);

  // Retrieve the current token count
  let currentTokens = 0;
  await userRef.child('tokens').once('value', (snapshot) => {
    currentTokens = snapshot.val();
  });

  // Check if user has enough tokens
  if (currentTokens < tokenCount) {
    throw new Error('Insufficient tokens');
  }

  // Compute the new token count
  const newTokens = currentTokens - tokenCount;

  // Update the token count in the database
  return userRef.update({ tokens: newTokens });
}


// Function to add tokens to a user's account
async function addTokens(uid: string, tokenCount: number) {
  // Reference to the user in the database
  const userRef = admin.database().ref('users/' + uid);

  // Retrieve the current token count
  let currentTokens = 0;
  await userRef.child('tokens').once('value', (snapshot) => {
    currentTokens = snapshot.val();
  });

  // Compute the new token count
  const newTokens = currentTokens + tokenCount;

  // Update the token count in the database
  return userRef.update({ tokens: newTokens });
}

// This endpoint is used to create a new Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
  // Extract amount, currency, and user id (uid) from the request body
  const { amount, currency, uid } = req.body;

  // Create a new checkout session by calling the create method of the stripeInstance.sessions object
  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ['card'],  // Specify the payment methods to be accepted
    line_items: [
      {
        price_data: {
          currency: currency,  // Set the currency for the transaction
          product_data: {
            name: 'CodeSpeak Tokens',  // Name the product for this transaction
          },
          unit_amount: 1,  // Set the price per unit (in cents)
        },
        quantity: amount,  // Set the quantity to be purchased
      },
    ],
    client_reference_id: uid,  // Use the user id as the client reference id
    mode: 'payment',  // Set the session mode to 'payment'
    success_url: 'https://codespeak.app',  // Specify the URL to redirect to on successful payment
    cancel_url: 'https://codespeak.app',  // Specify the URL to redirect to if the customer cancels
  });

  // Send the session id back in the response
  res.json({ id: session.id });
});
