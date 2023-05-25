import { useEffect, useState, createContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAitXTvJZQ6HbbNW82B2S0StaAJ45o_SJE",
  authDomain: "codespeak-387722.firebaseapp.com",
  projectId: "codespeak-387722",
  storageBucket: "codespeak-387722.appspot.com",
  messagingSenderId: "895133804230",
  appId: "1:895133804230:web:0706fe71f56ffc99e9d9c7",
  measurementId: "G-D3T6X5CJH9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

type AuthContextProps = {
  currentUser: User | null;
};

export const AuthContext = createContext<Partial<AuthContextProps>>({});

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
