'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  useGetStudentQuery, 
  useDeleteStudentMutation,
  useAddStudentSkillMutation,
  useRemoveStudentSkillMutation,
  getStudentFullName,
  getStudentYear,
  formatGPA,
  getSkillLevelText
} from '../../../../lib/api/studentsApi';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotificationContext } from '../../../Components/NotificationProvider';
import styles from './student.module.css';

export default function StudentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotificationContext();
  const studentId = params.id as string;

  // Проверяем роль пользователя
  const isUniversityUser = user?.role === 'UNIVERSITY';
  const isAdminUser = user?.role === 'ADMIN';
  const canViewStudents = isUniversityUser || isAdminUser;

  const { 
    data: student, 
    isLoading, 
    error 
  } = useGetStudentQuery(studentId, { skip: !canViewStudents });

  const [deleteStudent] = useDeleteStudentMutation();
  const [addStudentSkill] = useAddStudentSkillMutation();
  const [removeStudentSkill] = useRemoveStudentSkillMutation();

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ skillId: '', level: 1 });

  const handleDeleteStudent = async () => {
    if (!student) return;
    
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить студента ${getStudentFullName(student)}? Это действие нельзя отменить.`
    );
    
    if (confirmed) {
      try {
        await deleteStudent(studentId).unwrap();
        showSuccess('Студент удален', 'Студент успешно удален из системы');
        router.push('/admin/students');
      } catch (error) {
        console.error('Ошибка при удалении студента:', error);
        showError('Ошибка удаления', 'Ошибка при удалении студента');
      }
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.skillId) {
      showError('Выберите навык', 'Пожалуйста, выберите навык для добавления');
      return;
    }

    try {
      await addStudentSkill({
        studentId,
        data: {
          skillId: newSkill.skillId,
          level: newSkill.level
        }
      }).unwrap();
      
      setShowSkillModal(false);
      setNewSkill({ skillId: '', level: 1 });
      showSuccess('Навык добавлен', 'Навык успешно добавлен к студенту');
    } catch (error) {
      console.error('Ошибка при добавлении навыка:', error);
      showError('Ошибка добавления', 'Ошибка при добавлении навыка');
    }
  };

  const handleRemoveSkill = async (skillId: string, skillName: string) => {
    const confirmed = window.confirm(`Удалить навык "${skillName}"?`);
    
    if (confirmed) {
      try {
        await removeStudentSkill({ studentId, skillId }).unwrap();
        showSuccess('Навык удален', 'Навык успешно удален у студента');
      } catch (error) {
        console.error('Ошибка при удалении навыка:', error);
        showError('Ошибка удаления', 'Ошибка при удалении навыка');
      }
    }
  };

  if (!canViewStudents) {
    return (
      <div className={styles.accessDenied}>
        <h1>Доступ запрещен</h1>
        <p>У вас нет прав для просмотра студентов.</p>
        <Link href="/admin/students" className={styles.backButton}>
          Вернуться к списку студентов
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка профиля студента...</p>
      </div>
    );
  }

  if (error || !student) {
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
    <div className={styles.studentPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin/students" className={styles.backLink}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к списку
          </Link>
          
          <div className={styles.studentHeader}>
            <div className={styles.studentAvatar}>
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L12 2L3 7V9C3 10.1 3.9 11 5 11V17C5 18.1 5.9 19 7 19H17C18.1 19 19 18.1 19 17V11C20.1 11 21 10.1 21 9Z"/>
              </svg>
            </div>
            
            <div className={styles.studentInfo}>
              <h1 className={styles.studentName}>{getStudentFullName(student)}</h1>
              <p className={styles.studentMeta}>
                № {student.studentId} • {getStudentYear(student.yearOfStudy)} • {student.major}
              </p>
            </div>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <Link 
            href={`/admin/students/${student.id}/edit`}
            className={styles.editButton}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Редактировать
          </Link>
          
          <button 
            onClick={handleDeleteStudent}
            className={styles.deleteButton}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Удалить
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Student Information */}
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>Информация о студенте</h2>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{student.email}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Курс:</span>
              <span className={styles.infoValue}>{getStudentYear(student.yearOfStudy)}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Специальность:</span>
              <span className={styles.infoValue}>{student.major}</span>
            </div>
            
            {student.gpa && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Средний балл:</span>
                <span className={styles.infoValue}>{formatGPA(student.gpa)}</span>
              </div>
            )}
            
            {student.phone && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Телефон:</span>
                <span className={styles.infoValue}>{student.phone}</span>
              </div>
            )}
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Дата создания:</span>
              <span className={styles.infoValue}>
                {new Date(student.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
            
            {student.university && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Университет:</span>
                <span className={styles.infoValue}>{student.university.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className={styles.skillsCard}>
          <div className={styles.skillsHeader}>
            <h2 className={styles.cardTitle}>
              Навыки ({student.skills.length})
              <span className={styles.skillsCount}></span>
            </h2>
            <button 
              onClick={() => setShowSkillModal(true)}
              className={styles.addSkillButton}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить навык
            </button>
          </div>
          
          {student.skills.length === 0 ? (
            <div className={styles.emptySkills}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 7H7.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>У студента пока нет добавленных навыков</p>
              <button 
                onClick={() => setShowSkillModal(true)}
                className={styles.emptySkillsButton}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Добавить первый навык
              </button>
            </div>
          ) : (
            <div className={styles.skillsList}>
              {student.skills.map((studentSkill) => (
                <div key={studentSkill.id} className={styles.skillItem}>
                  <div className={styles.skillInfo}>
                    <div className={styles.skillName}>{studentSkill.skill.name}</div>
                    <div className={styles.skillCategory}>{studentSkill.skill.category}</div>
                  </div>
                  
                  <div className={styles.skillLevel}>
                    <span className={styles.skillLevelText}>
                      {getSkillLevelText(studentSkill.level)}
                    </span>
                    <div className={styles.skillLevelBar}>
                      <div 
                        className={styles.skillLevelFill}
                        style={{ width: `${(studentSkill.level / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRemoveSkill(studentSkill.skill.id, studentSkill.skill.name)}
                    className={styles.removeSkillButton}
                    title="Удалить навык"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSkillModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Добавить навык</h3>
              <button 
                onClick={() => setShowSkillModal(false)}
                className={styles.modalCloseButton}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Навык:</label>
                <select
                  value={newSkill.skillId}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, skillId: e.target.value }))}
                  className={styles.modalSelect}
                >
                  <option value="">Выберите навык</option>
                  {/* TODO: Загрузить список доступных навыков */}
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="react">React</option>
                  <option value="nodejs">Node.js</option>
                </select>
              </div>
              
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Уровень:</label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, level: Number(e.target.value) }))}
                  className={styles.modalSelect}
                >
                  <option value={1}>1 - Начальный</option>
                  <option value={2}>2 - Базовый</option>
                  <option value={3}>3 - Средний</option>
                  <option value={4}>4 - Продвинутый</option>
                  <option value={5}>5 - Экспертный</option>
                </select>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                onClick={() => setShowSkillModal(false)}
                className={styles.modalCancelButton}
              >
                Отмена
              </button>
              <button 
                onClick={handleAddSkill}
                className={styles.modalSubmitButton}
              >
                Добавить навык
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
