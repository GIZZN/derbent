'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetMyJobsQuery, useDeleteJobMutation, usePublishJobMutation, useUpdateJobStatusMutation, JobType, ExperienceLevel } from '../../../lib/api/jobsApi';
import { getUserRole } from '../../../lib/api/authApi';
import styles from './my-jobs.module.css';

// Helper functions for displaying data
const getJobTypeLabel = (type: JobType) => {
  const labels = {
    [JobType.FULL_TIME]: 'Полная занятость',
    [JobType.PART_TIME]: 'Частичная занятость',
    [JobType.CONTRACT]: 'Контракт',
    [JobType.FREELANCE]: 'Фриланс',
    [JobType.INTERNSHIP]: 'Стажировка'
  };
  return labels[type] || type;
};

const getExperienceLevelLabel = (level: ExperienceLevel) => {
  const labels = {
    [ExperienceLevel.NO_EXPERIENCE]: 'Без опыта',
    [ExperienceLevel.JUNIOR]: 'Junior',
    [ExperienceLevel.MIDDLE]: 'Middle',
    [ExperienceLevel.SENIOR]: 'Senior',
    [ExperienceLevel.LEAD]: 'Lead'
  };
  return labels[level] || level;
};

const getCurrencySymbol = (currency: string) => {
  const symbols = {
    'RUB': '₽',
    'USD': '$',
    'EUR': '€'
  };
  return symbols[currency as keyof typeof symbols] || currency;
};

const getModerationStatusLabel = (status: string) => {
  const labels = {
    'PENDING': 'На модерации',
    'APPROVED': 'Одобрено',
    'REJECTED': 'Отклонено'
  };
  return labels[status as keyof typeof labels] || status;
};

const getModerationStatusColor = (status: string) => {
  const colors = {
    'PENDING': '#f59e0b',
    'APPROVED': '#10b981',
    'REJECTED': '#ef4444'
  };
  return colors[status as keyof typeof colors] || '#666';
};

const getJobStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'Черновик';
    case 'ACTIVE': return 'Активна';
    case 'PAUSED': return 'Приостановлена';
    case 'CLOSED': return 'Закрыта';
    default: return status;
  }
};

const getJobStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT': return '#6b7280';
    case 'ACTIVE': return '#10b981';
    case 'PAUSED': return '#f59e0b';
    case 'CLOSED': return '#ef4444';
    case 'ARCHIVED': return '#8b5cf6';
    default: return '#666';
  }
};

// Available job statuses
const JOB_STATUSES = [
  { value: 'DRAFT', label: 'Черновик', color: '#6b7280' },
  { value: 'ACTIVE', label: 'Активна', color: '#10b981' },
  { value: 'PAUSED', label: 'Приостановлена', color: '#f59e0b' },
  { value: 'CLOSED', label: 'Закрыта', color: '#ef4444' },
  { value: 'ARCHIVED', label: 'Архивирована', color: '#8b5cf6' },
];

