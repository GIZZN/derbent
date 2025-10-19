// Централизованная обработка ошибок авторизации
export const handleAuthError = (status: number, response?: Response, context?: string) => {
  // 401 - всегда критическая ошибка (неавторизован)
  if (status === 401) {
    console.log('🚫 Critical auth error (401) detected, clearing user data');
    clearUserData();
    return;
  }
  
  // 403 - проверяем контекст
  if (status === 403) {
    // Если это ошибка доступа к конкретному ресурсу (не критическая)
    if (context === 'permission_denied' || 
        context === 'resource_permission_denied' ||
        (response && response.headers.get('x-error-type') === 'permission_denied')) {
      console.log('⚠️ Permission denied (403) - not clearing user data');
      return;
    }
    
    // Дополнительная проверка по URL - если это эндпоинты, которые могут возвращать 403 по правам доступа
    if (response) {
      const url = response.url || '';
      const isPermissionEndpoint = url.includes('/applications/') || 
                                 url.includes('/jobs/') || 
                                 url.includes('/students/') ||
                                 url.includes('/internships/') ||
                                 url.includes('/resumes/');
      
      if (isPermissionEndpoint) {
        console.log('⚠️ Resource permission denied (403) - not clearing user data');
        return;
      }
    }
    
    // Если это критическая ошибка авторизации
    console.log('🚫 Critical auth error (403) detected, clearing user data');
    clearUserData();
    return;
  }
};

// Функция для очистки данных пользователя
const clearUserData = () => {
  if (typeof window !== 'undefined') {
    // Очищаем localStorage
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    
    // Очищаем все cookies (если возможно)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
    
    // Уведомляем AuthContext об изменении авторизации
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
  }
};

// Функция для определения типа ошибки по тексту ответа
export const determineErrorContext = (errorText: string, url: string): string => {
  // Проверяем текст ошибки на наличие фраз о правах доступа
  const permissionPhrases = [
    'У вас нет прав',
    'permission denied',
    'access denied',
    'недостаточно прав',
    'insufficient permissions',
    'forbidden',
    'доступ запрещен'
  ];
  
  const isPermissionError = permissionPhrases.some(phrase => 
    errorText.toLowerCase().includes(phrase.toLowerCase())
  );
  
  if (isPermissionError) {
    return 'permission_denied';
  }
  
  // Проверяем URL на наличие эндпоинтов, которые могут возвращать 403 по правам
  const permissionEndpoints = [
    '/applications/',
    '/jobs/',
    '/students/',
    '/internships/',
    '/resumes/',
    '/analytics/',
    '/users/'
  ];
  
  const isPermissionEndpoint = permissionEndpoints.some(endpoint => 
    url.includes(endpoint)
  );
  
  if (isPermissionEndpoint) {
    return 'resource_permission_denied';
  }
  
  return 'unknown';
};

// Функция для проверки и очистки устаревших данных
export const checkAuthValidity = async () => {
  try {
    // Проверяем, есть ли данные пользователя
    const userData = localStorage.getItem('user_data');
    if (!userData) return false;
    
    // Можно добавить дополнительную проверку с сервером
    // const response = await fetch('/auth/me', { credentials: 'include' });
    // if (!response.ok) {
    //   handleAuthError(response.status);
    //   return false;
    // }
    
    return true;
  } catch (error) {
    console.error('Auth validity check failed:', error);
    handleAuthError(401);
    return false;
  }
};
