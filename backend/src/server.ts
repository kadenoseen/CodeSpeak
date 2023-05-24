// server.ts
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import { config } from 'dotenv';
import path from 'path';

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
}

app.use(express.static(path.join(__dirname, '../build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});


app.post('/submit', async (req: Request<{}, {}, SubmitRequestBody>, res: Response) => {
  // get code and language from request body
  try {
    const { code, language } = req.body;
    console.log(`${language} code received.\nProcessing...`);
    const codeSpeak: string = await translateCode(code, language);

    res.status(200).send({ message: codeSpeak });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to translate code" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

async function translateCode(code: string, language: string): Promise<string> {
  
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{role: "system", content: systemMessage}, { role: "user", content: `Convert the following ${language} code: ${code}`}],
  })
  const messageContent = completion.data.choices[0].message?.content;
  if (messageContent === undefined) {
    throw new Error("Failed to translate code");
  }

  console.log("Analysis complete. Results: " + messageContent);
  return messageContent;
}