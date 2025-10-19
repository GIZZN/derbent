'use client';

import { Briefcase, Plus, X } from 'lucide-react';
import { ExperienceSectionProps, Experience } from '../../../types';
import MonthYearSelect from '../../ui/MonthYearSelect';
import styles from './ExperienceSection.module.css';

export default function ExperienceSection({ experiences, setExperiences }: ExperienceSectionProps) {
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setExperiences([...experiences, newExp]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  return (
    <div className={styles.experienceSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <Briefcase size={20} /> Опыт работы
        </h2>
        <button onClick={addExperience} className={styles.addButton}>
          <Plus size={16} /> Добавить опыт
        </button>
      </div>

      {experiences.map((exp) => (
        <div key={exp.id} className={styles.experienceItem}>
          <button onClick={() => removeExperience(exp.id)} className={styles.removeButton}>
            <X size={16} />
          </button>
          
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Компания *</label>
              <input
                className={styles.input}
                type="text"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                placeholder="Название компании"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Должность *</label>
              <input
                className={styles.input}
                type="text"
                value={exp.position}
                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                placeholder="Ваша должность"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Дата начала *</label>
              <MonthYearSelect
                value={exp.startDate}
                onChange={(value) => updateExperience(exp.id, 'startDate', value)}
                placeholder="Выберите дату начала"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Дата окончания</label>
              <MonthYearSelect
                value={exp.endDate}
                onChange={(value) => updateExperience(exp.id, 'endDate', value)}
                placeholder="Выберите дату окончания"
                disabled={exp.current}
              />
              <div className={styles.checkbox}>
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                />
                <label htmlFor={`current-${exp.id}`}>Работаю сейчас</label>
              </div>
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label>Описание работы</label>
            <textarea
              className={styles.textarea}
              value={exp.description}
              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
              placeholder="Опишите ваши обязанности, достижения и проекты..."
              rows={3}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
