'use client';

import React, { useState } from 'react';
import { useCreateInternshipMutation } from '@/lib/api/internshipsApi';
import styles from './InternshipForm.module.css';

interface InternshipFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InternshipForm: React.FC<InternshipFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [createInternship, { isLoading, error }] = useCreateInternshipMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'RUB',
    location: '',
    isRemote: false,
    startDate: '',
    endDate: '',
    duration: '',
    maxParticipants: '',
    deadline: '',
    skills: [] as string[],
    tags: [] as string[],
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [currentTag, setCurrentTag] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const internshipData = {
        ...formData,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        duration: parseInt(formData.duration),
        maxParticipants: parseInt(formData.maxParticipants),
      };
      
      await createInternship(internshipData).unwrap();
      onSuccess?.();
    } catch (err) {
      console.error('Failed to create internship:', err);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.requirements.trim() &&
      formData.responsibilities.trim() &&
      formData.benefits.trim() &&
      formData.location.trim() &&
      formData.startDate &&
      formData.endDate &&
      formData.duration &&
      formData.maxParticipants &&
      formData.deadline &&
      formData.skills.length > 0
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Создание стажировки</h2>
        <p className={styles.subtitle}>
          Заполните форму для создания предложения стажировки
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Основная информация */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Основная информация</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Название стажировки *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Например: Стажировка Frontend разработчика"
                required
              />
            </div>

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
        </div>

        {/* Описание и требования */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Описание и требования</h3>
          
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
              placeholder="Подробно опишите, что будет изучать стажер"
              rows={4}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="requirements" className={styles.label}>
              Требования к кандидату *
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Опишите требования к знаниям и навыкам"
              rows={3}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="responsibilities" className={styles.label}>
              Обязанности стажера *
            </label>
            <textarea
              id="responsibilities"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Опишите основные задачи и обязанности"
              rows={3}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="benefits" className={styles.label}>
              Преимущества и условия *
            </label>
            <textarea
              id="benefits"
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Опишите что получит стажер от участия"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Финансовые условия */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Финансовые условия</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="salaryMin" className={styles.label}>
                Минимальная зарплата
              </label>
              <input
                type="number"
                id="salaryMin"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="30000"
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="salaryMax" className={styles.label}>
                Максимальная зарплата
              </label>
              <input
                type="number"
                id="salaryMax"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="50000"
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="currency" className={styles.label}>
                Валюта
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Временные рамки */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Временные рамки</h3>
          
          <div className={styles.formGrid}>
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

            <div className={styles.formGroup}>
              <label htmlFor="duration" className={styles.label}>
                Продолжительность (дни) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="90"
                min="1"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="deadline" className={styles.label}>
                Дедлайн подачи заявок *
              </label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxParticipants" className={styles.label}>
              Максимальное количество участников *
            </label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="5"
              min="1"
              max="100"
              required
            />
          </div>
        </div>

        {/* Навыки */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Навыки и технологии</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Навыки *
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
                  className={styles.addButton}
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
                        className={styles.removeButton}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Теги */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Теги</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Теги для поиска
            </label>
            <div className={styles.skillsContainer}>
              <div className={styles.skillInput}>
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  className={styles.input}
                  placeholder="Добавить тег"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={styles.addButton}
                  disabled={!currentTag.trim()}
                >
                  Добавить
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className={styles.skillsList}>
                  {formData.tags.map((tag, index) => (
                    <span key={index} className={styles.tagTag}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className={styles.removeButton}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ошибки */}
        {error && (
          <div className={styles.errorMessage}>
            Ошибка при создании стажировки. Попробуйте еще раз.
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
            {isLoading ? 'Создание...' : 'Создать стажировку'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InternshipForm;
