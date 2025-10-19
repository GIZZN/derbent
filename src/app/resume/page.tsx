'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, Search, Filter, ChevronLeft, ChevronRight, Star, Globe, Lock, Eye, Copy, EyeOff, Brain } from 'lucide-react';
import { 
  useCreateResumeMutation, 
  useGetResumesQuery, 
  useDeleteResumeMutation, 
  useUpdateResumeMutation,
  useSetDefaultResumeMutation,
  useDuplicateResumeMutation,
  useGetResumeByIdQuery
} from '../../lib/api/resumesApi';
import { Resume, CreateResumeDto, UpdateResumeDto, GetResumesQuery } from '../../lib/api/resumesApi';
import AuthGuard from '../Components/AuthGuard';
import { useNotificationContext } from '../Components/NotificationProvider';
import { ConfirmationDialog } from '../Components/ConfirmationDialog';
import ResumeViewer from './components/ResumeViewer';
import ResumeEditor from './components/ResumeEditor';
import ResumeAnalysis from '../Components/ResumeAnalysis';

// Импорт стилей
import styles from './styles/page.module.css';

export default function ResumePage() {
  // Состояние для создания нового резюме
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Состояние для поиска и фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    isDefault: undefined as boolean | undefined,
    isPublic: undefined as boolean | undefined,
    sortBy: 'createdAt' as 'createdAt' | 'updatedAt' | 'title',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  
  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Состояние для модального окна
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    resumeId: string;
    resumeTitle: string;
  }>({
    isOpen: false,
    resumeId: '',
    resumeTitle: ''
  });
  
  // Состояние для редактирования
  const [editingResume, setEditingResume] = useState<{
    id: string;
    title: string;
    summary: string;
    objective: string;
  } | null>(null);

  // Состояние для детального просмотра и редактирования
  const [viewingResume, setViewingResume] = useState<string | null>(null);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  
  // Состояние для AI анализа
  const [analysisDialog, setAnalysisDialog] = useState<{
    isOpen: boolean;
    resume: Resume | null;
  }>({
    isOpen: false,
    resume: null
  });
  const [duplicateDialog, setDuplicateDialog] = useState<{
    isOpen: boolean;
    resumeId: string;
    resumeTitle: string;
    newTitle: string;
  }>({
    isOpen: false,
    resumeId: '',
    resumeTitle: '',
    newTitle: ''
  });

  // API хуки
  const [createResume, { isLoading: isCreatingResume }] = useCreateResumeMutation();
  const [updateResume] = useUpdateResumeMutation();
  const [deleteResume] = useDeleteResumeMutation();
  const [setDefaultResume] = useSetDefaultResumeMutation();
  const [duplicateResume] = useDuplicateResumeMutation();
  
  // Получение детальной информации о резюме
  const { data: resumeDetail, isLoading: isLoadingResumeDetail } = useGetResumeByIdQuery(
    viewingResume || editingResumeId || '', 
    { skip: !viewingResume && !editingResumeId }
  );
  
  // Параметры запроса
  const queryParams: GetResumesQuery = {
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    isDefault: filters.isDefault,
    isPublic: filters.isPublic,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  };
  
  const { data: resumesResponse, isLoading: isLoadingResumes, refetch } = useGetResumesQuery(queryParams);
  
  // Уведомления
  const { showSuccess, showError, showWarning } = useNotificationContext();
  
  // Обработка данных резюме
  const resumes = resumesResponse?.resumes || [];
  const totalResumes = resumesResponse?.total || 0;
  const totalPages = Math.ceil(totalResumes / pageSize);
  
  // Логирование для отладки (только в development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Ответ API резюме:', resumesResponse);
    console.log('Список резюме:', resumes);
  }
  
  // Обработка поиска с дебаунсом
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Сброс на первую страницу при поиске
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  // Функции для управления фильтрами
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Сброс на первую страницу при изменении фильтров
  };
  
  const clearFilters = () => {
    setFilters({
      isDefault: undefined,
      isPublic: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchQuery('');
    setCurrentPage(1);
  };
  
  // Функции для пагинации
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Создание нового резюме
  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) {
      showWarning('Внимание', 'Пожалуйста, введите название резюме');
      return;
    }

    try {
      const resumeData: CreateResumeDto = {
        title: newResumeTitle.trim()
      };

      console.log('Отправляем данные для создания резюме:', resumeData);
      const result = await createResume(resumeData).unwrap();
      console.log('Резюме успешно создано:', result);
      
      setNewResumeTitle('');
      setIsCreating(false);
      showSuccess('Успех!', 'Резюме успешно создано');
    } catch (error: any) {
      console.error('Ошибка при создании резюме:', error);
      
      // Более детальная обработка ошибок
      let errorMessage = 'Ошибка при создании резюме';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status) {
        switch (error.status) {
          case 400:
            errorMessage = 'Некорректные данные для создания резюме';
            break;
          case 401:
            errorMessage = 'Необходимо войти в систему';
            break;
          case 403:
            errorMessage = 'Недостаточно прав для создания резюме';
            break;
          case 409:
            errorMessage = 'Резюме с таким названием уже существует';
            break;
          case 500:
            errorMessage = 'Внутренняя ошибка сервера';
            break;
          default:
            errorMessage = `Ошибка сервера (${error.status})`;
        }
      }
      
      showError('Ошибка', errorMessage);
    }
  };

  // Открытие диалога удаления
  const handleDeleteClick = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      resumeId: id,
      resumeTitle: title
    });
  };
  
  // Подтверждение удаления
  const handleConfirmDelete = async () => {
    try {
      await deleteResume(deleteDialog.resumeId).unwrap();
      showSuccess('Успех!', 'Резюме удалено');
      setDeleteDialog({ isOpen: false, resumeId: '', resumeTitle: '' });
    } catch (error: any) {
      console.error('Ошибка при удалении резюме:', error);
      
      let errorMessage = 'Ошибка при удалении резюме';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status) {
        switch (error.status) {
          case 401:
            errorMessage = 'Необходимо войти в систему';
            break;
          case 403:
            errorMessage = 'Недостаточно прав для удаления резюме';
            break;
          case 404:
            errorMessage = 'Резюме не найдено';
            break;
          case 500:
            errorMessage = 'Внутренняя ошибка сервера';
            break;
          default:
            errorMessage = `Ошибка сервера (${error.status})`;
        }
      }
      
      showError('Ошибка', errorMessage);
    }
  };
  
  // Отмена удаления
  const handleCancelDelete = () => {
    setDeleteDialog({ isOpen: false, resumeId: '', resumeTitle: '' });
  };
  
  // Начало редактирования
  const handleEditClick = (resume: Resume) => {
    setEditingResume({
      id: resume.id,
      title: resume.title,
      summary: resume.summary || '',
      objective: resume.objective || ''
    });
  };
  
  // Сохранение изменений
  const handleSaveEdit = async () => {
    if (!editingResume || !editingResume.title.trim()) {
      showWarning('Внимание', 'Пожалуйста, введите название резюме');
      return;
    }

    try {
      const updateData: UpdateResumeDto = {
        title: editingResume.title.trim(),
        summary: editingResume.summary.trim() || undefined,
        objective: editingResume.objective.trim() || undefined
      };

      await updateResume({ id: editingResume.id, data: updateData }).unwrap();
      showSuccess('Успех!', 'Резюме обновлено');
      setEditingResume(null);
    } catch (error: any) {
      console.error('Ошибка при обновлении резюме:', error);
      
      let errorMessage = 'Ошибка при обновлении резюме';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status) {
        switch (error.status) {
          case 400:
            errorMessage = 'Некорректные данные для обновления резюме';
            break;
          case 401:
            errorMessage = 'Необходимо войти в систему';
            break;
          case 403:
            errorMessage = 'Недостаточно прав для обновления резюме';
            break;
          case 404:
            errorMessage = 'Резюме не найдено';
            break;
          case 500:
            errorMessage = 'Внутренняя ошибка сервера';
            break;
          default:
            errorMessage = `Ошибка сервера (${error.status})`;
        }
      }
      
      showError('Ошибка', errorMessage);
    }
  };
  
  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingResume(null);
  };

  // Просмотр резюме
  const handleViewResume = (id: string) => {
    setViewingResume(id);
    setEditingResumeId(null);
  };

  // Редактирование резюме
  const handleEditResume = (id: string) => {
    setEditingResumeId(id);
    setViewingResume(null);
  };

  // Закрытие просмотра/редактирования
  const handleCloseDetail = () => {
    setViewingResume(null);
    setEditingResumeId(null);
  };

  // Сохранение изменений резюме
  const handleSaveResume = async (data: UpdateResumeDto) => {
    if (!editingResumeId) return;
    
    try {
      await updateResume({ id: editingResumeId, data }).unwrap();
      showSuccess('Успех!', 'Резюме обновлено');
      setEditingResumeId(null);
    } catch (error: any) {
      console.error('Ошибка при обновлении резюме:', error);
      
      let errorMessage = 'Ошибка при обновлении резюме';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status) {
        switch (error.status) {
          case 400:
            errorMessage = 'Некорректные данные для обновления резюме';
            break;
          case 401:
            errorMessage = 'Необходимо войти в систему';
            break;
          case 403:
            errorMessage = 'Недостаточно прав для обновления резюме';
            break;
          case 404:
            errorMessage = 'Резюме не найдено';
            break;
          case 500:
            errorMessage = 'Внутренняя ошибка сервера';
            break;
          default:
            errorMessage = `Ошибка сервера (${error.status})`;
        }
      }
      
      showError('Ошибка', errorMessage);
    }
  };

  // Установка основного резюме
  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultResume(id).unwrap();
      showSuccess('Успех!', 'Резюме установлено как основное');
    } catch (error: any) {
      console.error('Ошибка при установке основного резюме:', error);
      
      let errorMessage = 'Ошибка при установке основного резюме';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showError('Ошибка', errorMessage);
    }
  };

  // Переключение публичности
  const handleTogglePublic = async (id: string, currentPublic: boolean) => {
    try {
      await updateResume({ 
        id, 
        data: { isPublic: !currentPublic } 
      }).unwrap();
      showSuccess('Успех!', `Резюме ${!currentPublic ? 'сделано публичным' : 'сделано приватным'}`);
    } catch (error: any) {
      console.error('Ошибка при изменении публичности резюме:', error);
      
      let errorMessage = 'Ошибка при изменении публичности резюме';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showError('Ошибка', errorMessage);
    }
  };

  // Открытие диалога дублирования
  const handleDuplicateClick = (id: string, title: string) => {
    setDuplicateDialog({
      isOpen: true,
      resumeId: id,
      resumeTitle: title,
      newTitle: `${title} (копия)`
    });
  };

  // Подтверждение дублирования
  const handleConfirmDuplicate = async () => {
    try {
      await duplicateResume({ 
        id: duplicateDialog.resumeId, 
        title: duplicateDialog.newTitle 
      }).unwrap();
      showSuccess('Успех!', 'Резюме дублировано');
      setDuplicateDialog({ isOpen: false, resumeId: '', resumeTitle: '', newTitle: '' });
    } catch (error: any) {
      console.error('Ошибка при дублировании резюме:', error);
      
      let errorMessage = 'Ошибка при дублировании резюме';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showError('Ошибка', errorMessage);
    }
  };

  // Отмена дублирования
  const handleCancelDuplicate = () => {
    setDuplicateDialog({ isOpen: false, resumeId: '', resumeTitle: '', newTitle: '' });
  };

  // Открытие AI анализа
  const handleAIAnalysis = (resume: Resume) => {
    setAnalysisDialog({
      isOpen: true,
      resume: resume
    });
  };

  // Закрытие AI анализа
  const handleCloseAnalysis = () => {
    setAnalysisDialog({
      isOpen: false,
      resume: null
    });
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthGuard>
      <div className={styles.container}>
        {/* Заголовок страницы */}
        <div className={styles.header}>
          <h1>Мои резюме</h1>
          <p>Создавайте и управляйте своими резюме</p>
        </div>

        <div className={styles.content}>
          {/* Поиск и фильтры */}
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <div className={styles.searchInput}>
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Поиск по названию резюме..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchField}
                />
              </div>
              <button 
                className={styles.filterButton}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Фильтры
              </button>
            </div>
            
            {showFilters && (
              <div className={styles.filtersPanel}>
                <div className={styles.filterGroup}>
                  <label>Основное резюме:</label>
                  <select 
                    value={filters.isDefault === undefined ? '' : filters.isDefault.toString()}
                    onChange={(e) => handleFilterChange('isDefault', e.target.value === '' ? undefined : e.target.value === 'true')}
                    className={styles.filterSelect}
                  >
                    <option value="">Все</option>
                    <option value="true">Да</option>
                    <option value="false">Нет</option>
                  </select>
                </div>
                
                <div className={styles.filterGroup}>
                  <label>Публичность:</label>
                  <select 
                    value={filters.isPublic === undefined ? '' : filters.isPublic.toString()}
                    onChange={(e) => handleFilterChange('isPublic', e.target.value === '' ? undefined : e.target.value === 'true')}
                    className={styles.filterSelect}
                  >
                    <option value="">Все</option>
                    <option value="true">Публичные</option>
                    <option value="false">Приватные</option>
                  </select>
                </div>
                
                <div className={styles.filterGroup}>
                  <label>Сортировка:</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="createdAt">По дате создания</option>
                    <option value="updatedAt">По дате обновления</option>
                    <option value="title">По названию</option>
                  </select>
                </div>
                
                <div className={styles.filterGroup}>
                  <label>Порядок:</label>
                  <select 
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="desc">По убыванию</option>
                    <option value="asc">По возрастанию</option>
                  </select>
                </div>
                
                <button 
                  className={styles.clearFiltersButton}
                  onClick={clearFilters}
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>

          {/* Форма создания/редактирования резюме */}
          <div className={styles.createSection}>
            {editingResume ? (
              <>
                <h2>Редактировать резюме</h2>
                <div className={styles.createForm}>
                  <input
                    type="text"
                    placeholder="Название резюме"
                    value={editingResume.title}
                    onChange={(e) => setEditingResume(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className={styles.titleInput}
                    maxLength={100}
                  />
                  <textarea
                    placeholder="Краткое описание резюме (необязательно)"
                    value={editingResume.summary}
                    onChange={(e) => setEditingResume(prev => prev ? { ...prev, summary: e.target.value } : null)}
                    className={styles.summaryInput}
                    maxLength={500}
                    rows={3}
                  />
                  <textarea
                    placeholder="Цель/цели резюме (необязательно)"
                    value={editingResume.objective}
                    onChange={(e) => setEditingResume(prev => prev ? { ...prev, objective: e.target.value } : null)}
                    className={styles.summaryInput}
                    maxLength={500}
                    rows={3}
                  />
                  <div className={styles.formActions}>
                    <button 
                      onClick={handleSaveEdit}
                      className={styles.saveButton}
                      disabled={!editingResume.title.trim()}
                    >
                      <Save size={16} />
                      Сохранить изменения
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className={styles.cancelButton}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2>Создать новое резюме</h2>
                {!isCreating ? (
                  <button 
                    onClick={() => setIsCreating(true)}
                    className={styles.createButton}
                    disabled={isCreatingResume}
                  >
                    <Plus size={16} />
                    Создать резюме
                  </button>
                ) : (
                  <div className={styles.createForm}>
                    <input
                      type="text"
                      placeholder="Введите название резюме (например: Frontend Developer)"
                      value={newResumeTitle}
                      onChange={(e) => setNewResumeTitle(e.target.value)}
                      className={styles.titleInput}
                      maxLength={100}
                    />
                    <div className={styles.formActions}>
                      <button 
                        onClick={handleCreateResume}
                        className={styles.saveButton}
                        disabled={isCreatingResume || !newResumeTitle.trim()}
                      >
                        <Save size={16} />
                        {isCreatingResume ? 'Создание...' : 'Создать'}
                      </button>
                      <button 
                        onClick={() => {
                          setIsCreating(false);
                          setNewResumeTitle('');
                        }}
                        className={styles.cancelButton}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Список существующих резюме */}
          <div className={styles.resumesSection}>
            <div className={styles.sectionHeader}>
              <h2>Мои резюме ({totalResumes})</h2>
              <div className={styles.viewOptions}>
                <span>Страница {currentPage} из {totalPages}</span>
              </div>
            </div>
            
            {isLoadingResumes ? (
              <div className={styles.loading}>Загрузка резюме...</div>
            ) : !Array.isArray(resumes) ? (
              <div className={styles.emptyState}>
                <p>Ошибка загрузки резюме</p>
                <p>Попробуйте обновить данные</p>
                <button 
                  onClick={() => refetch()} 
                  className={styles.createButton}
                  style={{ marginTop: '1rem' }}
                >
                  Обновить
                </button>
              </div>
            ) : resumes.length === 0 ? (
              <div className={styles.emptyState}>
                <p>У вас пока нет резюме</p>
                <p>Создайте первое резюме, нажав кнопку "Создать резюме" выше</p>
              </div>
            ) : (
              <>
                <div className={styles.resumesList}>
                  {resumes.map((resume: Resume) => (
                    <div key={resume.id} className={styles.resumeCard}>
                      <div className={styles.resumeInfo}>
                        <div className={styles.resumeHeader}>
                          <h3>{resume.title}</h3>
                          <div className={styles.resumeBadges}>
                            {resume.isDefault && (
                              <span className={styles.badge} title="Основное резюме">
                                <Star size={14} />
                                Основное
                              </span>
                            )}
                            {resume.isPublic ? (
                              <span className={styles.badge} title="Публичное резюме">
                                <Globe size={14} />
                                Публичное
                              </span>
                            ) : (
                              <span className={styles.badge} title="Приватное резюме">
                                <Lock size={14} />
                                Приватное
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {resume.summary && (
                          <p className={styles.resumeSummary}>{resume.summary}</p>
                        )}
                        {resume.objective && (
                          <p className={styles.resumeObjective}>
                            <strong>Цель:</strong> {resume.objective}
                          </p>
                        )}
                        
                        <div className={styles.resumeMeta}>
                          <p className={styles.resumeDate}>
                            Создано: {formatDate(resume.createdAt)}
                          </p>
                          {resume.updatedAt !== resume.createdAt && (
                            <p className={styles.resumeDate}>
                              Обновлено: {formatDate(resume.updatedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className={styles.resumeActions}>
                        <button 
                          onClick={() => handleViewResume(resume.id)}
                          className={styles.viewButton}
                          title="Просмотреть"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditResume(resume.id)}
                          className={styles.editButton}
                          title="Редактировать"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleAIAnalysis(resume)}
                          className={styles.aiAnalysisButton}
                          title="AI Анализ резюме"
                        >
                          <Brain size={16} />
                          AI Анализ
                        </button>
                        <button 
                          onClick={() => handleDuplicateClick(resume.id, resume.title)}
                          className={styles.duplicateButton}
                          title="Дублировать"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(resume.id, resume.title)}
                          className={styles.deleteButton}
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Пагинация */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button 
                      className={styles.paginationButton}
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                      Предыдущая
                    </button>
                    
                    <div className={styles.pageNumbers}>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      className={styles.paginationButton}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Следующая
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          </div>

        {/* Детальный просмотр резюме */}
        {viewingResume && resumeDetail && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Просмотр резюме</h2>
                <button 
                  onClick={handleCloseDetail}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <ResumeViewer
                  resume={resumeDetail}
                  onEdit={() => handleEditResume(resumeDetail.id)}
                  onDuplicate={() => handleDuplicateClick(resumeDetail.id, resumeDetail.title)}
                  onSetDefault={resumeDetail.isDefault ? undefined : () => handleSetDefault(resumeDetail.id)}
                  onTogglePublic={() => handleTogglePublic(resumeDetail.id, resumeDetail.isPublic)}
                  onAIAnalysis={() => handleAIAnalysis(resumeDetail)}
                  showActions={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Редактирование резюме */}
        {editingResumeId && resumeDetail && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Редактирование резюме</h2>
                <button 
                  onClick={handleCloseDetail}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <ResumeEditor
                  resume={resumeDetail}
                  onSave={handleSaveResume}
                  onCancel={handleCloseDetail}
                  isLoading={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно подтверждения удаления */}
        <ConfirmationDialog
          isOpen={deleteDialog.isOpen}
          title="Удалить резюме"
          message={`Вы уверены, что хотите удалить резюме "${deleteDialog.resumeTitle}"? Это действие нельзя отменить.`}
          confirmText="Удалить"
          cancelText="Отмена"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          type="danger"
        />

        {/* Модальное окно дублирования */}
        <ConfirmationDialog
          isOpen={duplicateDialog.isOpen}
          title="Дублировать резюме"
          message={
            <div>
              <p>Создать копию резюме "{duplicateDialog.resumeTitle}"?</p>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Название копии:
                </label>
                <input
                  type="text"
                  value={duplicateDialog.newTitle}
                  onChange={(e) => setDuplicateDialog(prev => ({ ...prev, newTitle: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Введите название для копии"
                />
              </div>
            </div>
          }
          confirmText="Дублировать"
          cancelText="Отмена"
          onConfirm={handleConfirmDuplicate}
          onCancel={handleCancelDuplicate}
          type="info"
        />

        {/* AI Анализ резюме */}
        <ResumeAnalysis
          isOpen={analysisDialog.isOpen}
          onClose={handleCloseAnalysis}
          resume={analysisDialog.resume}
        />
      </div>
    </AuthGuard>
  );
}