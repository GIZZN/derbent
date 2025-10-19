'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetJobByIdQuery, useCreateApplicationMutation } from '../../../lib/api/jobsApi';
import { getUserRole } from '../../../lib/api/authApi';
import { useNotificationContext } from '../../Components/NotificationProvider';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Building, 
  Phone, 
  ArrowLeft,
  Briefcase,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import styles from './page.module.css';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  const { data: job, error, isLoading, refetch } = useGetJobByIdQuery(jobId);
  const [createApplication, { isLoading: isCreatingApplication }] = useCreateApplicationMutation();
  const { showSuccess, showError } = useNotificationContext();

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  const handleApply = async () => {
    if (!job || (job.hasApplied && job.applicationStatus !== 'REJECTED')) return;
    
    setIsApplying(true);
    try {
      await createApplication({ jobId: job.id }).unwrap();
      showSuccess('Отклик отправлен!', 'Ваш отклик успешно отправлен на рассмотрение');
      // Принудительно обновляем данные вакансии
      await refetch();
    } catch (error) {
      console.error('Failed to apply:', error);
      showError('Ошибка отправки', 'Произошла ошибка при отправке отклика. Попробуйте еще раз.');
    } finally {
      setIsApplying(false);
    }
  };

  const getApplicationButtonText = () => {
    if (!job?.hasApplied) {
      return 'Подать заявку';
    }
    
    switch (job.applicationStatus) {
      case 'PENDING':
        return 'Ожидает рассмотрения';
      case 'REVIEWED':
        return 'Рассмотрен';
      case 'ACCEPTED':
        return 'Принят';
      case 'REJECTED':
        return 'Откликнуться снова';
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

  const getApplicationButtonClass = () => {
    if (!job?.hasApplied) return styles.applyButton;
    
    switch (job.applicationStatus) {
      case 'PENDING':
        return `${styles.applyButton} ${styles.pendingButton}`;
      case 'ACCEPTED':
        return `${styles.applyButton} ${styles.acceptedButton}`;
      case 'REJECTED':
        return `${styles.applyButton} ${styles.rejectedButton}`;
      case 'INTERVIEW_SCHEDULED':
        return `${styles.applyButton} ${styles.interviewButton}`;
      case 'HIRED':
        return `${styles.applyButton} ${styles.hiredButton}`;
      default:
        return `${styles.applyButton} ${styles.appliedButton}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'PAUSED': return '#f59e0b';
      case 'CLOSED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Активна';
      case 'PAUSED': return 'Приостановлена';
      case 'CLOSED': return 'Закрыта';
      default: return status;
    }
  };

  const getModerationStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'REJECTED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getModerationStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Одобрена';
      case 'PENDING': return 'На модерации';
      case 'REJECTED': return 'Отклонена';
      default: return status;
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'ACCEPTED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getApplicationStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'На рассмотрении';
      case 'ACCEPTED': return 'Принята';
      case 'REJECTED': return 'Отклонена';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingIcon}>
            <Briefcase size={48} />
          </div>
          <p>Загрузка вакансии...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle size={48} />
          <h2>Вакансия не найдена</h2>
          <p>Возможно, вакансия была удалена или не существует.</p>
          <Link href="/jobs" className={styles.errorBackButton}>
            <ArrowLeft size={16} />
            Вернуться к вакансиям
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back Tab */}
      <button 
        onClick={() => router.back()}
        className={styles.backTab}
        title="Назад"
      >
        <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{job.title}</h1>
          <div className={styles.jobMeta}>
            <div className={styles.jobMetaItem}>
              <Building size={16} />
              <span>{job.hr?.company || 'Компания не указана'}</span>
            </div>
            <div className={styles.jobMetaItem}>
              <MapPin size={16} />
              <span>{job.location}</span>
              {job.remote && <span className={styles.remote}>• Удаленно</span>}
            </div>
            <div className={styles.jobMetaItem}>
              <Calendar size={16} />
              <span>Опубликовано {new Date(job.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Main Info */}
        <div className={styles.mainInfo}>
          <div className={styles.jobCard}>
            <div className={styles.jobHeader}>
              <div className={styles.jobTitle}>
                <h2>{job.title}</h2>
                <div className={styles.jobBadges}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(job.status || '') }}
                  >
                    {getStatusLabel(job.status || '')}
                  </span>
                  {job.moderationStatus && (
                    <span 
                      className={styles.moderationBadge}
                      style={{ backgroundColor: getModerationStatusColor(job.moderationStatus) }}
                    >
                      {getModerationStatusLabel(job.moderationStatus)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.jobDetails}>
                <div className={styles.detailItem}>
                  <Briefcase size={16} />
                  <span>{job.type}</span>
                </div>
                <div className={styles.detailItem}>
                  <Award size={16} />
                  <span>{job.experienceLevel}</span>
                </div>
                {job.salaryMin && job.salaryMax && (
                  <div className={styles.detailItem}>
                    <DollarSign size={16} />
                    <span>{job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.currency}</span>
                  </div>
                )}
                {job.deadline && (
                  <div className={styles.detailItem}>
                    <Clock size={16} />
                    <span>До {new Date(job.deadline).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.jobDescription}>
              <h3>Описание</h3>
              <p>{job.description}</p>
            </div>

            {job.responsibilities && (
              <div className={styles.jobSection}>
                <h3>Обязанности</h3>
                <p>{job.responsibilities}</p>
              </div>
            )}

            {job.requirements && (
              <div className={styles.jobSection}>
                <h3>Требования</h3>
                <p>{job.requirements}</p>
              </div>
            )}

            {job.benefits && (
              <div className={styles.jobSection}>
                <h3>Что мы предлагаем</h3>
                <p>{job.benefits}</p>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div className={styles.jobSection}>
                <h3>Необходимые навыки</h3>
                <div className={styles.skillsList}>
                  {job.skills.map((skill) => (
                    <div key={skill.id} className={styles.skillItem}>
                      <span className={styles.skillName}>{skill.name}</span>
                      <span className={styles.skillCategory}>{skill.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* HR Info */}
          {job.hr && (
            <div className={styles.hrCard}>
              <h3>Контактное лицо</h3>
              <div className={styles.hrInfo}>
                <div className={styles.hrName}>
                  {job.hr.firstName} {job.hr.lastName}
                </div>
                <div className={styles.hrCompany}>
                  {job.hr.company}
                </div>
                {('phone' in job.hr) && (job.hr as { phone?: string }).phone && (
                  <div className={styles.hrContact}>
                    <Phone size={16} />
                    <span>{(job.hr as { phone?: string }).phone || ''}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Applications (for HR only) */}
          {userRole === 'HR' && job.applications && job.applications.length > 0 && (
            <div className={styles.applicationsCard}>
              <h3>Заявки ({job.applications.length})</h3>
              <div className={styles.applicationsList}>
                {job.applications.map((application) => (
                  <div key={application.id} className={styles.applicationItem}>
                    <div className={styles.applicationHeader}>
                      <div className={styles.candidateName}>
                        Кандидат ID: {application.candidateId}
                      </div>
                      <span 
                        className={styles.applicationStatus}
                        style={{ backgroundColor: getApplicationStatusColor(application.status) }}
                      >
                        {getApplicationStatusLabel(application.status)}
                      </span>
                    </div>
                    <div className={styles.applicationDate}>
                      Подана {new Date(application.appliedAt).toLocaleDateString('ru-RU')}
                    </div>
                    <div className={styles.applicationDetails}>
                      <div>Resume ID: {application.resumeId}</div>
                      <div>Обновлено: {new Date(application.updatedAt).toLocaleDateString('ru-RU')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply Button (for candidates) */}
          {userRole === 'CANDIDATE' && (
            <div className={styles.applyCard}>
              <button 
                className={getApplicationButtonClass()}
                onClick={handleApply}
                disabled={isApplying || isCreatingApplication || (job?.hasApplied && job.applicationStatus !== 'REJECTED')}
              >
                <CheckCircle size={16} />
                {isApplying || isCreatingApplication ? 'Отправка...' : getApplicationButtonText()}
              </button>
              {job?.hasApplied ? (
                <div className={styles.applicationInfo}>
                  <p className={styles.applyNote}>
                    Отклик отправлен {job.appliedAt && new Date(job.appliedAt).toLocaleDateString('ru-RU')}
                  </p>
                  {job.applicationStatus === 'REJECTED' && (
                    <p className={styles.reapplyNote}>
                      Вы можете откликнуться снова
                    </p>
                  )}
                </div>
              ) : (
                <p className={styles.applyNote}>
                  Нажмите кнопку, чтобы отправить заявку на эту вакансию
                </p>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}