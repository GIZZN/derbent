'use client';

import { useState, useCallback } from 'react';
import { 
  useGetStudentsQuery,
  useSearchStudentsQuery,
  useLazySearchStudentsQuery,
  useGetStudentStatsQuery,
  useDeleteStudentMutation,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useAddStudentSkillMutation,
  useRemoveStudentSkillMutation,
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  StudentSearchParams,
  getStudentFullName,
  validateStudent
} from '../../lib/api/studentsApi';

// Интерфейс для состояния студентов
interface UseStudentsState {
  students: Student[];
  filteredStudents: Student[];
  selectedStudent: Student | null;
  searchTerm: string;
  yearFilter: number | '';
  isLoading: boolean;
  error: string | null;
  stats: any;
}

// Интерфейс для действий со студентами
interface UseStudentsActions {
  // Поиск и фильтрация
  setSearchTerm: (term: string) => void;
  setYearFilter: (year: number | '') => void;
  searchBySkills: (params: StudentSearchParams) => Promise<void>;
  clearSearch: () => void;
  
  // CRUD операции
  createStudent: (data: CreateStudentDto) => Promise<Student>;
  updateStudent: (id: string, data: UpdateStudentDto) => Promise<Student>;
  deleteStudent: (id: string, name?: string) => Promise<void>;
  
  // Навыки
  addSkillToStudent: (studentId: string, skillId: string, level: number) => Promise<void>;
  removeSkillFromStudent: (studentId: string, skillId: string, skillName?: string) => Promise<void>;
  
  // Выбор студента
  selectStudent: (student: Student | null) => void;
  
  // Утилиты
  refreshData: () => void;
  getFormattedStudentName: (student: Student) => string;
  validateStudentData: (data: CreateStudentDto | UpdateStudentDto) => string[];
}

// Основной хук для управления студентами
export function useStudentsManager(): UseStudentsState & UseStudentsActions {
  // Состояние
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<Student[]>([]);

  // API хуки
  const { 
    data: allStudents = [], 
    isLoading: studentsLoading, 
    error: studentsError,
    refetch: refetchStudents
  } = useGetStudentsQuery();

  const { 
    data: stats, 
    isLoading: statsLoading,
    refetch: refetchStats
  } = useGetStudentStatsQuery();

  const [searchStudents] = useLazySearchStudentsQuery();
  const [createStudentMutation] = useCreateStudentMutation();
  const [updateStudentMutation] = useUpdateStudentMutation();
  const [deleteStudentMutation] = useDeleteStudentMutation();
  const [addStudentSkillMutation] = useAddStudentSkillMutation();
  const [removeStudentSkillMutation] = useRemoveStudentSkillMutation();

  // Фильтрация студентов
  const filteredStudents = (isSearchMode ? searchResults : allStudents).filter(student => {
    const matchesSearch = !searchTerm || 
      getStudentFullName(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = yearFilter === '' || student.yearOfStudy === yearFilter;

    return matchesSearch && matchesYear;
  });

  // Действия

  const searchBySkills = useCallback(async (params: StudentSearchParams) => {
    try {
      const result = await searchStudents(params).unwrap();
      setSearchResults(result);
      setIsSearchMode(true);
    } catch (error) {
      console.error('Ошибка поиска по навыкам:', error);
      throw error;
    }
  }, [searchStudents]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setIsSearchMode(false);
    setSearchTerm('');
    setYearFilter('');
  }, []);

  const createStudent = useCallback(async (data: CreateStudentDto): Promise<Student> => {
    try {
      const result = await createStudentMutation(data).unwrap();
      return result;
    } catch (error) {
      console.error('Ошибка создания студента:', error);
      throw error;
    }
  }, [createStudentMutation]);

  const updateStudent = useCallback(async (id: string, data: UpdateStudentDto): Promise<Student> => {
    try {
      const result = await updateStudentMutation({ id, data }).unwrap();
      return result;
    } catch (error) {
      console.error('Ошибка обновления студента:', error);
      throw error;
    }
  }, [updateStudentMutation]);

  const deleteStudent = useCallback(async (id: string, name?: string): Promise<void> => {
    const studentName = name || selectedStudent?.firstName || 'студента';
    const confirmed = window.confirm(`Вы уверены, что хотите удалить ${studentName}?`);
    
    if (confirmed) {
      try {
        await deleteStudentMutation(id).unwrap();
        if (selectedStudent?.id === id) {
          setSelectedStudent(null);
        }
      } catch (error) {
        console.error('Ошибка удаления студента:', error);
        throw error;
      }
    }
  }, [deleteStudentMutation, selectedStudent]);

  const addSkillToStudent = useCallback(async (studentId: string, skillId: string, level: number): Promise<void> => {
    try {
      await addStudentSkillMutation({
        studentId,
        data: { skillId, level }
      }).unwrap();
    } catch (error) {
      console.error('Ошибка добавления навыка:', error);
      throw error;
    }
  }, [addStudentSkillMutation]);

  const removeSkillFromStudent = useCallback(async (studentId: string, skillId: string, skillName?: string): Promise<void> => {
    const confirmed = skillName ? 
      window.confirm(`Удалить навык "${skillName}"?`) :
      window.confirm('Удалить этот навык?');
    
    if (confirmed) {
      try {
        await removeStudentSkillMutation({ studentId, skillId }).unwrap();
      } catch (error) {
        console.error('Ошибка удаления навыка:', error);
        throw error;
      }
    }
  }, [removeStudentSkillMutation]);

  const selectStudent = useCallback((student: Student | null) => {
    setSelectedStudent(student);
  }, []);

  const refreshData = useCallback(() => {
    refetchStudents();
    refetchStats();
  }, [refetchStudents, refetchStats]);

  const getFormattedStudentName = useCallback((student: Student) => {
    return getStudentFullName(student);
  }, []);

  const validateStudentData = useCallback((data: CreateStudentDto | UpdateStudentDto) => {
    return validateStudent(data as CreateStudentDto);
  }, []);

  return {
    // Состояние
    students: allStudents,
    filteredStudents,
    selectedStudent,
    searchTerm,
    yearFilter,
    isLoading: studentsLoading || statsLoading,
    error: studentsError ? 'Ошибка загрузки студентов' : null,
    stats,

    // Действия
    setSearchTerm,
    setYearFilter,
    searchBySkills,
    clearSearch,
    createStudent,
    updateStudent,
    deleteStudent,
    addSkillToStudent,
    removeSkillFromStudent,
    selectStudent,
    refreshData,
    getFormattedStudentName,
    validateStudentData,
  };
}

