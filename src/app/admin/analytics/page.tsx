'use client';

import { useState } from 'react';
import {
  useGetAnalyticsOverviewQuery,
  useGetCompaniesAnalyticsQuery,
  useGetUniversitiesAnalyticsQuery,
  useGetSkillsAnalyticsQuery,
  useGetJobsAnalyticsQuery,
  useGetApplicationsAnalyticsQuery,
  useGetUsersAnalyticsQuery,
  useGetActivityAnalyticsQuery,
} from '../../../lib/api/analyticsApi';
import styles from './analytics.module.css';

// Все типы теперь импортируются из API файла

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // RTK Query хуки для всех аналитических данных
  const { data: overviewData, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useGetAnalyticsOverviewQuery();
  const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useGetCompaniesAnalyticsQuery();
  const { data: universitiesData, isLoading: universitiesLoading, error: universitiesError } = useGetUniversitiesAnalyticsQuery();
  const { data: skillsData, isLoading: skillsLoading, error: skillsError } = useGetSkillsAnalyticsQuery();
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useGetJobsAnalyticsQuery();
  const { data: applicationsData, isLoading: applicationsLoading, error: applicationsError } = useGetApplicationsAnalyticsQuery();
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetUsersAnalyticsQuery();
  const { data: activityData, isLoading: activityLoading, error: activityError } = useGetActivityAnalyticsQuery();

  // Общие состояния загрузки и ошибок
  const isLoading = overviewLoading;
  const error = overviewError;
  const refetch = refetchOverview;


  const tabs = [
    { id: 'overview', name: 'Обзор', icon: '📊' },
    { id: 'companies', name: 'Компании', icon: '🏢' },
    { id: 'universities', name: 'Университеты', icon: '🎓' },
    { id: 'skills', name: 'Навыки', icon: '💡' },
    { id: 'jobs', name: 'Вакансии', icon: '💼' },
    { id: 'applications', name: 'Отклики', icon: '📝' },
    { id: 'users', name: 'Пользователи', icon: '👥' },
    { id: 'activity', name: 'Активность', icon: '⚡' }
  ];

  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка аналитики...</p>
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
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h3>Ошибка загрузки данных</h3>
          <p>Не удалось загрузить данные аналитики. Попробуйте обновить страницу.</p>
        </div>
      </div>
    );
  }

  if (!overviewData && !isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h3>Нет данных</h3>
          <p>Данные аналитики пока недоступны.</p>
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
                <span className={styles.highlight}>Аналитика</span> и статистика
              </h1>
              <p className={styles.subtitle}>
                Подробная аналитика по всем аспектам работы платформы
              </p>
              {overviewData && (
                <div className={`${styles.statusIndicator} ${styles.statusSuccess}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Данные загружены из API
                </div>
              )}
              {!overviewData && !isLoading && (
                <div className={`${styles.statusIndicator} ${styles.statusWarning}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Ошибка загрузки данных
                </div>
              )}
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={() => refetch()}
                className={styles.refreshButton}
                disabled={isLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C13.3009 3 14.5329 3.26656 15.6571 3.74552" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 3V7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isLoading ? 'Обновление...' : 'Обновить'}
              </button>
              <div className={styles.headerIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {overviewData && (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(overviewData.overview.totalUsers)}</div>
                    <div className={styles.statLabel}>Пользователи</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(overviewData.overview.totalJobs)}</div>
                    <div className={styles.statLabel}>Вакансии</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(overviewData.overview.totalApplications)}</div>
                    <div className={styles.statLabel}>Отклики</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(overviewData.overview.totalCompanies)}</div>
                    <div className={styles.statLabel}>Компании</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(overviewData.overview.totalUniversities)}</div>
                    <div className={styles.statLabel}>Университеты</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{overviewData.overview.pendingModeration}</div>
                    <div className={styles.statLabel}>На модерации</div>
                  </div>
                </div>

                {/* Recent Activity */}
                {overviewData.recentActivity && overviewData.recentActivity.length > 0 && (
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.cardTitle}>Недавняя активность</h2>
                      <div className={styles.cardIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                    <table className={styles.table}>
                      <thead className={styles.tableHeader}>
                        <tr>
                          <th>Тип</th>
                          <th>Описание</th>
                          <th>Время</th>
                          <th>Пользователь</th>
                        </tr>
                      </thead>
                      <tbody className={styles.tableBody}>
                        {overviewData.recentActivity.map((activity) => (
                          <tr key={activity.id}>
                            <td>
                              <span className={`${styles.badge} ${styles.badgeActive}`}>
                                {activity.type}
                              </span>
                            </td>
                            <td>{activity.description}</td>
                            <td>{new Date(activity.timestamp).toLocaleString('ru-RU')}</td>
                            <td>{activity.userName || 'Неизвестно'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div>
            {companiesLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Загрузка данных о компаниях...</p>
              </div>
            ) : companiesError ? (
              <div className={styles.emptyState}>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить данные о компаниях.</p>
              </div>
            ) : companiesData && companiesData.length > 0 ? (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Статистика по компаниям</h2>
                  <div className={styles.cardIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 21H21V9L12 2L3 9V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th>Компания</th>
                      <th>Вакансии</th>
                      <th>Отклики</th>
                      <th>Среднее откликов на вакансию</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {companiesData.map((company, index) => (
                      <tr key={index}>
                        <td>{company.name}</td>
                        <td>{company.totalJobs}</td>
                        <td>{company.totalApplications}</td>
                        <td>{company.totalJobs > 0 ? (company.totalApplications / company.totalJobs).toFixed(1) : '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h3>Нет данных</h3>
                <p>Данные о компаниях пока недоступны.</p>
              </div>
            )}
          </div>
        )}

        {/* Universities Tab */}
        {activeTab === 'universities' && (
          <div>
            {universitiesLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Загрузка данных об университетах...</p>
              </div>
            ) : universitiesError ? (
              <div className={styles.emptyState}>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить данные об университетах.</p>
              </div>
            ) : universitiesData && universitiesData.length > 0 ? (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Статистика по университетам</h2>
                  <div className={styles.cardIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 14L6.16 10.36A12.07 12.07 0 003 9.67V16.67A12.07 12.07 0 006.16 20.33L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 14L17.84 10.36A12.07 12.07 0 0021 9.67V16.67A12.07 12.07 0 0017.84 20.33L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th>Университет</th>
                      <th>Адрес</th>
                      <th>Студенты</th>
                      <th>Образования</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {universitiesData.map((university, index) => (
                      <tr key={index}>
                        <td>{university.name}</td>
                        <td>{university.address}</td>
                        <td>{university.totalStudents}</td>
                        <td>{university.totalEducations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h3>Нет данных</h3>
                <p>Данные об университетах пока недоступны.</p>
              </div>
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div>
            {skillsLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Загрузка данных о навыках...</p>
              </div>
            ) : skillsError ? (
              <div className={styles.emptyState}>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить данные о навыках.</p>
              </div>
            ) : skillsData && skillsData.length > 0 ? (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Статистика по навыкам</h2>
                  <div className={styles.cardIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9.663 17H7.016C5.343 17 4 15.657 4 14V5.828A2 2 0 015.828 4H18.172A2 2 0 0120 5.828V14C20 15.657 18.657 17 16.984 17H14.337L12 20L9.663 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 7V13M9 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th>Навык</th>
                      <th>Категория</th>
                      <th>Спрос</th>
                      <th>Кандидаты</th>
                      <th>Студенты</th>
                      <th>Вакансии</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {skillsData.map((skill) => (
                      <tr key={skill.id}>
                        <td>{skill.name}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.badgeActive}`}>
                            {skill.category}
                          </span>
                        </td>
                        <td>{skill.demandScore}/10</td>
                        <td>{skill.totalCandidates}</td>
                        <td>{skill.totalStudents}</td>
                        <td>{skill.totalJobs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h3>Нет данных</h3>
                <p>Данные о навыках пока недоступны.</p>
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div>
            {jobsLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Загрузка данных о вакансиях...</p>
              </div>
            ) : jobsError ? (
              <div className={styles.emptyState}>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить данные о вакансиях.</p>
              </div>
            ) : jobsData ? (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(jobsData.totalJobs)}</div>
                    <div className={styles.statLabel}>Всего вакансий</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(jobsData.jobViews)}</div>
                    <div className={styles.statLabel}>Просмотров</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{jobsData.applicationsPerJob._avg.applicationsCount.toFixed(1)}</div>
                    <div className={styles.statLabel}>Откликов на вакансию</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatCurrency(jobsData.averageSalary._avg.salaryMin)}</div>
                    <div className={styles.statLabel}>Мин. зарплата</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatCurrency(jobsData.averageSalary._avg.salaryMax)}</div>
                    <div className={styles.statLabel}>Макс. зарплата</div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Вакансии по статусам</h2>
                    <div className={styles.cardIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th>Статус</th>
                        <th>Количество</th>
                        <th>Процент</th>
                      </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                      {jobsData.jobsByStatus.map((status, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`${styles.badge} ${styles.badgeActive}`}>
                              {status.status}
                            </span>
                          </td>
                          <td>{status._count}</td>
                          <td>{jobsData.totalJobs > 0 ? ((status._count / jobsData.totalJobs) * 100).toFixed(1) : '0'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>Нет данных</h3>
                <p>Данные о вакансиях пока недоступны.</p>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {applicationsLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Загрузка данных об откликах...</p>
              </div>
            ) : applicationsError ? (
              <div className={styles.emptyState}>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить данные об откликах.</p>
              </div>
            ) : applicationsData ? (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(applicationsData.totalApplications)}</div>
                    <div className={styles.statLabel}>Всего откликов</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{applicationsData.averageResponseTime} дня</div>
                    <div className={styles.statLabel}>Среднее время ответа</div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Отклики по статусам</h2>
                    <div className={styles.cardIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th>Статус</th>
                        <th>Количество</th>
                        <th>Процент</th>
                      </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                      {applicationsData.applicationsByStatus.map((status, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`${styles.badge} ${styles.badgePending}`}>
                              {status.status}
                            </span>
                          </td>
                          <td>{status._count}</td>
                          <td>{applicationsData.totalApplications > 0 ? ((status._count / applicationsData.totalApplications) * 100).toFixed(1) : '0'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>Нет данных</h3>
                <p>Данные об откликах пока недоступны.</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            {usersLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Загрузка данных о пользователях...</p>
              </div>
            ) : usersError ? (
              <div className={styles.emptyState}>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить данные о пользователях.</p>
              </div>
            ) : usersData ? (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(usersData.totalUsers)}</div>
                    <div className={styles.statLabel}>Всего пользователей</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(usersData.activeUsers)}</div>
                    <div className={styles.statLabel}>Активных</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(usersData.newUsers)}</div>
                    <div className={styles.statLabel}>Новых за месяц</div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Пользователи по ролям</h2>
                    <div className={styles.cardIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th>Роль</th>
                        <th>Количество</th>
                        <th>Процент</th>
                      </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                      {usersData.usersByRole.map((role, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`${styles.badge} ${styles.badgeApproved}`}>
                              {role.role}
                            </span>
                          </td>
                          <td>{role._count}</td>
                          <td>{usersData.totalUsers > 0 ? ((role._count / usersData.totalUsers) * 100).toFixed(1) : '0'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>Нет данных</h3>
                <p>Данные о пользователях пока недоступны.</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            {activityLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Загрузка данных об активности...</p>
              </div>
            ) : activityError ? (
              <div className={styles.emptyState}>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить данные об активности.</p>
              </div>
            ) : activityData ? (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{formatNumber(activityData.totalEvents)}</div>
                    <div className={styles.statLabel}>Всего событий</div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>События по типам</h2>
                    <div className={styles.cardIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th>Тип события</th>
                        <th>Количество</th>
                        <th>Процент</th>
                      </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                      {activityData.eventsByType.map((event, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`${styles.badge} ${styles.badgeActive}`}>
                              {event.eventType}
                            </span>
                          </td>
                          <td>{event._count}</td>
                          <td>{activityData.totalEvents > 0 ? ((event._count / activityData.totalEvents) * 100).toFixed(1) : '0'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>Нет данных</h3>
                <p>Данные об активности пока недоступны.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
