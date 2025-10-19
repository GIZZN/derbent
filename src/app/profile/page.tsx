'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  UniversalUpdateDto,
  UniversalProfileDto
} from '../../lib/api/authApi';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  Globe, 
  GraduationCap,
  Edit,
  Save,
  X,
  UserCircle,
  Calendar,
  Award,
  Shield
} from 'lucide-react';
import styles from './profile.module.css';

interface ProfileFormData {
  // Candidate fields
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  
  // HR fields
  company?: string;
  position?: string;
  
  // University fields
  name?: string;
  address?: string;
  website?: string;
  logoId?: string;
  
  // Admin fields
  department?: string;
  permissions?: string;
  
  // Avatar
  avatarUrl?: string;
  avatarId?: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  // Universal API hooks - используем только универсальные endpoints
  const profileQuery = useGetProfileQuery({ role: user?.role || '' }, {
    skip: !user?.role
  });
  const [createProfile] = useCreateProfileMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [uploadAvatar] = useUploadAvatarMutation();

  // Используем только универсальный query
  const currentQuery = profileQuery;

  // Update form data when profile data loads
  useEffect(() => {
    if (currentQuery.data) {
      console.log('📥 Profile data received:', currentQuery.data);
      // Инициализируем отсутствующие поля значениями по умолчанию
      const profileData = {
        // Общие поля
        avatarUrl: '',
        avatarId: '',
        phone: '',
        email: '',
        // Candidate поля
        firstName: '',
        lastName: '',
        location: '',
        bio: '',
        // HR поля
        company: '',
        position: '',
        // University поля
        name: '',
        address: '',
        website: '',
        logoId: '',
        ...currentQuery.data
      };
      console.log('🔧 Processed profile data:', profileData);
      setFormData(profileData);
      setHasProfile(true);
      setChangedFields(new Set()); // Сбрасываем список измененных полей при загрузке
    } else if (!currentQuery.isLoading && !currentQuery.error) {
      setHasProfile(false);
    }
  }, [currentQuery.data, currentQuery.isLoading, currentQuery.error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Отмечаем поле как измененное
    setChangedFields(prev => new Set(prev).add(name));
  };


  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadAvatarFile(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAvatarDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    await uploadAvatarFile(file);
  };

  const uploadAvatarFile = async (file: File) => {
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadAvatar(formData).unwrap();
      console.log('✅ Avatar uploaded successfully:', result);

      // Обновляем данные формы с новым аватаром
      setFormData(prev => ({
        ...prev,
        avatarUrl: result.avatarUrl,
        avatarId: result.mediaFileId
      }));

      // Отмечаем поля аватара как измененные
      setChangedFields(prev => new Set(prev).add('avatarUrl').add('avatarId'));

      // Обновляем данные пользователя в AuthContext
      if (user) {
        updateUser({
          ...user,
          avatarUrl: result.avatarUrl
        });
      }

    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : 'Ошибка при загрузке аватарки';
      setError(errorMessage || 'Ошибка при загрузке аватарки');
    } finally {
      setIsUploading(false);
    }
  };

  // Валидация для профиля университета
  const validateUniversityProfile = (data: ProfileFormData) => {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim() === '') {
      errors.push('Название университета обязательно для заполнения');
    }
    
    if (!data.address || data.address.trim() === '') {
      errors.push('Адрес университета обязателен для заполнения');
    }
    
