import { useState, useEffect } from 'react';

/**
 * Хук для получения Bearer token из localStorage или cookies
 * @returns Bearer token или null
 */
export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Пытаемся получить токен из localStorage
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      return;
    }

    // Если токена нет в localStorage, пытаемся получить из cookies
    const getCookieValue = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };

    const cookieToken = getCookieValue('authToken');
    if (cookieToken) {
      setToken(cookieToken);
      return;
    }

    // Если токена нет, можно попробовать получить из других источников
    // Например, из Redux store или контекста
    setToken(null);
  }, []);

  return token;
}

/**
 * Хук для получения HR токена
 * @returns HR Bearer token или null
 */
export function useHRToken(): string | null {
  const [hrToken, setHRToken] = useState<string | null>(null);

  useEffect(() => {
    // Пытаемся получить HR токен из localStorage
    const storedHRToken = localStorage.getItem('hrToken');
    if (storedHRToken) {
      setHRToken(storedHRToken);
      return;
    }

    // Если HR токена нет, используем общий токен
    const generalToken = localStorage.getItem('authToken');
    if (generalToken) {
      setHRToken(generalToken);
      return;
    }

    setHRToken(null);
  }, []);

  return hrToken;
}
