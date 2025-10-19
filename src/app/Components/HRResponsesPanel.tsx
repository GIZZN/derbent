'use client';

import React, { useState } from 'react';
import { 
  useGetHRCompanyResponsesQuery, 
  useUpdateCompanyResponseStatusMutation
} from '@/lib/api/internshipRequestsApi';
import ResponseDetailsModal from './ResponseDetailsModal';
import styles from './HRResponsesPanel.module.css';

interface HRResponsesPanelProps {
  onClose?: () => void;
}

const HRResponsesPanel: React.FC<HRResponsesPanelProps> = ({ onClose }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
  });

  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: responses, isLoading, error, refetch } = useGetHRCompanyResponsesQuery(filters);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateCompanyResponseStatusMutation();

  const handleStatusUpdate = async (responseId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    try {
      await updateStatus({ id: responseId, status: newStatus }).unwrap();
      setShowDetailsModal(false);
    } catch (err) {
      console.error('Failed to update response status:', err);
    }
  };

  const handleShowDetails = (response: any) => {
    setSelectedResponse(response);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        return 'Принят';
      case 'REJECTED':
        return 'Отклонен';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка откликов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Ошибка загрузки</h2>
          <p>Не удалось загрузить отклики. Попробуйте обновить страницу.</p>
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
          <h1 className={styles.title}>Панель HR - Управление откликами</h1>
          <p className={styles.subtitle}>
            Управляйте откликами компаний на заявки стажировок
          </p>
        </div>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Статистика */}
      {responses && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{responses.length}</div>
            <div className={styles.statLabel}>Всего откликов</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: '#f59e0b' }}>
              {responses.filter(r => r.status === 'PENDING').length}
            </div>
            <div className={styles.statLabel}>На рассмотрении</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: '#10b981' }}>
              {responses.filter(r => r.status === 'ACCEPTED').length}
            </div>
            <div className={styles.statLabel}>Принято</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: '#ef4444' }}>
              {responses.filter(r => r.status === 'REJECTED').length}
            </div>
            <div className={styles.statLabel}>Отклонено</div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Поиск по компании, сообщению..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.statusFilter}>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.statusSelect}
          >
            <option value="all">Все статусы</option>
            <option value="PENDING">На рассмотрении</option>
            <option value="ACCEPTED">Принятые</option>
            <option value="REJECTED">Отклоненные</option>
          </select>
        </div>
      </div>

      {/* Список откликов */}
      <div className={styles.responsesList}>
        {responses && responses.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>Нет откликов</h3>
            <p>Отклики от компаний появятся здесь</p>
          </div>
        ) : (
          responses?.map((response) => (
            <div key={response.id} className={styles.responseCard}>
              <div className={styles.responseHeader}>
                <div className={styles.responseInfo}>
                  <h3 className={styles.companyName}>{response.companyName}</h3>
                  <p className={styles.contactEmail}>📧 {response.contactEmail}</p>
                  <p className={styles.responseDate}>
                    Отправлен: {formatDate(response.createdAt)}
                  </p>
                </div>
                <div className={styles.responseStatus}>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(response.status) }}
                  >
                    {getStatusText(response.status)}
                  </span>
                </div>
              </div>

              <div className={styles.responseContent}>
                <div className={styles.responseMessage}>
                  <h4>Сообщение от компании:</h4>
                  <p>{response.message}</p>
                </div>

                {response.internshipRequest && (
                  <div className={styles.requestInfo}>
                    <h4>Заявка на стажировку:</h4>
                    <p><strong>Специальность:</strong> {response.internshipRequest.specialty}</p>
                    <p><strong>Университет:</strong> {response.internshipRequest.university.name}</p>
                    <p><strong>Количество студентов:</strong> {response.internshipRequest.studentCount}</p>
                    <p><strong>Период:</strong> {response.internshipRequest.period}</p>
                    <p><strong>Локация:</strong> {response.internshipRequest.location}</p>
                    {response.internshipRequest.isRemote && (
                      <p><strong>Удаленно:</strong> Да</p>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.responseActions}>
                {response.status === 'PENDING' && (
                  <>
                    <button
                      className={styles.acceptButton}
                      onClick={() => handleStatusUpdate(response.id, 'ACCEPTED')}
                      disabled={isUpdating}
                    >
                      ✓ Принять
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleStatusUpdate(response.id, 'REJECTED')}
                      disabled={isUpdating}
                    >
                      ✗ Отклонить
                    </button>
                  </>
                )}
                <button 
                  className={styles.detailsButton}
                  onClick={() => handleShowDetails(response)}
                >
                  👁 Подробнее
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно с деталями отклика */}
      {selectedResponse && (
        <ResponseDetailsModal
          response={selectedResponse}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onStatusUpdate={handleStatusUpdate}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};

export default HRResponsesPanel;
