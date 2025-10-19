'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  useGetStudentsQuery, 
  useDeleteStudentMutation, 
  useGetStudentStatsQuery,
  getStudentFullName,
  getStudentYear,
  formatGPA
} from '../../../lib/api/studentsApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotificationContext } from '../../Components/NotificationProvider';
import styles from './students.module.css';

interface CustomYearSelectProps {
  options: { value: number | '', label: string }[];
  value: number | '';
  onChange: (value: number | '') => void;
}

function CustomYearSelect({ options, value, onChange }: CustomYearSelectProps) {
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

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={styles.customYearSelect} ref={selectRef}>
      <button 
        className={styles.yearSelectButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{selectedOption?.label || 'Все курсы'}</span>
        <svg 
          className={`${styles.yearSelectIcon} ${isOpen ? styles.yearSelectIconOpen : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isOpen && (
        <div className={styles.yearSelectDropdown}>
          {options.map((option) => (
            <button
              key={option.value.toString()}
              className={`${styles.yearSelectOption} ${value === option.value ? styles.yearSelectOptionActive : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotificationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | ''>('');
  
  // Опции для выбора курса
  const yearOptions = [
    { value: '' as const, label: 'Все курсы' },
    { value: 1, label: '1-й курс' },
    { value: 2, label: '2-й курс' },
    { value: 3, label: '3-й курс' },
    { value: 4, label: '4-й курс' },
    { value: 5, label: '5-й курс' },
    { value: 6, label: '6-й курс' },
  ];
  
  // Проверяем роль пользователя - в админ панели ADMIN имеет полный доступ
  const isUniversityUser = user?.role === 'UNIVERSITY';
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'MODERATOR';
  const canManageStudents = isUniversityUser || isAdminUser;
  
  // Для администраторов игнорируем все проверки университета
  const isAdminMode = isAdminUser;

  const { 
    data: students = [], 
    isLoading: studentsLoading, 
    error: studentsError 
  } = useGetStudentsQuery(undefined, { skip: !canManageStudents });

  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useGetStudentStatsQuery(undefined, { skip: !canManageStudents });

  const [deleteStudent] = useDeleteStudentMutation();

  // Фильтрация студентов
  const filteredStudents = students.filter(student => {
    const fullName = getStudentFullName(student).toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = selectedYearFilter === '' || student.yearOfStudy === selectedYearFilter;

    return matchesSearch && matchesYear;
  });

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить студента ${studentName}?`)) {
      try {
        await deleteStudent(studentId).unwrap();
        showSuccess('Студент удален', 'Студент успешно удален из системы');
      } catch (error) {
        console.error('Ошибка при удалении студента:', error);
        showError('Ошибка удаления', 'Ошибка при удалении студента');
      }
    }
  };

  if (!canManageStudents) {
    return (
      <div className={styles.studentsPage}>
        <section className={styles.studentsSection}>
          <div className={styles.accessDenied}>
            <div className={styles.accessDeniedIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" fill="currentColor"/>
              </svg>
            </div>
            <h1>Доступ запрещен</h1>
            <p>У вас нет прав для просмотра студентов.</p>
            <p>Эта функция доступна только университетам и администраторам.</p>
            <Link href="/" className={styles.backToHomeButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              На главную
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (studentsLoading) {
    return (
      <div className={styles.studentsPage}>
        {/* Header */}
        <section className={styles.header}>
          <div className={styles.headerWrapper}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>
                Управление <span className={styles.highlight}>студентами</span>
              </h1>
              <p className={styles.subtitle}>
                {isAdminMode 
                  ? 'Административное управление всеми студентами платформы'
                  : 'Управляйте профилями студентов вашего университета'
                }
              </p>
            </div>
            <Link 
              href="/admin/students/create" 
              className={styles.createButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Добавить студента
            </Link>
          </div>
        </section>

        {/* Filters Section */}
        <section className={styles.filtersSection}>
          <div className={styles.filtersContainer}>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Поиск по имени, email, номеру билета или специальности..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                disabled
              />
            </div>

            <div className={styles.filters}>
              <div className={styles.customYearSelect}>
                <button 
                  className={`${styles.yearSelectButton} ${styles.disabled}`}
                  disabled
                  type="button"
                >
                  <span>Все курсы</span>
                  <svg 
                    className={styles.yearSelectIcon}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Students Section - Skeleton */}
        <section className={styles.studentsSection}>
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>Загрузка студентов...</p>
          </div>

          <div className={styles.studentsGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonHeader}>
                  <div className={styles.skeletonTitle}>
                    <div className={styles.skeletonAvatar}></div>
                    <div>
                      <div className={styles.skeletonName}></div>
                      <div className={styles.skeletonMeta}></div>
                    </div>
                  </div>
                  <div className={styles.skeletonBadge}></div>
                </div>
                
                <div className={styles.skeletonDescription}></div>
                <div className={styles.skeletonDescription}></div>
                <div className={styles.skeletonDescription}></div>
                
                <div className={styles.skeletonFooter}>
                  <div className={styles.skeletonDate}></div>
                  <div className={styles.skeletonActions}>
                    <div className={styles.skeletonButton}></div>
                    <div className={styles.skeletonActionBtn}></div>
                    <div className={styles.skeletonActionBtn}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (studentsError) {
    return (
      <div className={styles.studentsPage}>
        <section className={styles.studentsSection}>
          <div className={styles.error}>
            <div className={styles.errorIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
            </div>
            <h1>Ошибка загрузки студентов</h1>
            <p>Не удалось загрузить список студентов. Проверьте подключение к интернету и попробуйте снова.</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Обновить страницу
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.studentsPage}>
      {/* Header */}
      <section className={styles.header}>
        <div className={styles.headerWrapper}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              Управление <span className={styles.highlight}>студентами</span>
            </h1>
            <p className={styles.subtitle}>
              {isAdminMode 
                ? 'Административное управление всеми студентами платформы'
                : 'Управляйте профилями студентов вашего университета'
              }
            </p>
          </div>
          <Link 
            href="/admin/students/create" 
            className={styles.createButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Добавить студента
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      {stats && !statsLoading && (
        <section className={styles.statsSection}>
          <div className={styles.statsContainer}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Всего студентов</h3>
              <p className={styles.statNumber}>{stats.totalStudents}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>С навыками</h3>
              <p className={styles.statNumber}>{stats.studentsWithSkills}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Без навыков</h3>
              <p className={styles.statNumber}>{stats.studentsWithoutSkills}</p>
            </div>
          </div>
        </div>
        </div>
        </section>
      )}

      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по имени, email, номеру билета или специальности..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <CustomYearSelect
              options={yearOptions}
              value={selectedYearFilter}
              onChange={setSelectedYearFilter}
            />
          </div>
        </div>
      </section>

      {/* Students Section */}
      <section className={styles.studentsSection}>
        <div className={styles.resultsHeader}>
          <p className={styles.resultsCount}>
            Найдено {filteredStudents.length} {filteredStudents.length === 1 ? 'студент' : 'студентов'}
          </p>
        </div>

        {filteredStudents.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>Студенты не найдены</h3>
            <p>
              {searchTerm || selectedYearFilter
                ? 'Попробуйте изменить условия поиска'
                : 'Добавьте первого студента в вашу базу'}
            </p>
            {!searchTerm && !selectedYearFilter && (
              <Link href="/admin/students/create" className={styles.emptyStateButton}>
                <span className={styles.blackText}>Добавить</span> студента
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.studentsGrid}>
            {filteredStudents.map((student) => (
              <article key={student.id} className={styles.studentCard}>
                <div className={styles.studentHeader}>
                  <div className={styles.studentTitle}>
                    <div className={styles.studentAvatar}>
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L12 2L3 7V9C3 10.1 3.9 11 5 11V17C5 18.1 5.9 19 7 19H17C18.1 19 19 18.1 19 17V11C20.1 11 21 10.1 21 9Z"/>
                      </svg>
                    </div>
                    <div className={styles.studentInfo}>
                      <h3>{getStudentFullName(student)}</h3>
                      <div className={styles.studentMeta}>
                        <span className={styles.studentId}>№ {student.studentId}</span>
                        <span className={styles.separator}>•</span>
                        <span>{getStudentYear(student.yearOfStudy)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.skillsBadge}>
                    {student.skills.length} навыков
                  </div>
                </div>

                <p className={styles.studentDescription}>
                  {student.major} • {student.email}
                  {student.gpa && ` • Средний балл: ${formatGPA(student.gpa)}`}
                  {student.phone && ` • ${student.phone}`}
                </p>

                <div className={styles.studentActions}>
                  <div className={styles.studentInfo}>
                    <span className={styles.creationDate}>
                      {new Date(student.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  <div className={styles.actionButtons}>
                    <Link 
                      href={`/admin/students/${student.id}`}
                      className={styles.viewButton}
                    >
                      Подробнее
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                    <Link 
                      href={`/admin/students/${student.id}/edit`}
                      className={styles.editButton}
                      title="Редактировать"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button 
                      onClick={() => handleDeleteStudent(student.id, getStudentFullName(student))}
                      className={styles.deleteButton}
                      title="Удалить"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>  
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
