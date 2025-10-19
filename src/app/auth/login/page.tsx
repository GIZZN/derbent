'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '../../../lib/api/authApi';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState('');
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Вход в систему через RTK Query
      const result = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();
      
      console.log('✅ Login successful:', result);
      
      // Обновляем состояние авторизации в контексте
      authLogin(result.user);
      
      // Перенаправление на главную страницу через Next.js router
      router.push('/');
    } catch (err: unknown) {
      console.error('❌ Login error:', err);
      
      let errorMessage = 'Неверный email или пароль';
      
      if (typeof err === 'object' && err !== null) {
        const error = err as { data?: { message?: string }; message?: string; status?: number };
        
        // Обрабатываем разные типы ошибок
        if (error.status === 401) {
          errorMessage = 'Неверный email или пароль';
        } else if (error.status === 403) {
          errorMessage = 'Доступ запрещен';
        } else if (error.status === 429) {
          errorMessage = 'Слишком много попыток входа. Попробуйте позже';
        } else if (error.status >= 500) {
          errorMessage = 'Ошибка сервера. Попробуйте позже';
        } else {
          errorMessage = error?.data?.message || error?.message || errorMessage;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.title}>Вход в аккаунт</h1>
          <p className={styles.subtitle}>Добро пожаловать обратно!</p>
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
              placeholder="Введите ваш пароль"
              required
            />
          </div>

          <div className={styles.options}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" className={styles.checkbox} />
              <span className={styles.checkboxText}>Запомнить меня</span>
            </label>
            <Link href="/auth/forgot-password" className={styles.forgotLink}>
              Забыли пароль?
            </Link>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p className={styles.footerText}>
            Нет аккаунта?{' '}
            <Link href="/auth/register" className={styles.link}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
