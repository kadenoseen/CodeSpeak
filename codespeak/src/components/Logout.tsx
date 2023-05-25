import React from "react";
import { getAuth, signOut } from "firebase/auth";
import styles from '../css/Logout.module.css';

const Logout: React.FC = () => {
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
  );
};

export default Logout;
