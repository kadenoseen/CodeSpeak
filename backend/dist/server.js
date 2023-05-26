"use strict";
// server.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary modules
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const openai_1 = require("openai");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const admin = __importStar(require("firebase-admin"));
const service_account_json_1 = __importDefault(require("./service-account.json")); // get service account from service-account.json
const stripe_1 = require("stripe");
// Initialize Firebase Admin SDK with service account and database URL
admin.initializeApp({
    credential: admin.credential.cert(service_account_json_1.default),
    databaseURL: 'https://codespeak-387722-default-rtdb.firebaseio.com'
});
// Load environmental variables
(0, dotenv_1.config)();
// Setup server configuration
const port = process.env.PORT || 3001;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// Initialize Stripe instance
const stripeAPIKey = process.env.STRIPE_KEY;
if (!stripeAPIKey)
    throw new Error('Missing Stripe API key');
const stripeInstance = new stripe_1.Stripe(stripeAPIKey, { apiVersion: "2022-11-15" });
// POST endpoint to handle Stripe webhooks
app.post('/webhook', body_parser_1.default.raw({ type: 'application/json' }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (!stripeWebhookSecret)
        throw new Error('Missing Stripe webhook secret');
    let event;
    // Try to construct the event using the received payload, signature and the webhook secret
    try {
        event = stripeInstance.webhooks.constructEvent(req.body.toString(), sig, stripeWebhookSecret);
    }
    catch (err) {
        console.log("Error constructing event");
        // If the event cannot be constructed, return an error response
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // If the event type is 'checkout.session.completed' (which means the payment was successful)
    if (event.type === 'checkout.session.completed') {
        // Cast the event data object to a Stripe Checkout Session object
        const session = event.data.object;
        // Retrieve the client reference id and the total amount from the session
        const uid = session.client_reference_id;
        const amount = session.amount_total; // Convert back to dollar amount
        // If uid or amount does not exist, throw an error
        if (!uid || !amount)
            throw new Error('Missing client reference id or amount');
        console.log("ADDING TOKENS TO USER", uid, amount);
        // Call the addTokens function to add the purchased tokens to the user's account
        yield addTokens(uid, amount);
    }
    // Send a response indicating that the webhook has been received
    res.json({ received: true });
}));
// Parse body as JSON for all other routes after the webhook route
app.use(body_parser_1.default.json());
// Serve static files from the React app
app.use(express_1.default.static(path_1.default.join(__dirname, '../build')));
// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('/*', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../build', 'index.html'));
});
// Start server and listen on port
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
// POST endpoint to handle code submission and translation
app.post('/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Destructure the incoming request body for code, language, and user id (uid)
        const { code, language, uid, mode } = req.body;
        console.log(`Mode: ${mode}`);
        // Calculate token count based on code length and some constants
        const charged = Math.ceil((code.length / 4) + 600);
        let tokenCount = Math.ceil(((code.length / 4) + 600) / 20);
        if (mode === 2) {
            tokenCount = Math.ceil(tokenCount / 5);
        }
        console.log(`Charged token count: ${charged}`);
        // Try to deduct the calculated token count from the user's account
        try {
            yield removeTokens(uid, tokenCount);
        }
        catch (error) {
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
            if (mode === 1) {
                codeSpeak = yield translateCode(code, language, "gpt-4");
            }
            else {
                codeSpeak = yield translateCode(code, language, "gpt-3.5-turbo");
            }
        }
        catch (error) {
            console.log(error);
            // If an error occurs during translation, refund the tokens back to the user
            yield addTokens(uid, tokenCount);
            // Send an error response with the specific error message or a general failure message
            if (error instanceof Error) {
                res.status(500).send({ message: `Failed to translate code: ${error.message}` });
            }
            else {
                res.status(500).send({ message: "Failed to translate code" });
            }
            return;
        }
        // Send a success response with the translated code
        res.status(200).send({ message: codeSpeak });
    }
    catch (error) {
        // If any other error occurs, log it and send a general error response
        console.log(error);
        res.status(500).send({ message: "An unexpected error occurred" });
    }
}));
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
const systemMessage = "Transform code to spoken language, 'CodeSpeak'. \
  For syntax, map basic operators to phrases: '==', 'if', 'for'. \
  Name variables based on function: 'i' could be 'index'. \
  Describe flow, hierarchy, and error handling using phrases. \
  Use analogies for complex ideas rather than including code snippets.\
  Ensure clarity and understanding. If no code is provided, tell a joke.";
// Asynchronous function to translate code using OpenAI
function translateCode(code, language, model) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        // Use OpenAI's createChatCompletion method to translate the provided code
        // The method takes an object that specifies the model (in this case "gpt-4") and a series of messages
        // The system message gives the model instructions, and the user message contains the code to be translated
        const completion = yield openai.createChatCompletion({
            model: model,
            messages: [{ role: "system", content: systemMessage }, { role: "user", content: `Convert the following ${language} code: ${code}` }],
        });
        // Log the number of tokens used by the prompt and in total
        const tokensUsed = (_a = completion.data.usage) === null || _a === void 0 ? void 0 : _a.total_tokens;
        const promptUsed = (_b = completion.data.usage) === null || _b === void 0 ? void 0 : _b.prompt_tokens;
        console.log(`Prompt tokens used: ${promptUsed}`);
        console.log(`Actual tokens used: ${tokensUsed}`);
        // Retrieve the translated message from the API response
        const messageContent = (_c = completion.data.choices[0].message) === null || _c === void 0 ? void 0 : _c.content;
        // If the translation failed (i.e., there's no message content), throw an error
        if (messageContent === undefined) {
            throw new Error("Failed to translate code");
        }
        // If the translation was successful, return the translated message
        return messageContent;
    });
}
// Function to remove tokens from a user's account
function removeTokens(uid, tokenCount) {
    return __awaiter(this, void 0, void 0, function* () {
        // Reference to the user in the database
        const userRef = admin.database().ref('users/' + uid);
        // Retrieve the current token count
        let currentTokens = 0;
        yield userRef.child('tokens').once('value', (snapshot) => {
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
    });
}
// Function to add tokens to a user's account
function addTokens(uid, tokenCount) {
    return __awaiter(this, void 0, void 0, function* () {
        // Reference to the user in the database
        const userRef = admin.database().ref('users/' + uid);
        // Retrieve the current token count
        let currentTokens = 0;
        yield userRef.child('tokens').once('value', (snapshot) => {
            currentTokens = snapshot.val();
        });
        // Compute the new token count
        const newTokens = currentTokens + tokenCount;
        // Update the token count in the database
        return userRef.update({ tokens: newTokens });
    });
}
// This endpoint is used to create a new Stripe Checkout session
app.post('/create-checkout-session', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract amount, currency, and user id (uid) from the request body
    const { amount, currency, uid } = req.body;
    // Create a new checkout session by calling the create method of the stripeInstance.sessions object
    const session = yield stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: 'CodeSpeak Tokens', // Name the product for this transaction
                    },
                    unit_amount: 1, // Set the price per unit (in cents)
                },
                quantity: amount, // Set the quantity to be purchased
            },
        ],
        client_reference_id: uid,
        mode: 'payment',
        success_url: 'https://codespeak.app',
        cancel_url: 'https://codespeak.app', // Specify the URL to redirect to if the customer cancels
    });
    // Send the session id back in the response
    res.json({ id: session.id });
}));
