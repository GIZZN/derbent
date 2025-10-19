'use client';

import React, { useState, useEffect } from 'react';
import { 
  Resume, 
  ResumeSkill, 
  ResumeExperience, 
  ResumeEducation, 
  ResumeProject, 
  ResumeAchievement, 
  ResumeLanguage, 
  ResumeCertification,
  UpdateResumeDto
} from '../../lib/api/resumesApi';
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit2, 
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
  X
} from 'lucide-react';
import styles from './ResumeEditor.module.css';
import { useNotificationContext } from '../../Components/NotificationProvider';

interface ResumeEditorProps {
  resume: Resume;
  onSave: (data: UpdateResumeDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ResumeEditor({ 
  resume, 
  onSave, 
  onCancel, 
  isLoading = false 
}: ResumeEditorProps) {
  const { showError } = useNotificationContext();
  
  // Утилитарные функции для работы с датами
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return true; // Пустые даты разрешены
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
  };

  const normalizeDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };
  
  // Состояние формы
  const [formData, setFormData] = useState<UpdateResumeDto>(() => {
    // Правильно обрабатываем даты при инициализации
    const processExperiences = (experiences: any[]) => {
      return experiences.map(exp => ({
        ...exp,
        startDate: formatDateForInput(exp.startDate),
        endDate: formatDateForInput(exp.endDate)
      }));
    };

    const processEducations = (educations: any[]) => {
      return educations.map(edu => ({
        ...edu,
        startDate: formatDateForInput(edu.startDate),
        endDate: formatDateForInput(edu.endDate)
      }));
    };

    const processProjects = (projects: any[]) => {
      return projects.map(project => ({
        ...project,
        startDate: formatDateForInput(project.startDate),
        endDate: formatDateForInput(project.endDate)
      }));
    };

    const processAchievements = (achievements: any[]) => {
      return achievements.map(achievement => ({
        ...achievement,
        date: formatDateForInput(achievement.date)
      }));
    };

    const processCertifications = (certifications: any[]) => {
      return certifications.map(cert => ({
        ...cert,
        date: formatDateForInput(cert.date)
      }));
    };

    return {
      title: resume.title,
      summary: resume.summary || '',
      objective: resume.objective || '',
      skills: resume.skills || [],
      experiences: processExperiences(resume.experiences || []),
      educations: processEducations(resume.educations || []),
      projects: processProjects(resume.projects || []),
      achievements: processAchievements(resume.achievements || []),
      languages: resume.languages || [],
      certifications: processCertifications(resume.certifications || []),
      isDefault: resume.isDefault,
      isPublic: resume.isPublic
    };
  });

  // Состояние для активной секции
  const [activeSection, setActiveSection] = useState<string>('basic');

