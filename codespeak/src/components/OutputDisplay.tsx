// OutputDisplay.tsx
import React, { useEffect, useRef } from 'react';
import styles from '../css/OutputDisplay.module.css';

interface OutputDisplayProps {
  result: string;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ result }) => {
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  if(!result) {
    return null;
  }

  return (
    <div className={styles.outputDisplay} ref={resultRef}>
      <pre>{result}</pre>
    </div>
  );
};

export default OutputDisplay;
