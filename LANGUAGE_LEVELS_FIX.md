# 🌍 Исправление уровней владения языками

## ❌ Проблема

В системе резюме использовались русские значения для уровней владения языками:
```json
"level": "Носитель"
"level": "Продвинутый"
"level": "Средний"
```

## ✅ Решение

Переход на стандартные английские значения уровней владения языками:

### 1. **Стандартные уровни**

```typescript
type LanguageLevel = 
  | 'Basic'           // Базовый
  | 'Elementary'      // Начальный  
  | 'Intermediate'    // Средний
  | 'Upper-Intermediate' // Выше среднего
  | 'Advanced'        // Продвинутый
  | 'Fluent'          // Свободно
  | 'Native';         // Родной
```

### 2. **Обновленный интерфейс**

```typescript
export interface ResumeLanguage {
  name: string;
  level: 'Basic' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced' | 'Fluent' | 'Native';
  certification?: string;
}
```

### 3. **Селект в редакторе**

```jsx
<select
  value={language.level}
  onChange={(e) => updateLanguage(index, 'level', e.target.value)}
  className={styles.select}
>
  <option value="">Выберите уровень</option>
  <option value="Basic">Basic</option>
  <option value="Elementary">Elementary</option>
  <option value="Intermediate">Intermediate</option>
  <option value="Upper-Intermediate">Upper-Intermediate</option>
  <option value="Advanced">Advanced</option>
  <option value="Fluent">Fluent</option>
  <option value="Native">Native</option>
</select>
```

### 4. **Локализация для отображения**

```typescript
const getLanguageLevelText = (level: string) => {
  const levelMap: { [key: string]: string } = {
    'Basic': 'Базовый',
    'Elementary': 'Начальный',
    'Intermediate': 'Средний',
    'Upper-Intermediate': 'Выше среднего',
    'Advanced': 'Продвинутый',
    'Fluent': 'Свободно',
    'Native': 'Родной'
  };
  return levelMap[level] || level;
};
```

## 🎯 Преимущества

### ✅ **Стандартизация**
- Соответствие международным стандартам
- Совместимость с внешними системами
- Единообразие в API

### ✅ **Типизация**
- Строгая типизация TypeScript
- Автодополнение в IDE
- Предотвращение ошибок

### ✅ **Локализация**
- Английские значения в API
- Русские подписи в интерфейсе
- Гибкость отображения

## 📊 Сравнение уровней

| Уровень | Описание | Использование |
|---------|----------|---------------|
| **Basic** | Базовый | Минимальные знания |
| **Elementary** | Начальный | Простые фразы |
| **Intermediate** | Средний | Повседневное общение |
| **Upper-Intermediate** | Выше среднего | Рабочее общение |
| **Advanced** | Продвинутый | Профессиональное использование |
| **Fluent** | Свободно | Свободное владение |
| **Native** | Родной | Родной язык |

## 🔄 Миграция данных

### Для существующих данных:

```typescript
const migrateLanguageLevels = (languages: ResumeLanguage[]) => {
  const levelMapping: { [key: string]: string } = {
    'Начальный': 'Elementary',
    'Средний': 'Intermediate', 
    'Продвинутый': 'Advanced',
    'Носитель': 'Native'
  };
  
  return languages.map(lang => ({
    ...lang,
    level: levelMapping[lang.level] || lang.level
  }));
};
```

## 🚀 Результат

### ❌ **Было:**
```json
{
  "name": "Английский",
  "level": "Носитель"
}
```

### ✅ **Стало:**
```json
{
  "name": "Английский", 
  "level": "Native"
}
```

### 🎨 **Отображение:**
- **В API**: `"Native"`
- **В интерфейсе**: `"Родной"`

## 📝 Рекомендации

1. **Используйте стандартные значения** в API
2. **Локализуйте отображение** для пользователей
3. **Валидируйте уровни** на клиенте и сервере
4. **Документируйте маппинг** для разработчиков
