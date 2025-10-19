'use client';

import React from 'react';
import { 
  Resume, 
  ResumeSkill, 
  ResumeExperience, 
  ResumeEducation, 
  ResumeProject, 
  ResumeAchievement, 
  ResumeLanguage, 
  ResumeCertification 
} from '../../lib/api/resumesApi';
import { 
  Star, 
  Globe, 
  Lock, 
  Calendar, 
  MapPin, 
  Award, 
  Code, 
  GraduationCap, 
  Briefcase, 
  Trophy, 
  Languages, 
  Verified,
  ExternalLink,
  Github,
  Brain
} from 'lucide-react';
import styles from './ResumeViewer.module.css';

interface ResumeViewerProps {
  resume: Resume;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onSetDefault?: () => void;
  onTogglePublic?: () => void;
  onAIAnalysis?: () => void;
  showActions?: boolean;
}

export default function ResumeViewer({ 
  resume, 
  onEdit, 
  onDuplicate, 
  onSetDefault, 
  onTogglePublic, 
  onAIAnalysis,
  showActions = true 
}: ResumeViewerProps) {
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Некорректная дата';
      }
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return 'Некорректная дата';
    }
  };

  const formatDateRange = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = formatDate(startDate);
    if (isCurrent) {
      return `${start} - настоящее время`;
    }
    if (endDate) {
      const end = formatDate(endDate);
      return `${start} - ${end}`;
    }
    return start;
  };

  const getSkillLevelText = (level: number) => {
    const levels = ['Новичок', 'Начальный', 'Средний', 'Продвинутый', 'Эксперт'];
    return levels[level - 1] || 'Не указан';
  };

  const getLanguageLevelText = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'Basic': 'Базовый',
      'Elementary': 'Начальный',
      'Intermediate': 'Средний',
      'Upper-Intermediate': 'Выше среднего',
      'Advanced': 'Продвинутый',
      'Fluent': 'Свободно',
      'Native': 'Родной'
    };
    return levelMap[level] || level;
  };

  const getSkillLevelColor = (level: number) => {
    const colors = ['#ff6b6b', '#ffa726', '#ffeb3b', '#66bb6a', '#42a5f5'];
    return colors[level - 1] || '#e0e0e0';
  };

  return (
    <div className={styles.resumeViewer}>
      {/* Заголовок резюме */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{resume.title}</h1>
          <div className={styles.badges}>
            {resume.isDefault && (
              <span className={styles.badge} title="Основное резюме">
                <Star size={14} />
                Основное
              </span>
            )}
            {resume.isPublic ? (
              <span className={styles.badge} title="Публичное резюме">
                <Globe size={14} />
                Публичное
              </span>
            ) : (
              <span className={styles.badge} title="Приватное резюме">
                <Lock size={14} />
                Приватное
              </span>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className={styles.actions}>
            {onAIAnalysis && (
              <button onClick={onAIAnalysis} className={styles.aiAnalysisButton}>
                <Brain size={16} />
                AI Анализ
              </button>
            )}
            {onEdit && (
              <button onClick={onEdit} className={styles.actionButton}>
                Редактировать
              </button>
            )}
            {onDuplicate && (
              <button onClick={onDuplicate} className={styles.actionButton}>
                Дублировать
              </button>
            )}
            {onSetDefault && !resume.isDefault && (
              <button onClick={onSetDefault} className={styles.actionButton}>
                Сделать основным
              </button>
            )}
            {onTogglePublic && (
              <button onClick={onTogglePublic} className={styles.actionButton}>
                {resume.isPublic ? 'Сделать приватным' : 'Сделать публичным'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Краткое описание */}
      {resume.summary && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>О себе</h2>
          <p className={styles.summary}>{resume.summary}</p>
        </div>
      )}

      {/* Цель */}
      {resume.objective && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Цель</h2>
          <p className={styles.objective}>{resume.objective}</p>
        </div>
      )}

      {/* Навыки */}
      {resume.skills && resume.skills.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Code size={20} />
            Навыки
          </h2>
          <div className={styles.skillsGrid}>
            {resume.skills.map((skill, index) => (
              <div key={index} className={styles.skillItem}>
                <div className={styles.skillHeader}>
                  <span className={styles.skillName}>{skill.name}</span>
                  <span 
                    className={styles.skillLevel}
                    style={{ color: getSkillLevelColor(skill.level) }}
                  >
                    {getSkillLevelText(skill.level)}
                  </span>
                </div>
                {skill.category && (
                  <span className={styles.skillCategory}>{skill.category}</span>
                )}
                <div className={styles.skillBar}>
                  <div 
                    className={styles.skillBarFill}
                    style={{ 
                      width: `${(skill.level / 5) * 100}%`,
                      backgroundColor: getSkillLevelColor(skill.level)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Опыт работы */}
      {resume.experiences && resume.experiences.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Briefcase size={20} />
            Опыт работы
          </h2>
          <div className={styles.experienceList}>
            {resume.experiences.map((exp, index) => (
              <div key={index} className={styles.experienceItem}>
                <div className={styles.experienceHeader}>
                  <h3 className={styles.experiencePosition}>{exp.position}</h3>
                  <div className={styles.experienceCompany}>
                    <span className={styles.companyName}>{exp.company}</span>
                    <span className={styles.experiencePeriod}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                    </span>
                  </div>
                </div>
                
                {exp.description && (
                  <p className={styles.experienceDescription}>{exp.description}</p>
                )}
                
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className={styles.achievements}>
                    <h4>Достижения:</h4>
                    <ul>
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className={styles.technologies}>
                    <h4>Технологии:</h4>
                    <div className={styles.techTags}>
                      {exp.technologies.map((tech, idx) => (
                        <span key={idx} className={styles.techTag}>{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Образование */}
      {resume.educations && resume.educations.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <GraduationCap size={20} />
            Образование
          </h2>
          <div className={styles.educationList}>
            {resume.educations.map((edu, index) => (
              <div key={index} className={styles.educationItem}>
                <div className={styles.educationHeader}>
                  <h3 className={styles.educationDegree}>{edu.degree}</h3>
                  <div className={styles.educationInstitution}>
                    <span className={styles.institutionName}>{edu.institution}</span>
                    <span className={styles.educationField}>{edu.field}</span>
                  </div>
                  <div className={styles.educationPeriod}>
                    {formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}
                    {edu.gpa && <span className={styles.gpa}>GPA: {edu.gpa}</span>}
                  </div>
                </div>
                {edu.description && (
                  <p className={styles.educationDescription}>{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Проекты */}
      {resume.projects && resume.projects.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Code size={20} />
            Проекты
          </h2>
          <div className={styles.projectsList}>
            {resume.projects.map((project, index) => (
              <div key={index} className={styles.projectItem}>
                <div className={styles.projectHeader}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  <div className={styles.projectPeriod}>
                    {formatDateRange(project.startDate, project.endDate, project.isCurrent)}
                  </div>
                </div>
                
                <p className={styles.projectDescription}>{project.description}</p>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className={styles.projectTechnologies}>
                    <div className={styles.techTags}>
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className={styles.techTag}>{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className={styles.projectLinks}>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                      <ExternalLink size={14} />
                      Сайт проекта
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                      <Github size={14} />
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Достижения */}
      {resume.achievements && resume.achievements.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Trophy size={20} />
            Достижения
          </h2>
          <div className={styles.achievementsList}>
            {resume.achievements.map((achievement, index) => (
              <div key={index} className={styles.achievementItem}>
                <div className={styles.achievementHeader}>
                  <h3 className={styles.achievementTitle}>{achievement.title}</h3>
                  <span className={styles.achievementDate}>{formatDate(achievement.date)}</span>
                </div>
                <p className={styles.achievementDescription}>{achievement.description}</p>
                <span className={styles.achievementCategory}>{achievement.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Языки */}
      {resume.languages && resume.languages.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Languages size={20} />
            Языки
          </h2>
          <div className={styles.languagesList}>
            {resume.languages.map((language, index) => (
              <div key={index} className={styles.languageItem}>
                <span className={styles.languageName}>{language.name}</span>
                <span className={styles.languageLevel}>{getLanguageLevelText(language.level)}</span>
                {language.certification && (
                  <span className={styles.languageCertification}>{language.certification}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Сертификаты */}
      {resume.certifications && resume.certifications.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Verified size={20} />
            Сертификаты
          </h2>
          <div className={styles.certificationsList}>
            {resume.certifications.map((cert, index) => (
              <div key={index} className={styles.certificationItem}>
                <div className={styles.certificationHeader}>
                  <h3 className={styles.certificationName}>{cert.name}</h3>
                  <span className={styles.certificationDate}>{formatDate(cert.date)}</span>
                </div>
                <div className={styles.certificationDetails}>
                  <span className={styles.certificationIssuer}>{cert.issuer}</span>
                  {cert.credentialId && (
                    <span className={styles.certificationId}>ID: {cert.credentialId}</span>
                  )}
                </div>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className={styles.certificationLink}>
                    <ExternalLink size={14} />
                    Просмотреть сертификат
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Метаданные */}
      <div className={styles.metadata}>
        <div className={styles.metadataItem}>
          <Calendar size={16} />
          <span>Создано: {formatDate(resume.createdAt)}</span>
        </div>
        {resume.updatedAt !== resume.createdAt && (
          <div className={styles.metadataItem}>
            <Calendar size={16} />
            <span>Обновлено: {formatDate(resume.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
