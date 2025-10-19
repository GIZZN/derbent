'use client';

import React, { useState } from 'react';
import { useCreateInternshipRequestMutation } from '@/lib/api/internshipRequestsApi';
import styles from './InternshipRequestForm.module.css';

interface InternshipRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InternshipRequestForm: React.FC<InternshipRequestFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [createInternshipRequest, { isLoading, error }] = useCreateInternshipRequestMutation();
  
  const [formData, setFormData] = useState({
    specialty: '',
    studentCount: 1,
    period: '',
    startDate: '',
    endDate: '',
    description: '',
    requirements: '',
    skills: [] as string[],
    location: '',
    isRemote: false,
  });

  const [currentSkill, setCurrentSkill] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'studentCount') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createInternshipRequest(formData).unwrap();
      onSuccess?.();
    } catch (err) {
      console.error('Failed to create internship request:', err);
    }
  };

  const isFormValid = () => {
    return (
      formData.specialty.trim() &&
      formData.period.trim() &&
      formData.startDate &&
      formData.endDate &&
      formData.description.trim() &&
      formData.requirements.trim() &&
      formData.location.trim() &&
      formData.skills.length > 0
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Подача заявки на стажировку</h2>
        <p className={styles.subtitle}>
          Заполните форму для создания заявки на стажировку. Заявка будет доступна компаниям.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Специальность */}
          <div className={styles.formGroup}>
            <label htmlFor="specialty" className={styles.label}>
              Специальность *
            </label>
            <input
              type="text"
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Например: Информатика, Программирование"
              required
            />
          </div>

          {/* Количество студентов */}
          <div className={styles.formGroup}>
            <label htmlFor="studentCount" className={styles.label}>
              Количество студентов *
            </label>
            <input
              type="number"
              id="studentCount"
              name="studentCount"
              value={formData.studentCount}
              onChange={handleInputChange}
              className={styles.input}
              min="1"
              max="100"
              required
            />
          </div>

          {/* Период стажировки */}
          <div className={styles.formGroup}>
            <label htmlFor="period" className={styles.label}>
              Период стажировки *
            </label>
            <input
              type="text"
              id="period"
              name="period"
              value={formData.period}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Например: 3 месяца, 6 месяцев"
              required
            />
          </div>

          {/* Дата начала */}
          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>
              Дата начала *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Дата окончания */}
          <div className={styles.formGroup}>
            <label htmlFor="endDate" className={styles.label}>
              Дата окончания *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Локация */}
          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.label}>
              Локация *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Например: Москва, Санкт-Петербург"
              required
            />
          </div>
        </div>

        {/* Удаленная работа */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isRemote"
              checked={formData.isRemote}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>Удаленная работа</span>
          </label>
        </div>

        {/* Описание */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Описание стажировки *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Подробно опишите, что будут изучать студенты во время стажировки"
            rows={4}
            required
          />
        </div>

        {/* Требования */}
        <div className={styles.formGroup}>
          <label htmlFor="requirements" className={styles.label}>
            Требования к студентам *
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Опишите требования к знаниям и навыкам студентов"
            rows={3}
            required
          />
        </div>

        {/* Навыки */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Навыки и технологии *
          </label>
          <div className={styles.skillsContainer}>
            <div className={styles.skillInput}>
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                className={styles.input}
                placeholder="Добавить навык"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className={styles.addSkillButton}
                disabled={!currentSkill.trim()}
              >
                Добавить
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className={styles.skillsList}>
                {formData.skills.map((skill, index) => (
                  <span key={index} className={styles.skillTag}>
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className={styles.removeSkillButton}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ошибки */}
        {error && (
          <div className={styles.errorMessage}>
            Ошибка при создании заявки. Попробуйте еще раз.
          </div>
        )}

        {/* Кнопки */}
        <div className={styles.buttonGroup}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Создание...' : 'Подать заявку'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InternshipRequestForm;
