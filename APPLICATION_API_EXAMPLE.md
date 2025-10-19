# API для откликов на вакансии

## Описание

Реализован функционал отклика на вакансии с использованием API endpoint `/applications`.

## Структура запроса

### Создание отклика

```bash
curl -X POST http://localhost:3000/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job_id",
    "coverLetter": "Здравствуйте! Меня заинтересовала вакансия Frontend Developer...",
    "resumeUrl": "https://example.com/resume.pdf"
  }'
```

### Структура ответа

```json
{
  "id": "application_id",
  "jobId": "job_id",
  "candidateId": "candidate_id",
  "coverLetter": "Здравствуйте! Меня заинтересовала вакансия Frontend Developer...",
  "resumeUrl": "https://example.com/resume.pdf",
  "status": "PENDING",
  "appliedAt": "2024-01-15T00:00:00.000Z",
  "job": {
    "id": "job_id",
    "title": "Frontend Developer",
    "hr": {
      "company": "ООО Технологии"
    }
  },
  "candidate": {
    "firstName": "Анна",
    "lastName": "Смирнова"
  }
}
```

## Реализованные компоненты

### 1. API Integration (`jobsApi.ts`)

- Добавлен интерфейс `Application` с полной структурой данных
- Добавлен DTO `CreateApplicationDto` для создания откликов
- Добавлен endpoint `createApplication` для отправки откликов
- Экспортирован хук `useCreateApplicationMutation`

### 2. Компонент формы отклика (`JobApplicationForm.tsx`)

- Модальное окно с формой отклика
- Поля для сопроводительного письма и ссылки на резюме
- Валидация полей
- Обработка ошибок
- Индикатор загрузки

### 3. Интеграция в страницу вакансии

- Кнопка "Подать заявку" для кандидатов
- Модальное окно с формой отклика
- Обработка успешной отправки

## Использование

1. Пользователь с ролью `CANDIDATE` заходит на страницу вакансии
2. Нажимает кнопку "Подать заявку"
3. Заполняет форму с сопроводительным письмом и ссылкой на резюме
4. Отправляет заявку через API
5. Получает подтверждение об успешной отправке

## Типы данных

```typescript
interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  coverLetter: string;
  resumeUrl: string;
  status: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    hr: {
      company: string;
    };
  };
  candidate: {
    firstName: string;
    lastName: string;
  };
}

interface CreateApplicationDto {
  jobId: string;
  coverLetter: string;
  resumeUrl: string;
}
```

## Стили

Компонент использует CSS модули с адаптивным дизайном:
- Модальное окно с анимацией
- Адаптивная верстка для мобильных устройств
- Стилизованные поля ввода и кнопки
- Индикаторы состояния (загрузка, ошибки)
