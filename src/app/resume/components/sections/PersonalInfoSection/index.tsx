'use client';

import { User } from 'lucide-react';
import { PersonalInfoSectionProps } from '../../../types';
import styles from './PersonalInfoSection.module.css';

export default function PersonalInfoSection({ personalInfo, setPersonalInfo }: PersonalInfoSectionProps) {
  return (
    <div className={styles.personalInfoSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <User size={20} /> Личная информация
        </h2>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label>Полное имя *</label>
          <input
            className={styles.input}
            type="text"
            value={personalInfo.fullName}
            onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
            placeholder="Иван Иванов"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Желаемая должность *</label>
          <input
            className={styles.input}
            type="text"
            value={personalInfo.title}
            onChange={(e) => setPersonalInfo({...personalInfo, title: e.target.value})}
            placeholder="Frontend Developer"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Email *</label>
          <input
            className={styles.input}
            type="email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
            placeholder="ivan@example.com"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Телефон</label>
          <input
            className={styles.input}
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
            placeholder="+7 (999) 999-99-99"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Местоположение</label>
          <input
            className={styles.input}
            type="text"
            value={personalInfo.location}
            onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
            placeholder="Москва, Россия"
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>О себе</label>
        <textarea
          className={styles.textarea}
          value={personalInfo.summary}
          onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
          placeholder="Расскажите немного о себе, своих целях и достижениях..."
          rows={4}
        />
      </div>
    </div>
  );
}
