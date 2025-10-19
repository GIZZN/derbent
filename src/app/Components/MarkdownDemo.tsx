'use client';

import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import styles from './MarkdownDemo.module.css';

const MarkdownDemo: React.FC = () => {
  const [markdownContent, setMarkdownContent] = useState(`# 🤖 AI Анализ кандидатов

## 📊 Результаты анализа

**Общая статистика:**
- Проанализировано: **25 кандидатов**
- Время обработки: **2.5 секунды**
- Найдено отличных кандидатов: **3**

### 🏆 Топ кандидаты

#### 1. Иван Петров - **9/10**
- **Соответствие:** 95%
- **Уровень:** Высокий

**Сильные стороны:**
- ✅ 5+ лет опыта в React
- ✅ Опыт работы в крупных проектах
- ✅ Знание TypeScript и современных инструментов

**Области для улучшения:**
- ⚠️ Отсутствует опыт с GraphQL
- ⚠️ Нет опыта работы в команде более 10 человек

**Рекомендации:**
- 💡 Приоритетный кандидат для собеседования
- 💡 Рекомендуется техническое интервью
- 💡 Проверить опыт работы в команде

---

#### 2. Мария Сидорова - **7/10**
- **Соответствие:** 78%
- **Уровень:** Средний

**Сильные стороны:**
- ✅ Хорошие базовые навыки React
- ✅ Мотивация к обучению
- ✅ Опыт работы в стартапе

**Области для улучшения:**
- ⚠️ Недостаточно опыта с Redux
- ⚠️ Отсутствует опыт с тестированием

**Рекомендации:**
- 💡 Рассмотреть для junior позиции
- 💡 Провести техническое интервью
- 💡 Оценить потенциал роста

---

## 📈 Детальный анализ

### Критерии оценки

| Критерий | Вес | Описание |
|----------|-----|----------|
| **Навыки** | 40% | Соответствие техническим требованиям |
| **Опыт** | 30% | Релевантный опыт работы |
| **Образование** | 15% | Соответствие образовательным требованиям |
| **Качество заявки** | 15% | Анализ резюме и сопроводительного письма |

### Статистика по навыкам

\`\`\`javascript
const skillsAnalysis = {
  "React": { "candidates": 20, "average": 7.5 },
  "TypeScript": { "candidates": 15, "average": 6.8 },
  "Redux": { "candidates": 12, "average": 6.2 },
  "Testing": { "candidates": 8, "average": 5.5 }
};
\`\`\`

## 🎯 Итоговые рекомендации

> **Важно:** AI анализ является вспомогательным инструментом и не заменяет личную оценку HR-специалиста.

### Следующие шаги:
1. **Провести собеседования** с топ-3 кандидатами
2. **Техническое интервью** для проверки навыков
3. **Оценить культурное соответствие** команде
4. **Принять финальное решение** на основе всех факторов

---

*Анализ выполнен с помощью AI • Время: ${new Date().toLocaleString('ru-RU')}*`);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>📝 Markdown Demo - AI Анализ</h2>
        <p className={styles.subtitle}>
          Демонстрация возможностей отображения Markdown в результатах AI анализа
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.editorSection}>
          <h3 className={styles.sectionTitle}>Редактор Markdown</h3>
          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            className={styles.textarea}
            placeholder="Введите Markdown контент..."
          />
        </div>

        <div className={styles.previewSection}>
          <h3 className={styles.sectionTitle}>Предварительный просмотр</h3>
          <div className={styles.preview}>
            <MarkdownRenderer content={markdownContent} />
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <h3 className={styles.featuresTitle}>🎨 Поддерживаемые возможности</h3>
        <div className={styles.featuresGrid}>
          <div className={styles.feature}>
            <h4>📝 Текст</h4>
            <ul>
              <li>Заголовки (H1-H6)</li>
              <li>Параграфы</li>
              <li>**Жирный текст**</li>
              <li>*Курсив*</li>
              <li>~~Зачеркнутый~~</li>
            </ul>
          </div>
          
          <div className={styles.feature}>
            <h4>📋 Списки</h4>
            <ul>
              <li>Маркированные списки</li>
              <li>Нумерованные списки</li>
              <li>Вложенные списки</li>
              <li>Чек-листы</li>
            </ul>
          </div>
          
          <div className={styles.feature}>
            <h4>🔗 Ссылки</h4>
            <ul>
              <li>Обычные ссылки</li>
              <li>Автоматические ссылки</li>
              <li>Ссылки с описанием</li>
            </ul>
          </div>
          
          <div className={styles.feature}>
            <h4>💻 Код</h4>
            <ul>
              <li>Инлайн код</li>
              <li>Блоки кода</li>
              <li>Подсветка синтаксиса</li>
            </ul>
          </div>
          
          <div className={styles.feature}>
            <h4>📊 Таблицы</h4>
            <ul>
              <li>Таблицы с заголовками</li>
              <li>Выравнивание</li>
              <li>Стилизация</li>
            </ul>
          </div>
          
          <div className={styles.feature}>
            <h4>💬 Цитаты</h4>
            <ul>
              <li>Блоки цитат</li>
              <li>Вложенные цитаты</li>
              <li>Стилизация</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownDemo;
