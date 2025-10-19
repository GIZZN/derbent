'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentStats } from '../Components/StudentsHooks';
import styles from './universities-dashboard.module.css';

export default function UniversitiesDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { stats, isLoading: statsLoading } = useStudentStats();

  // Проверяем, что пользователь - университет
  const isUniversityUser = user?.role === 'UNIVERSITY';

  // Если пользователь не авторизован или не университет
  if (!isAuthenticated || !isUniversityUser) {
    return (
      <div className={styles.accessDenied}>
        <div className={styles.accessContent}>
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1>Доступ запрещен</h1>
          <p>Эта страница доступна только для университетов.</p>
          <p>Пожалуйста, войдите в систему как представитель университета.</p>
          <Link href="/auth/login" className={styles.loginButton}>
            Войти в систему
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.universitiesDashboard}>
      {/* Welcome Header */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Добро пожаловать в панель университета!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Управляйте студентами, отслеживайте их успехи и анализируйте данные
          </p>
          <div className={styles.welcomeActions}>
            <Link href="/universities/students" className={styles.primaryButton}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить студента
            </Link>
            <Link href="/universities/students" className={styles.secondaryButton}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Управлять студентами
            </Link>
          </div>
        </div>
        <div className={styles.welcomeIcon}>
          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0118 8.875L6 14.344a12.093 12.093 0 01-6.16-3.422L12 14z" />
          </svg>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Статистика студентов</h2>
        
        {statsLoading ? (
          <div className={styles.statsLoading}>
            <div className={styles.spinner}></div>
            <p>Загрузка статистики...</p>
          </div>
        ) : (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className={styles.statContent}>
                <h3>Всего студентов</h3>
                <p className={styles.statNumber}>{stats?.totalStudents || 0}</p>
                <Link href="/universities/students" className={styles.statLink}>
                  Управлять студентами
                </Link>
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
                <p className={styles.statNumber}>{stats?.studentsWithSkills || 0}</p>
                <span className={styles.statPercentage}>
                  {stats?.totalStudents ? 
                    Math.round((stats.studentsWithSkills / stats.totalStudents) * 100) : 0}%
                </span>
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
                <p className={styles.statNumber}>{stats?.studentsWithoutSkills || 0}</p>
                <span className={styles.statPercentage}>
                  {stats?.totalStudents ? 
                    Math.round((stats.studentsWithoutSkills / stats.totalStudents) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Быстрые действия</h2>
        
        <div className={styles.actionsGrid}>
          <Link href="/universities/students" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0118 8.875L6 14.344a12.093 12.093 0 01-6.16-3.422L12 14z" />
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3>Управление студентами</h3>
              <p>Просматривайте, добавляйте и редактируйте профили студентов</p>
            </div>
            <div className={styles.actionArrow}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/admin/students/create" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3>Добавить студента</h3>
              <p>Создайте новый профиль студента в системе</p>
            </div>
            <div className={styles.actionArrow}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/admin/students" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3>Административная панель</h3>
              <p>Расширенные инструменты управления и аналитики</p>
            </div>
            <div className={styles.actionArrow}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/profile" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3>Профиль университета</h3>
              <p>Управляйте информацией о вашем университете</p>
            </div>
            <div className={styles.actionArrow}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className={styles.gettingStartedSection}>
        <h2 className={styles.sectionTitle}>Начало работы</h2>
        
        <div className={styles.gettingStartedContent}>
          <div className={styles.stepsList}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Настройте профиль университета</h3>
                <p>Заполните информацию о вашем университете для лучшего представления</p>
                <Link href="/profile" className={styles.stepLink}>Настроить профиль</Link>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Добавьте студентов</h3>
                <p>Импортируйте или добавьте студентов в систему для управления их профилями</p>
                <Link href="/universities/students" className={styles.stepLink}>Управлять студентами</Link>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Управляйте навыками</h3>
                <p>Добавляйте и отслеживайте навыки студентов для лучшего трудоустройства</p>
                <Link href="/universities/students" className={styles.stepLink}>Управлять навыками</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
