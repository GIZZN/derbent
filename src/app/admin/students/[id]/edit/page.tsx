'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  useGetStudentQuery, 
  useUpdateStudentMutation,
  validateStudent,
  UpdateStudentDto,
  getStudentFullName
} from '../../../../../lib/api/studentsApi';
import { useAuth } from '../../../../../contexts/AuthContext';
import styles from './edit.module.css';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const studentId = params.id as string;

  // Проверяем роль пользователя
  const isUniversityUser = user?.role === 'UNIVERSITY';
  const isAdminUser = user?.role === 'ADMIN';
  const canEditStudents = isUniversityUser || isAdminUser;

  const { 
    data: student, 
    isLoading: studentLoading, 
    error: studentError 
  } = useGetStudentQuery(studentId, { skip: !canEditStudents });

  const [updateStudent, { isLoading: updateLoading }] = useUpdateStudentMutation();

  const [formData, setFormData] = useState<UpdateStudentDto>({
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

  // Заполняем форму данными студента при загрузке
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        studentId: student.studentId,
        yearOfStudy: student.yearOfStudy,
        major: student.major,
        gpa: student.gpa,
        phone: student.phone || '',
      });
    }
  }, [student]);

  const handleInputChange = (field: keyof UpdateStudentDto, value: string | number) => {
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
    
    // Валидация (используем функцию валидации для создания, так как поля те же)
    const validationErrors = validateStudent(formData as Parameters<typeof validateStudent>[0]);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setErrors([]);
      setSubmitError('');
      
      // Подготавливаем данные (убираем пустые необязательные поля)
      const updateData: UpdateStudentDto = {
        ...formData,
        gpa: formData.gpa || undefined,
        phone: formData.phone?.trim() || undefined,
      };

      await updateStudent({ id: studentId, data: updateData }).unwrap();
      
      // Перенаправляем на страницу студента
      router.push(`/admin/students/${studentId}`);
    } catch (error: unknown) {
      console.error('Ошибка обновления студента:', error);
      
      const apiError = error as { data?: { message?: string; details?: Array<{ message: string }> } };
      
      if (apiError?.data?.message) {
        setSubmitError(apiError.data.message);
      } else if (apiError?.data?.details) {
        const apiErrors = apiError.data.details.map((detail) => detail.message);
        setErrors(apiErrors);
      } else {
        setSubmitError('Произошла ошибка при обновлении студента. Попробуйте еще раз.');
      }
    }
  };

  if (!canEditStudents) {
    return (
      <div className={styles.accessDenied}>
        <h1>Доступ запрещен</h1>
        <p>У вас нет прав для редактирования студентов.</p>
        <Link href="/admin/students" className={styles.backButton}>
          Вернуться к списку студентов
        </Link>
      </div>
    );
  }

  if (studentLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка данных студента...</p>
      </div>
    );
  }

  if (studentError || !student) {
    return (
      <div className={styles.error}>
        <h1>Студент не найден</h1>
        <p>Запрашиваемый студент не существует или был удален.</p>
        <Link href="/admin/students" className={styles.backButton}>
          Вернуться к списку студентов
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.editStudentPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link href={`/admin/students/${studentId}`} className={styles.backLink}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к профилю
          </Link>
          <h1 className={styles.title}>Редактировать студента</h1>
          <p className={styles.subtitle}>
            Изменение информации о {getStudentFullName(student)}
          </p>
        </div>
      </div>

      {/* Form */}
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
            <Link href={`/admin/students/${studentId}`} className={styles.cancelButton}>
              Отмена
            </Link>
            <button 
              type="submit" 
              disabled={updateLoading}
              className={styles.submitButton}
            >
              {updateLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Сохранить изменения
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
              <h4>Студенческий билет</h4>
              <p>Номер {student.studentId} был присвоен при создании профиля.</p>
            </div>
            
            <div className={styles.infoItem}>
              <h4>Изменение email</h4>
              <p>При изменении email студент получит уведомление на новый адрес.</p>
            </div>
            
            <div className={styles.infoItem}>
              <h4>Навыки</h4>
              <p>Навыки студента можно изменить в разделе Навыки на странице профиля.</p>
            </div>
            
            <div className={styles.infoItem}>
              <h4>История изменений</h4>
              <p>Все изменения сохраняются с отметкой времени.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
