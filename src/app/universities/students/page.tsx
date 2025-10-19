'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useStudentsManager } from '../../Components/StudentsHooks';
import { StudentCardList } from '../../Components/StudentCard';
import CreateStudentForm from '../../Components/CreateStudentForm';
import EditStudentForm from '../../Components/EditStudentForm';
import StudentImportForm from '../../Components/StudentImportForm';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  GraduationCap,
  BookOpen,
  Award,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  Settings
} from 'lucide-react';
import styles from './students-page.module.css';

export default function UniversityStudentsPage() {
  const { user, isAuthenticated } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  
  // Проверяем, что пользователь - университет
  const isUniversityUser = user?.role === 'UNIVERSITY';

  const {
    filteredStudents,
    searchTerm,
    setSearchTerm,
    yearFilter,
    setYearFilter,
    isLoading,
    error,
    stats,
    deleteStudent,
    refreshData
  } = useStudentsManager();

  // Если пользователь не авторизован или не университет
  if (!isAuthenticated || !isUniversityUser) {
    return (
      <div className={styles.accessDenied}>
        <div className={styles.accessContent}>
          <div className={styles.accessIcon}>
            <GraduationCap size={64} />
          </div>
          <h1 className={styles.accessTitle}>Доступ ограничен</h1>
          <p className={styles.accessText}>
            Эта страница доступна только для представителей университетов.
          </p>
          <p className={styles.accessSubtext}>
            Войдите в систему с учетной записью университета для управления студентами.
          </p>
          <Link href="/auth/login" className={styles.loginButton}>
            <GraduationCap size={20} />
            Войти в систему
          </Link>
        </div>
      </div>
    );
  }

  const handleDeleteStudent = async (student: { id: string; firstName: string; lastName: string }) => {
    try {
      await deleteStudent(student.id, `${student.firstName} ${student.lastName}`);
      refreshData();
    } catch (error) {
      console.error('Ошибка удаления студента:', error);
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
  };

  return (
    <div className={styles.studentsPage}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              <GraduationCap size={32} />
              Мои студенты
            </h1>
            <p className={styles.heroSubtitle}>
              Управляйте базой студентов, отслеживайте их успехи и анализируйте статистику
            </p>
          </div>
          <div className={styles.heroActions}>
            <button 
              onClick={() => setShowCreateForm(true)}
              className={styles.addButton}
            >
              <Plus size={20} />
              Добавить студента
            </button>
            <button 
              onClick={() => setShowImportForm(true)}
              className={styles.importButton}
            >
              <Users size={20} />
              Импорт списка
            </button>
            <button 
              onClick={refreshData}
              className={styles.refreshButton}
              disabled={isLoading}
            >
              <RefreshCw size={20} className={isLoading ? styles.spinning : ''} />
              Обновить
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users size={24} />
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statTitle}>Всего студентов</h3>
                <p className={styles.statNumber}>{stats.totalStudents}</p>
                <p className={styles.statLabel}>в базе данных</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Award size={24} />
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statTitle}>С навыками</h3>
                <p className={styles.statNumber}>{stats.studentsWithSkills}</p>
                <p className={styles.statLabel}>активных профилей</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <BookOpen size={24} />
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statTitle}>Без навыков</h3>
                <p className={styles.statNumber}>{stats.studentsWithoutSkills}</p>
                <p className={styles.statLabel}>требуют внимания</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по имени, email, номеру билета или специальности..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterButton}
          >
            <Filter size={20} />
            Фильтры
          </button>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Курс</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className={styles.filterSelect}
              >
                <option value="">Все курсы</option>
                <option value={1}>1-й курс</option>
                <option value={2}>2-й курс</option>
                <option value={3}>3-й курс</option>
                <option value={4}>4-й курс</option>
                <option value={5}>5-й курс</option>
                <option value={6}>6-й курс</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className={styles.errorBanner}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <Settings size={20} />
            </div>
            <div className={styles.errorText}>
              <h4>Ошибка загрузки данных</h4>
              <p>{error}</p>
            </div>
            <button onClick={refreshData} className={styles.retryButton}>
              <RefreshCw size={16} />
              Попробовать снова
            </button>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className={styles.studentsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Список студентов
            {filteredStudents.length > 0 && (
              <span className={styles.studentsCount}>({filteredStudents.length})</span>
            )}
          </h2>
        </div>

        <StudentCardList
          students={filteredStudents}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          loading={isLoading}
          emptyMessage={
            searchTerm || yearFilter
              ? 'Студенты не найдены по заданным критериям'
              : 'Добавьте первого студента в вашу базу данных'
          }
          className={styles.studentsList}
        />
      </div>

      {/* Create Student Modal */}
      {showCreateForm && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateForm(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <CreateStudentForm
              onSuccess={(student) => {
                console.log('Студент создан:', student);
                setShowCreateForm(false);
                refreshData();
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className={styles.modalOverlay} onClick={() => setEditingStudent(null)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <EditStudentForm
              student={editingStudent}
              onSuccess={(student) => {
                console.log('Студент обновлен:', student);
                setEditingStudent(null);
                refreshData();
              }}
              onCancel={() => setEditingStudent(null)}
            />
          </div>
        </div>
      )}

      {/* Import Students Modal */}
      {showImportForm && (
        <div className={styles.modalOverlay} onClick={() => setShowImportForm(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <StudentImportForm
              onSuccess={(importedCount) => {
                console.log(`Импортировано ${importedCount} студентов`);
                setShowImportForm(false);
                refreshData();
              }}
              onCancel={() => setShowImportForm(false)}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Link href="/universities" className={styles.backButton}>
          <GraduationCap size={20} />
          Панель университета
        </Link>
        
        <div className={styles.actionsGroup}>
          <button 
            onClick={() => setShowCreateForm(true)}
            className={styles.quickAddButton}
          >
            <Plus size={16} />
            Быстрое добавление
          </button>
          
          <button 
            onClick={() => setShowImportForm(true)}
            className={styles.quickImportButton}
          >
            <Users size={16} />
            Импорт списка
          </button>
          
          <button 
            onClick={refreshData}
            className={styles.quickRefreshButton}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
            Обновить данные
          </button>
        </div>
      </div>
    </div>
  );
}