'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateJobMutation, useGetPopularSkillsQuery, useCreateSkillMutation, JobType, ExperienceLevel } from '../../../lib/api/jobsApi';
import { getUserRole } from '../../../lib/api/authApi';
import styles from './create.module.css';

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.customSelect} ref={selectRef}>
      <button 
        className={`${styles.selectButton} ${!value ? styles.selectButtonPlaceholder : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{value || placeholder}</span>
        <svg 
          className={`${styles.selectIcon} ${isOpen ? styles.selectIconOpen : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isOpen && (
        <div className={styles.selectDropdown}>
          {options.map((option) => (
            <button
              key={option}
              className={`${styles.selectOption} ${value === option ? styles.selectOptionActive : ''}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface SkillSelectProps {
  selectedSkills: string[];
  onChange: (skillIds: string[]) => void;
  availableSkills: { skill: { id: string; name: string; category: string }; candidateCount: number; studentCount: number; totalCount: number }[];
  onSkillCreated?: (newSkill: { id: string; name: string; category: string; description: string }) => void;
}

function SkillSelect({ selectedSkills, onChange, availableSkills, onSkillCreated }: SkillSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSkillData, setNewSkillData] = useState({
    name: '',
    category: '',
    description: ''
  });
  const selectRef = useRef<HTMLDivElement>(null);
  const [createSkill, { isLoading: isCreatingSkill }] = useCreateSkillMutation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredSkills = availableSkills.filter(popularSkill =>
    popularSkill.skill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedSkills.includes(popularSkill.skill.id)
  );

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      onChange(selectedSkills.filter(id => id !== skillId));
    } else {
      onChange([...selectedSkills, skillId]);
    }
  };

  const removeSkill = (skillId: string) => {
    onChange(selectedSkills.filter(id => id !== skillId));
  };

  const getSkillName = (skillId: string) => {
    return availableSkills.find(popularSkill => popularSkill.skill.id === skillId)?.skill.name || skillId;
  };

  const handleCreateSkill = async () => {
    // Validate required fields matching curl format
    if (!newSkillData.name.trim()) {
      console.error('Skill name is required');
      return;
    }
    
    if (!newSkillData.category.trim()) {
      console.error('Skill category is required');
      return;
    }

    try {
      // Prepare data for API - exactly matching the curl format:
      // curl -X POST http://localhost:3000/skills \
      //   -H "Authorization: Bearer <token>" \
      //   -H "Content-Type: application/json" \
      //   -d '{
      //     "name": "TypeScript",
      //     "category": "Programming",
      //     "description": "TypeScript programming language with static typing"
      //   }'
      const skillData = {
        name: newSkillData.name.trim(),
        category: newSkillData.category.trim(),
        description: newSkillData.description.trim() || ''
      };
      
      console.log('Creating skill with data:', skillData);
      const newSkill = await createSkill(skillData).unwrap();
      onSkillCreated?.(newSkill);
      onChange([...selectedSkills, newSkill.id]);
      setShowCreateModal(false);
      setNewSkillData({ name: '', category: '', description: '' });
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to create skill:', error);
    }
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setNewSkillData({ name: '', category: '', description: '' });
  };

  const handleCreateClick = () => {
    if (searchQuery.trim()) {
      setNewSkillData(prev => ({ ...prev, name: searchQuery.trim() }));
    }
    setShowCreateModal(true);
    setIsOpen(false);
  };

  return (
    <div className={styles.skillSelect} ref={selectRef}>
      <div className={styles.skillContainer}>
        <div className={styles.selectedSkills}>
          {selectedSkills.map((skillId) => (
            <span key={skillId} className={styles.skillTag}>
              {getSkillName(skillId)}
              <button
                type="button"
                onClick={() => removeSkill(skillId)}
                className={styles.skillRemove}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        
        <button
          type="button"
          className={styles.skillDropdownButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedSkills.length === 0 ? 'Выберите навыки' : `Выбрано: ${selectedSkills.length}`}</span>
          <svg 
            className={`${styles.skillDropdownIcon} ${isOpen ? styles.skillDropdownIconOpen : ''}`}
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none"
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className={styles.skillDropdown}>
          <div className={styles.skillSearch}>
            <input
              type="text"
              placeholder="Поиск навыков..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.skillSearchInput}
            />
          </div>
          
          <div className={styles.skillList}>
            {filteredSkills.length === 0 ? (
              <div className={styles.noSkillsContainer}>
                <div className={styles.noSkills}>
                  {searchQuery ? `Навык «${searchQuery}» не найден` : 'Навыки не найдены'}
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleCreateClick}
                    className={styles.createSkillButton}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Создать навык «{searchQuery}»
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredSkills.map((popularSkill) => (
                  <button
                    key={popularSkill.skill.id}
                    type="button"
                    onClick={() => toggleSkill(popularSkill.skill.id)}
                    className={styles.skillOption}
                  >
                    <div className={styles.skillInfo}>
                      <span className={styles.skillName}>{popularSkill.skill.name}</span>
                      <span className={styles.skillCategory}>{popularSkill.skill.category}</span>
                    </div>
                    {selectedSkills.includes(popularSkill.skill.id) && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleCreateClick}
                    className={styles.createSkillButton}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Создать навык «{searchQuery}»
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      <div className={styles.skillHint}>
        Выберите навыки, необходимые для этой позиции
      </div>

      {/* Create Skill Modal */}
      {showCreateModal && (
        <div className={styles.skillModal}>
          <div className={styles.skillModalOverlay} onClick={handleCreateModalClose}></div>
          <div className={styles.skillModalContent}>
            <div className={styles.skillModalHeader}>
              <h3>Создать новый навык</h3>
              <button
                type="button"
                onClick={handleCreateModalClose}
                className={styles.skillModalClose}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className={styles.skillModalBody}>
              <div className={styles.skillModalGroup}>
                <label className={styles.skillModalLabel}>
                  Название навыка *
                </label>
                <input
                  type="text"
                  value={newSkillData.name}
                  onChange={(e) => setNewSkillData(prev => ({ ...prev, name: e.target.value }))}
                  className={styles.skillModalInput}
                  placeholder="TypeScript, React, Python..."
                  required
                />
              </div>

              <div className={styles.skillModalGroup}>
                <label className={styles.skillModalLabel}>
                  Категория *
                </label>
                <select
                  value={newSkillData.category}
                  onChange={(e) => setNewSkillData(prev => ({ ...prev, category: e.target.value }))}
                  className={styles.skillModalSelect}
                  required
                >
                  <option value="">Выберите категорию</option>
                  <option value="Programming">Programming</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Design">Design</option>
                  <option value="QA">QA</option>
                  <option value="Management">Management</option>
                  <option value="Other">Другое</option>
                </select>
              </div>

              <div className={styles.skillModalGroup}>
                <label className={styles.skillModalLabel}>
                  Описание
                </label>
                <textarea
                  value={newSkillData.description}
                  onChange={(e) => setNewSkillData(prev => ({ ...prev, description: e.target.value }))}
                  className={styles.skillModalTextarea}
                  placeholder="TypeScript programming language with static typing..."
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.skillModalActions}>
              <button
                type="button"
                onClick={handleCreateModalClose}
                className={styles.skillModalCancelButton}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleCreateSkill}
                disabled={!newSkillData.name.trim() || !newSkillData.category.trim() || isCreatingSkill}
                className={styles.skillModalCreateButton}
                title={!newSkillData.name.trim() || !newSkillData.category.trim() ? 'Заполните название и категорию навыка' : 'Создать навык'}
              >
                {isCreatingSkill ? (
                  <>
                    <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="32">
                        <animate attributeName="strokeDashoffset" values="32;0" dur="1s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    Создание...
                  </>
                ) : (
                  'Создать навык'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateJobPage() {
  const router = useRouter();
  const [createJob, { isLoading, error }] = useCreateJobMutation();
  
  // Helper function to get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Активна';
      case 'PAUSED': return 'Приостановлена';
      case 'CLOSED': return 'Закрыта';
      default: return status;
    }
  };
  const { data: skills = [], isLoading: skillsLoading, refetch: refetchSkills } = useGetPopularSkillsQuery();
  const [localSkills, setLocalSkills] = useState<typeof skills>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    salaryMin: undefined as number | undefined,
    salaryMax: undefined as number | undefined,
    currency: 'RUB',
    location: '',
    type: '' as JobType | '',
    experienceLevel: '' as ExperienceLevel | '',
    remote: false,
    deadline: '',
    skillIds: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdJobInfo, setCreatedJobInfo] = useState<{title: string, status: string} | null>(null);

  // Update local skills when API data changes
  useEffect(() => {
    if (skills && skills.length > 0) {
      setLocalSkills(skills);
    }
  }, [skills]);

  // Check if user is HR
  useEffect(() => {
    const userRole = getUserRole();
    if (!userRole || userRole !== 'HR') {
      router.push('/auth/login');
    }
  }, [router]);

  const jobTypeOptions = useMemo(() => [
    { value: JobType.FULL_TIME, label: 'Полная занятость' },
    { value: JobType.PART_TIME, label: 'Частичная занятость' },
    { value: JobType.CONTRACT, label: 'Контракт' },
    { value: JobType.FREELANCE, label: 'Фриланс' },
    { value: JobType.INTERNSHIP, label: 'Стажировка' }
  ], []);

  const experienceLevelOptions = useMemo(() => [
    { value: ExperienceLevel.NO_EXPERIENCE, label: 'Без опыта' },
    { value: ExperienceLevel.JUNIOR, label: 'Junior (1-3 года)' },
    { value: ExperienceLevel.MIDDLE, label: 'Middle (3-5 лет)' },
    { value: ExperienceLevel.SENIOR, label: 'Senior (5+ лет)' },
    { value: ExperienceLevel.LEAD, label: 'Lead/Architect' }
  ], []);

  const currencyOptions = useMemo(() => [
    { value: 'RUB', label: '₽ Рубли' },
    { value: 'USD', label: '$ Доллары' },
    { value: 'EUR', label: '€ Евро' }
  ], []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields matching curl format
    if (!formData.title.trim()) {
      newErrors.title = 'Название должности обязательно';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Описание должно содержать минимум 50 символов';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Местоположение обязательно';
    }

    if (!formData.type) {
      newErrors.type = 'Тип занятости обязателен';
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Уровень опыта обязателен';
    }

    if (formData.skillIds.length === 0) {
      newErrors.skillIds = 'Выберите хотя бы один навык';
    }

    // Optional field validations
    if (formData.salaryMin && formData.salaryMax && formData.salaryMin >= formData.salaryMax) {
      newErrors.salaryMax = 'Максимальная зарплата должна быть больше минимальной';
    }

    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Дедлайн должен быть в будущем';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data for API - exactly matching the curl format:
      // curl -X POST http://localhost:3000/jobs \
      //   -H "Authorization: Bearer <token>" \
      //   -H "Content-Type: application/json" \
      //   -d '{
      //     "title": "Frontend Developer",
      //     "description": "Разработка пользовательских интерфейсов",
      //     "requirements": "React, TypeScript, 2+ года опыта",
      //     "responsibilities": "Разработка компонентов, оптимизация производительности",
      //     "benefits": "Удаленная работа, медицинская страховка",
      //     "salaryMin": 80000,
      //     "salaryMax": 120000,
      //     "currency": "RUB",
      //     "location": "Москва",
      //     "type": "FULL_TIME",
      //     "experienceLevel": "MIDDLE",
      //     "remote": true,
      //     "deadline": "2024-12-31",
      //     "skillIds": ["skill1", "skill2"]
      //   }'
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || undefined,
        responsibilities: formData.responsibilities || undefined,
        benefits: formData.benefits || undefined,
        salaryMin: formData.salaryMin || undefined,
        salaryMax: formData.salaryMax || undefined,
        currency: formData.currency,
        location: formData.location,
        type: formData.type as JobType,
        experienceLevel: formData.experienceLevel as ExperienceLevel,
        remote: formData.remote,
        deadline: formData.deadline || undefined,
        skillIds: formData.skillIds
      };
      
      console.log('Creating job with data:', jobData);
      const createdJob = await createJob(jobData).unwrap();
      console.log('Job created successfully:', createdJob);
      
      // Show success message with job status
      setCreatedJobInfo({
        title: createdJob.title,
        status: createdJob.status
      });
      setShowSuccessMessage(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/jobs');
      }, 3000);
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | string[] | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumberChange = (field: 'salaryMin' | 'salaryMax', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    handleInputChange(field, numValue);
  };

  const handleSkillCreated = useCallback((newSkill: { id: string; name: string; category: string; description: string }) => {
    setLocalSkills(prev => [...prev, { ...newSkill, skill: { id: newSkill.id, name: newSkill.name, category: newSkill.category }, candidateCount: 0, studentCount: 0, totalCount: 0 }]);
    refetchSkills(); // Refresh the server data
  }, [refetchSkills]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад
        </button>
        
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Создать <span className={styles.highlight}>вакансию</span>
          </h1>
          <p className={styles.subtitle}>
            Создайте привлекательную вакансию и найдите лучших кандидатов
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Основная информация</h2>  
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="title">
                Название должности *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                placeholder="Например: Senior Frontend Developer"
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="location">
                Местоположение *
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                placeholder="Москва / Удаленно / Гибрид"
              />
              {errors.location && <span className={styles.error}>{errors.location}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Тип занятости *
              </label>
              <CustomSelect
                options={jobTypeOptions.map(opt => opt.label)}
                value={jobTypeOptions.find(opt => opt.value === formData.type)?.label || ''}
                onChange={(label) => {
                  const option = jobTypeOptions.find(opt => opt.label === label);
                  if (option) handleInputChange('type', option.value);
                }}
                placeholder="Выберите тип занятости"
              />
              {errors.type && <span className={styles.error}>{errors.type}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Уровень опыта *
              </label>
              <CustomSelect
                options={experienceLevelOptions.map(opt => opt.label)}
                value={experienceLevelOptions.find(opt => opt.value === formData.experienceLevel)?.label || ''}
                onChange={(label) => {
                  const option = experienceLevelOptions.find(opt => opt.label === label);
                  if (option) handleInputChange('experienceLevel', option.value);
                }}
                placeholder="Выберите уровень опыта"
              />
              {errors.experienceLevel && <span className={styles.error}>{errors.experienceLevel}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Зарплата (от)
              </label>
              <input
                type="number"
                value={formData.salaryMin || ''}
                onChange={(e) => handleNumberChange('salaryMin', e.target.value)}
                className={`${styles.input} ${errors.salaryMin ? styles.inputError : ''}`}
                placeholder="50000"
                min="0"
              />
              {errors.salaryMin && <span className={styles.error}>{errors.salaryMin}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Зарплата (до)
              </label>
              <input
                type="number"
                value={formData.salaryMax || ''}
                onChange={(e) => handleNumberChange('salaryMax', e.target.value)}
                className={`${styles.input} ${errors.salaryMax ? styles.inputError : ''}`}
                placeholder="80000"
                min="0"
              />
              {errors.salaryMax && <span className={styles.error}>{errors.salaryMax}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Валюта
              </label>
              <CustomSelect
                options={currencyOptions.map(opt => opt.label)}
                value={currencyOptions.find(opt => opt.value === formData.currency)?.label || '₽ Рубли'}
                onChange={(label) => {
                  const option = currencyOptions.find(opt => opt.label === label);
                  if (option) handleInputChange('currency', option.value);
                }}
                placeholder="Выберите валюту"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.remote}
                  onChange={(e) => handleInputChange('remote', e.target.checked)}
                  className={styles.checkbox}
                />
                Удаленная работа
              </label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="deadline">
                Дедлайн подачи заявок
              </label>
              <input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className={`${styles.input} ${errors.deadline ? styles.inputError : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.deadline && <span className={styles.error}>{errors.deadline}</span>}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Описание и требования</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="description">
              Общее описание вакансии *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder="Общее описание должности и компании..."
              rows={6}
            />
            <div className={styles.charCount}>
              {formData.description.length} символов (минимум 50)
            </div>
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="responsibilities">
              Обязанности
            </label>
            <textarea
              id="responsibilities"
              value={formData.responsibilities}
              onChange={(e) => handleInputChange('responsibilities', e.target.value)}
              className={styles.textarea}
              placeholder="Основные обязанности на данной позиции..."
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="requirements">
              Требования
            </label>
            <textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              className={styles.textarea}
              placeholder="Требования к кандидату..."
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="benefits">
              Что мы предлагаем
            </label>
            <textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              className={styles.textarea}
              placeholder="Преимущества работы в компании..."
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Необходимые навыки *
            </label>
            {skillsLoading ? (
              <div className={styles.skillsLoading}>Загрузка навыков...</div>
            ) : (
              <SkillSelect
                selectedSkills={formData.skillIds}
                onChange={(skillIds) => handleInputChange('skillIds', skillIds)}
                availableSkills={localSkills}
                onSkillCreated={handleSkillCreated}
              />
            )}
            {errors.skillIds && <span className={styles.error}>{errors.skillIds}</span>}
          </div>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            Произошла ошибка при создании вакансии. Попробуйте еще раз.
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <>
                <svg className={styles.spinner} width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="strokeDashoffset" values="32;0" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Создание...
              </>
            ) : (
              'Опубликовать вакансию'
            )}
          </button>
        </div>
      </form>

      {/* Success Message */}
      {showSuccessMessage && createdJobInfo && (
        <div className={styles.successOverlay}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.successTitle}>Вакансия создана!</h2>
            <p className={styles.successJobTitle}>{createdJobInfo.title}</p>
            <div className={styles.successStatus}>
              <span className={styles.statusLabel}>Статус:</span>
              <span className={`${styles.statusValue} ${
                createdJobInfo.status === 'ACTIVE' ? styles.statusActive :
                createdJobInfo.status === 'PAUSED' ? styles.statusPaused :
                createdJobInfo.status === 'CLOSED' ? styles.statusClosed :
                styles.statusActive
              }`}>
                {getStatusLabel(createdJobInfo.status)}
              </span>
            </div>
            <p className={styles.successNote}>
              Перенаправление на страницу вакансий через 3 секунды...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
