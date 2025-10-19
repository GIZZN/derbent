'use client';

import { Code, Plus, X } from 'lucide-react';
import { SkillsSectionProps, Skill } from '../../../types';
import CustomSelect from '../../ui/CustomSelect';
import styles from './SkillsSection.module.css';

export default function SkillsSection({ skills, setSkills }: SkillsSectionProps) {
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'Beginner'
    };
    setSkills([...skills, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const levelOptions = [
    { value: 'Beginner', label: 'Начинающий' },
    { value: 'Intermediate', label: 'Средний' },
    { value: 'Advanced', label: 'Продвинутый' },
    { value: 'Expert', label: 'Эксперт' }
  ];

  return (
    <div className={styles.skillsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <Code size={20} /> Навыки
        </h2>
        <button onClick={addSkill} className={styles.addButton}>
          <Plus size={16} /> Добавить навык
        </button>
      </div>

      <div className={styles.skillsGrid}>
        {skills.map((skill) => (
          <div key={skill.id} className={styles.skillItem}>
            <button onClick={() => removeSkill(skill.id)} className={styles.removeSkillButton}>
              <X size={12} />
            </button>
            
            <div className={styles.skillContent}>
              <div className={styles.inputGroup}>
                <label>Навык</label>
                <input
                  className={styles.input}
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                  placeholder="JavaScript, Python, React..."
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label>Уровень владения</label>
                <CustomSelect
                  options={levelOptions}
                  value={skill.level}
                  onChange={(value) => updateSkill(skill.id, 'level', value as Skill['level'])}
                  placeholder="Выберите уровень"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
