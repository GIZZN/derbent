'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { RotateCw } from 'lucide-react';
import { useGetJobsQuery } from '../../../lib/api/jobsApi';
import {
  useApproveJobMutation,
  useRejectJobMutation,
  useReturnJobMutation,
  useGetModerationStatsQuery,
} from '../../../lib/api/analyticsApi';
import styles from './jobs.module.css';

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomSelect({ options, value, onChange, placeholder = 'Выберите...' }: CustomSelectProps) {
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

export default function AdminJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Все статусы');
  const [selectedType, setSelectedType] = useState('Все типы');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  // RTK Query hooks
  const { data: jobsData, error, isLoading, refetch } = useGetJobsQuery({
    search: searchQuery.trim() || undefined,
    type: selectedType !== 'Все типы' ? selectedType : undefined,
    page: currentPage > 1 ? currentPage : undefined,
  });

  const { data: statsData } = useGetModerationStatsQuery();
  const [approveJob] = useApproveJobMutation();
  const [rejectJob] = useRejectJobMutation();
  const [returnJob] = useReturnJobMutation();

  const jobs = jobsData?.jobs || [];

  const statusOptions = ['Все статусы', 'ACTIVE', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'];
  const typeOptions = ['Все типы', 'Полная занятость', 'Частичная занятость', 'Проектная занятость', 'Контракт', 'Стажировка', 'Фриланс'];

  const handleJobAction = async (jobId: string, action: 'approve' | 'reject' | 'return', notes?: string) => {
    setActionLoading(jobId);
    
    try {
      let result;
      
      switch (action) {
        case 'approve':
          result = await approveJob({ jobId, notes }).unwrap();
          console.log('✅ Вакансия одобрена:', result);
          break;
        case 'reject':
          result = await rejectJob({ jobId, notes }).unwrap();
          console.log('❌ Вакансия отклонена:', result);
          break;
        case 'return':
          result = await returnJob({ jobId, notes }).unwrap();
          console.log('🔄 Вакансия возвращена на доработку:', result);
          break;
      }
      
      refetch();
    } catch (error) {
      console.error('❌ Ошибка при выполнении действия:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return `${styles.badge} ${styles.badgeActive}`;
      case 'DRAFT':
        return `${styles.badge} ${styles.badgeDraft}`;
      case 'PENDING':
        return `${styles.badge} ${styles.badgePending}`;
      case 'APPROVED':
        return `${styles.badge} ${styles.badgeApproved}`;
      case 'REJECTED':
        return `${styles.badge} ${styles.badgeRejected}`;
      case 'ARCHIVED':
        return `${styles.badge} ${styles.badgeArchived}`;
      default:
        return `${styles.badge}`;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Активна';
      case 'DRAFT':
        return 'Черновик';
      case 'PENDING':
        return 'На модерации';
      case 'APPROVED':
        return 'Одобрена';
      case 'REJECTED':
        return 'Отклонена';
      case 'ARCHIVED':
        return 'Архив';
      default:
        return status;
    }
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка вакансий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Ошибка загрузки данных</h3>
          <p>Не удалось загрузить список вакансий. Попробуйте обновить страницу.</p>
          <button onClick={() => refetch()} className={styles.refreshButton}>
            <RotateCw size={16} />
            Обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Управление <span className={styles.highlight}>вакансиями</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Административное управление всеми вакансиями на платформе
          </p>
          
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Поиск по названию, компании..."
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
                options={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
              />
              
              <CustomSelect
                options={typeOptions}
                value={selectedType}
                onChange={setSelectedType}
              />
              
              <button
                onClick={() => refetch()}
                className={styles.refreshButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <RotateCw size={16} />
                )}
                {isLoading ? 'Обновление...' : 'Обновить'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <h2>Найдено {jobs.length} {jobs.length === 1 ? 'вакансия' : 'вакансий'}</h2>
          {statsData && (
            <div className={styles.statsInfo}>
              <span>На модерации: {statsData.total.pending}</span>
              <span>Одобрено: {statsData.total.approved}</span>
              <span>Отклонено: {statsData.total.rejected}</span>
              <span>Всего: {jobsData?.total || jobs.length}</span>
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className={styles.jobsGrid}>
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobCardHeader}>
                  <div className={styles.jobCardLeft}>
                    <div className={styles.jobCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                      />
                    </div>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <p className={styles.jobCompany}>
                        {job.hr?.company || 'Неизвестная компания'} • {job.hr?.firstName} {job.hr?.lastName}
                      </p>
                      <p className={styles.jobLocation}>
                        {job.location} {job.remote && '• Удаленно'}
                      </p>
                    </div>
                  </div>
                  <div className={styles.jobCardRight}>
                    <span className={getStatusBadge(job.status)}>
                      {getStatusLabel(job.status)}
                    </span>
                    <span className={styles.jobDate}>
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>
                
                <p className={styles.jobDescription}>
                  {job.description && job.description.length > 200 
                    ? `${job.description.substring(0, 200)}...` 
                    : job.description || 'Описание не указано'
                  }
                </p>
                
                <div className={styles.jobSkills}>
                  {job.skills?.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {typeof skill === 'object' && skill !== null ? skill.name : skill}
                    </span>
                  )) || []}
                </div>
                
                <div className={styles.jobFooter}>
                  <div className={styles.jobMeta}>
                    <span>{(job as unknown as { _count: { applications: number } })._count?.applications || 0} откликов</span>
                    {job.salaryMin && job.salaryMax && (
                      <span>• {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.currency}</span>
                    )}
                  </div>
                  
                  <div className={styles.jobActions}>
                    <Link
                      href={`/jobs/${job.id}`}
                      className={`${styles.actionButton} ${styles.actionButtonView}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Просмотр
                    </Link>
                    
                    <Link
                      href={`/jobs/${job.id}/edit`}
                      className={`${styles.actionButton} ${styles.actionButtonEdit}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="m18.5 2.5-5 5v2h2l5-5a2.12 2.12 0 0 0 0-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Редактировать
                    </Link>
                    
                    {job.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleJobAction(job.id, 'approve')}
                          disabled={actionLoading === job.id}
                          className={`${styles.actionButton} ${styles.actionButtonApprove}`}
                        >
                          {actionLoading === job.id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleJobAction(job.id, 'reject')}
                          disabled={actionLoading === job.id}
                          className={`${styles.actionButton} ${styles.actionButtonReject}`}
                        >
                          {actionLoading === job.id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          Отклонить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Нет вакансий</h3>
              <p>
                Вакансии не найдены с текущими параметрами поиска
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {jobsData && jobsData.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className={styles.paginationInfo}>
              Страница {currentPage} из {jobsData.totalPages}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(jobsData.totalPages, prev + 1))}
              disabled={currentPage === jobsData.totalPages}
              className={styles.paginationButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
