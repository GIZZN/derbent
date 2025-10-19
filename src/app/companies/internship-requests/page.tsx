'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetInternshipRequestsQuery } from '@/lib/api/internshipRequestsApi';
import styles from './internship-requests.module.css';

const CompanyInternshipRequestsPage: React.FC = () => {
  const { data: responseData, isLoading, error, refetch } = useGetInternshipRequestsQuery();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Безопасно получаем массив заявок из ответа API
  const requests = Array.isArray(responseData?.requests) ? responseData.requests : [];

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Дата не указана';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Ошибка даты';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'ACCEPTED':
        return '#10b981';
      case 'REJECTED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'На рассмотрении';
      case 'ACCEPTED':
        return 'Принята';
      case 'REJECTED':
        return 'Отклонена';
      default:
        return status;
    }
  };

  // Фильтрация заявок
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка заявок на стажировки...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Ошибка загрузки</h2>
          <p>Не удалось загрузить заявки на стажировки. Попробуйте обновить страницу.</p>
          <button onClick={() => refetch()} className={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Заявки на стажировки от университетов</h1>
          <p className={styles.subtitle}>
            Просматривайте и отвечайте на заявки от учебных заведений
          </p>
        </div>
      </div>

      {/* Фильтры */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Поиск по специальности, описанию, локации..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.statusFilter}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="all">Все статусы</option>
            <option value="PENDING">На рассмотрении</option>
            <option value="ACCEPTED">Принятые</option>
            <option value="REJECTED">Отклоненные</option>
          </select>
        </div>
      </div>

      {/* Результаты */}
      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <h2>Найдено {filteredRequests.length} заявок</h2>
        </div>

        {filteredRequests.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎓</div>
            <h3>Нет заявок</h3>
            <p>Заявки от университетов появятся здесь</p>
          </div>
        ) : (
          <div className={styles.requestsList}>
            {filteredRequests.map((request) => (
              <div key={request.id} className={styles.requestCard}>
                <div className={styles.requestHeader}>
                  <div className={styles.requestInfo}>
                    <h3 className={styles.requestTitle}>{request.specialty}</h3>
                    <p className={styles.requestDetails}>
                      {request.location} • {request.studentCount} студентов • {request.period}
                      {request.isRemote && ' • Удаленно'}
                    </p>
                    <p className={styles.universityInfo}>
                      🏫 {request.university.name}
                    </p>
                  </div>
                  <div className={styles.requestStatus}>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(request.status) }}
                    >
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>

                <div className={styles.requestContent}>
                  <div className={styles.requestDescription}>
                    <h4>Описание:</h4>
                    <p>{request.description}</p>
                  </div>

                  {request.requirements && (
                    <div className={styles.requestRequirements}>
                      <h4>Требования:</h4>
                      <p>{request.requirements}</p>
                    </div>
                  )}

                  {request.skills && Array.isArray(request.skills) && request.skills.length > 0 && (
                    <div className={styles.requestSkills}>
                      <h4>Навыки:</h4>
                      <div className={styles.skillsList}>
                        {request.skills.map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.requestDates}>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Начало:</span>
                      <span className={styles.dateValue}>
                        {formatDate(request.startDate)}
                      </span>
                    </div>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Окончание:</span>
                      <span className={styles.dateValue}>
                        {formatDate(request.endDate)}
                      </span>
                    </div>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Подана:</span>
                      <span className={styles.dateValue}>
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.requestFooter}>
                  <div className={styles.requestMeta}>
                    <span className={styles.createdAt}>
                      Создано: {formatDate(request.createdAt)}
                    </span>
                  </div>
                  <div className={styles.requestActions}>
                    {request.status === 'PENDING' && (
                      <>
                        <button className={styles.acceptButton}>
                          Принять
                        </button>
                        <button className={styles.rejectButton}>
                          Отклонить
                        </button>
                      </>
                    )}
                    <button className={styles.contactButton}>
                      Связаться
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

export default CompanyInternshipRequestsPage;