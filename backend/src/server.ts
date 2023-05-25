// server.ts
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import { config } from 'dotenv';
import path from 'path';
import * as admin from 'firebase-admin';
// get service account from service-account.json
import serviceAccount from './service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://codespeak-387722-default-rtdb.firebaseio.com'
});


config();

const port = process.env.PORT || 3001;

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

const app = express();

app.use(bodyParser.json());

app.use(cors());

interface SubmitRequestBody {
  code: string;
  language: string;
  userId: string;
}

app.use(express.static(path.join(__dirname, '../build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.post('/submit', async (req: Request<{}, {}, SubmitRequestBody & { uid: string }>, res: Response) => {
  try {
    const { code, language, uid } = req.body;
    console.log(`User ID: ${uid}`);
    // Calculate token count
    const charged = Math.ceil((code.length / 3) + 350);
    const tokenCount = Math.ceil(((code.length / 3) + 350 ) / 35);
    console.log(`Charged token count: ${charged}`);
    // Attempt to update tokens in the database
    try {
      await updateTokens(uid, tokenCount);
    } catch (error) {
      if (error instanceof Error && error.message === 'Insufficient tokens') {
        res.status(400).send({ message: "Insufficient tokens" });
        return;
      }
      throw error;
    }

    console.log(`${language} code received.\nProcessing...`);
    
    let codeSpeak;
    try {
      codeSpeak = await translateCode(code, language);
    } catch (error) {
      console.log(error);
      // Refund tokens if translation fails
      await updateTokens(uid, -tokenCount);
      if (error instanceof Error) {
        res.status(500).send({ message: `Failed to translate code: ${error.message}` });
      } else {
        res.status(500).send({ message: "Failed to translate code" });
      }
      return;
    }

    res.status(200).send({ message: codeSpeak });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "An unexpected error occurred" });
  }
});


async function translateCode(code: string, language: string): Promise<string> {
  
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{role: "system", content: systemMessage}, { role: "user", content: `Convert the following ${language} code: ${code}`}],
  })
  const tokensUsed = completion.data.usage?.total_tokens;
  const promptUsed = completion.data.usage?.prompt_tokens;
  console.log(`Prompt tokens used: ${promptUsed}`);
  console.log(`Actual tokens used: ${tokensUsed}`);
  const messageContent = completion.data.choices[0].message?.content;
  if (messageContent === undefined) {
    throw new Error("Failed to translate code");
  }

  return messageContent;
}

async function updateTokens(uid: string, tokenCount: number) {
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
