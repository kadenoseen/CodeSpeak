import React from 'react';
import '../css/SwitchMode.css';

interface SwitchModeProps {
  mode: number;
  setMode: (value: number) => void;
}

const SwitchMode: React.FC<SwitchModeProps> = ({ mode, setMode }) => {
  const toggleMode = () => {
    setMode(mode === 1 ? 2 : 1);
  };

  return (
    <div className="switch" onClick={toggleMode}>
      <div className={`slider ${mode === 1 ? 'right' : 'left'}`}></div>
      <span className="emoji">Powerful<br></br>💥⏳</span>
      <span className="emoji">Fast<br></br>🐇🍃</span>
    </div>
  );
};

export default SwitchMode;
