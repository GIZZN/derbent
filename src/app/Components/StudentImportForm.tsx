'use client';

import React, { useState, useRef } from 'react';
import { 
  useCreateStudentMutation,
  CreateStudentDto,
  validateStudent
} from '../../lib/api/studentsApi';
import { 
  Upload, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  X,
  Save
} from 'lucide-react';
import styles from './StudentImportForm.module.css';

interface StudentImportFormProps {
  onSuccess?: (importedCount: number) => void;
  onCancel?: () => void;
  className?: string;
}

interface ImportResult {
  success: boolean;
  student?: CreateStudentDto;
  error?: string;
}

export default function StudentImportForm({ 
  onSuccess, 
  onCancel, 
  className = '' 
}: StudentImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [previewData, setPreviewData] = useState<CreateStudentDto[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createStudent] = useCreateStudentMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors([]);
      parseFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      const isValidFile = droppedFile.type === 'text/csv' || 
                         droppedFile.type === 'application/csv' ||
                         droppedFile.name.endsWith('.csv') ||
                         droppedFile.name.endsWith('.txt');
      
      if (isValidFile) {
        setFile(droppedFile);
        setErrors([]);
        parseFile(droppedFile);
      } else {
        setErrors(['Пожалуйста, выберите файл в формате CSV (.csv или .txt)']);
      }
    }
  };

  const parseFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const students: CreateStudentDto[] = [];
      const fileErrors: string[] = [];

      if (lines.length < 2) {
        setErrors(['Файл должен содержать заголовок и хотя бы одну строку данных']);
        return;
      }

      // Пропускаем заголовок (первую строку)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Поддержка разных разделителей
        const columns = line.split(/[,;\t]/).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 6) {
          fileErrors.push(`Строка ${i + 1}: Недостаточно данных (найдено ${columns.length} колонок, требуется минимум 6)`);
          continue;
        }

        const student: CreateStudentDto = {
          firstName: columns[0] || '',
          lastName: columns[1] || '',
          email: columns[2] || '',
          studentId: columns[3] || '',
          yearOfStudy: parseInt(columns[4]) || 1,
          major: columns[5] || '',
          gpa: columns[6] ? parseFloat(columns[6]) : undefined,
          phone: columns[7] || ''
        };

        // Валидация студента
        const validationErrors = validateStudent(student);
        if (validationErrors.length > 0) {
          fileErrors.push(`Строка ${i + 1}: ${validationErrors.join(', ')}`);
          continue;
        }

        students.push(student);
      }

      if (students.length === 0) {
        setErrors(['Не найдено валидных записей студентов в файле']);
        return;
      }

      setPreviewData(students);
      setShowPreview(true);
      setErrors(fileErrors);
    } catch (error) {
      console.error('Ошибка парсинга файла:', error);
      setErrors(['Ошибка чтения файла. Убедитесь, что файл в формате CSV и не поврежден.']);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    const results: ImportResult[] = [];

    for (let i = 0; i < previewData.length; i++) {
      try {
        await createStudent(previewData[i]).unwrap();
        results.push({ success: true, student: previewData[i] });
      } catch (error) {
        results.push({ 
          success: false, 
          student: previewData[i],
          error: 'Ошибка создания студента'
        });
      }
      
      setImportProgress(Math.round(((i + 1) / previewData.length) * 100));
    }

    setImportResults(results);
    setIsImporting(false);
    
    const successCount = results.filter(r => r.success).length;
    onSuccess?.(successCount);
  };

  const downloadTemplate = () => {
    const csvContent = [
      'Имя,Фамилия,Email,Номер билета,Курс,Специальность,GPA,Телефон',
      'Иван,Петров,ivan.petrov@university.edu,2024001,3,Информатика,4.2,+7-999-123-45-67',
      'Мария,Сидорова,maria.sidorova@university.edu,2024002,2,Экономика,3.8,+7-999-234-56-78'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_students.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancel = () => {
    setFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setImportResults([]);
    setErrors([]);
    onCancel?.();
  };

  const formClasses = [
    styles.importForm,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={formClasses}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          <Users size={24} />
          Импорт студентов
        </h2>
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

      <div className={styles.formContent}>
        {!showPreview ? (
          <>
            {/* File Upload */}
            <div className={styles.uploadSection}>
              <div 
                className={`${styles.uploadArea} ${isDragOver ? styles.uploadAreaDragOver : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                />
                <div className={styles.uploadContent}>
                  <Upload size={48} className={styles.uploadIcon} />
                  <h3 className={styles.uploadTitle}>
                    {isDragOver ? 'Отпустите файл здесь' : 'Загрузите CSV файл'}
                  </h3>
                  <p className={styles.uploadText}>
                    {isDragOver 
                      ? 'Файл будет загружен автоматически'
                      : 'Перетащите файл сюда или выберите файл с данными студентов в формате CSV'
                    }
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadButton}
                  >
                    <FileText size={20} />
                    Выбрать файл
                  </button>
                </div>
              </div>

              {file && (
                <div className={styles.fileInfo}>
                  <FileText size={20} />
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* Template Download */}
            <div className={styles.templateSection}>
              <h3 className={styles.templateTitle}>Нужен шаблон?</h3>
              <p className={styles.templateText}>
                Скачайте шаблон CSV файла с примером структуры данных
              </p>
              <button 
                onClick={downloadTemplate}
                className={styles.templateButton}
              >
                <Download size={20} />
                Скачать шаблон
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Preview */}
            <div className={styles.previewSection}>
              <h3 className={styles.previewTitle}>
                Предварительный просмотр ({previewData.length} студентов)
              </h3>
              
              <div className={styles.previewTable}>
                <div className={styles.tableHeader}>
                  <div>Имя</div>
                  <div>Фамилия</div>
                  <div>Email</div>
                  <div>Курс</div>
                  <div>Специальность</div>
                </div>
                
                {previewData.slice(0, 5).map((student, index) => (
                  <div key={index} className={styles.tableRow}>
                    <div>{student.firstName}</div>
                    <div>{student.lastName}</div>
                    <div>{student.email}</div>
                    <div>{student.yearOfStudy}-й курс</div>
                    <div>{student.major}</div>
                  </div>
                ))}
                
                {previewData.length > 5 && (
                  <div className={styles.moreRows}>
                    ... и еще {previewData.length - 5} студентов
                  </div>
                )}
              </div>
            </div>

            {/* Import Progress */}
            {isImporting && (
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <h3>Импорт в процессе...</h3>
                  <span>{importProgress}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Import Results */}
            {importResults.length > 0 && (
              <div className={styles.resultsSection}>
                <h3 className={styles.resultsTitle}>Результаты импорта</h3>
                
                <div className={styles.resultsStats}>
                  <div className={styles.statItem}>
                    <CheckCircle size={20} className={styles.successIcon} />
                    <span>Успешно: {importResults.filter(r => r.success).length}</span>
                  </div>
                  <div className={styles.statItem}>
                    <XCircle size={20} className={styles.errorIcon} />
                    <span>Ошибки: {importResults.filter(r => !r.success).length}</span>
                  </div>
                </div>

                {importResults.filter(r => !r.success).length > 0 && (
                  <div className={styles.errorDetails}>
                    <h4>Ошибки импорта:</h4>
                    {importResults
                      .filter(r => !r.success)
                      .slice(0, 5)
                      .map((result, index) => (
                        <div key={index} className={styles.errorDetail}>
                          {result.student?.firstName} {result.student?.lastName}: {result.error}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className={styles.importActions}>
              <button
                onClick={() => setShowPreview(false)}
                className={styles.backButton}
                disabled={isImporting}
              >
                Назад
              </button>
              
              <button
                onClick={handleImport}
                className={styles.importButton}
                disabled={isImporting || previewData.length === 0}
              >
                <Save size={16} />
                {isImporting ? 'Импорт...' : `Импортировать ${previewData.length} студентов`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
