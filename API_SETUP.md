# Настройка API для авторизации

## Переменные окружения

Система автоматически использует переменную `Backend_URL` из вашего .env файла.

### Варианты настройки:

1. **Если у вас уже есть `Backend_URL` в .env файле:**
   ```bash
   # В вашем .env файле
   Backend_URL=https://smartmatch-three.vercel.app/
   ```

2. **Если нужно создать новую переменную:**
   ```bash
   # Создайте файл .env.local в корне проекта
   NEXT_PUBLIC_Backend_URL=https://smartmatch-three.vercel.app/
   ```

3. **Для продакшена:**
   ```bash
   NEXT_PUBLIC_Backend_URL=https://smartmatch-three.vercel.app/
   ```

### Приоритет переменных:
1. `NEXT_PUBLIC_Backend_URL` (для фронтенда)
2. `Backend_URL` (из вашего .env файла)
3. `https://smartmatch-three.vercel.app/` (по умолчанию)

## API Endpoints

Система авторизации ожидает следующие endpoints на вашем Backend:

### 1. Регистрация пользователя
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "HR" | "CANDIDATE" | "UNIVERSITY",
  "firstName": "Иван",
  "lastName": "Иванов"
}

Response:
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "HR",
    "firstName": "Иван",
    "lastName": "Иванов"
  },
  "token": "jwt_token_here"
}
```

### 2. Вход в систему
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "HR",
    "firstName": "Иван",
    "lastName": "Иванов"
  },
  "token": "jwt_token_here"
}
```

### 3. Выход из системы
```
POST /auth/logout
Authorization: Bearer jwt_token_here

Response: 200 OK
```

### 4. Получение информации о пользователе
```
GET /auth/me
Authorization: Bearer jwt_token_here

Response:
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "HR",
  "firstName": "Иван",
  "lastName": "Иванов"
}
```

## Роли пользователей

- **HR** - HR-менеджеры, могут размещать вакансии
- **CANDIDATE** - Кандидаты, ищут работу
- **UNIVERSITY** - Университеты, размещают стажировки

## Обработка ошибок

API должен возвращать ошибки в формате:

```json
{
  "message": "Описание ошибки",
  "code": "ERROR_CODE"
}
```

Примеры ошибок:
- `400` - Неверные данные
- `401` - Неверные учетные данные
- `409` - Пользователь уже существует
- `500` - Внутренняя ошибка сервера

## Настройка CORS

Убедитесь, что ваш Backend настроен для работы с фронтендом:

```javascript
// Пример для Express.js
app.use(cors({
  origin: 'https://your-frontend-domain.com', // URL вашего фронтенда
  credentials: true
}));
```

## Тестирование

Для тестирования API можно использовать curl:

```bash
# Регистрация
curl -X POST https://smartmatch-three.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"CANDIDATE","firstName":"Test","lastName":"User"}'

# Вход
curl -X POST https://smartmatch-three.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
