'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, getUserData } from '../lib/api/authApi';
import { RootState } from '../lib/store';
import { setUser, setLoading, login, logout, updateUser } from '../lib/slices/authSlice';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  // Проверка авторизации при загрузке и слушание изменений
  useEffect(() => {
    const initAuth = () => {
      const userData = getUserData();
      
      console.log('🔍 AuthContext: Checking user data:', userData);
      
      if (userData) {
        dispatch(setUser(userData));
        console.log('✅ AuthContext: User is authenticated');
      } else {
        console.log('❌ AuthContext: No user data found');
      }
      
      dispatch(setLoading(false));
    };

    // Слушаем изменения авторизации
    const handleAuthChange = (event: CustomEvent) => {
      console.log('🔄 AuthContext: Auth state changed:', event.detail);
      if (event.detail) {
        dispatch(setUser(event.detail));
      } else {
        dispatch(setUser(null));
      }
    };

    // Инициализируем только если мы в браузере
    if (typeof window !== 'undefined') {
      initAuth();

      // Подписываемся на изменения авторизации
      window.addEventListener('auth-changed', handleAuthChange as EventListener);

      return () => {
        window.removeEventListener('auth-changed', handleAuthChange as EventListener);
      };
    } else {
      // На сервере просто устанавливаем loading в false
      dispatch(setLoading(false));
    }
  }, []);

  const loginUser = (userData: User) => {
    console.log('🎉 AuthContext: Login called with user:', userData);
    dispatch(login(userData));
    // Сохраняем данные пользователя в localStorage (токен уже в httpOnly cookie)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(userData));
      // Уведомляем другие компоненты об успешной авторизации
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: userData }));
    }
  };

  const logoutUser = async () => {
    console.log('👋 AuthContext: Logout called');
    try {
      // Очистка данных пользователя
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        
        // Очищаем все cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        });
      }
      dispatch(logout());
      console.log('✅ AuthContext: User logged out');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
    }
  };

  const updateUserData = (userData: User) => {
    dispatch(updateUser(userData));
    // Обновляем данные в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: loginUser,
    logout: logoutUser,
    updateUser: updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
