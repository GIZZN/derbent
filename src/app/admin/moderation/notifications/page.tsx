'use client';

import { useState } from 'react';
import {
  useGetNotificationsQuery,
  useBroadcastNotificationMutation,
  useDeleteNotificationMutation,
  NotificationsParams,
  BroadcastNotificationParams,
} from '../../../../lib/api/analyticsApi';
import styles from '../moderation.module.css';

export default function ModerationNotificationsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<NotificationsParams>({
    type: '',
    priority: '',
    page: 1,
    limit: 20,
  });
  
  const [newNotification, setNewNotification] = useState<BroadcastNotificationParams>({
    title: '',
    message: '',
    type: 'SYSTEM',
    priority: 'MEDIUM',
    targetRoles: ['ADMIN'],
    scheduledAt: '',
  });

  // API хуки
  const { data: notificationsData, isLoading,  refetch } = useGetNotificationsQuery({
    ...filters,
    page,
  });
  
  const [broadcastNotification, { isLoading: broadcastLoading }] = useBroadcastNotificationMutation();
  const [deleteNotification, { isLoading: deleteLoading }] = useDeleteNotificationMutation();

  const handleFilterChange = (key: keyof NotificationsParams, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleBroadcast = async () => {
    if (!newNotification.title || !newNotification.message) {
      alert('Пожалуйста, заполните заголовок и сообщение');
      return;
    }

    try {
      await broadcastNotification(newNotification).unwrap();
      alert('Уведомление отправлено успешно!');
      setNewNotification({
        title: '',
        message: '',
        type: 'SYSTEM',
        priority: 'MEDIUM',
        targetRoles: ['ADMIN'],
        scheduledAt: '',
      });
      refetch();
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
      alert('Ошибка отправки уведомления');
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это уведомление?')) return;

    try {
      await deleteNotification(notificationId).unwrap();
      alert('Уведомление удалено');
      refetch();
    } catch (error) {
      console.error('Ошибка удаления уведомления:', error);
      alert('Ошибка удаления уведомления');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '#ef4444';
      case 'MEDIUM':
        return '#f59e0b';
      case 'LOW':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return '⚙️';
      case 'MODERATION':
        return '🛡️';
      case 'ALERT':
        return '🚨';
      case 'INFO':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const tabs = [
    { id: 'list', name: 'Уведомления', icon: '📋' },
    { id: 'create', name: 'Создать', icon: '✉️' },
  ];

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка уведомлений...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>
                <span className={styles.highlight}>Уведомления</span> модерации
              </h1>
              <p className={styles.subtitle}>
                Управление уведомлениями и рассылками для модераторов
              </p>
            </div>
            <div className={styles.headerIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Tabs */}
        <div className={styles.filtersCard}>
          <div className={styles.filters}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.filterSelect} ${activeTab === tab.id ? styles.filterSelectActive : ''}`}
                style={{
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #e10600, #ba0500)' : '#fff',
                  color: activeTab === tab.id ? '#fff' : '#111',
                  border: activeTab === tab.id ? '1px solid #e10600' : '1px solid #eaeaea',
                }}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List Tab */}
        {activeTab === 'list' && (
          <div>
            {/* Filters */}
            <div className={styles.filtersCard}>
              <div className={styles.filters}>
                <span className={styles.filterLabel}>Фильтры:</span>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Все типы</option>
                  <option value="SYSTEM">Системные</option>
                  <option value="MODERATION">Модерация</option>
                  <option value="ALERT">Оповещения</option>
                  <option value="INFO">Информационные</option>
                </select>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Все приоритеты</option>
                  <option value="HIGH">Высокий</option>
                  <option value="MEDIUM">Средний</option>
                  <option value="LOW">Низкий</option>
                </select>
                 {notificationsData && notificationsData.notifications && (
                   <span style={{ fontSize: '0.875rem', color: '#555' }}>
                     Показано {notificationsData.notifications.length} из {notificationsData.total} уведомлений
                   </span>
                 )}
              </div>
            </div>

            {/* Notifications List */}
            {notificationsData && notificationsData.notifications && notificationsData.notifications.length > 0 ? (
              <div className={styles.jobsGrid}>
                {notificationsData.notifications.map((notification) => (
                  <div key={notification.id} className={styles.jobCard}>
                    <div className={styles.jobCardHeader}>
                      <div className={styles.jobCardLeft}>
                        <div style={{ fontSize: '1.5rem', marginRight: '1rem' }}>
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className={styles.jobInfo}>
                          <h3 className={styles.jobTitle}>{notification.title}</h3>
                          <p className={styles.jobCompany}>
                            Тип: {notification.type} • Роли: {notification.targetRoles.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className={styles.jobCardRight}>
                        <span 
                          className={styles.badge}
                          style={{ 
                            backgroundColor: getPriorityColor(notification.priority) + '20',
                            color: getPriorityColor(notification.priority),
                            border: `1px solid ${getPriorityColor(notification.priority)}40`
                          }}
                        >
                          {notification.priority}
                        </span>
                        <span className={styles.jobDate}>
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className={styles.jobDescription}>
                      {notification.message}
                    </p>
                    
                    {notification.scheduledAt && (
                      <div className={styles.jobSkills}>
                        <span className={styles.skillTag}>
                          📅 Запланировано на: {formatDate(notification.scheduledAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className={styles.jobFooter}>
                      <div className={styles.jobMeta}>
                        <span>ID: {notification.id}</span>
                      </div>
                      
                      <div className={styles.jobActions}>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          disabled={deleteLoading}
                          className={`${styles.actionButton} ${styles.actionButtonReject}`}
                        >
                          {deleteLoading ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <h3>Нет уведомлений</h3>
                <p>Пока нет уведомлений для отображения.</p>
              </div>
            )}

            {/* Pagination */}
            {notificationsData && notificationsData.totalPages && notificationsData.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className={styles.paginationButton}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <span className={styles.paginationButton} style={{ background: '#f8fafc', cursor: 'default' }}>
                  {page} из {notificationsData.totalPages}
                </span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= notificationsData.totalPages}
                  className={styles.paginationButton}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create Notification Tab */}
        {activeTab === 'create' && (
          <div>
            <div className={styles.jobCard}>
              <div className={styles.jobCardHeader}>
                <div className={styles.jobInfo}>
                  <h3 className={styles.jobTitle}>Создать новое уведомление</h3>
                  <p className={styles.jobCompany}>Отправка уведомлений пользователям системы</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111' }}>
                    Заголовок:
                  </label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    className={styles.filterSelect}
                    placeholder="Введите заголовок уведомления"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111' }}>
                    Сообщение:
                  </label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    className={styles.filterSelect}
                    placeholder="Введите текст уведомления"
                    rows={4}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div className={styles.filters}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111' }}>
                      Тип:
                    </label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                      className={styles.filterSelect}
                    >
                      <option value="SYSTEM">Системное</option>
                      <option value="MODERATION">Модерация</option>
                      <option value="ALERT">Оповещение</option>
                      <option value="INFO">Информационное</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111' }}>
                      Приоритет:
                    </label>
                    <select
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value }))}
                      className={styles.filterSelect}
                    >
                      <option value="LOW">Низкий</option>
                      <option value="MEDIUM">Средний</option>
                      <option value="HIGH">Высокий</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111' }}>
                      Запланировать на:
                    </label>
                    <input
                      type="datetime-local"
                      value={newNotification.scheduledAt}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledAt: e.target.value }))}
                      className={styles.filterSelect}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111' }}>
                    Целевые роли:
                  </label>
                  <div className={styles.jobSkills}>
                    {['ADMIN', 'MODERATOR', 'HR', 'CANDIDATE', 'UNIVERSITY'].map((role) => (
                      <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newNotification.targetRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewNotification(prev => ({ 
                                ...prev, 
                                targetRoles: [...prev.targetRoles, role] 
                              }));
                            } else {
                              setNewNotification(prev => ({ 
                                ...prev, 
                                targetRoles: prev.targetRoles.filter(r => r !== role) 
                              }));
                            }
                          }}
                        />
                        <span className={styles.skillTag}>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.jobActions} style={{ marginTop: '2rem' }}>
                <button
                  onClick={handleBroadcast}
                  disabled={broadcastLoading || !newNotification.title || !newNotification.message}
                  className={`${styles.actionButton} ${styles.actionButtonApprove}`}
                  style={{ padding: '0.75rem 2rem' }}
                >
                  {broadcastLoading ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  Отправить уведомление
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
