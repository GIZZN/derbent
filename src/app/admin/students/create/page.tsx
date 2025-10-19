'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateStudentMutation, validateStudent, CreateStudentDto } from '../../../../lib/api/studentsApi';
import { useAuth } from '../../../../contexts/AuthContext';
import styles from './create.module.css';

export default function CreateStudentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [createStudent, { isLoading }] = useCreateStudentMutation();

  // Проверяем роль пользователя
  const isUniversityUser = user?.role === 'UNIVERSITY';
  const isAdminUser = user?.role === 'ADMIN';
  const canCreateStudents = isUniversityUser || isAdminUser;

  const [formData, setFormData] = useState<CreateStudentDto>({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    yearOfStudy: 1,
    major: '',
    gpa: undefined,
    phone: '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string>('');

  const handleInputChange = (field: keyof CreateStudentDto, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибки при изменении формы
    if (errors.length > 0) {
      setErrors([]);
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    const validationErrors = validateStudent(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setErrors([]);
      setSubmitError('');
      
      // Подготавливаем данные (убираем пустые необязательные поля)
      const studentData: CreateStudentDto = {
        ...formData,
        gpa: formData.gpa || undefined,
        phone: formData.phone?.trim() || undefined,
      };

      await createStudent(studentData).unwrap();
      
      // Перенаправляем на страницу со списком студентов
      router.push('/admin/students');
    } catch (error: unknown) {
      console.error('Ошибка создания студента:', error);
      
      const apiError = error as { data?: { message?: string; details?: Array<{ message: string }> } };
      
      if (apiError?.data?.message) {
        setSubmitError(apiError.data.message);
      } else if (apiError?.data?.details) {
        const apiErrors = apiError.data.details.map((detail) => detail.message);
        setErrors(apiErrors);
      } else {
        setSubmitError('Произошла ошибка при создании студента. Попробуйте еще раз.');
      }
    }
  };

  if (!canCreateStudents) {
    return (
      <div className={styles.accessDenied}>
        <h1>Доступ запрещен</h1>
        <p>У вас нет прав для создания студентов.</p>
        <p>Эта функция доступна только университетам и администраторам.</p>
        <Link href="/admin/students" className={styles.backButton}>
          Вернуться к списку студентов
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.createStudentPage}>
      {/* Header */}
      <section className={styles.header}>
        <div className={styles.headerWrapper}>
          <Link href="/admin/students" className={styles.backLink}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к списку
          </Link>
          <h1 className={styles.title}>
            Добавить нового <span className={styles.highlight}>студента</span>
          </h1>
          <p className={styles.subtitle}>
            Заполните информацию о студенте для добавления в базу
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
          {/* Error Messages */}
          {(errors.length > 0 || submitError) && (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h3 className={styles.errorTitle}>Исправьте следующие ошибки:</h3>
                <ul className={styles.errorList}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {submitError && <li>{submitError}</li>}
                </ul>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Личная информация</h2>
            
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="firstName" className={styles.label}>
                  Имя <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={styles.input}
                  placeholder="Введите имя"
                  maxLength={50}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="lastName" className={styles.label}>
                  Фамилия <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={styles.input}
                  placeholder="Введите фамилию"
                  maxLength={50}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={styles.input}
                placeholder="student@university.edu"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="phone" className={styles.label}>
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={styles.input}
                placeholder="+7-999-123-45-67"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Академическая информация</h2>
            
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="studentId" className={styles.label}>
                  Номер студенческого билета <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  className={styles.input}
                  placeholder="2024001"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="yearOfStudy" className={styles.label}>
                  Курс <span className={styles.required}>*</span>
                </label>
                <select
                  id="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={(e) => handleInputChange('yearOfStudy', Number(e.target.value))}
                  className={styles.select}
                >
                  <option value={1}>1-й курс</option>
                  <option value={2}>2-й курс</option>
                  <option value={3}>3-й курс</option>
                  <option value={4}>4-й курс</option>
                  <option value={5}>5-й курс</option>
                  <option value={6}>6-й курс</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="major" className={styles.label}>
                Специальность <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="major"
                value={formData.major}
                onChange={(e) => handleInputChange('major', e.target.value)}
                className={styles.input}
                placeholder="Информатика и вычислительная техника"
                maxLength={100}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="gpa" className={styles.label}>
                Средний балл (GPA)
              </label>
              <input
                type="number"
                id="gpa"
                value={formData.gpa || ''}
                onChange={(e) => handleInputChange('gpa', e.target.value ? Number(e.target.value) : '')}
                className={styles.input}
                placeholder="4.2"
                min="0"
                max="5"
                step="0.1"
              />
              <p className={styles.fieldHint}>
                Необязательное поле. Введите средний балл от 0 до 5.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.actions}>
            <Link href="/admin/students" className={styles.cancelButton}>
              Отмена
            </Link>
            <button 
              type="submit" 
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Создание...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Создать студента
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.infoPanelHeader}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Информация</h3>
          </div>
          
          <div className={styles.infoPanelContent}>
            <div className={styles.infoItem}>
              <h4>Обязательные поля</h4>
              <p>Поля отмеченные звездочкой (*) обязательны для заполнения.</p>
            </div>
            
            <div className={styles.infoItem}>
              <h4>Номер студенческого билета</h4>
              <p>Должен быть уникальным в рамках вашего университета.</p>
            </div>
            
            <div className={styles.infoItem}>
              <h4>Email</h4>
              <p>Используется для входа в систему и уведомлений.</p>
            </div>
            
            <div className={styles.infoItem}>
              <h4>После создания</h4>
              <p>Вы сможете добавить навыки студенту в его профиле.</p>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
