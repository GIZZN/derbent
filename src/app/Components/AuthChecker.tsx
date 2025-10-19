'use client';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { checkAuthValidity } from '../../lib/authErrorHandler';

export default function AuthChecker() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const validateAuth = async () => {
      // Если пользователь загружен, проверяем валидность
      if (user && !isLoading) {
        const isValid = await checkAuthValidity();
        if (!isValid) {
          console.log('🚫 Auth validation failed, user will be logged out');
        }
      }
    };

    // Проверяем авторизацию при загрузке
    validateAuth();

    // Проверяем авторизацию каждые 5 минут
    const interval = setInterval(validateAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, isLoading]);

  // Этот компонент не рендерит ничего, только проверяет авторизацию
  return null;
}
