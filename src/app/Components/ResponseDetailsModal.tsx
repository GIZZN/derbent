'use client';

import React from 'react';
import { CompanyResponse } from '@/lib/api/internshipRequestsApi';
import styles from './ResponseDetailsModal.module.css';

interface ResponseDetailsModalProps {
  response: CompanyResponse;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (responseId: string, status: 'ACCEPTED' | 'REJECTED') => void;
  isUpdating: boolean;
}

const ResponseDetailsModal: React.FC<ResponseDetailsModalProps> = ({
  response,
  isOpen,
  onClose,
  onStatusUpdate,
  isUpdating
}) => {
  if (!isOpen) return null;

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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Детали отклика</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Информация о компании</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Название компании:</span>
                <span className={styles.infoValue}>{response.companyName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Контактный email:</span>
                <span className={styles.infoValue}>{response.contactEmail}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Статус:</span>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(response.status) }}
                >
                  {getStatusText(response.status)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Дата отклика:</span>
                <span className={styles.infoValue}>{formatDate(response.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Сообщение от компании</h3>
            <div className={styles.messageBox}>
              <p className={styles.messageText}>{response.message}</p>
            </div>
          </div>

          {response.internshipRequest && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Заявка на стажировку</h3>
              <div className={styles.requestDetails}>
                <div className={styles.requestInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Специальность:</span>
                    <span className={styles.infoValue}>{response.internshipRequest.specialty}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Университет:</span>
                    <span className={styles.infoValue}>{response.internshipRequest.university.name}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Количество студентов:</span>
                    <span className={styles.infoValue}>{response.internshipRequest.studentCount}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Период:</span>
                    <span className={styles.infoValue}>{response.internshipRequest.period}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Локация:</span>
                    <span className={styles.infoValue}>{response.internshipRequest.location}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Удаленно:</span>
                    <span className={styles.infoValue}>
                      {response.internshipRequest.isRemote ? 'Да' : 'Нет'}
                    </span>
                  </div>
                </div>

                {response.internshipRequest.description && (
                  <div className={styles.descriptionBox}>
                    <h4 className={styles.descriptionTitle}>Описание:</h4>
                    <p className={styles.descriptionText}>{response.internshipRequest.description}</p>
                  </div>
                )}

                {response.internshipRequest.requirements && (
                  <div className={styles.descriptionBox}>
                    <h4 className={styles.descriptionTitle}>Требования:</h4>
                    <p className={styles.descriptionText}>{response.internshipRequest.requirements}</p>
                  </div>
                )}

                {response.internshipRequest.skills && response.internshipRequest.skills.length > 0 && (
                  <div className={styles.skillsBox}>
                    <h4 className={styles.skillsTitle}>Навыки:</h4>
                    <div className={styles.skillsList}>
                      {response.internshipRequest.skills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.datesBox}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Начало стажировки:</span>
                    <span className={styles.dateValue}>
                      {formatDate(response.internshipRequest.startDate)}
                    </span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Окончание стажировки:</span>
                    <span className={styles.dateValue}>
                      {formatDate(response.internshipRequest.endDate)}
                    </span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Заявка создана:</span>
                    <span className={styles.dateValue}>
                      {formatDate(response.internshipRequest.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {response.status === 'PENDING' && (
            <div className={styles.actionButtons}>
              <button
                className={styles.acceptButton}
                onClick={() => onStatusUpdate(response.id, 'ACCEPTED')}
                disabled={isUpdating}
              >
                ✓ Принять отклик
              </button>
              <button
                className={styles.rejectButton}
                onClick={() => onStatusUpdate(response.id, 'REJECTED')}
                disabled={isUpdating}
              >
                ✗ Отклонить отклик
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseDetailsModal;
