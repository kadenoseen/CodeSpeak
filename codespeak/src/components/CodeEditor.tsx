import React, { useState, useEffect } from 'react';
import MonacoEditor, { EditorDidMount } from 'react-monaco-editor';
import { editor as monacoEditor } from 'monaco-editor';
import styles from '../css/CodeEditor.module.css';

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
  const [editorValue, setEditorValue] = useState(value);

  const editorDidMount: EditorDidMount = (editor: monacoEditor.IStandaloneCodeEditor, monaco: any) => {
    editor.onDidChangeModelContent((event: monacoEditor.IModelContentChangedEvent) => {
      const newValue = editor.getValue();
      const newTokenCount = Math.ceil((newValue.length / 3) + 350);
  
      if(newTokenCount > 6650) {
        const trimmedValue = newValue.slice(0, (6650 - 350) * 3); // Trim the value to fit the limit
        editor.setValue(trimmedValue);
      } else {
        setIsValueSet(newValue !== '');
        setEditorValue(newValue);
        onChange(newValue, event);
      }
    });
  };
  

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleClick = () => {
    setIsFocused(true);
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
          value={editorValue}
          onChange={() => {}} // Make onChange a no-op
          editorDidMount={editorDidMount}
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
