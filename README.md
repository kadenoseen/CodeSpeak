# CodeSpeak

Created by Kaden Oseen

CodeSpeak is an intuitive web-based application designed to convert inputted code into easy-to-understand language, helping both novice and experienced programmers better comprehend the functionality of their code. Users can select a programming language, input their code, and receive a human-readable interpretation of their code's logic.

## Table of Contents

1. [Features](#features)
2. [Technology](#technology)
3. [Installation and Setup](#installation-and-setup)
4. [Backend](#backend)

## Features

- **Code Input:** Allows users to input any code snippet into the provided text editor.
- **Language Selection:** Users can choose the language of the code they are inputting for accurate translations.
- **Real-time Feedback:** Users receive a human-readable interpretation of their code's logic upon submission.

## Technology

CodeSpeak is built with React and TypeScript, providing a responsive and dynamic user interface. Code editing is facilitated by the Monaco Editor, and custom styles are written with CSS modules.

## Installation and Setup

### Prerequisites

Ensure you have Node.js and npm installed in your environment. 

### Clone the Repository

```bash
git clone https://github.com/kadenoseen/CodeSpeak.git
cd codespeak
```

### Install Dependencies
```bash
npm install
```

### Start the Application
```bash
npm start
```
Open your web browser and visit 'http://localhost:3000' to view the application.


## Backend

### Setup
#### Environment Variables
This application uses the following environment variables:
`OPENAI_API_KEY` - Your OpenAI API Key.

#### Running the Application Locally
1. Install dependencies using `npm install`.
2. Build the TypeScript application using `npm run build`.
3. Run the server using `npm start`.

### API Endpoints
#### POST /submit
Converts provided code into spoken language.

Parameters
- code (required): The programming code to be translated.
- language (required): The language in which the code is written.

Example
```json
{
  "code": "for(int i = 0; i < 10; i++) { console.log(i); }",
  "language": "javascript"
}
```

Response
- The endpoint responds with a message containing the spoken language translation of the provided code.

### Deploying The Application
1. Run `npm run build` on the frontend application.
2. Move the `build` folder into the `backend` folder
3. Run `npm run build` on the backend to ensure typescript code is compiled
4. Deploy with an `app.yaml` file for Google App Engine, or use own deployment of `node dist/server.js` as entrypoint.
