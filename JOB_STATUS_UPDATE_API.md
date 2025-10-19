# API для обновления статуса вакансии

## Описание функциональности

Реализован полный API для обновления статуса вакансий в разделе "Мои вакансии" с красивым интерфейсом выбора статуса.

## API Endpoint

### 🔗 **Endpoint**
```
PATCH /jobs/{job_id}
```

### 🔐 **Аутентификация**
```
Authorization: Bearer <token>
Content-Type: application/json
```

### 📝 **Тело запроса**
```json
{
  "status": "ACTIVE"
}
```

### 🎯 **Доступные статусы**
- **ACTIVE** - Активная вакансия (зеленый)
- **PAUSED** - Приостановлена (желтый)
- **CLOSED** - Закрыта (красный)
- **DRAFT** - Черновик (серый)
- **ARCHIVED** - Архивирована (фиолетовый)

### 📤 **Ответ API**
```json
{
  "id": "job_id",
  "title": "Frontend Developer",
  "description": "Описание вакансии...",
  "status": "ACTIVE",
  "type": "FULL_TIME",
  "experienceLevel": "MIDDLE",
  "location": "Москва",
  "remote": false,
  "salaryMin": 100000,
  "salaryMax": 200000,
  "currency": "RUB",
  "createdAt": "2025-10-18T16:49:17.000Z",
  "updatedAt": "2025-10-18T16:49:17.000Z",
  "hr": {
    "id": "hr_profile_id",
    "firstName": "Иван",
    "lastName": "Петров",
    "company": "IT Company"
  },
  "skills": [
    {
      "id": "skill_id",
      "name": "React",
      "category": "Frontend"
    }
  ]
}
```

## Реализованные компоненты

### 1. **API Integration** (`src/lib/api/jobsApi.ts`)
```typescript
updateJobStatus: builder.mutation<Job, { jobId: string; status: string }>({
  query: ({ jobId, status }) => ({
    url: `/jobs/${jobId}`,
    method: 'PATCH',
    body: { status },
  }),
  invalidatesTags: (result, error, { jobId }) => [
    { type: 'Job', id: jobId },
    'Job',
    'MyJobs',
  ],
})
```

### 2. **UI Components** (`src/app/jobs/my/page.tsx`)
- **Кликабельный статус**: кнопка с иконкой стрелки
- **Модальное окно**: выбор нового статуса
- **Обработчики**: `handleStatusChangeClick`, `handleStatusUpdate`
- **Состояние**: `showStatusModal`, `selectedStatus`

### 3. **Стили** (`src/app/jobs/my/my-jobs.module.css`)
- **Кнопка статуса**: `.jobStatusButton` с hover-эффектами
- **Модальное окно**: `.statusOptions`, `.statusOption`
- **Индикаторы**: цветные точки для каждого статуса
- **Адаптивность**: корректное отображение на мобильных

## Пользовательский опыт

### 🎯 **Как это работает:**

1. **HR видит статус вакансии** в карточке (кликабельный с иконкой)
2. **Нажимает на статус** → открывается модальное окно
3. **Выбирает новый статус** из списка с цветовыми индикаторами
4. **Нажимает "Обновить статус"** → статус меняется
5. **Список обновляется** автоматически

### 🎨 **Визуальные особенности:**

- **Кликабельный статус**: кнопка с иконкой стрелки вниз
- **Цветовая индикация**: каждый статус имеет свой цвет
- **Модальное окно**: красивое окно с опциями статусов
- **Hover-эффекты**: подъем элементов при наведении
- **Анимации**: плавные переходы и трансформации

## Цветовая схема статусов

| Статус | Цвет | Описание |
|--------|------|----------|
| **ACTIVE** | 🟢 `#10b981` | Активная вакансия |
| **PAUSED** | 🟡 `#f59e0b` | Приостановлена |
| **CLOSED** | 🔴 `#ef4444` | Закрыта |
| **DRAFT** | 🔘 `#6b7280` | Черновик |
| **ARCHIVED** | 🟣 `#8b5cf6` | Архивирована |

## Технические детали

### **Обработчик изменения статуса:**
```typescript
const handleStatusChangeClick = (jobId: string, currentStatus: string) => {
  setShowStatusModal(jobId);
  setSelectedStatus(currentStatus);
};
```

### **API вызов:**
```typescript
const handleStatusUpdate = async () => {
  try {
    await updateJobStatus({ 
      jobId: showStatusModal, 
      status: selectedStatus 
    }).unwrap();
    setShowStatusModal(null);
    refetch(); // Автообновление списка
  } catch (error) {
    console.error('Failed to update job status:', error);
  }
};
```

### **Условное отображение:**
```jsx
<button 
  className={styles.jobStatusButton}
  style={{ color: getJobStatusColor(job.status) }}
  onClick={() => handleStatusChangeClick(job.id, job.status)}
  title="Изменить статус вакансии"
>
  {getJobStatusLabel(job.status)}
  <svg>...</svg>
</button>
```

## Адаптивность

### **Десктоп:**
- Полноразмерные кнопки статусов
- Модальное окно с полными опциями
- Hover-эффекты и анимации

### **Мобильные устройства:**
- Компактные кнопки статусов
- Адаптивное модальное окно
- Уменьшенные размеры элементов

## Безопасность

- ✅ **Проверка роли**: только HR может изменять статусы
- ✅ **Валидация**: проверка выбранного статуса
- ✅ **Обработка ошибок**: логирование неудачных попыток
- ✅ **Автообновление**: актуальное состояние после изменений

## Дополнительные возможности

### **Интеграция с существующим функционалом:**
- ✅ Работает с кнопкой "Опубликовать" (DRAFT → ACTIVE)
- ✅ Совместимо с редактированием вакансий
- ✅ Сохраняет все существующие функции

### **UX улучшения:**
- ✅ Интуитивно понятные иконки и цвета
- ✅ Плавные анимации и переходы
- ✅ Четкая обратная связь при изменениях
- ✅ Адаптивный дизайн для всех устройств

Функциональность полностью готова к использованию! 🚀
