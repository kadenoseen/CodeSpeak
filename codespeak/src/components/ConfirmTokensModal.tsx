import React from 'react';
import styles from '../css/ConfirmTokensModal.module.css';

interface ConfirmTokensModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tokens: number;
}

const ConfirmTokensModal: React.FC<ConfirmTokensModalProps> = ({ open, onClose, onConfirm, tokens }) => {

  return (
    open ?
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>You are about to use {tokens} tokens.<br></br><br></br>Proceed?</h2>
        <div className={styles.modalButtons}>
          <button onClick={onConfirm}>✅</button>
          <button onClick={onClose}>❌</button>
        </div>
      </div>
    </div>
    : null
  );
};

export default ConfirmTokensModal;
