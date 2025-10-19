'use client';

import { Save, Eye } from 'lucide-react';
import { HeroSectionProps } from '../../../types';
import styles from './HeroSection.module.css';

export default function HeroSection({ onLoadResume, onShowPreview, showPreview }: HeroSectionProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Создайте <span className={styles.highlight}>профессиональное</span> резюме
        </h1>
        <p className={styles.heroSubtitle}>
          Заполните информацию о себе, опыте работы, образовании и навыках. 
          Создайте резюме, которое поможет вам получить работу мечты.
        </p>
        <div className={styles.heroActions}>
          <button onClick={onLoadResume} className={styles.loadButton}>
            <Save size={16} />
            Загрузить резюме
          </button>
          <button onClick={onShowPreview} className={styles.previewButton}>
            <Eye size={16} />
            {showPreview ? 'Скрыть превью' : 'Показать превью'}
          </button>
        </div>
      </div>
    </div>
  );
}
