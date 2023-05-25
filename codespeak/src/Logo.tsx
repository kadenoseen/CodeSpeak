// Logo.tsx
import React from 'react';
import styles from './css/Logo.module.css';

interface LogoProps {
  src: string;
}

const Logo: React.FC<LogoProps> = ({ src }) => {
  return (
    <img src={src} className={styles.logo} alt="Logo" />
  );
};

export default Logo;
