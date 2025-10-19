'use client';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../app/Components/NotificationProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </Provider>
  );
}
