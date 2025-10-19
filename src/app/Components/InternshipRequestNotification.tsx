'use client';

import React from 'react';
import styles from './InternshipRequestNotification.module.css';

interface InternshipRequestNotificationProps {
  request: {
    id: string;
    specialty: string;
    studentCount: number;
    period: string;
    location: string;
    isRemote: boolean;
    university: {
      name: string;
    };
    createdAt: string;
  };
  onView: (requestId: string) => void;
  onDismiss: (requestId: string) => void;
}

const InternshipRequestNotification: React.FC<InternshipRequestNotificationProps> = ({
  request,
  onView,
  onDismiss
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.notification}>
      <div className={styles.notificationHeader}>
        <div className={styles.notificationIcon}>
          🎓
        </div>
        <div className={styles.notificationInfo}>
          <h4 className={styles.notificationTitle}>
            Новая заявка на стажировку
          </h4>
          <p className={styles.notificationTime}>
            {formatDate(request.createdAt)}
          </p>
        </div>
        <button
          onClick={() => onDismiss(request.id)}
          className={styles.dismissButton}
        >
          ×
        </button>
      </div>

      <div className={styles.notificationContent}>
        <div className={styles.requestInfo}>
          <h5 className={styles.specialty}>{request.specialty}</h5>
          <p className={styles.details}>
            {request.studentCount} студентов • {request.period} • {request.location}
            {request.isRemote && ' • Удаленно'}
          </p>
          <p className={styles.university}>
            Университет: {request.university.name}
          </p>
        </div>

        <div className={styles.notificationActions}>
          <button
            onClick={() => onView(request.id)}
            className={styles.viewButton}
          >
            Посмотреть заявку
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternshipRequestNotification;
