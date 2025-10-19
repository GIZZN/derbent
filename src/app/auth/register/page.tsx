'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '../../../lib/api/authApi';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './register.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CANDIDATE' as 'HR' | 'CANDIDATE' | 'UNIVERSITY',
    agreeToTerms: false
  });
  const [register, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState('');
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Необходимо согласиться с условиями использования');
      return;
    }

    try {
      console.log('🚀 Sending registration request with data:', {
        email: formData.email,
        role: formData.role,
        passwordLength: formData.password.length
      });
      
      // Регистрация пользователя через RTK Query
      const result = await register({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }).unwrap();
      
      console.log('✅ Registration successful:', result);
      
      // Обновляем состояние авторизации в контексте
      authLogin(result.user);
      
      // Перенаправление на главную страницу через Next.js router
      router.push('/');
    } catch (err: unknown) {
      console.error('❌ Registration error:', err);
      
      let errorMessage = 'Ошибка при регистрации. Попробуйте еще раз.';
      
      if (typeof err === 'object' && err !== null) {
        const error = err as { data?: { message?: string }; message?: string; status?: number };
        
        // Обрабатываем разные типы ошибок
        if (error.status === 400) {
          errorMessage = 'Некорректные данные. Проверьте введенную информацию';
        } else if (error.status === 409) {
          errorMessage = 'Пользователь с таким email уже существует';
        } else if (error.status === 422) {
          errorMessage = 'Пароль не соответствует требованиям безопасности';
        } else if (error.status >= 500) {
          errorMessage = 'Ошибка сервера. Попробуйте позже';
        } else {
          errorMessage = error?.data?.message || error?.message || errorMessage;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.title}>Создать аккаунт</h1>
          <p className={styles.subtitle}>Присоединяйтесь к нашему сообществу!</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}


          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Введите ваш email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="role" className={styles.label}>
              Роль
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="CANDIDATE">Кандидат</option>
              <option value="HR">HR-менеджер</option>
              <option value="UNIVERSITY">Университет</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Создайте пароль"
              required
              minLength={6}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Подтвердите пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              placeholder="Повторите пароль"
              required
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={styles.checkbox} 
                required
              />
              <span className={styles.checkboxText}>
                Я согласен с{' '}
                <Link href="/terms" className={styles.termsLink}>
                  условиями использования
                </Link>
                {' '}и{' '}
                <Link href="/privacy" className={styles.termsLink}>
                  политикой конфиденциальности
                </Link>
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p className={styles.footerText}>
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className={styles.link}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
