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


const App: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState({ value: 'javascript', label: 'JavaScript' });
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
      body: JSON.stringify({ code, language: language.value, uid: currentUser?.uid, mode }),
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
      <h1 className="title">CodeSpeak</h1>
      {currentUser ? (
        <>
        <div className="fadeIn">
          <Logout />
          <TokenDisplay onClick={handleTokenClick} />
          <TokenPurchaseModal open={showModal} onClose={handleCloseModal} />
          <div className="headingAndSelector">
            <h2 className="languageTitle">🌐 Language</h2>
            <LanguageSelector
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
