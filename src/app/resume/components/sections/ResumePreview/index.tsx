'use client';

import { ResumePreviewProps } from '../../../types';
import styles from './ResumePreview.module.css';

export default function ResumePreview({ 
  personalInfo, 
  experiences, 
  education, 
  skills, 
  showPreview 
}: ResumePreviewProps) {
  if (!showPreview) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getLevelTranslation = (level: string) => {
    const levels = {
      'Beginner': 'Начинающий',
      'Intermediate': 'Средний',
      'Advanced': 'Продвинутый',
      'Expert': 'Эксперт'
    };
    return levels[level as keyof typeof levels] || level;
  };

  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewContent}>
        <h3>Предварительный просмотр</h3>
        <div className={styles.resumePreview}>
          {/* Header */}
          <div className={styles.previewHeader}>
            <h1>{personalInfo.fullName || 'Ваше имя'}</h1>
            <h2>{personalInfo.title || 'Желаемая должность'}</h2>
            <div className={styles.previewContacts}>
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
            </div>
          </div>

          {/* Summary */}
          {personalInfo.summary && (
            <div className={styles.previewSection}>
              <h3>О себе</h3>
              <p>{personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <div className={styles.previewSection}>
              <h3>Опыт работы</h3>
              {experiences.map((exp) => (
                <div key={exp.id} className={styles.previewItem}>
                  <h4>{exp.position} в {exp.company}</h4>
                  <div className={styles.previewDates}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Настоящее время' : formatDate(exp.endDate)}
                  </div>
                  {exp.description && <p>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className={styles.previewSection}>
              <h3>Образование</h3>
              {education.map((edu) => (
                <div key={edu.id} className={styles.previewItem}>
                  <h4>{edu.degree} - {edu.field}</h4>
                  <p>{edu.institution}</p>
                  <div className={styles.previewDates}>
                    {formatDate(edu.startDate)} - {edu.current ? 'Настоящее время' : formatDate(edu.endDate)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className={styles.previewSection}>
              <h3>Навыки</h3>
              <div className={styles.previewSkills}>
                {skills.map((skill) => (
                  <div key={skill.id} className={styles.previewSkill}>
                    {skill.name} - {getLevelTranslation(skill.level)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
