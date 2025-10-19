'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useGetJobsQuery } from '../../lib/api/jobsApi';
import { getUserRole } from '../../lib/api/authApi';
import AIAssistant from '../Components/AIAssistant';
import styles from './jobs.module.css';



interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function CustomSelect({ options, value, onChange }: CustomSelectProps) {
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
        className={styles.selectButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{value}</span>
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

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Тип работы');
  const [selectedLocation, setSelectedLocation] = useState('Города');
  const [selectedExperience, setSelectedExperience] = useState('Опыт работы');
  const [selectedSalary, setSelectedSalary] = useState('Уровень дохода');
  const [selectedSkills, setSelectedSkills] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  const getApplicationStatusText = (job: { hasApplied?: boolean; applicationStatus?: string | null }) => {
    if (!job.hasApplied) return null;
    
    switch (job.applicationStatus) {
      case 'PENDING':
        return 'Ожидает рассмотрения';
      case 'REVIEWED':
        return 'Рассмотрен';
      case 'ACCEPTED':
        return 'Принят';
      case 'REJECTED':
        return 'Отклонен';
      case 'INTERVIEW_SCHEDULED':
        return 'Собеседование назначено';
      case 'HIRED':
        return 'Нанят';
      case 'WITHDRAWN':
        return 'Отозван';
      default:
        return 'Отклик отправлен';
    }
  };

  const getApplicationStatusClass = (job: { hasApplied?: boolean; applicationStatus?: string | null }) => {
    if (!job.hasApplied) return '';
    
    switch (job.applicationStatus) {
      case 'PENDING':
        return styles.pendingStatus;
      case 'ACCEPTED':
        return styles.acceptedStatus;
      case 'REJECTED':
        return styles.rejectedStatus;
      case 'INTERVIEW_SCHEDULED':
        return styles.interviewStatus;
      case 'HIRED':
        return styles.hiredStatus;
      default:
        return styles.appliedStatus;
    }
  };

  const jobTypes = ['Все', 'Полная занятость', 'Частичная занятость', 'Проектная занятость','Контракт', 'Стажировка', 'Фриланс'];
  const locations = [
    'Все',
    'Дербент',
    'Москва',
    'Санкт-Петербург',
    'Новосибирск',
    'Екатеринбург',
    'Казань',
    'Нижний Новгород',
    'Челябинск',
    'Самара',
    'Уфа',
    'Ростов-на-Дону',
    'Красноярск',
    'Пермь',
    'Воронеж',
    'Волгоград',
    'Саратов',
    'Краснодар',
    'Тюмень',
    'Тольятти',
    'Ижевск',
    'Барнаул',
    'Ульяновск',
    'Иркутск',
    'Хабаровск',
    'Ярославль',
    'Владивосток',
    'Махачкала',
    'Томск',
    'Оренбург',
    'Кемерово',
    'Новокузнецк',
    'Рязань',
    'Астрахань',
    'Пенза',
    'Липецк',
    'Киров',
    'Чебоксары',
    'Балашиха',
    'Калининград',
    'Тула',
    'Курск',
    'Севастополь',
    'Сочи',
    'Ставрополь',
    'Улан-Удэ',
    'Тверь',
    'Магнитогорск'
  ];
  const experienceLevels = ['Все', 'Без опыта', '1-3 года', '3-6 лет', 'Более 6 лет'];
  const salaryLevels = ['Все', 'До 50 000₽', '50 000₽ - 100 000₽', '100 000₽ - 200 000₽', '200 000₽ - 500 000₽', 'От 500 000₽'];

  // Validate and prepare query parameters
  const queryParams = {
    search: searchQuery.trim() || undefined,
    type: selectedType !== 'Тип работы' ? selectedType : undefined,
    location: selectedLocation !== 'Города' ? selectedLocation : undefined,
    skills: selectedSkills.trim() || undefined,
    remote: remoteOnly || undefined,
    // Only include pagination if we have valid values
    ...(currentPage > 1 && { page: currentPage })
    // Removed limit to use API default
  };

  const { data: jobsData, error, isLoading } = useGetJobsQuery(queryParams);
  
  // Handle validation errors
  useEffect(() => {
    if (error && 'data' in error) {
      const errorData = error.data as { errors?: { page?: string } };
      if (errorData?.errors) {
        console.error('Validation errors:', errorData.errors);
        // Reset to valid state if needed
        if (errorData.errors.page) {
          setCurrentPage(1);
        }
      }
    }
  }, [error]);
  
  const jobs = jobsData?.jobs || [];
  const filteredJobs = jobs;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Найди работу <span className={styles.highlight}>мечты</span>
          </h1>
          <p className={styles.subtitle}>
            Актуальные вакансии от лучших компаний
          </p>
          {userRole === 'HR' && (
            <div className={styles.heroActions}>
              <Link href="/jobs/create" className={styles.createJobBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Создать вакансию
              </Link>
            </div>
          )}
        </div>
      </section>
      <section className={styles.searchSection}>
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
            options={jobTypes}
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
          
        </div>
      </section>
      <section className={styles.jobsSection}>
        <div className={styles.resultsHeader}>
          {isLoading ? (
            <p className={styles.resultsCount}>Загрузка вакансий...</p>
          ) : error ? (
            <p className={styles.resultsCount} style={{ color: '#e10600' }}>
              {error && 'data' in error && (error.data as { errors?: unknown })?.errors ? 
                'Ошибка валидации параметров поиска' : 
                'Ошибка загрузки вакансий'
              }
            </p>
          ) : (
            <p className={styles.resultsCount}>
              Найдено {jobsData?.total || filteredJobs.length} {jobsData?.total === 1 ? 'вакансия' : 'вакансий'}
              {jobsData?.totalPages && jobsData.totalPages > 1 && ` (страница ${currentPage} из ${jobsData.totalPages})`}
            </p>
          )}
        </div>

        <div className={styles.jobsGrid}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={`${styles.jobCard} ${styles.jobCardSkeleton}`}>
                <div className={styles.skeletonHeader}></div>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonTags}>
                  <div className={styles.skeletonTag}></div>
                  <div className={styles.skeletonTag}></div>
                  <div className={styles.skeletonTag}></div>
                </div>
                <div className={styles.skeletonFooter}></div>
              </div>
            ))
          ) : (
            filteredJobs.map((job) => (
              <article key={job.id} className={styles.jobCard}>
                <div className={styles.jobCardHeader}>
                  <div className={styles.jobCardTitle}>
                    <h3>{job.title}</h3>
                    <div className={styles.jobCardMeta}>
                      <span className={styles.company}>
                        {job.hr?.company || 'Компания не указана'}
                      </span>
                      <span className={styles.separator}>•</span>
                      <span className={styles.location}>{job.location}</span>
                      {job.remote && (
                        <>
                          <span className={styles.separator}>•</span>
                          <span className={styles.remote}>Удаленно</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.jobCardBadge}>
                    <span className={styles.jobType}>{job.type}</span>
                    {job.status && (
                      <span className={styles.jobStatus}>{job.status}</span>
                    )}
                  </div>
                </div>

                <p className={styles.jobDescription}>
                  {job.description}
                </p>

                <div className={styles.jobTags}>
                  {job.skills?.map((skill) => (
                    <span key={skill.id} className={styles.tag}>
                      {skill.name}
                    </span>
                  ))}
                </div>

                <div className={styles.jobCardFooter}>
                  <div className={styles.jobSalary}>
                    {job.salaryMin && job.salaryMax ? 
                      `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency}` :
                      'Зарплата не указана'
                    }
                  </div>
                  <div className={styles.jobActions}>
                    <span className={styles.postedAt}>
                      {new Date(job.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                    {userRole === 'CANDIDATE' && job.hasApplied && (
                      <div className={`${styles.applicationStatus} ${getApplicationStatusClass(job)}`}>
                        {getApplicationStatusText(job)}
                      </div>
                    )}
                    <Link href={`/jobs/${job.id}`} className={styles.applyBtn}>
                      Подробнее
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {!isLoading && filteredJobs.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Вакансии не найдены</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && jobsData && jobsData.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Предыдущая
            </button>
            
            <div className={styles.paginationInfo}>
              Страница {currentPage} из {jobsData.totalPages}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(jobsData.totalPages, prev + 1))}
              disabled={currentPage === jobsData.totalPages}
              className={styles.paginationButton}
            >
              Следующая
            </button>
          </div>
        )}
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2>Нашли подходящую вакансию?</h2>
          <p>Оставьте резюме и работодатели сами найдут вас</p>
          <Link href="/resume" className={styles.ctaBtn}>
            Создать резюме
          </Link>
        </div>
      </section>
      <AIAssistant jobs={filteredJobs.map(job => ({
        ...job,
        postedAt: job.createdAt,
        company: job.hr?.company || 'Не указано',
        salary: job.salaryMin && job.salaryMax ? 
          `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency}` : 
          'Не указано',
        tags: []
      }))} />
    </div>
  );
}