    // Валидация телефона (если указан)
    if (data.phone && data.phone.trim() !== '') {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(data.phone)) {
        errors.push('Неверный формат телефона');
      }
    }
    
    // Валидация веб-сайта (если указан)
    if (data.website && data.website.trim() !== '') {
      try {
        new URL(data.website);
      } catch {
        errors.push('Неверный формат URL веб-сайта');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Валидация для университета
    if (user?.role === 'UNIVERSITY') {
      const validationErrors = validateUniversityProfile(formData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (hasProfile) {
        // Update existing profile - send only changed fields
        const fieldsToSend: Partial<ProfileFormData> = {};
        
        // Собираем только те поля, которые пользователь реально изменил
        changedFields.forEach(fieldName => {
          const fieldKey = fieldName as keyof ProfileFormData;
          fieldsToSend[fieldKey] = formData[fieldKey] as string | undefined;
        });
        
        // Only send update if there are changes
        if (Object.keys(fieldsToSend).length > 0) {
          console.log('📤 Sending only changed fields:', fieldsToSend);
          await updateProfile(fieldsToSend as UniversalUpdateDto).unwrap();
          
          // Обновляем данные пользователя в AuthContext если изменялся avatarUrl
          if (user && fieldsToSend.avatarUrl) {
            updateUser({
              ...user,
              avatarUrl: fieldsToSend.avatarUrl
            });
          }
          
          setChangedFields(new Set()); // Очищаем список измененных полей
        } else {
          console.log('ℹ️ No changes detected, skipping update');
        }
      } else {
        // Create new profile using universal endpoint
        await createProfile({ ...formData, role: user?.role || '' } as UniversalProfileDto & { role: string }).unwrap();
        
        // Обновляем данные пользователя в AuthContext если есть avatarUrl
        if (user && formData.avatarUrl) {
          updateUser({
            ...user,
            avatarUrl: formData.avatarUrl
          });
        }
        
        setHasProfile(true);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : 'Произошла ошибка при сохранении профиля';
      setError(errorMessage || 'Произошла ошибка при сохранении профиля');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || currentQuery.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingIcon}>
            <UserCircle size={48} />
          </div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.message}>
          <h2>Доступ запрещен</h2>
          <p>Для просмотра профиля необходимо войти в систему.</p>
        </div>
      </div>
    );
  }

  const renderCandidateProfile = () => (
    <div className={styles.profileFields}>
      <div className={styles.fieldsRow}>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <User size={20} />
            <label className={styles.fieldLabel}>Имя *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={styles.fieldInput}
              value={formData.firstName || ''}
              onChange={handleInputChange}
              placeholder="Введите имя"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.firstName || <span className={styles.emptyValue}>Не указано</span>}
            </div>
          )}
        </div>
        
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <User size={20} />
            <label className={styles.fieldLabel}>Фамилия *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={styles.fieldInput}
              value={formData.lastName || ''}
              onChange={handleInputChange}
              placeholder="Введите фамилию"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.lastName || <span className={styles.emptyValue}>Не указано</span>}
            </div>
          )}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <Phone size={20} />
          <label className={styles.fieldLabel}>Телефон</label>
        </div>
        {isEditing ? (
          <input
            type="tel"
            id="phone"
            name="phone"
            className={styles.fieldInput}
            value={formData.phone || ''}
            onChange={handleInputChange}
            placeholder="+7 (999) 999-99-99"
          />
        ) : (
          <div className={styles.fieldValue}>
            {formData.phone || <span className={styles.emptyValue}>Не указан</span>}
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <MapPin size={20} />
          <label className={styles.fieldLabel}>Местоположение</label>
        </div>
        {isEditing ? (
          <input
            type="text"
            id="location"
            name="location"
            className={styles.fieldInput}
            value={formData.location || ''}
            onChange={handleInputChange}
            placeholder="Город, страна"
          />
        ) : (
          <div className={styles.fieldValue}>
            {formData.location || <span className={styles.emptyValue}>Не указано</span>}
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <User size={20} />
          <label className={styles.fieldLabel}>О себе</label>
        </div>
        {isEditing ? (
          <textarea
            id="bio"
            name="bio"
            className={styles.fieldTextarea}
            value={formData.bio || ''}
            onChange={handleInputChange}
            rows={4}
            placeholder="Расскажите о себе, ваших навыках и опыте..."
          />
        ) : (
          <div className={styles.fieldValue}>
            {formData.bio || <span className={styles.emptyValue}>Информация не добавлена</span>}
          </div>
        )}
      </div>
    </div>
  );

  const renderHRProfile = () => (
    <div className={styles.profileFields}>
      <div className={styles.fieldsRow}>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <User size={20} />
            <label className={styles.fieldLabel}>Имя *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={styles.fieldInput}
              value={formData.firstName || ''}
              onChange={handleInputChange}
              placeholder="Ваше имя"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.firstName || <span className={styles.emptyValue}>Не указано</span>}
            </div>
          )}
        </div>
        
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <User size={20} />
            <label className={styles.fieldLabel}>Фамилия *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={styles.fieldInput}
              value={formData.lastName || ''}
              onChange={handleInputChange}
              placeholder="Ваша фамилия"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.lastName || <span className={styles.emptyValue}>Не указана</span>}
            </div>
          )}
        </div>
      </div>

      <div className={styles.fieldsRow}>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <Building size={20} />
            <label className={styles.fieldLabel}>Компания *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="company"
              name="company"
              className={styles.fieldInput}
              value={formData.company || ''}
              onChange={handleInputChange}
              placeholder="Название компании"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.company || <span className={styles.emptyValue}>Не указана</span>}
            </div>
          )}
        </div>
        
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <Briefcase size={20} />
            <label className={styles.fieldLabel}>Должность *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="position"
              name="position"
              className={styles.fieldInput}
              value={formData.position || ''}
              onChange={handleInputChange}
              placeholder="Ваша должность"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.position || <span className={styles.emptyValue}>Не указана</span>}
            </div>
          )}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <Phone size={20} />
          <label className={styles.fieldLabel}>Телефон</label>
        </div>
        {isEditing ? (
          <input
            type="tel"
            id="phone"
            name="phone"
            className={styles.fieldInput}
            value={formData.phone || ''}
            onChange={handleInputChange}
            placeholder="+7 (999) 999-99-99"
          />
        ) : (
          <div className={styles.fieldValue}>
            {formData.phone || <span className={styles.emptyValue}>Не указан</span>}
          </div>
        )}
      </div>


    </div>
  );

  const renderUniversityProfile = () => (
    <div className={styles.profileFields}>
      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <GraduationCap size={20} />
          <label className={styles.fieldLabel}>Название университета *</label>
        </div>
        {isEditing ? (
          <input
            type="text"
            id="name"
            name="name"
            className={styles.fieldInput}
            value={formData.name || ''}
            onChange={handleInputChange}
            placeholder="Полное название университета"
            required
          />
        ) : (
          <div className={styles.fieldValue}>
            {formData.name || <span className={styles.emptyValue}>Не указано</span>}
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <MapPin size={20} />
          <label className={styles.fieldLabel}>Адрес *</label>
        </div>
        {isEditing ? (
          <input
            type="text"
            id="address"
            name="address"
            className={styles.fieldInput}
            value={formData.address || ''}
            onChange={handleInputChange}
            placeholder="Полный адрес университета"
            required
          />
        ) : (
          <div className={styles.fieldValue}>
            {formData.address || <span className={styles.emptyValue}>Не указан</span>}
          </div>
        )}
      </div>

      <div className={styles.fieldsRow}>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <Phone size={20} />
            <label className={styles.fieldLabel}>Телефон</label>
          </div>
          {isEditing ? (
            <input
              type="tel"
              id="phone"
              name="phone"
              className={styles.fieldInput}
              value={formData.phone || ''}
              onChange={handleInputChange}
              placeholder="+7-495-939-10-00"
              pattern="[\+]?[0-9\s\-\(\)]+"
              title="Введите корректный номер телефона"
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.phone || <span className={styles.emptyValue}>Не указан</span>}
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <Globe size={20} />
            <label className={styles.fieldLabel}>Веб-сайт</label>
          </div>
          {isEditing ? (
            <input
              type="url"
              id="website"
              name="website"
              className={styles.fieldInput}
              value={formData.website || ''}
              onChange={handleInputChange}
              placeholder="https://university.edu"
              title="Введите корректный URL (например: https://university.edu)"
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.website ? (
                <a href={formData.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {formData.website}
                </a>
              ) : (
                <span className={styles.emptyValue}>Не указан</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdminProfile = () => (
    <div className={styles.profileFields}>
      <div className={styles.fieldsRow}>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <User size={20} />
            <label className={styles.fieldLabel}>Имя *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={styles.fieldInput}
              value={formData.firstName || ''}
              onChange={handleInputChange}
              placeholder="Введите имя"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.firstName || <span className={styles.emptyValue}>Не указано</span>}
            </div>
          )}
        </div>
        
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <User size={20} />
            <label className={styles.fieldLabel}>Фамилия *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={styles.fieldInput}
              value={formData.lastName || ''}
              onChange={handleInputChange}
              placeholder="Введите фамилию"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.lastName || <span className={styles.emptyValue}>Не указана</span>}
            </div>
          )}
        </div>
      </div>

      <div className={styles.fieldsRow}>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <Briefcase size={20} />
            <label className={styles.fieldLabel}>Должность *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="position"
              name="position"
              className={styles.fieldInput}
              value={formData.position || ''}
              onChange={handleInputChange}
              placeholder="Главный администратор"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.position || <span className={styles.emptyValue}>Не указана</span>}
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldHeader}>
            <Building size={20} />
            <label className={styles.fieldLabel}>Отдел *</label>
          </div>
          {isEditing ? (
            <input
              type="text"
              id="department"
              name="department"
              className={styles.fieldInput}
              value={formData.department || ''}
              onChange={handleInputChange}
              placeholder="IT"
              required
            />
          ) : (
            <div className={styles.fieldValue}>
              {formData.department || <span className={styles.emptyValue}>Не указан</span>}
            </div>
          )}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <Phone size={20} />
          <label className={styles.fieldLabel}>Телефон</label>
        </div>
        {isEditing ? (
          <input
            type="tel"
            id="phone"
            name="phone"
            className={styles.fieldInput}
            value={formData.phone || ''}
            onChange={handleInputChange}
            placeholder="+7 (999) 999-99-99"
          />
        ) : (
          <div className={styles.fieldValue}>
            {formData.phone || <span className={styles.emptyValue}>Не указан</span>}
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <Shield size={20} />
          <label className={styles.fieldLabel}>Права доступа</label>
        </div>
        {isEditing ? (
          <textarea
            id="permissions"
            name="permissions"
            className={styles.fieldTextarea}
            value={formData.permissions || ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="Описание прав доступа администратора"
          />
        ) : (
          <div className={styles.fieldValue}>
            {formData.permissions || <span className={styles.emptyValue}>Не указаны</span>}
          </div>
        )}
      </div>
    </div>
  );

  const getRoleName = (role: string) => {
    switch (role) {
      case 'CANDIDATE':
        return 'Кандидат';
      case 'HR':
        return 'HR Специалист';
      case 'UNIVERSITY':
        return 'Университет';
      case 'ADMIN':
        return 'Администратор';
      case 'MODERATOR':
        return 'Модератор';
      default:
        return 'Пользователь';
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Мой <span className={styles.highlight}>Профиль</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Управляйте своей профессиональной информацией и настройками аккаунта
          </p>
        </div>
      </div>
      
      <div className={styles.profileLayout}>
        {/* Header Card */}
        <div className={styles.headerCard}>
           <div className={styles.avatarSection}>
             <div className={styles.avatarContainer}>
               <div 
                 className={`${styles.avatarDropzone} ${isUploading ? styles.uploading : ''}`}
                 onDrop={handleAvatarDrop}
                 onDragOver={handleDragOver}
                 onDragEnter={handleDragEnter}
                 onDragLeave={handleDragLeave}
               >
                 <div className={styles.avatar}>
                   {formData.avatarUrl ? (
                     <Image 
                       src={formData.avatarUrl} 
                       alt="Avatar" 
                       width={120}
                       height={120}
                       className={styles.avatarImage}
                       priority
                     />
                   ) : (
                     <UserCircle size={80} />
                   )}
                 </div>
                 <div className={styles.avatarOverlay}>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleAvatarUpload}
                     className={styles.avatarInput}
                     id="avatar-upload"
                     disabled={isUploading}
                   />
                   <label htmlFor="avatar-upload" className={styles.avatarLabel}>
                     <div className={styles.avatarText}>
                       {isUploading ? 'Загрузка...' : 'Перетащите фото или нажмите для выбора'}
                     </div>
                   </label>
                 </div>
               </div>
             </div>
            <div className={styles.userBasicInfo}>
              <h1 className={styles.userName}>
                {user?.role === 'CANDIDATE' ? `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Новый пользователь' : 
                 user?.role === 'HR' ? formData.company || 'HR Специалист' :
                 user?.role === 'UNIVERSITY' ? formData.name || 'Университет' :
                 user?.role === 'ADMIN' ? `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Администратор' :
                 user?.role === 'MODERATOR' ? 'Модератор' : 'Пользователь'}
              </h1>
              <div className={styles.userMeta}>
                <div className={styles.metaItem}>
                  <Mail size={16} />
                  <span>{user?.email}</span>
                </div>
                <div className={styles.metaItem}>  
                  <Award size={16} />
                  <span>{getRoleName(user?.role || '')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            {!isEditing ? (
              <>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                >
                  <Edit size={16} />
                  {hasProfile ? 'Редактировать' : 'Создать профиль'}
                </button>
                
                {user?.role === 'ADMIN' && (
                  <button 
                    type="button" 
                    onClick={() => window.location.href = '/admin'}
                    className={styles.adminButton}
                  >
                    <Shield size={16} />
                    Админ-панель
                  </button>
                )}
              </>
            ) : (
              <div className={styles.editActions}>
                <button 
                  onClick={handleSubmit}
                  className={styles.saveButton}
                  disabled={isSubmitting || changedFields.size === 0}
                >
                  <Save size={16} />
                  {isSubmitting ? 'Сохранение...' : 
                   changedFields.size > 0 ? `Сохранить изменения (${changedFields.size})` : 'Нет изменений'}
                </button>
                
                {hasProfile && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(currentQuery.data || {});
                      setChangedFields(new Set());
                    }}
                    className={styles.cancelButton}
                  >
                    <X size={16} />
                    Отменить
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Cards */}
        <div className={styles.contentGrid}>
          {/* Main Info Card */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <h2>Основная информация</h2>
            </div>
            
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              {user?.role === 'CANDIDATE' && renderCandidateProfile()}
              {user?.role === 'HR' && renderHRProfile()}
              {user?.role === 'UNIVERSITY' && renderUniversityProfile()}
              {user?.role === 'ADMIN' && renderAdminProfile()}
            </form>
            
          </div>

          {/* Stats/Additional Info Card */}
          <div className={styles.statsCard}>
            <div className={styles.cardHeader}>
              <h2>Статистика</h2>
            </div>
            {user?.role === 'UNIVERSITY' ? (
              <div className={styles.universityStats}>
                
                <div className={styles.statCard}>
                  <div className={styles.statCardIcon}>
                    <Globe size={32} />
                  </div>
                  <div className={styles.statCardValue}>
                    0
                  </div>
                  <div className={styles.statCardLabel}>Соц. сетей</div>
                </div>
              </div>
            ) : (
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <Calendar size={24} />
                <div>
                  <span className={styles.statLabel}>Дата регистрации</span>
                  <span className={styles.statValue}>Недавно</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <User size={24} />
                <div>
                  <span className={styles.statLabel}>Статус профиля</span>
                  <span className={styles.statValue}>{hasProfile ? 'Заполнен' : 'Не заполнен'}</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <Award size={24} />
                <div>
                  <span className={styles.statLabel}>Роль</span>
                  <span className={styles.statValue}>{getRoleName(user?.role || '')}</span>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}