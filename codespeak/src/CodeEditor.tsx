import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import styles from './css/CodeEditor.module.css';

interface CodeEditorProps {
  value: string;
  onChange: (newValue: string, event: any) => void;
  language: string;
  height: string;
  loading: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language, height, loading }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValueSet, setIsValueSet] = useState(false);

  const handleClick = () => {
    setIsFocused(true);
  };

  const handleChange = (newValue: string, event: any) => {
    if(newValue !== '') setIsValueSet(true);
    else setIsValueSet(false);
    onChange(newValue, event);
  };

  return (
    <div className={styles.codeEditorContainer} style={{ height: height }}>
      {loading ? (
        <div className={styles.loadingContainer}>
          <img src="loading.gif" alt="Loading..." />
        </div>
      ) : (!isFocused && !isValueSet ? (
        <div className={styles.placeholder} onClick={handleClick}>
          Paste Code Here! 👇
        </div>
      ) : (
        <MonacoEditor
          height="100%"
          language={language}
          theme="vs"
          value={value}
          onChange={handleChange}
          options={{
            scrollbar: {
              vertical: 'hidden',
              verticalScrollbarSize: 0,
            },
            automaticLayout: true,
          }}
        />
      ))}
    </div>
  );
};

export default CodeEditor;

