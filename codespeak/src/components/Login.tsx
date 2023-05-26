import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import styles from '../css/Login.module.css';
import Alert from '@mui/material/Alert';
import { FirebaseError } from '@firebase/util';
import { sendPasswordResetEmail } from 'firebase/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const auth = getAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<"error" | "success">("error");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if(submitting) return;
    setShowAlert(false);
    if(!email.includes("@") || !email.includes(".") || email.length < 5) {
      setAlertMessage("Please enter a valid email address.");
      setShowAlert(true);
      return;
    }else if(password.length < 8) {
      setAlertMessage("Password must be at least 8 characters.");
      setShowAlert(true);
      return;
    }
    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      setAlertMessage("Invalid login credentials.");
      setShowAlert(true);
    }
    setSubmitting(false);
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if(submitting) return;
    setShowAlert(false);
    if(!email.includes("@") || !email.includes(".") || email.length < 5) {
      setAlertMessage("Please enter a valid email address.");
      setShowAlert(true);
      return;
    }else if(password.length < 8) {
      setAlertMessage("Password must be at least 8 characters.");
      setShowAlert(true);
      return;
    }
    try {
      setSubmitting(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error(error);
      setShowAlert(true);
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setAlertMessage("The email address is already in use by another account.");
          break;
        case "auth/invalid-email":
          setAlertMessage("The email address is badly formatted.");
          break;
        default:
          setAlertMessage("An unexpected error occurred. Please try again.");
          break;
      }
    }
    setSubmitting(false);
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if(submitting) return;
    setShowAlert(false);
    if(!email.includes("@") || !email.includes(".") || email.length < 5) {
      setAlertMessage("Please provide a valid email address.");
      setAlertSeverity("error");
      setShowAlert(true);
      return;
    }
    try {
      setSubmitting(true);
      await sendPasswordResetEmail(auth, email);
      setAlertSeverity("success");
      setAlertMessage("Password reset email sent!");
      setShowAlert(true);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error(firebaseError);
      setAlertMessage("Error sending password reset email. Please try again.");
      setShowAlert(true);
    }
    setSubmitting(false);
  };
  

  const toggleForm = (event: React.MouseEvent) => {
    event.preventDefault();
    setShowAlert(false);
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
  };
  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>
        {resetPassword ? "Reset Password" : isLogin ? "Sign Up" : "Login"}
      </h2>
      {showAlert && 
        <Alert
          severity={alertSeverity}
          onClose={() => setShowAlert(false)}
          sx={{
            width: '250px',
            marginTop: '25px',
            borderRadius: '10px',
            padding: '15px',
            animation: 'fadeIn 0.7s ease-in-out',
          }}
        >
          {alertMessage}
        </Alert>
      }
      {resetPassword ? (
        <form onSubmit={handlePasswordReset} className={styles.formContainer}>
          <input
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`${styles.inputField} ${showAlert ? styles.error : ''}`}
          />
          <div className={styles.buttonContainer}>
            <button type="button" className={styles.switchButton} onClick={(e) => {
              e.preventDefault();
              setResetPassword(false)}
            }>Back</button>
            <button type="submit" className={styles.submitButton} >Reset Password</button>
          </div>
        </form>
      ) : isLogin ?  (
        <form onSubmit={handleSignUp} className={styles.formContainer}>
          <h2 className={styles.signUpSubtitle}>🎉 Get started with 500 free tokens! 🎉</h2>
          <input
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`${styles.inputField} ${showAlert ? styles.error : ''}`}
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`${styles.inputField} ${showAlert ? styles.error : ''}`}
          />
          <button type="submit" className={styles.submitButton}>Create account</button>
          <button type="button" className={styles.switchButton} onClick={toggleForm}>Already have an account?</button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className={styles.formContainer}>
          <input
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`${styles.inputField} ${showAlert ? styles.error : ''}`}
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`${styles.inputField} ${showAlert ? styles.error : ''}`}
          />
          <button type="submit" className={styles.submitButton}>Login</button>
          <button type="button" className={styles.switchButton} onClick={toggleForm}>Don't have an account yet?</button>
          <button type="button" className={styles.forgotPasswordButton} onClick={() => setResetPassword(true)}>Forgot Password</button>
        </form>
      )}
    </div>
  );
}

export default Login;
