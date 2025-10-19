'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation, getUserData, User } from '../../lib/api/authApi';
import { RootState } from '../../lib/store';
import { setUser, setLoading } from '../../lib/slices/authSlice';
import styles from './Header.module.css';

function HeaderContent() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const userData = getUserData();
    
    // Обновляем состояние в RTK store
    dispatch(setUser(userData));
    dispatch(setLoading(false));

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.profileDropdown}`) && !target.closest(`.${styles.profileMenuButton}`)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      setIsMenuOpen(false);
      setIsProfileMenuOpen(false);
      
      // Очищаем состояние в RTK store
      dispatch(setUser(null));
      
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Очищаем состояние в RTK store даже при ошибке
      dispatch(setUser(null));
      
      window.location.href = '/';
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo1.png" 
            alt="Logo" 
            width={320}
            height={368}
            className={styles.logoIcon}
            priority
          />
        </Link>
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <ul className={styles.navList}>
            <li>
              <Link href="/jobs" className={styles.navLink}>
                Вакансии
              </Link>
            </li>
            <li>
              <Link href="/companies" className={styles.navLink}>
                Стажировки
              </Link>
            </li>
            {isAuthenticated && user?.role === 'CANDIDATE' && (
              <li>
                <Link href="/resume" className={styles.navLink}>
                  Резюме
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'HR' && (
              <>
                <li>
                  <Link href="/hr" className={styles.navLink}>
                    HR Панель
                  </Link>
                </li>
                <li>
                  <Link href="/jobs/my" className={styles.navLink}>
                    Мои вакансии
                  </Link>
                </li>
                <li>
                  <Link href="/companies/internships" className={styles.navLink}>
                    Мои стажировки
                  </Link>
                </li>
                <li>
                  <Link href="/companies/internship-requests" className={styles.navLink}>
                    Заявки от вузов
                  </Link>
                </li>
              </>
            )}
            {isAuthenticated && user?.role === 'UNIVERSITY' && (
              <>
                <li>
                  <Link href="/universities/students" className={styles.navLink}>
                    Мои студенты
                  </Link>
                </li>
                <li>
                  <Link href="/universities/internship-requests" className={styles.navLink}>
                    Заявки на стажировки
                  </Link>
                </li>
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <li>
                <Link href="/admin" className={styles.navLink}>
                  Админка
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className={styles.actions} suppressHydrationWarning>
          {isAuthenticated ? (
            <>
              <div className={styles.profileMenu}>
                <button 
                  onClick={toggleProfileMenu}
                  className={styles.profileMenuButton}
                >
                  <div className={styles.userAvatar}>
                    {user?.avatarUrl ? (
                      <Image 
                        src={user.avatarUrl} 
                        alt="Avatar" 
                        width={40}
                        height={40}
                        className={styles.avatarImage}
                        priority
                      />
                    ) : (
                      user?.email?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>
                      {user?.email?.split('@')[0] || 'Пользователь'}
                    </span>
                    <span className={styles.userRole}>
                      {user?.role === 'HR' ? 'HR' : 
                       user?.role === 'CANDIDATE' ? 'Кандидат' : 
                       user?.role === 'UNIVERSITY' ? 'Университет' :
                       user?.role === 'ADMIN' ? 'Администратор' :
                       user?.role === 'MODERATOR' ? 'Модератор' : 'Пользователь'}
                    </span>
                  </div>
                  <svg 
                    className={`${styles.dropdownIcon} ${isProfileMenuOpen ? styles.dropdownIconOpen : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div className={styles.profileDropdown}>
                    <Link 
                      href="/profile" 
                      className={styles.profileDropdownItem}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      Профиль
                    </Link>
                    
                    {user?.role === 'HR' && (
                      <Link 
                        href="/jobs/my" 
                        className={styles.profileDropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Мои вакансии
                      </Link>
                    )}
                    
                    {user?.role === 'ADMIN' && (
                      <Link 
                        href="/admin" 
                        className={styles.profileDropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Админ-панель
                      </Link>
                    )}
                    
                    {user?.role === 'CANDIDATE' && (
                      <Link 
                        href="/resume" 
                        className={styles.profileDropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Резюме
                      </Link>
                    )}
                    
                    {user?.role === 'UNIVERSITY' && (
                      <Link 
                        href="/universities" 
                        className={styles.profileDropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 14l6.16-3.422A12.083 12.083 0 0118 8.875L6 14.344a12.093 12.093 0 01-6.16-3.422L12 14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Панель университета
                      </Link>
                    )}
                    
                    <div className={styles.profileDropdownDivider}></div>
                    
                    <button 
                      onClick={handleLogout}
                      className={`${styles.profileDropdownItem} ${styles.profileDropdownItemDanger}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Выйти
                    </button>
                  </div>
                )}
              </div>
              
              {user?.role === 'HR' && (
                <Link href="/jobs/create" className={styles.primaryBtn}>
                  <span>Создать вакансию</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/auth/login" className={styles.loginBtn}>
                Войти
              </Link>
              <Link href="/auth/register" className={styles.registerBtn}>
                Регистрация
              </Link>
            </>
          )}
        </div>
        <div className={styles.mobileActions} suppressHydrationWarning>
          {isAuthenticated && (
            <div className={styles.profileMenu}>
              <button 
                onClick={toggleProfileMenu}
                className={styles.profileMenuButton}
              >
                <div className={styles.userAvatar}>
                  {user?.avatarUrl ? (
                    <Image 
                      src={user.avatarUrl} 
                      alt="Avatar" 
                      width={40}
                      height={40}
                      className={styles.avatarImage}
                      priority
                    />
                  ) : (
                    user?.email?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {user?.email?.split('@')[0] || 'Пользователь'}
                  </span>
                  <span className={styles.userRole}>
                    {user?.role === 'HR' ? 'HR' : user?.role === 'CANDIDATE' ? 'Кандидат' : 'Университет'}
                  </span>
                </div>
                <svg 
                  className={`${styles.dropdownIcon} ${isProfileMenuOpen ? styles.dropdownIconOpen : ''}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none"
                >
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Выпадающее меню для мобильных */}
              {isProfileMenuOpen && (
                <div className={styles.profileDropdown}>
                  <Link 
                    href="/profile" 
                    className={styles.profileDropdownItem}
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Профиль
                  </Link>
                  
                  {user?.role === 'HR' && (
                    <>
                      <Link 
                        href="/jobs/my" 
                        className={styles.profileDropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Мои вакансии
                      </Link>
                      
                      <Link 
                        href="/jobs/create" 
                        className={styles.profileDropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                        Создать вакансию
                      </Link>
                    </>
                  )}
                  
                  {user?.role === 'CANDIDATE' && (
                    <Link 
                      href="/resume" 
                      className={styles.profileDropdownItem}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Резюме
                    </Link>
                  )}
                  
                  {user?.role === 'UNIVERSITY' && (
                    <Link 
                      href="/universities" 
                      className={styles.profileDropdownItem}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14l6.16-3.422A12.083 12.083 0 0118 8.875L6 14.344a12.093 12.093 0 01-6.16-3.422L12 14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Панель университета
                    </Link>
                  )}
                  
                  {user?.role === 'ADMIN' && (
                    <Link 
                      href="/admin" 
                      className={styles.profileDropdownItem}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Админ-панель
                    </Link>
                  )}
                  
                  <div className={styles.profileDropdownDivider}></div>
                  
                  <button 
                    onClick={handleLogout}
                    className={`${styles.profileDropdownItem} ${styles.profileDropdownItemDanger}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Выйти
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          className={`${styles.mobileMenu} ${isMenuOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="Открыть меню"
        >
          <div className={styles.menuIconWrapper}>
            <div className={`${styles.menuIconLine} ${styles.half} ${styles.first}`}></div>
            <div className={styles.menuIconLine}></div>
            <div className={`${styles.menuIconLine} ${styles.half} ${styles.last}`}></div>
          </div>
        </button>
      </div>

      {isMenuOpen && (
        <div className={styles.mobileNav}>
          <ul className={styles.mobileNavList}>
            <li>
              <Link href="/jobs" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                Вакансии
              </Link>
            </li>
            <li>
              <Link href="/companies" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                Стажировки
              </Link>
            </li>
            {isAuthenticated && user?.role === 'CANDIDATE' && (
              <li>
                <Link href="/resume" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                  Резюме
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'HR' && (
              <>
                <li>
                  <Link href="/hr" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                    HR Панель
                  </Link>
                </li>
                <li>
                  <Link href="/jobs/my" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                    Мои вакансии
                  </Link>
                </li>
                <li>
                  <Link href="/companies/internships" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                    Мои стажировки
                  </Link>
                </li>
                <li>
                  <Link href="/companies/internship-requests" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                    Заявки от вузов
                  </Link>
                </li>
              </>
            )}
            {isAuthenticated && user?.role === 'UNIVERSITY' && (
              <>
                <li>
                  <Link href="/universities/students" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                    Мои студенты
                  </Link>
                </li>
                <li>
                  <Link href="/universities/internship-requests" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                    Заявки на стажировки
                  </Link>
                </li>
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <li>
                <Link href="/admin" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                  Админка
                </Link>
              </li>
            )}
            <li>
              <Link href="/about" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                О нас
              </Link>
            </li>
          </ul>
          <div className={styles.mobileActionsOld} suppressHydrationWarning>
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login" className={styles.mobileLoginBtn} onClick={() => setIsMenuOpen(false)}>
                  Войти
                </Link>
                <Link href="/auth/register" className={styles.mobileRegisterBtn} onClick={() => setIsMenuOpen(false)}>
                  Регистрация
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}

// Экспортируем компонент с отключенным SSR для избежания проблем с гидратацией
export default dynamic(() => Promise.resolve(HeaderContent), {
  ssr: false,
  loading: () => (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo1.png" 
            alt="Logo" 
            width={320}
            height={368}
            className={styles.logoIcon}
            priority
          />
        </Link>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link href="/jobs" className={styles.navLink}>
                Вакансии
              </Link>
            </li>
            <li>
              <Link href="/companies" className={styles.navLink}>
                Стажировки
              </Link>
            </li>
          </ul>
        </nav>
        <div className={styles.actions}>
          <Link href="/auth/login" className={styles.loginBtn}>
            Войти
          </Link>
          <Link href="/auth/register" className={styles.registerBtn}>
            Регистрация
          </Link>
        </div>
      </div>
    </header>
  )
});
