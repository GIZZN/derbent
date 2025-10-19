'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  useGetMyInternshipsQuery, 
  useUpdateInternshipStatusMutation
} from '@/lib/api/internshipsApi';
import styles from './internships.module.css';

const CompanyInternshipsPage: React.FC = () => {
  const { data: responseData, isLoading, error, refetch } = useGetMyInternshipsQuery();
  const [updateStatus] = useUpdateInternshipStatusMutation();
  
  // Безопасно получаем массив стажировок из ответа API
  const internships = Array.isArray(responseData?.internships) ? responseData.internships : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return '#6b7280';
      case 'ACTIVE':
        return '#10b981';
      case 'PAUSED':
        return '#f59e0b';
      case 'COMPLETED':
        return '#3b82f6';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Черновик';
      case 'ACTIVE':
        return 'Активна';
      case 'PAUSED':
        return 'Приостановлена';
      case 'COMPLETED':
        return 'Завершена';
      case 'CANCELLED':
        return 'Отменена';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Обработчики для изменения статуса
  const handlePublish = async (internshipId: string) => {
    try {
      await updateStatus({ id: internshipId, status: 'ACTIVE' }).unwrap();
      refetch(); // Обновляем список
    } catch (err) {
      console.error('Failed to publish internship:', err);
    }
  };

  const handlePause = async (internshipId: string) => {
    try {
      await updateStatus({ id: internshipId, status: 'PAUSED' }).unwrap();
      refetch(); // Обновляем список
    } catch (err) {
      console.error('Failed to pause internship:', err);
    }
  };

  const handleResume = async (internshipId: string) => {
    try {
      await updateStatus({ id: internshipId, status: 'ACTIVE' }).unwrap();
      refetch(); // Обновляем список
    } catch (err) {
      console.error('Failed to resume internship:', err);
    }
  };

  const handleComplete = async (internshipId: string) => {
    if (confirm('Вы уверены, что хотите завершить эту стажировку?')) {
      try {
        await updateStatus({ id: internshipId, status: 'COMPLETED' }).unwrap();
        refetch(); // Обновляем список
      } catch (err) {
        console.error('Failed to complete internship:', err);
      }
    }
  };

  const handleCancel = async (internshipId: string) => {
    if (confirm('Вы уверены, что хотите отменить эту стажировку? Это действие нельзя отменить.')) {
      try {
        await updateStatus({ id: internshipId, status: 'CANCELLED' }).unwrap();
        refetch(); // Обновляем список
      } catch (err) {
        console.error('Failed to cancel internship:', err);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Мои стажировки</h1>
          <p className={styles.subtitle}>
            Управляйте вашими предложениями стажировок
          </p>
        </div>
        <Link href="/companies/internships/create" className={styles.createButton}>
          Создать стажировку
        </Link>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка стажировок...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить стажировки. Попробуйте обновить страницу.</p>
            <button onClick={() => refetch()} className={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        ) : !Array.isArray(internships) || internships.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎓</div>
            <h3>Нет стажировок</h3>
            <p>Создайте первое предложение стажировки для привлечения студентов</p>
            <Link href="/companies/internships/create" className={styles.createFirstButton}>
              Создать стажировку
            </Link>
          </div>
        ) : (
          <div className={styles.internshipsList}>
            {Array.isArray(internships) && internships.map((internship) => (
              <div key={internship.id} className={styles.internshipCard}>
                <div className={styles.internshipHeader}>
                  <div className={styles.internshipInfo}>
                    <h3 className={styles.internshipTitle}>{internship.title}</h3>
                    <p className={styles.internshipDetails}>
                      {internship.location} • {internship.duration} дней • {internship.maxParticipants} мест
                      {internship.isRemote && ' • Удаленно'}
                      {internship.currentParticipants && ` • ${internship.currentParticipants} участников`}
                    </p>
                    <p className={styles.internshipSalary}>
                      {internship.salaryMin && internship.salaryMax && internship.currency
                        ? `${formatCurrency(internship.salaryMin, internship.currency)} - ${formatCurrency(internship.salaryMax, internship.currency)}`
                        : internship.salaryMin && internship.currency
                        ? `От ${formatCurrency(internship.salaryMin, internship.currency)}`
                        : 'Зарплата не указана'
                      }
                    </p>
                  </div>
                  <div className={styles.internshipStatus}>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(internship.status) }}
                    >
                      {getStatusText(internship.status)}
                    </span>
                  </div>
                </div>

                <div className={styles.internshipContent}>
                  <div className={styles.internshipDescription}>
                    <h4>Описание:</h4>
                    <p>{internship.description}</p>
                  </div>

                  {internship.requirements && (
                    <div className={styles.internshipRequirements}>
                      <h4>Требования:</h4>
                      <p>{internship.requirements}</p>
                    </div>
                  )}

                  {internship.skills && Array.isArray(internship.skills) && internship.skills.length > 0 && (
                    <div className={styles.internshipSkills}>
                      <h4>Навыки:</h4>
                      <div className={styles.skillsList}>
                        {internship.skills.map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {internship.tags && Array.isArray(internship.tags) && internship.tags.length > 0 && (
                    <div className={styles.internshipTags}>
                      <h4>Теги:</h4>
                      <div className={styles.tagsList}>
                        {internship.tags.map((tag, index) => (
                          <span key={index} className={styles.tagTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.internshipDates}>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Начало:</span>
                      <span className={styles.dateValue}>
                        {formatDate(internship.startDate)}
                      </span>
                    </div>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Окончание:</span>
                      <span className={styles.dateValue}>
                        {formatDate(internship.endDate)}
                      </span>
                    </div>
                    {internship.deadline && (
                      <div className={styles.dateItem}>
                        <span className={styles.dateLabel}>Дедлайн:</span>
                        <span className={styles.dateValue}>
                          {formatDate(internship.deadline)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.internshipStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Просмотры:</span>
                      <span className={styles.statValue}>{internship.views}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Заявки:</span>
                      <span className={styles.statValue}>{internship.applicationsCount}</span>
                    </div>
                    {internship._count && (
                      <>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Участники:</span>
                          <span className={styles.statValue}>{internship._count.participants}</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Всего заявок:</span>
                          <span className={styles.statValue}>{internship._count.applications}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.internshipFooter}>
                  <div className={styles.internshipMeta}>
                    <span className={styles.createdAt}>
                      Создано: {formatDate(internship.createdAt)}
                    </span>
                  </div>
                  <div className={styles.internshipActions}>
                    {/* Кнопки в зависимости от статуса */}
                    {internship.status === 'DRAFT' && (
                      <button 
                        onClick={() => handlePublish(internship.id)}
                        className={styles.publishButton}
                      >
                        Опубликовать
                      </button>
                    )}
                    
                    {internship.status === 'ACTIVE' && (
                      <>
                        <button 
                          onClick={() => handlePause(internship.id)}
                          className={styles.pauseButton}
                        >
                          Приостановить
                        </button>
                        <button 
                          onClick={() => handleComplete(internship.id)}
                          className={styles.completeButton}
                        >
                          Завершить
                        </button>
                      </>
                    )}
                    
                    {internship.status === 'PAUSED' && (
                      <button 
                        onClick={() => handleResume(internship.id)}
                        className={styles.resumeButton}
                      >
                        Возобновить
                      </button>
                    )}
                    
                    {(internship.status === 'ACTIVE' || internship.status === 'PAUSED') && (
                      <button 
                        onClick={() => handleCancel(internship.id)}
                        className={styles.cancelButton}
                      >
                        Отменить
                      </button>
                    )}
                    
                    <button className={styles.editButton}>
                      Редактировать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInternshipsPage;
