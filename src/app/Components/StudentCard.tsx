'use client';

import React from 'react';
import Link from 'next/link';
import { Student, getStudentFullName, getStudentYear, formatGPA } from '../../lib/api/studentsApi';
import styles from './StudentCard.module.css';

interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  showActions?: boolean;
  showSkills?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function StudentCard({
  student,
  onEdit,
  onDelete,
  showActions = true,
  showSkills = true,
  className = '',
  size = 'medium'
}: StudentCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(student);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить студента ${getStudentFullName(student)}?`
    );
    
    if (confirmed) {
      onDelete?.(student);
    }
  };

  const cardClasses = [
    styles.studentCard,
    styles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {/* Student Header */}
      <div className={styles.studentHeader}>
        <div className={styles.studentAvatar}>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L12 2L3 7V9C3 10.1 3.9 11 5 11V17C5 18.1 5.9 19 7 19H17C18.1 19 19 18.1 19 17V11C20.1 11 21 10.1 21 9Z"/>
          </svg>
        </div>
        
        <div className={styles.studentInfo}>
          <h3 className={styles.studentName}>
            {getStudentFullName(student)}
          </h3>
          <p className={styles.studentId}>№ {student.studentId}</p>
        </div>

        {showActions && (
          <div className={styles.quickActions}>
            <Link 
              href={`/universities/students/${student.id}`}
              className={styles.viewButton}
              title="Просмотреть профиль"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Student Details */}
      <div className={styles.studentDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Email:</span>
          <span className={styles.detailValue} title={student.email}>
            {student.email}
          </span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Курс:</span>
          <span className={styles.detailValue}>
            {getStudentYear(student.yearOfStudy)}
          </span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Специальность:</span>
          <span className={styles.detailValue} title={student.major}>
            {student.major}
          </span>
        </div>
        
        {student.gpa !== undefined && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Средний балл:</span>
            <span className={styles.detailValue}>
              {formatGPA(student.gpa)}
            </span>
          </div>
        )}
        
        {student.phone && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Телефон:</span>
            <span className={styles.detailValue}>
              {student.phone}
            </span>
          </div>
        )}
      </div>

      {showSkills && (
        <div className={styles.skillsSection}>
          <div className={styles.skillsBadge}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {student.skills.length} навыков
          </div>
          
          {student.skills.length > 0 && (
            <div className={styles.skillsList}>
              {student.skills.slice(0, 3).map((studentSkill) => (
                <div key={studentSkill.id} className={styles.skillTag}>
                  <span className={styles.skillName}>
                    {studentSkill.skill.name}
                  </span>
                  <span className={styles.skillLevel}>
                    {studentSkill.level}
                  </span>
                </div>
              ))}
              {student.skills.length > 3 && (
                <div className={styles.moreSkills}>
                  +{student.skills.length - 3} еще
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showActions && (onEdit || onDelete) && (
        <div className={styles.studentActions}>
          {onEdit && (
            <button 
              onClick={handleEdit}
              className={styles.editButton}
              title="Редактировать"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button 
              onClick={handleDelete}
              className={styles.deleteButton}
              title="Удалить"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Creation Date Footer */}
      <div className={styles.studentFooter}>
        <span className={styles.creationDate}>
          Создан {new Date(student.createdAt).toLocaleDateString('ru-RU')}
        </span>
      </div>
    </div>
  );
}

// Компонент списка студентов
interface StudentCardListProps {
  students: Student[];
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  cardSize?: 'small' | 'medium' | 'large';
}

export function StudentCardList({
  students,
  onEdit,
  onDelete,
  loading,
  emptyMessage = 'Студенты не найдены',
  className = '',
  cardSize = 'medium'
}: StudentCardListProps) {
  if (loading) {
    return (
      <div className={`${styles.studentCardList} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Загрузка студентов...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className={`${styles.studentCardList} ${className}`}>
        <div className={styles.emptyState}>
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0118 8.875L6 14.344a12.093 12.093 0 01-6.16-3.422L12 14z" />
          </svg>
          <h3>Студенты не найдены</h3>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.studentCardList} ${styles.grid} ${className}`}>
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          onEdit={onEdit}
          onDelete={onDelete}
          size={cardSize}
        />
      ))}
    </div>
  );
}