// Хук для статистики студентов
export function useStudentStats() {
  const { data: stats, isLoading, error, refetch } = useGetStudentStatsQuery();

  return {
    stats,
    isLoading,
    error,
    refetch,
    totalStudents: stats?.totalStudents || 0,
    studentsWithSkills: stats?.studentsWithSkills || 0,
    studentsWithoutSkills: stats?.studentsWithoutSkills || 0,
    topSkills: stats?.topSkills || [],
  };
}

// Хук для работы с отдельным студентом
export function useStudentDetails(studentId?: string) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateStudentDto>({});

  const { 
    data: student, 
    isLoading, 
    error,
    refetch 
  } = useGetStudentsQuery(undefined, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.find(s => s.id === studentId),
      ...rest
    }),
    skip: !studentId
  });

  const [updateStudent] = useUpdateStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();

  const startEditing = useCallback(() => {
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
      setIsEditing(true);
    }
  }, [student]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setFormData({});
  }, []);

  const saveChanges = useCallback(async () => {
    if (!studentId) return;
    
    try {
      await updateStudent({ id: studentId, data: formData }).unwrap();
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      throw error;
    }
  }, [studentId, formData, updateStudent, refetch]);

  const removeStudent = useCallback(async () => {
    if (!studentId || !student) return;
    
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить студента ${getStudentFullName(student)}?`
    );
    
    if (confirmed) {
      try {
        await deleteStudent(studentId).unwrap();
        return true; // Успешно удален
      } catch (error) {
        console.error('Ошибка удаления:', error);
        throw error;
      }
    }
    
    return false; // Не удален
  }, [studentId, student, deleteStudent]);

  const updateFormField = useCallback((field: keyof UpdateStudentDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    student,
    isLoading,
    error,
    isEditing,
    formData,
    startEditing,
    cancelEditing,
    saveChanges,
    removeStudent,
    updateFormField,
    refetch,
  };
}

// Утилитарные функции для экспорта
export const studentUtils = {
  getFullName: getStudentFullName,
  validate: validateStudent,
  
  // Форматирование курса
  formatYear: (yearOfStudy: number): string => {
    const yearNames = ['', '1-й курс', '2-й курс', '3-й курс', '4-й курс', '5-й курс', '6-й курс'];
    return yearNames[yearOfStudy] || `${yearOfStudy}-й курс`;
  },
  
  // Форматирование GPA
  formatGPA: (gpa?: number): string => {
    if (gpa === undefined) return 'Не указан';
    return gpa.toFixed(2);
  },
  
  // Получение уровня навыка
  getSkillLevelText: (level: number): string => {
    const levelTexts = ['', 'Начальный', 'Базовый', 'Средний', 'Продвинутый', 'Экспертный'];
    return levelTexts[level] || 'Неизвестный';
  },
  
  // Группировка студентов по курсам
  groupByYear: (students: Student[]): Record<number, Student[]> => {
    return students.reduce((groups, student) => {
      const year = student.yearOfStudy;
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(student);
      return groups;
    }, {} as Record<number, Student[]>);
  },
  
  // Группировка студентов по специальностям
  groupByMajor: (students: Student[]): Record<string, Student[]> => {
    return students.reduce((groups, student) => {
      const major = student.major;
      if (!groups[major]) {
        groups[major] = [];
      }
      groups[major].push(student);
      return groups;
    }, {} as Record<string, Student[]>);
  },
};
