// LanguageSelector.tsx
import React from 'react';
import Select from 'react-select';
import styles from './css/LanguageSelector.module.css';

interface LanguageOption {
  value: string;
  label: string;
}

interface LanguageSelectorProps {
  options: LanguageOption[];
  value: LanguageOption;
  onChange: (selectedOption: LanguageOption) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ options, value, onChange }) => {
    const handleChange = (selectedOption: LanguageOption | null) => {
      if (selectedOption) {
        onChange(selectedOption);
      }
    };
  
    return <Select options={options} value={value} onChange={handleChange} className={styles.languageSelector} />
};
  

export default LanguageSelector;