  // Обработчики для основных полей
  const handleBasicChange = (field: keyof UpdateResumeDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Обработчики для навыков
  const addSkill = () => {
    const newSkill: ResumeSkill = {
      name: '',
      level: 1,
      category: ''
    };
    setFormData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill]
    }));
  };

  const updateSkill = (index: number, field: keyof ResumeSkill, value: any) => {
    // Убеждаемся, что level всегда является числом
    const processedValue = field === 'level' ? parseInt(value) || 1 : value;
    
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.map((skill, i) => 
        i === index ? { ...skill, [field]: processedValue } : skill
      ) || []
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || []
    }));
  };

  // Обработчики для опыта работы
  const addExperience = () => {
    const newExperience: ResumeExperience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      achievements: [],
      technologies: []
    };
    setFormData(prev => ({
      ...prev,
      experiences: [...(prev.experiences || []), newExperience]
    }));
  };

  const updateExperience = (index: number, field: keyof ResumeExperience, value: any) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences?.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ) || []
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences?.filter((_, i) => i !== index) || []
    }));
  };

  // Обработчики для образования
  const addEducation = () => {
    const newEducation: ResumeEducation = {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      gpa: undefined,
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      educations: [...(prev.educations || []), newEducation]
    }));
  };

  const updateEducation = (index: number, field: keyof ResumeEducation, value: any) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations?.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ) || []
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations?.filter((_, i) => i !== index) || []
    }));
  };

  // Обработчики для проектов
  const addProject = () => {
    const newProject: ResumeProject = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      technologies: [],
      url: '',
      githubUrl: ''
    };
    setFormData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), newProject]
    }));
  };

  const updateProject = (index: number, field: keyof ResumeProject, value: any) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects?.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      ) || []
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index) || []
    }));
  };

  // Обработчики для достижений
  const addAchievement = () => {
    const newAchievement: ResumeAchievement = {
      title: '',
      description: '',
      date: '',
      category: ''
    };
    setFormData(prev => ({
      ...prev,
      achievements: [...(prev.achievements || []), newAchievement]
    }));
  };

  const updateAchievement = (index: number, field: keyof ResumeAchievement, value: any) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements?.map((achievement, i) => 
        i === index ? { ...achievement, [field]: value } : achievement
      ) || []
    }));
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements?.filter((_, i) => i !== index) || []
    }));
  };

  // Обработчики для языков
  const addLanguage = () => {
    const newLanguage: ResumeLanguage = {
      name: '',
      level: '',
      certification: ''
    };
    setFormData(prev => ({
      ...prev,
      languages: [...(prev.languages || []), newLanguage]
    }));
  };

  const updateLanguage = (index: number, field: keyof ResumeLanguage, value: any) => {
    // Убеждаемся, что level всегда является строкой из допустимых значений
    const validLevels = ['Basic', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Fluent', 'Native'];
    const processedValue = field === 'level' && validLevels.includes(value) ? value : 
                          field === 'level' ? 'Basic' : value;
    
    setFormData(prev => ({
      ...prev,
      languages: prev.languages?.map((lang, i) => 
        i === index ? { ...lang, [field]: processedValue } : lang
      ) || []
    }));
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages?.filter((_, i) => i !== index) || []
    }));
  };

  // Обработчики для сертификатов
  const addCertification = () => {
    const newCertification: ResumeCertification = {
      name: '',
      issuer: '',
      date: '',
      credentialId: '',
      url: ''
    };
    setFormData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCertification]
    }));
  };

  const updateCertification = (index: number, field: keyof ResumeCertification, value: any) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      ) || []
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  // Обработчики для массивов в объектах
  const addArrayItem = (section: string, index: number, field: string) => {
    if (section === 'experiences') {
      const currentAchievements = formData.experiences?.[index]?.achievements || [];
      updateExperience(index, 'achievements', [...currentAchievements, '']);
    } else if (section === 'experiences') {
      const currentTechnologies = formData.experiences?.[index]?.technologies || [];
      updateExperience(index, 'technologies', [...currentTechnologies, '']);
    } else if (section === 'projects') {
      const currentTechnologies = formData.projects?.[index]?.technologies || [];
      updateProject(index, 'technologies', [...currentTechnologies, '']);
    }
  };

  const updateArrayItem = (section: string, index: number, field: string, itemIndex: number, value: string) => {
    if (section === 'experiences' && field === 'achievements') {
      const currentAchievements = formData.experiences?.[index]?.achievements || [];
      const updatedAchievements = currentAchievements.map((item, i) => i === itemIndex ? value : item);
      updateExperience(index, 'achievements', updatedAchievements);
    } else if (section === 'experiences' && field === 'technologies') {
      const currentTechnologies = formData.experiences?.[index]?.technologies || [];
      const updatedTechnologies = currentTechnologies.map((item, i) => i === itemIndex ? value : item);
      updateExperience(index, 'technologies', updatedTechnologies);
    } else if (section === 'projects' && field === 'technologies') {
      const currentTechnologies = formData.projects?.[index]?.technologies || [];
      const updatedTechnologies = currentTechnologies.map((item, i) => i === itemIndex ? value : item);
      updateProject(index, 'technologies', updatedTechnologies);
    }
  };

  const removeArrayItem = (section: string, index: number, field: string, itemIndex: number) => {
    if (section === 'experiences' && field === 'achievements') {
      const currentAchievements = formData.experiences?.[index]?.achievements || [];
      const updatedAchievements = currentAchievements.filter((_, i) => i !== itemIndex);
      updateExperience(index, 'achievements', updatedAchievements);
    } else if (section === 'experiences' && field === 'technologies') {
      const currentTechnologies = formData.experiences?.[index]?.technologies || [];
      const updatedTechnologies = currentTechnologies.filter((_, i) => i !== itemIndex);
      updateExperience(index, 'technologies', updatedTechnologies);
    } else if (section === 'projects' && field === 'technologies') {
      const currentTechnologies = formData.projects?.[index]?.technologies || [];
      const updatedTechnologies = currentTechnologies.filter((_, i) => i !== itemIndex);
      updateProject(index, 'technologies', updatedTechnologies);
    }
  };

  // Сохранение формы
  const handleSave = async () => {
    try {
      // Проверяем валидность всех дат перед отправкой
      const hasInvalidDates = [
        ...(formData.experiences || []),
        ...(formData.educations || []),
        ...(formData.projects || []),
        ...(formData.achievements || []),
        ...(formData.certifications || [])
      ].some(item => {
        if ('startDate' in item && item.startDate && !validateDate(item.startDate)) return true;
        if ('endDate' in item && item.endDate && !validateDate(item.endDate)) return true;
        if ('date' in item && item.date && !validateDate(item.date)) return true;
        return false;
      });

      if (hasInvalidDates) {
        showError('Некорректные даты', 'Пожалуйста, исправьте некорректные даты перед сохранением');
        return;
      }

      // Проверяем валидность уровней навыков и языков
      const hasInvalidSkills = (formData.skills || []).some(skill => 
        typeof skill.level !== 'number' || skill.level < 1 || skill.level > 5
      );

      const validLanguageLevels = ['Basic', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Fluent', 'Native'];
      const hasInvalidLanguages = (formData.languages || []).some(lang => 
        !validLanguageLevels.includes(lang.level)
      );

      if (hasInvalidSkills) {
        showError('Некорректные уровни навыков', 'Пожалуйста, исправьте некорректные уровни навыков (должны быть от 1 до 5)');
        return;
      }

      if (hasInvalidLanguages) {
        showError('Некорректные уровни языков', 'Пожалуйста, исправьте некорректные уровни языков');
        return;
      }

      // Нормализуем даты перед отправкой
      const normalizedData: UpdateResumeDto = {
        ...formData,
        experiences: formData.experiences?.map(exp => ({
          ...exp,
          startDate: normalizeDate(exp.startDate),
          endDate: exp.endDate ? normalizeDate(exp.endDate) : undefined
        })),
        educations: formData.educations?.map(edu => ({
          ...edu,
          startDate: normalizeDate(edu.startDate),
          endDate: edu.endDate ? normalizeDate(edu.endDate) : undefined
        })),
        projects: formData.projects?.map(project => ({
          ...project,
          startDate: normalizeDate(project.startDate),
          endDate: project.endDate ? normalizeDate(project.endDate) : undefined
        })),
        achievements: formData.achievements?.map(achievement => ({
          ...achievement,
          date: normalizeDate(achievement.date)
        })),
        certifications: formData.certifications?.map(cert => ({
          ...cert,
          date: normalizeDate(cert.date)
        }))
      };

      await onSave(normalizedData);
    } catch (error) {
      console.error('Ошибка при сохранении резюме:', error);
    }
  };

  // Навигация по секциям
  const sections = [
    { id: 'basic', label: 'Основное', icon: Edit2 },
    { id: 'skills', label: 'Навыки', icon: Code },
    { id: 'experience', label: 'Опыт', icon: Briefcase },
    { id: 'education', label: 'Образование', icon: GraduationCap },
    { id: 'projects', label: 'Проекты', icon: Code },
    { id: 'achievements', label: 'Достижения', icon: Trophy },
    { id: 'languages', label: 'Языки', icon: Languages },
    { id: 'certifications', label: 'Сертификаты', icon: Verified }
  ];

  return (
    <div className={styles.editor}>
      {/* Навигация по секциям */}
      <div className={styles.navigation}>
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.navButton} ${activeSection === id ? styles.active : ''}`}
            onClick={() => setActiveSection(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {/* Основная информация */}
        {activeSection === 'basic' && (
          <div className={styles.section}>
            <h2>Основная информация</h2>
            
            <div className={styles.fieldGroup}>
              <label>Название резюме *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleBasicChange('title', e.target.value)}
                placeholder="Например: Frontend Developer"
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Краткое описание</label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleBasicChange('summary', e.target.value)}
                placeholder="Кратко опишите себя и свой опыт..."
                className={styles.textarea}
                rows={4}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Цель</label>
              <textarea
                value={formData.objective}
                onChange={(e) => handleBasicChange('objective', e.target.value)}
                placeholder="Опишите свои профессиональные цели..."
                className={styles.textarea}
                rows={3}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => handleBasicChange('isDefault', e.target.checked)}
                />
                Основное резюме
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleBasicChange('isPublic', e.target.checked)}
                />
                Публичное резюме
              </label>
            </div>
          </div>
        )}

        {/* Навыки */}
        {activeSection === 'skills' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Навыки</h2>
              <button onClick={addSkill} className={styles.addButton}>
                <Plus size={16} />
                Добавить навык
              </button>
            </div>

            {formData.skills?.map((skill, index) => (
              <div key={index} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h3>Навык {index + 1}</h3>
                  <button 
                    onClick={() => removeSkill(index)}
                    className={styles.removeButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Название навыка *</label>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    placeholder="Например: JavaScript"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Уровень (1-5) *</label>
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value))}
                    className={styles.select}
                  >
                    <option value={1}>1 - Новичок</option>
                    <option value={2}>2 - Начальный</option>
                    <option value={3}>3 - Средний</option>
                    <option value={4}>4 - Продвинутый</option>
                    <option value={5}>5 - Эксперт</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Категория</label>
                  <input
                    type="text"
                    value={skill.category || ''}
                    onChange={(e) => updateSkill(index, 'category', e.target.value)}
                    placeholder="Например: Programming, Design, Management"
                    className={styles.input}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Опыт работы */}
        {activeSection === 'experience' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Опыт работы</h2>
              <button onClick={addExperience} className={styles.addButton}>
                <Plus size={16} />
                Добавить опыт
              </button>
            </div>

            {formData.experiences?.map((exp, index) => (
              <div key={index} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h3>Опыт {index + 1}</h3>
                  <button 
                    onClick={() => removeExperience(index)}
                    className={styles.removeButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Должность *</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      placeholder="Например: Frontend Developer"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Компания *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="Например: Tech Corp"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Дата начала *</label>
                    <input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      className={styles.input}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                    {exp.startDate && !validateDate(exp.startDate) && (
                      <span className={styles.errorText}>Некорректная дата</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Дата окончания</label>
                    <input
                      type="date"
                      value={exp.endDate || ''}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      className={styles.input}
                      disabled={exp.isCurrent}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                    {exp.endDate && !validateDate(exp.endDate) && (
                      <span className={styles.errorText}>Некорректная дата</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)}
                      />
                      Текущая работа
                    </label>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Описание</label>
                  <textarea
                    value={exp.description || ''}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    placeholder="Опишите свои обязанности и достижения..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>

                {/* Достижения */}
                <div className={styles.arraySection}>
                  <div className={styles.arrayHeader}>
                    <label>Достижения</label>
                    <button 
                      onClick={() => addArrayItem('experiences', index, 'achievements')}
                      className={styles.addArrayButton}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  {exp.achievements?.map((achievement, itemIndex) => (
                    <div key={itemIndex} className={styles.arrayItem}>
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateArrayItem('experiences', index, 'achievements', itemIndex, e.target.value)}
                        placeholder="Опишите достижение..."
                        className={styles.input}
                      />
                      <button 
                        onClick={() => removeArrayItem('experiences', index, 'achievements', itemIndex)}
                        className={styles.removeArrayButton}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Технологии */}
                <div className={styles.arraySection}>
                  <div className={styles.arrayHeader}>
                    <label>Технологии</label>
                    <button 
                      onClick={() => addArrayItem('experiences', index, 'technologies')}
                      className={styles.addArrayButton}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  {exp.technologies?.map((tech, itemIndex) => (
                    <div key={itemIndex} className={styles.arrayItem}>
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => updateArrayItem('experiences', index, 'technologies', itemIndex, e.target.value)}
                        placeholder="Например: React, TypeScript"
                        className={styles.input}
                      />
                      <button 
                        onClick={() => removeArrayItem('experiences', index, 'technologies', itemIndex)}
                        className={styles.removeArrayButton}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Образование */}
        {activeSection === 'education' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Образование</h2>
              <button onClick={addEducation} className={styles.addButton}>
                <Plus size={16} />
                Добавить образование
              </button>
            </div>

            {formData.educations?.map((edu, index) => (
              <div key={index} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h3>Образование {index + 1}</h3>
                  <button 
                    onClick={() => removeEducation(index)}
                    className={styles.removeButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Степень *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="Например: Бакалавр"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Учебное заведение *</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      placeholder="Например: МГУ"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Специальность *</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    placeholder="Например: Компьютерные науки"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Дата начала *</label>
                    <input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                      className={styles.input}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                    {edu.startDate && !validateDate(edu.startDate) && (
                      <span className={styles.errorText}>Некорректная дата</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Дата окончания</label>
                    <input
                      type="date"
                      value={edu.endDate || ''}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                      className={styles.input}
                      disabled={edu.isCurrent}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                    {edu.endDate && !validateDate(edu.endDate) && (
                      <span className={styles.errorText}>Некорректная дата</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={edu.isCurrent}
                        onChange={(e) => updateEducation(index, 'isCurrent', e.target.checked)}
                      />
                      Текущее обучение
                    </label>
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Средний балл (GPA)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(index, 'gpa', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Описание</label>
                  <textarea
                    value={edu.description || ''}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    placeholder="Дополнительная информация об образовании..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Проекты */}
        {activeSection === 'projects' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Проекты</h2>
              <button onClick={addProject} className={styles.addButton}>
                <Plus size={16} />
                Добавить проект
              </button>
            </div>

            {formData.projects?.map((project, index) => (
              <div key={index} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h3>Проект {index + 1}</h3>
                  <button 
                    onClick={() => removeProject(index)}
                    className={styles.removeButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Название проекта *</label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    placeholder="Например: E-commerce Platform"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Описание *</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    placeholder="Опишите проект, его функциональность и вашу роль..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Дата начала *</label>
                    <input
                      type="date"
                      value={project.startDate}
                      onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                      className={styles.input}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                    {project.startDate && !validateDate(project.startDate) && (
                      <span className={styles.errorText}>Некорректная дата</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Дата окончания</label>
                    <input
                      type="date"
                      value={project.endDate || ''}
                      onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                      className={styles.input}
                      disabled={project.isCurrent}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                    {project.endDate && !validateDate(project.endDate) && (
                      <span className={styles.errorText}>Некорректная дата</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={project.isCurrent}
                        onChange={(e) => updateProject(index, 'isCurrent', e.target.checked)}
                      />
                      Текущий проект
                    </label>
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>URL проекта</label>
                    <input
                      type="url"
                      value={project.url || ''}
                      onChange={(e) => updateProject(index, 'url', e.target.value)}
                      placeholder="https://example.com"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>GitHub URL</label>
                    <input
                      type="url"
                      value={project.githubUrl || ''}
                      onChange={(e) => updateProject(index, 'githubUrl', e.target.value)}
                      placeholder="https://github.com/username/repo"
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Технологии проекта */}
                <div className={styles.arraySection}>
                  <div className={styles.arrayHeader}>
                    <label>Технологии</label>
                    <button 
                      onClick={() => addArrayItem('projects', index, 'technologies')}
                      className={styles.addArrayButton}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  {project.technologies?.map((tech, itemIndex) => (
                    <div key={itemIndex} className={styles.arrayItem}>
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => updateArrayItem('projects', index, 'technologies', itemIndex, e.target.value)}
                        placeholder="Например: React, Node.js, MongoDB"
                        className={styles.input}
                      />
                      <button 
                        onClick={() => removeArrayItem('projects', index, 'technologies', itemIndex)}
                        className={styles.removeArrayButton}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Достижения */}
        {activeSection === 'achievements' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Достижения</h2>
              <button onClick={addAchievement} className={styles.addButton}>
                <Plus size={16} />
                Добавить достижение
              </button>
            </div>

            {formData.achievements?.map((achievement, index) => (
              <div key={index} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h3>Достижение {index + 1}</h3>
                  <button 
                    onClick={() => removeAchievement(index)}
                    className={styles.removeButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Название *</label>
                  <input
                    type="text"
                    value={achievement.title}
                    onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                    placeholder="Например: Лучший сотрудник года"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Описание *</label>
                  <textarea
                    value={achievement.description}
                    onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                    placeholder="Опишите достижение..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Дата *</label>
                    <input
                      type="date"
                      value={achievement.date}
                      onChange={(e) => updateAchievement(index, 'date', e.target.value)}
                      className={styles.input}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                    {achievement.date && !validateDate(achievement.date) && (
                      <span className={styles.errorText}>Некорректная дата</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Категория</label>
                    <input
                      type="text"
                      value={achievement.category}
                      onChange={(e) => updateAchievement(index, 'category', e.target.value)}
                      placeholder="Например: Профессиональные, Академические"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Языки */}
        {activeSection === 'languages' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Языки</h2>
              <button onClick={addLanguage} className={styles.addButton}>
                <Plus size={16} />
                Добавить язык
              </button>
            </div>

            {formData.languages?.map((language, index) => (
              <div key={index} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h3>Язык {index + 1}</h3>
                  <button 
                    onClick={() => removeLanguage(index)}
                    className={styles.removeButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Название языка *</label>
                    <input
                      type="text"
                      value={language.name}
                      onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                      placeholder="Например: Английский"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Уровень *</label>
                    <select
                      value={language.level}
                      onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Выберите уровень</option>
                      <option value="Basic">Basic</option>
                      <option value="Elementary">Elementary</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Upper-Intermediate">Upper-Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native">Native</option>
                    </select>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Сертификат</label>
                  <input
                    type="text"
                    value={language.certification || ''}
                    onChange={(e) => updateLanguage(index, 'certification', e.target.value)}
                    placeholder="Например: IELTS 7.5"
                    className={styles.input}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Сертификаты */}
        {activeSection === 'certifications' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Сертификаты</h2>
              <button onClick={addCertification} className={styles.addButton}>
                <Plus size={16} />
                Добавить сертификат
              </button>
            </div>

            {formData.certifications?.map((cert, index) => (
              <div key={index} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h3>Сертификат {index + 1}</h3>
                  <button 
                    onClick={() => removeCertification(index)}
                    className={styles.removeButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Название сертификата *</label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    placeholder="Например: AWS Certified Solutions Architect"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Организация *</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                      placeholder="Например: Amazon Web Services"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Дата получения *</label>
                    <input
                      type="date"
                      value={cert.date}
                      onChange={(e) => updateCertification(index, 'date', e.target.value)}
                      className={styles.input}
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                    {cert.date && !validateDate(cert.date) && (
                      <span className={styles.errorText}>Некорректная дата</span>
                    )}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label>ID сертификата</label>
                  <input
                    type="text"
                    value={cert.credentialId || ''}
                    onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                    placeholder="Например: AWS-123456"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Ссылка на сертификат</label>
                  <input
                    type="url"
                    value={cert.url || ''}
                    onChange={(e) => updateCertification(index, 'url', e.target.value)}
                    placeholder="https://example.com/certificate"
                    className={styles.input}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className={styles.actions}>
        <button 
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={isLoading}
        >
          Отмена
        </button>
        
        <button 
          onClick={handleSave}
          className={styles.saveButton}
          disabled={isLoading || !formData.title.trim()}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner} />
              Сохранение...
            </>
          ) : (
            <>
              <Save size={16} />
              Сохранить изменения
            </>
          )}
        </button>
      </div>
    </div>
  );
}
