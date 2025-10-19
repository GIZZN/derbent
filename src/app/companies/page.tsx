'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AIAssistant from '../Components/AIAssistant';
import { useGetInternshipsQuery } from '@/lib/api/internshipsApi';
import React from 'react';
import styles from './companies.module.css';

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  duration: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationDeadline: string;
  logo: string;
  companyDescription: string;
  tags: string[];
  salary?: string;
  // Дополнительные поля для совместимости с API
  companyId?: string;
  isRemote?: boolean;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  skills?: string[];
}

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}


function CustomSelect({ options, value, onChange }: CustomSelectProps) {
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
    <div className={styles.selectContainer} ref={selectRef}>
      <button
        className={`${styles.selectButton} ${isOpen ? styles.selectOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {options.find(opt => opt.value === value)?.label || options[0].label}
        <svg 
          className={`${styles.selectArrow} ${isOpen ? styles.selectArrowOpen : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isOpen && (
        <div className={styles.selectDropdown}>
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

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedSort, setSelectedSort] = useState('relevance');

  // Получаем данные из API
  const { data: internshipsData, isLoading, error } = useGetInternshipsQuery();

  // Безопасное форматирование даты
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Дата не указана';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      return date.toLocaleDateString('ru-RU');
    } catch (error) {
      return 'Ошибка даты';
    }
  };

  // Mock data для стажировок (fallback)
  const mockInternships: Internship[] = [
    {
      id: '1',
      title: 'Frontend Developer Стажер',
      company: 'TechCorp',
      location: 'Москва',
      type: 'Оплачиваемая',
      duration: '3 месяца',
      description: 'Присоединяйся к команде разработки современных веб-приложений. Изучай React, TypeScript и современные технологии.',
      requirements: ['Базовые знания HTML, CSS, JavaScript', 'Знание React (приветствуется)', 'Английский язык (B1+)', 'Готовность к обучению'],
      benefits: ['Зарплата 50,000₽', 'Обучение от сеньоров', 'Современное оборудование', 'Возможность трудоустройства'],
      applicationDeadline: '2024-02-15',
      logo: 'Rocket',
      companyDescription: 'Ведущая IT-компания, разрабатывающая инновационные решения',
      tags: ['React', 'TypeScript', 'Frontend', 'Обучение'],
      salary: '50,000₽'
    },
    {
      id: '2',
      title: 'Data Science Стажировка',
      company: 'DataLab',
      location: 'Санкт-Петербург',
      type: 'Неоплачиваемая',
      duration: '4 месяца',
      description: 'Изучай машинное обучение и анализ данных в реальных проектах. Работай с Python, pandas, scikit-learn.',
      requirements: ['Знание Python', 'Базы статистики и математики', 'Опыт работы с pandas', 'Аналитическое мышление'],
      benefits: ['Сертификат', 'Менторство', 'Реальные проекты', 'Портфолио'],
      applicationDeadline: '2024-02-20',
      logo: 'BarChart3',
      companyDescription: 'Исследовательская лаборатория в области больших данных',
      tags: ['Python', 'ML', 'Data Science', 'Аналитика']
    },
    {
      id: '3',
      title: 'Backend Java Стажер',
      company: 'Enterprise Solutions',
      location: 'Екатеринбург',
      type: 'Оплачиваемая',
      duration: '6 месяцев',
      description: 'Разрабатывай корпоративные системы на Java Spring. Изучай микросервисную архитектуру и современные подходы.',
      requirements: ['Java Core', 'Знание Spring (базово)', 'SQL и базы данных', 'Понимание ООП'],
      benefits: ['Зарплата 40,000₽', 'Корпоративное обучение', 'Карьерный рост', 'ДМС'],
      applicationDeadline: '2024-02-25',
      logo: 'Coffee',
      companyDescription: 'Разработчик корпоративных решений для крупного бизнеса',
      tags: ['Java', 'Spring', 'Backend', 'Enterprise'],
      salary: '40,000₽'
    },
    {
      id: '4',
      title: 'UX/UI Design Стажировка',
      company: 'Creative Studio',
      location: 'Москва',
      type: 'Оплачиваемая',
      duration: '3 месяца',
      description: 'Создавай интерфейсы мобильных приложений и веб-сервисов. Работай с Figma, изучай UX-исследования.',
      requirements: ['Базы дизайна', 'Знание Figma/Sketch', 'Понимание UX принципов', 'Портфолио'],
      benefits: ['Зарплата 35,000₽', 'Работа с топ-брендами', 'Творческая свобода', 'Обучение'],
      applicationDeadline: '2024-02-18',
      logo: 'Palette',
      companyDescription: 'Креативная студия полного цикла дизайн-услуг',
      tags: ['Design', 'UX', 'UI', 'Figma'],
      salary: '35,000₽'
    },
    {
      id: '5',
      title: 'Mobile Developer Стажер',
      company: 'AppDev Inc',
      location: 'Новосибирск',
      type: 'Оплачиваемая',
      duration: '4 месяца',
      description: 'Разрабатывай мобильные приложения на React Native и Flutter. Изучай современные подходы к мобильной разработке.',
      requirements: ['JavaScript или Dart', 'Базы мобильной разработки', 'Понимание UI/UX', 'Желание развиваться'],
      benefits: ['Зарплата 45,000₽', 'Гибкий график', 'Удаленная работа', 'Современные технологии'],
      applicationDeadline: '2024-02-22',
      logo: 'Smartphone',
      companyDescription: 'Студия мобильной разработки с международными клиентами',
      tags: ['React Native', 'Flutter', 'Mobile', 'JavaScript'],
      salary: '45,000₽'
    },
    {
      id: '6',
      title: 'DevOps Engineer Стажировка',
      company: 'CloudTech',
      location: 'Казань',
      type: 'Неоплачиваемая',
      duration: '5 месяцев',
      description: 'Изучай Docker, Kubernetes, CI/CD процессы. Работай с облачными сервисами AWS и Azure.',
      requirements: ['Базы Linux', 'Понимание сетей', 'Знание Git', 'Системное мышление'],
      benefits: ['Сертификация AWS', 'Опыт с enterprise проектами', 'Менторство', 'Трудоустройство'],
      applicationDeadline: '2024-02-28',
      logo: 'Settings',
      companyDescription: 'Провайдер облачных решений и DevOps консалтинга',
      tags: ['DevOps', 'Docker', 'Kubernetes', 'AWS']
    }
  ];

  // Используем данные из API или fallback на mock данные
  const internships = Array.isArray(internshipsData?.internships) ? internshipsData.internships : mockInternships;

  const internshipTypes = [
    { value: 'all', label: 'Все типы' },
    { value: 'Оплачиваемая', label: 'Оплачиваемая' },
    { value: 'Неоплачиваемая', label: 'Неоплачиваемая' }
  ];

  const locations = [
    { value: 'all', label: 'Все города' },
    { value: 'Москва', label: 'Москва' },
    { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
    { value: 'Екатеринбург', label: 'Екатеринбург' },
    { value: 'Новосибирск', label: 'Новосибирск' },
    { value: 'Казань', label: 'Казань' }
  ];

  const experienceLevels = [
    { value: 'all', label: 'Любой опыт' },
    { value: 'Без опыта', label: 'Без опыта' },
    { value: '1-3 года', label: '1-3 года' },
    { value: '3-6 лет', label: '3-6 лет' },
    { value: 'Более 6 лет', label: 'Более 6 лет' }
  ];

  const salaryLevels = [
    { value: 'all', label: 'Любая зарплата' },
    { value: 'До 30 000₽', label: 'До 30 000₽' },
    { value: '30 000₽ - 50 000₽', label: '30 000₽ - 50 000₽' },
    { value: '50 000₽ - 80 000₽', label: '50 000₽ - 80 000₽' },
    { value: 'От 80 000₽', label: 'От 80 000₽' },
    { value: 'Неоплачиваемая', label: 'Неоплачиваемая' }
  ];

  const durationOptions = [
    { value: 'all', label: 'Любая продолжительность' },
    { value: '1 месяц', label: '1 месяц' },
    { value: '2 месяца', label: '2 месяца' },
    { value: '3 месяца', label: '3 месяца' },
    { value: '4 месяца', label: '4 месяца' },
    { value: '5 месяцев', label: '5 месяцев' },
    { value: '6 месяцев', label: '6 месяцев' },
    { value: 'Более 6 месяцев', label: 'Более 6 месяцев' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'По актуальности' },
    { value: 'date', label: 'По дате' },
    { value: 'salary', label: 'По зарплате' }
  ];

  const filteredAndSortedInternships = (() => {
    // Сначала фильтруем
    const filtered = internships.filter(internship => {
      const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           internship.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           internship.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = selectedType === 'all' || internship.type === selectedType;
      const matchesLocation = selectedLocation === 'all' || internship.location === selectedLocation;
      
      // Фильтр по опыту работы (для стажировок обычно "Без опыта")
      const matchesExperience = selectedExperience === 'all' || selectedExperience === 'Без опыта';
      
      // Фильтр по зарплате
      const matchesSalary = (() => {
        if (selectedSalary === 'all') return true;
        if (selectedSalary === 'Неоплачиваемая') return !internship.salary;
        if (!internship.salary) return selectedSalary === 'Неоплачиваемая';
        
        const salary = parseInt(internship.salary.replace(/[^\d]/g, ''));
        switch (selectedSalary) {
          case 'До 30 000₽': return salary < 30000;
          case '30 000₽ - 50 000₽': return salary >= 30000 && salary <= 50000;
          case '50 000₽ - 80 000₽': return salary >= 50000 && salary <= 80000;
          case 'От 80 000₽': return salary > 80000;
          default: return true;
        }
      })();
      
      // Фильтр по продолжительности
      const matchesDuration = selectedDuration === 'all' || internship.duration === selectedDuration;
      
      return matchesSearch && matchesType && matchesLocation && matchesExperience && matchesSalary && matchesDuration;
    });

    // Затем сортируем
    return filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date':
          const dateA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : 0;
          const dateB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : 0;
          // Если дата невалидна, возвращаем NaN, который будет в конце списка
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          return dateB - dateA;
        case 'salary':
          const salaryA = a.salary ? parseInt(a.salary.replace(/[^\d]/g, '')) : 0;
          const salaryB = b.salary ? parseInt(b.salary.replace(/[^\d]/g, '')) : 0;
          return salaryB - salaryA;
        case 'relevance':
        default:
          return 0; // Оригинальный порядок для актуальности
      }
    });
  })();

  // Преобразуем стажировки в формат для AI Assistant
  const internshipsForAI = filteredAndSortedInternships.map(internship => ({
    id: internship.id,
    title: internship.title,
    company: internship.company,
    location: internship.location,
    type: internship.type,
    salary: internship.salary || 'Не указана',
    description: internship.description,
    tags: internship.tags,
    postedAt: internship.applicationDeadline
  }));

  // Показываем состояние загрузки
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Загрузка стажировок...</h1>
            <p className={styles.heroSubtitle}>Пожалуйста, подождите</p>
          </div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Ошибка загрузки</h1>
            <p className={styles.heroSubtitle}>Не удалось загрузить стажировки. Используются демо-данные.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero секция */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Стажировки в топовых <span className={styles.highlight}>компаниях</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Начни карьеру в IT с практического опыта. Стажировки от ведущих работодателей
          </p>
          <div className={styles.heroActions}>
            <Link href="/companies/internships/create" className={styles.createInternshipBtn}>
              Создать стажировку
            </Link>
          </div>
           <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Поиск по названию, компании или технологиям..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19 19L13 13L19 19ZM15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <div className={styles.filters}>
              <CustomSelect
                options={internshipTypes}
                value={selectedType}
                onChange={setSelectedType}
              />
              <CustomSelect
                options={locations}
                value={selectedLocation}
                onChange={setSelectedLocation}
              />
              <CustomSelect
                options={experienceLevels}
                value={selectedExperience}
                onChange={setSelectedExperience}
              />
              <CustomSelect
                options={salaryLevels}
                value={selectedSalary}
                onChange={setSelectedSalary}
              />
              <CustomSelect
                options={durationOptions}
                value={selectedDuration}
                onChange={setSelectedDuration}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Результаты */}
      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <h2>Найдено {filteredAndSortedInternships.length} стажировок</h2>
          <div className={styles.resultsSort}>
            <span>Сортировка:</span>
            <CustomSelect
              options={sortOptions}
              value={selectedSort}
              onChange={setSelectedSort}
            />
          </div>
        </div>

        <div className={styles.jobsGrid}>
          {filteredAndSortedInternships.map((internship) => (
            <article key={internship.id} className={styles.jobCard}>
              <div className={styles.jobCardHeader}>
                <div className={styles.jobCardTitle}>
                  <h3>{internship.title}</h3>
                  <div className={styles.jobCardMeta}>
                    <span className={styles.company}>{internship.company}</span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.location}>{internship.location}</span>
                  </div>
                </div>
                <div className={styles.jobCardBadge}>
                  <span className={styles.jobType}>{internship.type}</span>
                </div>
              </div>

              <p className={styles.jobDescription}>
                {internship.description}
              </p>

              <div className={styles.jobTags}>
                {internship.tags && Array.isArray(internship.tags) && internship.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={styles.jobCardFooter}>
                <div className={styles.jobSalary}>
                  {internship.salary || 'Не указана'}
                </div>
                <div className={styles.jobActions}>
                  <span className={styles.postedAt}>
                    {formatDate(internship.applicationDeadline)}
                  </span>
                  <div className={styles.actionButtons}>
                    <Link href={`/internships/${internship.id}`} className={styles.viewBtn}>
                      Подробнее
                    </Link>
                    {internship.hasApplied ? (
                      <div className={styles.appliedStatus}>
                        <span className={styles.appliedText}>
                          {internship.applicationStatus === 'PENDING' && 'Заявка отправлена'}
                          {internship.applicationStatus === 'ACCEPTED' && 'Заявка принята'}
                          {internship.applicationStatus === 'REJECTED' && 'Заявка отклонена'}
                        </span>
                        <span className={styles.appliedDate}>
                          {internship.appliedAt && new Date(internship.appliedAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    ) : (
                      <Link href={`/internships/${internship.id}`} className={styles.applyBtn}>
                        Откликнуться
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredAndSortedInternships.length === 0 && (
          <div className={styles.noResults}>
            <h3>Стажировки не найдены</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        )}
      </div>

      {/* AI Assistant с адаптированными данными */}
      <AIAssistant jobs={internshipsForAI} />
    </div>
  );
}