export default function MyJobsPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Check if user is HR
  useEffect(() => {
    const userRole = getUserRole();
    if (!userRole || userRole !== 'HR') {
      router.push('/auth/login');
    }
  }, [router]);

  const { data: jobs = [], error, isLoading, refetch } = useGetMyJobsQuery();
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  const [publishJob, { isLoading: isPublishing }] = usePublishJobMutation();
  const [updateJobStatus, { isLoading: isUpdatingStatus }] = useUpdateJobStatusMutation();

  const handleDeleteClick = (jobId: string) => {
    setShowDeleteModal(jobId);
  };

  const handleDeleteConfirm = async () => {
    if (!showDeleteModal) return;
    
    try {
      await deleteJob(showDeleteModal).unwrap();
      setShowDeleteModal(null);
      refetch(); // Refresh the list after deletion
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(null);
  };

  const handlePublishJob = async (jobId: string) => {
    try {
      await publishJob(jobId).unwrap();
      refetch(); // Refresh the list after publishing
    } catch (error) {
      console.error('Failed to publish job:', error);
    }
  };

  const handleStatusChangeClick = (jobId: string, currentStatus: string) => {
    setShowStatusModal(jobId);
    setSelectedStatus(currentStatus);
  };

  const handleStatusUpdate = async () => {
    if (!showStatusModal || !selectedStatus) return;
    
    try {
      await updateJobStatus({ 
        jobId: showStatusModal, 
        status: selectedStatus 
      }).unwrap();
      setShowStatusModal(null);
      setSelectedStatus('');
      refetch(); // Refresh the list after status update
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const handleStatusModalCancel = () => {
    setShowStatusModal(null);
    setSelectedStatus('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <button 
              onClick={() => router.back()}
              className={styles.backButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Назад
            </button>
            
            <Link href="/jobs/create" className={styles.createButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Создать вакансию
            </Link>
          </div>
          
          <h1 className={styles.title}>
            Мои <span className={styles.highlight}>вакансии</span>
          </h1>
          <p className={styles.subtitle}>
            Управляйте своими опубликованными вакансиями
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка ваших вакансий...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить ваши вакансии</p>
            <button onClick={() => refetch()} className={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className={styles.empty}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 9H9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>У вас пока нет вакансий</h3>
            <p>Создайте свою первую вакансию, чтобы найти лучших кандидатов</p>
            <Link href="/jobs/create" className={styles.createFirstButton}>
              Создать первую вакансию
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.statsHeader}>
              <div className={styles.statsCard}>
                <div className={styles.statsNumber}>{jobs.length}</div>
                <div className={styles.statsLabel}>
                  {jobs.length === 1 ? 'Активная вакансия' : 'Активных вакансий'}
                </div>
              </div>
            </div>
            
            <div className={styles.jobsList}>
              {jobs.map((job) => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobCardHeader}>
                    <div className={styles.jobCardTitle}>
                      <div className={styles.jobTitleRow}>
                        <h3>{job.title}</h3>
                        <div className={styles.statusBadges}>
                          <button 
                            className={styles.jobStatusButton}
                            style={{ color: getJobStatusColor(job.status) }}
                            onClick={() => handleStatusChangeClick(job.id, job.status)}
                            title="Изменить статус вакансии"
                          >
                            {getJobStatusLabel(job.status)}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <span 
                            className={styles.moderationStatus}
                            style={{ color: getModerationStatusColor(job.moderationStatus) }}
                          >
                            {getModerationStatusLabel(job.moderationStatus)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.jobCardMeta}>
                        <span className={styles.location}>{job.location}</span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.type}>{getJobTypeLabel(job.type)}</span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.experience}>{getExperienceLevelLabel(job.experienceLevel)}</span>
                        {job.remote && (
                          <>
                            <span className={styles.separator}>•</span>
                            <span className={styles.remote}>🏠 Удаленно</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={styles.jobCardActions}>
                      {job.status === 'DRAFT' && (
                        <button 
                          onClick={() => handlePublishJob(job.id)}
                          disabled={isPublishing}
                          className={styles.publishButton}
                          title="Опубликовать вакансию"
                        >
                          {isPublishing ? (
                            <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="32">
                                <animate attributeName="strokeDashoffset" values="32;0" dur="1s" repeatCount="indefinite"/>
                              </circle>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M8 5V13L12 9L16 13V5H8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M4 19H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {isPublishing ? 'Публикация...' : 'Опубликовать'}
                        </button>
                      )}
                      <Link 
                        href={`/jobs/${job.id}/edit`} 
                        className={styles.editButton}
                        title="Редактировать"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(job.id)}
                        className={styles.deleteButton}
                        title="Удалить"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className={styles.jobDescription}>
                    {job.description.length > 150 
                      ? `${job.description.substring(0, 150)}...` 
                      : job.description
                    }
                  </p>

                  <div className={styles.jobTags}>
                    {job.skills?.slice(0, 4).map((skill) => (
                      <span key={skill.id} className={styles.tag}>
                        {skill.name}
                      </span>
                    ))}
                    {job.skills && job.skills.length > 4 && (
                      <span className={styles.tagMore}>
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>

                  <div className={styles.jobCardFooter}>
                    <div className={styles.jobSalary}>
                      {(job.salaryMin || job.salaryMax) ? (
                        job.salaryMin && job.salaryMax 
                          ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${getCurrencySymbol(job.currency)}`
                          : job.salaryMin 
                            ? `от ${job.salaryMin.toLocaleString()} ${getCurrencySymbol(job.currency)}`
                            : `до ${job.salaryMax?.toLocaleString()} ${getCurrencySymbol(job.currency)}`
                      ) : (
                        'Зарплата по договоренности'
                      )}
                    </div>
                    <div className={styles.jobMeta}>
                      <div className={styles.jobStats}>
                        <span className={styles.views}>
                          👁️ {job.views} просмотров
                        </span>
                        <span className={styles.applications}>
                          📝 {job.applicationsCount} откликов
                        </span>
                      </div>
                      <span className={styles.createdDate}>
                        Создано: {new Date(job.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                      {job.deadline && (
                        <span className={styles.deadline}>
                          До: {new Date(job.deadline).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                      <Link href={`/jobs/${job.id}`} className={styles.viewButton}>
                        Посмотреть
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={handleDeleteCancel}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#e10600" strokeWidth="1.5"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="#e10600" strokeWidth="1.5"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="#e10600" strokeWidth="1.5"/>
              </svg>
              <h3>Удалить вакансию?</h3>
              <p>Это действие нельзя будет отменить. Вакансия будет удалена навсегда.</p>
            </div>
            <div className={styles.modalActions}>
              <button 
                onClick={handleDeleteCancel}
                className={styles.modalCancelButton}
              >
                Отмена
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className={styles.modalDeleteButton}
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={handleStatusModalCancel}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="1.5"/>
              </svg>
              <h3>Изменить статус вакансии</h3>
              <p>Выберите новый статус для вакансии</p>
            </div>
            <div className={styles.statusOptions}>
              {JOB_STATUSES.map((status) => (
                <button
                  key={status.value}
                  className={`${styles.statusOption} ${
                    selectedStatus === status.value ? styles.statusOptionActive : ''
                  }`}
                  onClick={() => setSelectedStatus(status.value)}
                  style={{ 
                    borderColor: selectedStatus === status.value ? status.color : '#e5e7eb',
                    backgroundColor: selectedStatus === status.value ? `${status.color}10` : 'white'
                  }}
                >
                  <div 
                    className={styles.statusOptionIndicator}
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span style={{ color: status.color }}>{status.label}</span>
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button 
                onClick={handleStatusModalCancel}
                className={styles.modalCancelButton}
              >
                Отмена
              </button>
              <button 
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus || !selectedStatus}
                className={styles.modalUpdateButton}
              >
                {isUpdatingStatus ? 'Обновление...' : 'Обновить статус'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

