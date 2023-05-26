import React, { useState, useContext } from 'react';
import Logo from './components/Logo';
import CodeEditor from './components/CodeEditor';
import SubmitButton from './components/SubmitButton';
import LanguageSelector from './components/LanguageSelector';
import OutputDisplay from './components/OutputDisplay';
import { AuthContext } from "./contexts/AuthContext";
import Login from "./components/Login";
import Logout from "./components/Logout";
import TokenDisplay from './components/TokenDisplay';
import TokenPurchaseModal from './components/TokenPurchaseModal';
import ConfirmTokensModal from './components/ConfirmTokensModal';
import SwitchMode from './components/SwitchMode';
import InfoButton from './components/InfoButton';
import './css/App.css';

// Import the language features from Monaco Editor that we want to support
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution';
import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution';
import 'monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution';
import 'monaco-editor/esm/vs/basic-languages/php/php.contribution';
import 'monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution';
import 'monaco-editor/esm/vs/basic-languages/go/go.contribution';
import 'monaco-editor/esm/vs/basic-languages/rust/rust.contribution';
import 'monaco-editor/esm/vs/basic-languages/swift/swift.contribution';
import 'monaco-editor/esm/vs/basic-languages/r/r.contribution';
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution';
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution';
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution';
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution';
import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution';
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution';
import 'monaco-editor/esm/vs/basic-languages/perl/perl.contribution';


// This is the list of options for the language dropdown
const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'r', label: 'R' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'perl', label: 'Perl' },
];


const App: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(languageOptions[0]); // By default javascript
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState('');
  const { currentUser } = useContext(AuthContext);
  const [mode, setMode] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tokensToUse, setTokensToUse] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const handleTokenClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleLanguageChange = (selectedOption: any) => {
    setLanguage(selectedOption);
  };

  const handleButtonClick = () => {
    if(submitting || code.length < 5) return;
    console.log(currentUser?.uid);
    let tokens = Math.ceil(((code.length / 4) + 600 ) / 20);
    console.log(mode);
    if(mode === 2){
      tokens = Math.ceil(tokens / 5);
    }
    setTokensToUse(tokens);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: code, language: language.value, uid: currentUser?.uid }),
    })
      .then(response => response.json())
      .then(data => {
        setResult(data.message);
        setSubmitting(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setSubmitting(false);
      });
  };

  return (
    <div className="App">
      <Logo src="logo.webp" />
      {currentUser ? (
        <>
        <div className="fadeIn">
          <Logout />
          <TokenDisplay onClick={handleTokenClick} />
          <TokenPurchaseModal open={showModal} onClose={handleCloseModal} />
          <div className="headingAndSelector">
            <h2 className="languageTitle">🌐 Language</h2>
            <LanguageSelector
              options={languageOptions}
              value={language}
              onChange={handleLanguageChange}
            />
          </div>
          <div className="headingAndSelector2">
            <h2 className="modeTitle">⚙️ Mode</h2>
            <SwitchMode mode={mode} setMode={setMode} />
            <InfoButton/>
          </div>
          <CodeEditor value={code} onChange={handleCodeChange} language={language.value} height={`300px`} loading={submitting} />
          {code? <SubmitButton onClick={handleButtonClick} /> : null}
          <OutputDisplay result={result} />
          <ConfirmTokensModal 
            open={showConfirmModal} 
            onClose={() => setShowConfirmModal(false)} 
            onConfirm={handleConfirm} 
            tokens={tokensToUse} 
          />
        </div>
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;
