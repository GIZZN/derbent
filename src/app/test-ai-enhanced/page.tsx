'use client';
import { useState } from 'react';
import AIAssistant from '../Components/AIAssistant';

// Тестовые данные вакансий
const testJobs = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Москва',
    type: 'FULL_TIME',
    salary: '150,000 - 200,000 ₽',
    description: 'Разработка пользовательских интерфейсов на React',
    tags: ['React', 'JavaScript', 'TypeScript', 'CSS'],
    postedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Backend Developer',
    company: 'DataSoft',
    location: 'Санкт-Петербург',
    type: 'FULL_TIME',
    salary: '120,000 - 180,000 ₽',
    description: 'Разработка серверных приложений на Node.js',
    tags: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
    postedAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'Стажировка в Data Science',
    company: 'AI University',
    location: 'Казань',
    type: 'INTERNSHIP',
    salary: '30,000 - 50,000 ₽',
    description: 'Стажировка в области машинного обучения',
    tags: ['Python', 'Machine Learning', 'Data Analysis', 'Стажировка'],
    postedAt: '2024-01-13'
  }
];

export default function TestAIEnhancedPage() {
  const [currentRole, setCurrentRole] = useState<'CANDIDATE' | 'HR' | 'UNIVERSITY' | 'ADMIN'>('CANDIDATE');
  const [currentPage, setCurrentPage] = useState('/jobs');

  // Имитируем изменение URL для тестирования
  const mockLocation = {
    pathname: currentPage,
    href: `http://localhost:3000${currentPage}`
  };

  // Переопределяем window.location для тестирования
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          color: '#333',
          fontSize: '2rem'
        }}>
          🤖 Тестирование улучшенного AI ассистента
        </h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Панель управления */}
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Настройки тестирования</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Роль пользователя:
              </label>
              <select 
                value={currentRole} 
                onChange={(e) => setCurrentRole(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
              >
                <option value="CANDIDATE">Кандидат</option>
                <option value="HR">HR-специалист</option>
                <option value="UNIVERSITY">Университет</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Текущая страница:
              </label>
              <select 
                value={currentPage} 
                onChange={(e) => setCurrentPage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
              >
                <option value="/jobs">Вакансии</option>
                <option value="/companies">Стажировки</option>
                <option value="/resume">Резюме</option>
                <option value="/hr">HR панель</option>
                <option value="/admin">Админ панель</option>
                <option value="/universities">Панель университета</option>
              </select>
            </div>
          </div>

          {/* Информация о контексте */}
          <div style={{
            background: '#e8f5e8',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #c3e6c3'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#2d5a2d' }}>Текущий контекст</h3>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p><strong>Роль:</strong> {currentRole}</p>
              <p><strong>Страница:</strong> {currentPage}</p>
              <p><strong>Доступно вакансий:</strong> {testJobs.length}</p>
              <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#666' }}>
                AI ассистент будет адаптироваться под эту роль и страницу, 
                предлагая соответствующие быстрые действия и контекстные ответы.
              </p>
            </div>
          </div>
        </div>

        {/* Демонстрация возможностей */}
        <div style={{
          background: '#fff3cd',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #ffeaa7',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#856404' }}>✨ Новые возможности AI ассистента:</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li><strong>Контекстное понимание:</strong> AI знает вашу роль и текущую страницу</li>
            <li><strong>Персонализированные приветствия:</strong> Разные сообщения для разных ролей</li>
            <li><strong>Быстрые действия:</strong> Кнопки для частых задач в зависимости от роли</li>
            <li><strong>Умные placeholder'ы:</strong> Подсказки в поле ввода адаптируются под контекст</li>
            <li><strong>Контекстные ответы:</strong> AI учитывает роль при ответах</li>
            <li><strong>Markdown поддержка:</strong> AI ответы отображаются с форматированием (списки, жирный текст, код)</li>
          </ul>
        </div>

        {/* Демонстрация Markdown */}
        <div style={{
          background: '#e8f5e8',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #c3e6c3',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#2d5a2d' }}>📝 Markdown поддержка</h3>
          <p style={{ marginBottom: '1rem', color: '#2d5a2d' }}>
            Теперь AI ассистент корректно отображает Markdown форматирование:
          </p>
          <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            <p><strong>Примеры поддерживаемого форматирования:</strong></p>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              <li><strong>Жирный текст</strong> и <em>курсив</em></li>
              <li>• Списки с маркерами</li>
              <li>1. Нумерованные списки</li>
              <li><code>Код в тексте</code></li>
              <li>Цитаты и выделение</li>
            </ul>
          </div>
        </div>

        {/* AI ассистент */}
        <div style={{ position: 'relative', minHeight: '400px' }}>
          <AIAssistant jobs={testJobs} />
        </div>

        {/* Инструкции */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#495057' }}>📋 Как тестировать:</h3>
          <ol style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li>Измените роль пользователя и страницу в настройках выше</li>
            <li>Нажмите на кнопку "AI Помощник" в правом нижнем углу</li>
            <li>Обратите внимание на персонализированное приветствие</li>
            <li>Попробуйте быстрые действия (кнопки под приветствием)</li>
            <li>Задайте вопросы - AI будет отвечать с учетом вашей роли</li>
            <li><strong>Протестируйте Markdown:</strong> Попросите AI составить список или выделить важные моменты</li>
            <li>Попробуйте разные комбинации ролей и страниц</li>
          </ol>
          
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#e3f2fd',
            borderRadius: '6px',
            border: '1px solid #bbdefb'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1565c0' }}>
              <strong>💡 Совет:</strong> Попробуйте спросить AI: "Составь список критериев для поиска студентов" 
              или "Опиши пошаговый план создания вакансии" - вы увидите красивое Markdown форматирование!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
