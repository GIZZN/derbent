'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles,
  redirectTo = '/' 
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const hasPermission = allowedRoles.includes(user.role);
      
      if (!hasPermission) {
        console.log('🚫 RoleGuard: User role not allowed, redirecting to:', redirectTo);
        console.log('👤 User role:', user.role);
        console.log('✅ Allowed roles:', allowedRoles);
        router.push(redirectTo);
      }
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, router, redirectTo]);

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Проверка прав доступа...
      </div>
    );
  }

  // Если пользователь не авторизован или нет прав, не показываем контент
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
