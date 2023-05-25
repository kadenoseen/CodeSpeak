import React from 'react';
import styles from './css/SubmitButton.module.css';

interface SubmitButtonProps {
  onClick: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className={styles.submitButton}>
      Translate
    </button>
  );
};

export default SubmitButton;
