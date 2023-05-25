// TokenDisplay.tsx

import React, { useEffect, useState } from 'react';
import { auth, db } from '../contexts/AuthContext'; 
import { ref, onValue, off } from "firebase/database";
import styles from '../css/TokenDisplay.module.css';

const TokenDisplay: React.FC = () => {
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = auth.currentUser; // Get the current user using Firebase's auth object

  const userRef = ref(db, `users/${currentUser?.uid}/tokens`);

  useEffect(() => {
    const handleData = (snap: any) => {
      if (snap.exists()) {
        setTokens(snap.val());
        setLoading(false);
      } else {
        setTimeout(() => setLoading(true), 1000);
      }
      setLoading(false);
    }

    const handleError = (error: any) => {
      setError(error);
      setLoading(false);
    }

    onValue(userRef, handleData, handleError);

    return () => {
      off(userRef, 'value', handleData);
    };
  }, [currentUser, userRef, loading]);

  if (loading) {
    return (
      <div className={styles.tokenDisplay}>
        Balance: Loading...
        <img src='token.png' alt="Token" className={styles.tokenImage} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.tokenDisplay}>
        Balance Error
      </div>
    );
  }

  return (
    <div className={styles.tokenDisplay}>
      Balance: {tokens}
      <img src='token.png' alt="Token" className={styles.tokenImage} />
    </div>
  )};

export default TokenDisplay;
