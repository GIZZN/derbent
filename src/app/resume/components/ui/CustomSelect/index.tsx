'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { CustomSelectProps } from '../../../types';
import styles from './CustomSelect.module.css';

export default function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.customSelectContainer} ref={selectRef}>
      <button
        className={`${styles.customSelectButton} ${isOpen ? styles.selectOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {options.find(opt => opt.value === value)?.label || placeholder || 'Выберите...'}
        <ChevronDown 
          className={`${styles.selectArrow} ${isOpen ? styles.selectArrowOpen : ''}`}
          size={16}
        />
      </button>
      {isOpen && (
        <div className={styles.customSelectDropdown}>
          {options.map((option) => (
            <button
              key={option.value}
              className={`${styles.selectOption} ${option.value === value ? styles.selectOptionActive : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
