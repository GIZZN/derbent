'use client';

import React, { useState, useEffect } from 'react';
import { 
  UpdateStudentDto, 
  validateStudent,
  useUpdateStudentMutation,
  Student
} from '../../lib/api/studentsApi';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Award,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import styles from './CreateStudentForm.module.css';

interface EditStudentFormProps {
  student: Student;
  onSuccess?: (student: Student) => void;
  onCancel?: () => void;
  className?: string;
}

export default function EditStudentForm({ 
  student,
  onSuccess, 
  onCancel, 
  className = '' 
}: EditStudentFormProps) {
  const [formData, setFormData] = useState<UpdateStudentDto>({
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    studentId: student.studentId,
    yearOfStudy: student.yearOfStudy,
    major: student.major,
    gpa: student.gpa,
    phone: student.phone || ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateStudent, { isLoading }] = useUpdateStudentMutation();

  // Обновляем форму при изменении студента
  useEffect(() => {
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentId: student.studentId,
      yearOfStudy: student.yearOfStudy,
      major: student.major,
      gpa: student.gpa,
      phone: student.phone || ''
    });
  }, [student]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearOfStudy' || name === 'gpa' ? 
        (value === '' ? undefined : Number(value)) : 
        value
    }));

    // Очищаем ошибки при изменении
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Валидация данных (используем CreateStudentDto для валидации)
      const validationErrors = validateStudent({
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        studentId: formData.studentId || '',
        yearOfStudy: formData.yearOfStudy || 1,
        major: formData.major || '',
        gpa: formData.gpa,
        phone: formData.phone
      });
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // Обновление студента
      const updatedStudent = await updateStudent({ 
        id: student.id, 
        data: formData 
      }).unwrap();
      
      onSuccess?.(updatedStudent);
    } catch (error) {
      console.error('Ошибка обновления студента:', error);
      setErrors(['Произошла ошибка при обновлении студента. Попробуйте еще раз.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const formClasses = [
    styles.createStudentForm,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={formClasses}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Редактировать студента</h2>
        {onCancel && (
          <button 
            type="button" 
            onClick={handleCancel}
            className={styles.cancelButton}
            title="Закрыть форму"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {errors.length > 0 && (
        <div className={styles.errorBanner}>
          <AlertCircle size={20} />
          <div className={styles.errorList}>
            {errors.map((error, index) => (
              <div key={index} className={styles.errorItem}>
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Основная информация */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Основная информация</h3>
          
          <div className={styles.fieldsRow}>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldHeader}>
                <User size={20} />
                <label className={styles.fieldLabel}>Имя *</label>
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleInputChange}
                className={styles.fieldInput}
                placeholder="Введите имя"
                required
                maxLength={50}
              />
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.fieldHeader}>
                <User size={20} />
                <label className={styles.fieldLabel}>Фамилия *</label>
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
                className={styles.fieldInput}
                placeholder="Введите фамилию"
                required
                maxLength={50}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <Mail size={20} />
              <label className={styles.fieldLabel}>Email *</label>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className={styles.fieldInput}
              placeholder="student@university.edu"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <GraduationCap size={20} />
              <label className={styles.fieldLabel}>Номер студенческого билета *</label>
            </div>
            <input
              type="text"
              name="studentId"
              value={formData.studentId || ''}
              onChange={handleInputChange}
              className={styles.fieldInput}
              placeholder="2024001"
              required
            />
          </div>
        </div>

        {/* Академическая информация */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Академическая информация</h3>
          
          <div className={styles.fieldsRow}>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldHeader}>
                <BookOpen size={20} />
                <label className={styles.fieldLabel}>Курс *</label>
              </div>
              <select
                name="yearOfStudy"
                value={formData.yearOfStudy || 1}
                onChange={handleInputChange}
                className={styles.fieldSelect}
                required
              >
                <option value={1}>1-й курс</option>
                <option value={2}>2-й курс</option>
                <option value={3}>3-й курс</option>
                <option value={4}>4-й курс</option>
                <option value={5}>5-й курс</option>
                <option value={6}>6-й курс</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.fieldHeader}>
                <Award size={20} />
                <label className={styles.fieldLabel}>Средний балл</label>
              </div>
              <input
                type="number"
                name="gpa"
                value={formData.gpa || ''}
                onChange={handleInputChange}
                className={styles.fieldInput}
                placeholder="4.2"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <BookOpen size={20} />
              <label className={styles.fieldLabel}>Специальность *</label>
            </div>
            <input
              type="text"
              name="major"
              value={formData.major || ''}
              onChange={handleInputChange}
              className={styles.fieldInput}
              placeholder="Информатика"
              required
              maxLength={100}
            />
          </div>
        </div>

        {/* Контактная информация */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Контактная информация</h3>
          
          <div className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <Phone size={20} />
              <label className={styles.fieldLabel}>Телефон</label>
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className={styles.fieldInput}
              placeholder="+7-999-123-45-67"
              pattern="[\+]?[0-9\s\-\(\)]+"
              title="Введите корректный номер телефона"
            />
          </div>
        </div>

        {/* Кнопки действий */}
        <div className={styles.formActions}>
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelActionButton}
              disabled={isSubmitting}
            >
              Отмена
            </button>
          )}
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || isLoading}
          >
            <Save size={16} />
            {isSubmitting || isLoading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
}
