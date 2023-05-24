"use strict";
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
// server.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const openai_1 = require("openai");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)();
const port = process.env.PORT || 3001;
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
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '../build')));
app.get('/*', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../build', 'index.html'));
});
app.post('/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get code and language from request body
    try {
        const { code, language } = req.body;
        console.log(`${language} code received.\nProcessing...`);
        const codeSpeak = yield translateCode(code, language);
        res.status(200).send({ message: codeSpeak });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to translate code" });
    }
}));
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
function translateCode(code, language) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const completion = yield openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "system", content: systemMessage }, { role: "user", content: `Convert the following ${language} code: ${code}` }],
        });
        const messageContent = (_a = completion.data.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
        if (messageContent === undefined) {
            throw new Error("Failed to translate code");
        }
        console.log("Analysis complete. Results: " + messageContent);
        return messageContent;
    });
}
