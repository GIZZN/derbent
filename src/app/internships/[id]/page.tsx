'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useGetInternshipByIdQuery } from '@/lib/api/internshipsApi';
import { useCreateInternshipRequestMutation } from '@/lib/api/internshipRequestsApi';
import styles from './internship-details.module.css';

interface InternshipDetailsPageProps {
  params: Promise<{
  id: string;
  }>;
}

const InternshipDetailsPage: React.FC<InternshipDetailsPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const { data: internship, isLoading, error } = useGetInternshipByIdQuery(resolvedParams.id);
  const [createInternshipRequest] = useCreateInternshipRequestMutation();
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    specialty: '',
    studentCount: '',
    period: '',
    startDate: '',
    endDate: '',
    description: '',
    requirements: '',
    skills: [] as string[],
    location: '',
    isRemote: false
  });
  const [newSkill, setNewSkill] = useState('');

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Дата не указана';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Ошибка даты';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleApply = async () => {
    // Валидация обязательных полей
    if (!applicationData.specialty.trim()) {
      alert('Пожалуйста, укажите специальность');
      return;
    }
    if (!applicationData.studentCount.trim()) {
      alert('Пожалуйста, укажите количество студентов');
      return;
    }
    if (!applicationData.period.trim()) {
      alert('Пожалуйста, укажите период стажировки');
      return;
    }
    if (!applicationData.startDate) {
      alert('Пожалуйста, укажите дату начала');
      return;
    }
    if (!applicationData.endDate) {
      alert('Пожалуйста, укажите дату окончания');
      return;
    }
    if (!applicationData.description.trim()) {
      alert('Пожалуйста, укажите описание');
      return;
    }

    setIsApplying(true);
    try {
      await createInternshipRequest({
        specialty: applicationData.specialty,
        studentCount: parseInt(applicationData.studentCount),
        period: applicationData.period,
        startDate: new Date(applicationData.startDate).toISOString(),
        endDate: new Date(applicationData.endDate).toISOString(),
        description: applicationData.description,
        requirements: applicationData.requirements,
        skills: applicationData.skills,
        location: applicationData.location,
        isRemote: applicationData.isRemote
      }).unwrap();
      
      setShowApplicationForm(false);
      setApplicationData({
        specialty: '',
        studentCount: '',
        period: '',
        startDate: '',
        endDate: '',
        description: '',
        requirements: '',
        skills: [],
        location: '',
        isRemote: false
      });
      // Заявка успешно отправлена
    } catch (error) {
      console.error('Failed to apply to internship:', error);
      alert('Ошибка при отправке заявки. Попробуйте еще раз.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !applicationData.skills.includes(newSkill.trim())) {
      setApplicationData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setApplicationData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка стажировки...</p>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Стажировка не найдена</h2>
          <p>Возможно, стажировка была удалена или не существует.</p>
          <Link href="/companies" className={styles.backButton}>
            Вернуться к каталогу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Хлебные крошки */}
      <nav className={styles.breadcrumbs}>
        <Link href="/companies" className={styles.breadcrumbLink}>
          Стажировки
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{internship.title}</span>
      </nav>

      <div className={styles.content}>
        {/* Основная информация */}
      <div className={styles.mainContent}>
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <h1 className={styles.title}>{internship.title}</h1>
              <div className={styles.statusBadge}>
                <span 
                  className={styles.status}
                  style={{ 
                    backgroundColor: internship.status === 'ACTIVE' ? '#10b981' : '#6b7280' 
                  }}
                >
                  {internship.status === 'ACTIVE' ? 'Активна' : 'Неактивна'}
              </span>
            </div>
          </div>

            <div className={styles.companyInfo}>
              <h2 className={styles.companyName}>{internship.company?.name || 'Компания не указана'}</h2>
              <div className={styles.location}>
                📍 {internship.location} {internship.isRemote && '• Удаленно'}
              </div>
            </div>
            
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Период:</span>
                <span className={styles.metaValue}>{internship.duration} дней</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Мест:</span>
                <span className={styles.metaValue}>{internship.maxParticipants}</span>
                </div>
              </div>
          </header>

          {/* Описание */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Описание</h3>
            <p className={styles.description}>{internship.description}</p>
          </section>

          {/* Требования */}
          {internship.requirements && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Требования</h3>
              <p className={styles.requirements}>{internship.requirements}</p>
            </section>
          )}

          {/* Обязанности */}
          {internship.responsibilities && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Обязанности</h3>
              <p className={styles.responsibilities}>{internship.responsibilities}</p>
            </section>
          )}

          {/* Преимущества */}
          {internship.benefits && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Преимущества</h3>
              <p className={styles.benefits}>{internship.benefits}</p>
            </section>
          )}

          {/* Навыки */}
          {internship.skills && Array.isArray(internship.skills) && internship.skills.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Требуемые навыки</h3>
              <div className={styles.skillsList}>
                {internship.skills.map((skill, index) => (
                  <span key={index} className={styles.skillTag}>
                    {skill}
                </span>
                ))}
          </div>
            </section>
          )}

          {/* Теги */}
          {internship.tags && Array.isArray(internship.tags) && internship.tags.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Теги</h3>
              <div className={styles.tagsList}>
                {internship.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
            </section>
          )}

          {/* Даты */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Важные даты</h3>
            <div className={styles.datesList}>
              <div className={styles.dateItem}>
                <span className={styles.dateLabel}>Начало стажировки:</span>
                <span className={styles.dateValue}>{formatDate(internship.startDate)}</span>
              </div>
              <div className={styles.dateItem}>
                <span className={styles.dateLabel}>Окончание:</span>
                <span className={styles.dateValue}>{formatDate(internship.endDate)}</span>
              </div>
              {internship.deadline && (
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Дедлайн подачи заявок:</span>
                  <span className={styles.dateValue}>{formatDate(internship.deadline)}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Боковая панель */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Информация о стажировке</h3>
            
            {/* Зарплата */}
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarLabel}>Зарплата:</span>
              <span className={styles.sidebarValue}>
                {internship.salaryMin && internship.salaryMax && internship.currency
                  ? `${formatCurrency(internship.salaryMin, internship.currency)} - ${formatCurrency(internship.salaryMax, internship.currency)}`
                  : internship.salaryMin && internship.currency
                  ? `От ${formatCurrency(internship.salaryMin, internship.currency)}`
                  : 'Не указана'
                }
              </span>
            </div>

            {/* Тип */}
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarLabel}>Тип:</span>
              <span className={styles.sidebarValue}>
                {internship.salaryMin ? 'Оплачиваемая' : 'Неоплачиваемая'}
              </span>
            </div>

            {/* Локация */}
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarLabel}>Локация:</span>
              <span className={styles.sidebarValue}>
                {internship.location} {internship.isRemote && '(Удаленно)'}
              </span>
            </div>

            {/* Период */}
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarLabel}>Период:</span>
              <span className={styles.sidebarValue}>{internship.duration} дней</span>
            </div>

            {/* Места */}
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarLabel}>Мест:</span>
              <span className={styles.sidebarValue}>{internship.maxParticipants}</span>
            </div>

            {/* Статистика */}
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarLabel}>Заявок:</span>
              <span className={styles.sidebarValue}>{internship.applicationsCount}</span>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className={styles.actionCard}>
            {internship.hasApplied ? (
              <div className={styles.appliedStatusCard}>
                <div className={styles.statusHeader}>
                  <h4 className={styles.statusTitle}>Статус заявки</h4>
                  <span className={`${styles.statusBadge} ${styles[internship.applicationStatus?.toLowerCase() || 'pending']}`}>
                    {internship.applicationStatus === 'PENDING' && 'На рассмотрении'}
                    {internship.applicationStatus === 'ACCEPTED' && 'Принята'}
                    {internship.applicationStatus === 'REJECTED' && 'Отклонена'}
                  </span>
                </div>
                <div className={styles.statusDetails}>
                  <p className={styles.statusDate}>
                    Подана: {internship.appliedAt && formatDate(internship.appliedAt)}
                  </p>
                  {internship.applicationCoverLetter && (
                    <div className={styles.coverLetterPreview}>
                      <h5>Ваше мотивационное письмо:</h5>
                      <p>{internship.applicationCoverLetter}</p>
                    </div>
                  )}
          </div>
        </div>
            ) : !showApplicationForm ? (
              <button 
                className={styles.applyButton}
                onClick={() => setShowApplicationForm(true)}
                disabled={internship.status !== 'ACTIVE'}
              >
                Подать заявку
              </button>
            ) : (
              <div className={styles.applicationForm}>
                <h4 className={styles.formTitle}>Заявка на стажировку</h4>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Специальность *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Например: Информационные технологии"
                      value={applicationData.specialty}
                      onChange={(e) => handleInputChange('specialty', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Количество студентов *</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder="Например: 15"
                      value={applicationData.studentCount}
                      onChange={(e) => handleInputChange('studentCount', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Период стажировки *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Например: 3 месяца"
                      value={applicationData.period}
                      onChange={(e) => handleInputChange('period', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Дата начала *</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={applicationData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Дата окончания *</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={applicationData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Локация</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Например: Москва"
                      value={applicationData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
          </div>
        </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Описание *</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Опишите детали стажировки..."
                    value={applicationData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Требования</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Укажите требования к студентам..."
                    value={applicationData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Навыки</label>
                  <div className={styles.skillsInput}>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Добавить навык..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button
                      type="button"
                      className={styles.addSkillButton}
                      onClick={addSkill}
                    >
                      Добавить
            </button>
          </div>
                  {applicationData.skills.length > 0 && (
                    <div className={styles.skillsList}>
                      {applicationData.skills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                          <button
                            type="button"
                            className={styles.removeSkillButton}
                            onClick={() => removeSkill(skill)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
              </div>
            )}
          </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={applicationData.isRemote}
                      onChange={(e) => handleInputChange('isRemote', e.target.checked)}
                    />
                    Удаленная стажировка
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button 
                    className={styles.submitButton}
                    onClick={handleApply}
                    disabled={isApplying}
                  >
                    {isApplying ? 'Отправка...' : 'Отправить заявку'}
                  </button>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowApplicationForm(false);
                      setApplicationData({
                        specialty: '',
                        studentCount: '',
                        period: '',
                        startDate: '',
                        endDate: '',
                        description: '',
                        requirements: '',
                        skills: [],
                        location: '',
                        isRemote: false
                      });
                    }}
                    disabled={isApplying}
                  >
                    Отмена
                  </button>
            </div>
          </div>
            )}
          </div>

          {/* Информация о компании */}
          {internship.company && (
            <div className={styles.companyCard}>
              <h3 className={styles.companyCardTitle}>О компании</h3>
              <div className={styles.companyInfo}>
                <h4 className={styles.companyName}>{internship.company.name}</h4>
                {internship.company.description && (
                  <p className={styles.companyDescription}>{internship.company.description}</p>
                )}
        </div>
          </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default InternshipDetailsPage;