'use client';

import { GraduationCap, Plus, X } from 'lucide-react';
import { EducationSectionProps, Education } from '../../../types';
import MonthYearSelect from '../../ui/MonthYearSelect';
import styles from './EducationSection.module.css';

export default function EducationSection({ education, setEducation }: EducationSectionProps) {
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false
    };
    setEducation([...education, newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  return (
    <div className={styles.educationSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <GraduationCap size={20} /> Образование
        </h2>
        <button onClick={addEducation} className={styles.addButton}>
          <Plus size={16} /> Добавить образование
        </button>
      </div>

      {education.map((edu) => (
        <div key={edu.id} className={styles.educationItem}>
          <button onClick={() => removeEducation(edu.id)} className={styles.removeButton}>
            <X size={16} />
          </button>
          
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Учебное заведение *</label>
              <input
                className={styles.input}
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                placeholder="Название университета/колледжа"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Степень/Уровень *</label>
              <input
                className={styles.input}
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                placeholder="Бакалавр, Магистр, Специалист"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Специальность *</label>
              <input
                className={styles.input}
                type="text"
                value={edu.field}
                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                placeholder="Информатика и вычислительная техника"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Дата поступления *</label>
              <MonthYearSelect
                value={edu.startDate}
                onChange={(value) => updateEducation(edu.id, 'startDate', value)}
                placeholder="Выберите дату поступления"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Дата окончания</label>
              <MonthYearSelect
                value={edu.endDate}
                onChange={(value) => updateEducation(edu.id, 'endDate', value)}
                placeholder="Выберите дату окончания"
                disabled={edu.current}
              />
              <div className={styles.checkbox}>
                <input
                  type="checkbox"
                  id={`current-edu-${edu.id}`}
                  checked={edu.current}
                  onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                />
                <label htmlFor={`current-edu-${edu.id}`}>Учусь сейчас</label>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
