# 🔧 Руководство по Admin API

Полное руководство по административным эндпоинтам SmartMatch для управления системой, аналитики и модерации.

## 📋 Содержание

- [Аутентификация](#аутентификация)
- [Модерация](#модерация)
- [Аналитика](#аналитика)
- [Отчеты](#отчеты)
- [Экспорт данных](#экспорт-данных)
- [Управление системой](#управление-системой)
- [Управление контентом](#управление-контентом)
- [Уведомления](#уведомления)
- [Навыки](#навыки)
- [AI и аналитика](#ai-и-аналитика)
- [Интеграции](#интеграции)

## 🔐 Аутентификация

Все административные эндпоинты требуют:
- JWT токен в заголовке `Authorization: Bearer <token>`
- Роль `ADMIN` в системе

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/admin/analytics/overview
```

## 🛡️ Модерация

### Получение вакансий на модерацию

```http
GET /admin/moderation/jobs
```

**Параметры:**
- `status` - статус модерации (PENDING, APPROVED, REJECTED, DRAFT)
- `page` - страница (по умолчанию 1)
- `limit` - количество на странице (по умолчанию 20)

**Ответ:**
```json
{
  "jobs": [
    {
      "id": "job_123",
      "title": "Frontend Developer",
      "description": "Описание вакансии",
      "hr": {
        "company": "Tech Corp",
        "firstName": "Иван",
        "lastName": "Петров"
      },
      "skills": [
        {
          "skill": {
            "name": "React",
            "category": "Frontend"
          }
        }
      ],
      "_count": {
        "applications": 5
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### Одобрение вакансии

```http
PATCH /admin/moderation/jobs/:id/approve
```

**Тело запроса:**
```json
{
  "notes": "Вакансия соответствует требованиям ОЭЗ"
}
```

### Отклонение вакансии

```http
PATCH /admin/moderation/jobs/:id/reject
```

**Тело запроса:**
```json
{
  "notes": "Несоответствие требованиям ОЭЗ"
}
```

### Возврат на доработку

```http
PATCH /admin/moderation/jobs/:id/return
```

**Тело запроса:**
```json
{
  "notes": "Требуется доработка описания"
}
```

### Массовые действия

```http
PATCH /admin/moderation/bulk-approve
PATCH /admin/moderation/bulk-reject
```

**Тело запроса:**
```json
{
  "jobIds": ["job_1", "job_2", "job_3"]
}
```

### Статистика модерации

```http
GET /admin/moderation/stats
```

**Ответ:**
```json
{
  "total": {
    "pending": 15,
    "approved": 120,
    "rejected": 8,
    "returned": 3
  },
  "today": {
    "pending": 5
  },
  "thisWeek": {
    "pending": 12
  }
}
```

### История модерации

```http
GET /admin/moderation/history
```

**Параметры:**
- `page` - страница
- `limit` - количество на странице
- `moderatorId` - ID модератора
- `status` - статус модерации

## 📊 Аналитика

### Общая статистика ОЭЗ

```http
GET /admin/analytics/overview
```

**Параметры:**
- `startDate` - начальная дата (ISO 8601)
- `endDate` - конечная дата (ISO 8601)

**Ответ:**
```json
{
  "overview": {
    "totalUsers": 1250,
    "totalJobs": 340,
    "totalApplications": 2100,
    "totalCompanies": 45,
    "totalUniversities": 12,
    "pendingModeration": 8
  },
  "recentActivity": [
    {
      "id": "event_123",
      "eventType": "JOB_CREATED",
      "user": {
        "email": "hr@company.com",
        "role": "HR"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Статистика по компаниям

```http
GET /admin/analytics/companies
```

**Ответ:**
```json
[
  {
    "name": "Tech Corp",
    "totalJobs": 25,
    "totalApplications": 180
  },
  {
    "name": "Startup Inc",
    "totalJobs": 15,
    "totalApplications": 95
  }
]
```

### Статистика по университетам

```http
GET /admin/analytics/universities
```

**Ответ:**
```json
[
  {
    "name": "МГУ",
    "address": "Москва, Ленинские горы, 1",
    "totalStudents": 150,
    "totalEducations": 45
  }
]
```

### Статистика по навыкам

```http
GET /admin/analytics/skills
```

**Ответ:**
```json
[
  {
    "id": "skill_123",
    "name": "React",
    "category": "Frontend",
    "demandScore": 8.5,
    "totalCandidates": 120,
    "totalStudents": 85,
    "totalJobs": 45
  }
]
```

### Детальная аналитика по вакансиям

```http
GET /admin/analytics/jobs
```

**Ответ:**
```json
{
  "totalJobs": 340,
  "jobsByStatus": [
    {
      "status": "ACTIVE",
      "_count": 280
    },
    {
      "status": "PAUSED",
      "_count": 45
    }
  ],
  "jobsByType": [
    {
      "type": "FULL_TIME",
      "_count": 200
    },
    {
      "type": "INTERNSHIP",
      "_count": 80
    }
  ],
  "jobsByLocation": [
    {
      "location": "Москва",
      "_count": 150
    }
  ],
  "averageSalary": {
    "_avg": {
      "salaryMin": 80000,
      "salaryMax": 150000
    }
  },
  "topCompanies": [
    {
      "company": "Tech Corp",
      "jobCount": 25
    }
  ],
  "jobViews": 12500,
  "applicationsPerJob": {
    "_avg": {
      "applicationsCount": 6.2
    }
  }
}
```

### Аналитика по откликам

```http
GET /admin/analytics/applications
```

**Ответ:**
```json
{
  "totalApplications": 2100,
  "applicationsByStatus": [
    {
      "status": "PENDING",
      "_count": 150
    },
    {
      "status": "ACCEPTED",
      "_count": 45
    }
  ],
  "averageResponseTime": 2.5,
  "topJobsByApplications": [
    {
      "jobId": "job_123",
      "title": "Frontend Developer",
      "applicationCount": 25
    }
  ],
  "applicationsByDay": [
    {
      "date": "2024-01-15",
      "count": 15
    }
  ]
}
```

### Аналитика по пользователям

```http
GET /admin/analytics/users
```

**Ответ:**
```json
{
  "totalUsers": 1250,
  "usersByRole": [
    {
      "role": "CANDIDATE",
      "_count": 800
    },
    {
      "role": "HR",
      "_count": 300
    },
    {
      "role": "UNIVERSITY",
      "_count": 150
    }
  ],
  "activeUsers": 450,
  "newUsers": 85,
  "userActivity": [
    {
      "date": "2024-01-15",
      "logins": 120,
      "registrations": 8
    }
  ]
}
```

### Аналитика активности

```http
GET /admin/analytics/activity
```

**Ответ:**
```json
{
  "totalEvents": 15000,
  "eventsByType": [
    {
      "eventType": "JOB_VIEWED",
      "_count": 5000
    },
    {
      "eventType": "APPLICATION_CREATED",
      "_count": 2000
    }
  ],
  "topUsers": [
    {
      "userId": "user_123",
      "email": "user@example.com",
      "eventCount": 150
    }
  ],
  "activityByDay": [
    {
      "date": "2024-01-15",
      "events": 450
    }
  ]
}
```

## 📈 Отчеты

### Системный отчет

```http
GET /admin/reports/system
```

**Ответ:**
```json
{
  "systemHealth": {
    "status": "healthy",
    "database": true,
    "activeUsers": 450,
    "systemLoad": {
      "cpu": "normal",
      "memory": "normal",
      "disk": "normal"
    },
    "lastBackup": "2024-01-14T02:00:00Z",
    "timestamp": "2024-01-15T10:00:00Z"
  },
  "performance": {
    "averageResponseTime": 150,
    "throughput": 1000
  },
  "errors": {
    "totalErrors": 5,
    "errorRate": 0.1
  },
  "usage": {
    "apiCalls": 50000,
    "storageUsed": "2.5GB"
  }
}
```

### Отчет по модерации

```http
GET /admin/reports/moderation
```

**Ответ:**
```json
{
  "moderationStats": {
    "total": {
      "pending": 15,
      "approved": 120,
      "rejected": 8,
      "returned": 3
    }
  },
  "moderatorPerformance": [
    {
      "moderatorId": "mod_123",
      "name": "Иван Модератор",
      "jobsProcessed": 45,
      "averageTime": 15.5
    }
  ],
  "contentQuality": {
    "averageScore": 8.2,
    "qualityTrend": "improving"
  },
  "moderationTrends": [
    {
      "date": "2024-01-15",
      "processed": 12,
      "approved": 10,
      "rejected": 2
    }
  ]
}
```

### Отчет по найму

```http
GET /admin/reports/hiring
```

**Ответ:**
```json
{
  "hiringStats": {
    "totalHires": 45,
    "successRate": 0.75,
    "averageTimeToHire": 21
  },
  "timeToHire": 21,
  "successRate": 0.75,
  "topSkills": [
    {
      "skill": "React",
      "hireCount": 15,
      "demandScore": 9.2
    }
  ]
}
```

## 📤 Экспорт данных

### Экспорт пользователей

```http
GET /admin/export/users
```

**Параметры:**
- `startDate` - начальная дата
- `endDate` - конечная дата
- `limit` - максимальное количество записей (по умолчанию 1000)

**Ответ:**
```json
{
  "data": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "role": "CANDIDATE",
      "isActive": true,
      "lastLogin": "2024-01-15T09:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "hrProfile": null,
      "candidateProfile": {
        "firstName": "Иван",
        "lastName": "Петров"
      },
      "universityProfile": null
    }
  ],
  "count": 100,
  "exportedAt": "2024-01-15T10:00:00Z"
}
```

### Экспорт вакансий

```http
GET /admin/export/jobs
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "job_123",
      "title": "Frontend Developer",
      "description": "Описание вакансии",
      "hr": {
        "company": "Tech Corp",
        "user": {
          "email": "hr@techcorp.com"
        }
      },
      "skills": [
        {
          "skill": {
            "name": "React",
            "category": "Frontend"
          }
        }
      ],
      "_count": {
        "applications": 25,
        "jobViews": 150
      }
    }
  ],
  "count": 50,
  "exportedAt": "2024-01-15T10:00:00Z"
}
```

### Экспорт откликов

```http
GET /admin/export/applications
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "app_123",
      "status": "PENDING",
      "appliedAt": "2024-01-15T10:00:00Z",
      "job": {
        "title": "Frontend Developer",
        "hr": {
          "company": "Tech Corp",
          "user": {
            "email": "hr@techcorp.com"
          }
        }
      },
      "candidate": {
        "firstName": "Иван",
        "lastName": "Петров",
        "user": {
          "email": "ivan@example.com"
        }
      }
    }
  ],
  "count": 200,
  "exportedAt": "2024-01-15T10:00:00Z"
}
```

## ⚙️ Управление системой

### Здоровье системы

```http
GET /admin/system/health
```

**Ответ:**
```json
{
  "status": "healthy",
  "database": true,
  "activeUsers": 450,
  "systemLoad": {
    "cpu": "normal",
    "memory": "normal",
    "disk": "normal"
  },
  "lastBackup": "2024-01-14T02:00:00Z",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Системные логи

```http
GET /admin/system/logs
```

**Параметры:**
- `level` - уровень лога (ERROR, WARN, INFO, DEBUG)
- `limit` - количество записей (по умолчанию 100)

**Ответ:**
```json
[
  {
    "id": "log_123",
    "action": "USER_LOGIN",
    "entityType": "User",
    "entityId": "user_123",
    "user": {
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "ipAddress": "192.168.1.1",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### Создание резервной копии

```http
POST /admin/system/backup
```

**Ответ:**
```json
{
  "message": "Резервная копия создана",
  "backupId": "backup_1642248000000",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Техническое обслуживание

```http
POST /admin/system/maintenance
```

**Тело запроса:**
```json
{
  "reason": "Обновление системы"
}
```

**Ответ:**
```json
{
  "message": "Техническое обслуживание запущено",
  "reason": "Обновление системы",
  "startedAt": "2024-01-15T10:00:00Z"
}
```

## 📝 Управление контентом

### Получение контентных вакансий

```http
GET /admin/content/jobs
```

**Параметры:**
- `status` - статус вакансии
- `featured` - выделенные вакансии
- `page` - страница
- `limit` - количество на странице

### Получение контентных профилей

```http
GET /admin/content/profiles
```

**Параметры:**
- `type` - тип профиля (HR, CANDIDATE, UNIVERSITY)
- `active` - активные профили
- `page` - страница
- `limit` - количество на странице

### Выделение вакансии

```http
PATCH /admin/content/jobs/:id/feature
```

### Снятие выделения вакансии

```http
PATCH /admin/content/jobs/:id/unfeature
```

## 🔔 Уведомления

### Получение уведомлений

```http
GET /admin/notifications
```

**Параметры:**
- `type` - тип уведомления
- `status` - статус уведомления
- `priority` - приоритет
- `page` - страница
- `limit` - количество на странице

### Рассылка уведомлений

```http
POST /admin/notifications/broadcast
```

**Тело запроса:**
```json
{
  "title": "Важное уведомление",
  "message": "Текст уведомления",
  "type": "SYSTEM",
  "priority": "HIGH",
  "targetRoles": ["CANDIDATE", "HR"],
  "scheduledAt": "2024-01-15T12:00:00Z"
}
```

### Удаление уведомления

```http
DELETE /admin/notifications/:id
```

## 🎯 Навыки

### Управление навыками

```http
GET /admin/skills/management
```

**Параметры:**
- `category` - категория навыка
- `active` - активные навыки
- `popular` - популярные навыки
- `page` - страница
- `limit` - количество на странице

### Объединение навыков

```http
POST /admin/skills/merge
```

**Тело запроса:**
```json
{
  "fromSkillId": "skill_old",
  "toSkillId": "skill_new"
}
```

### Очистка навыков

```http
POST /admin/skills/cleanup
```

## 🤖 AI и аналитика

### Статус AI

```http
GET /admin/ai/status
```

**Ответ:**
```json
{
  "status": "active",
  "models": {
    "resume_parsing": "online",
    "skill_extraction": "online",
    "job_matching": "online"
  },
  "performance": {
    "averageProcessingTime": 2.5,
    "successRate": 0.95
  }
}
```

### Переобучение AI

```http
POST /admin/ai/retrain
```

**Ответ:**
```json
{
  "message": "AI переобучен",
  "trainingId": "training_123",
  "startedAt": "2024-01-15T10:00:00Z"
}
```

### Логи AI

```http
GET /admin/ai/logs
```

**Параметры:**
- `modelType` - тип модели
- `success` - успешные запросы
- `startDate` - начальная дата
- `endDate` - конечная дата
- `limit` - количество записей

## 🔗 Интеграции

### Получение интеграций

```http
GET /admin/integrations
```

**Ответ:**
```json
[
  {
    "id": "integration_123",
    "name": "HH.ru",
    "type": "JOB_BOARD",
    "status": "active",
    "lastSync": "2024-01-15T09:00:00Z"
  }
]
```

### Синхронизация интеграций

```http
POST /admin/integrations/sync
```

**Ответ:**
```json
{
  "message": "Интеграции синхронизированы",
  "syncedAt": "2024-01-15T10:00:00Z",
  "results": [
    {
      "integration": "HH.ru",
      "status": "success",
      "recordsProcessed": 150
    }
  ]
}
```

## 🚨 Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 429 | Превышен лимит запросов |
| 500 | Внутренняя ошибка сервера |

## 📝 Примеры использования

### Получение статистики за последний месяц

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/admin/analytics/overview?startDate=2024-01-01&endDate=2024-01-31"
```

### Массовое одобрение вакансий

```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"jobIds": ["job_1", "job_2", "job_3"]}' \
     "http://localhost:3000/admin/moderation/bulk-approve"
```

### Экспорт данных за период

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/admin/export/users?startDate=2024-01-01&endDate=2024-01-31&limit=500"
```

## 🔒 Безопасность

- Все эндпоинты требуют аутентификации
- Только пользователи с ролью `ADMIN` имеют доступ
- Все действия логируются в аудит
- Ограничения по частоте запросов (rate limiting)
- Валидация всех входных данных

## 📊 Мониторинг

- Все запросы логируются
- Метрики производительности
- Отслеживание ошибок
- Алерты при критических проблемах

---

**Примечание:** Этот API предназначен только для администраторов системы. Все действия аудируются и могут быть отслежены в логах системы.
