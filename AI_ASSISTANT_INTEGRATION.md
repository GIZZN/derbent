# AI Assistant Integration - Документация

## 🎯 Обзор

AI ассистент интегрирован в приложение SmartMatch и использует реальный AI API для обработки сообщений пользователей.

## 📁 Файлы интеграции

### 1. API слой (`src/lib/api/aiApi.ts`)
- `sendAIChatMessage()` - отправка сообщений в AI
- `checkAIServiceHealth()` - проверка доступности AI сервиса
- Полная обработка ошибок и типизация

### 2. Компонент (`src/app/Components/AIAssistant.tsx`)
- Интеграция с реальным AI API
- Автоматическая проверка доступности AI сервиса
- Fallback на локальный поиск при недоступности AI
- Индикатор статуса AI сервиса

### 3. Стили (`src/app/Components/AIAssistant.module.css`)
- Стили для индикатора статуса AI
- Зеленый индикатор для активного AI
- Красный индикатор для локального режима

## 🔧 Как это работает

### 1. Проверка доступности
При загрузке компонента автоматически проверяется доступность AI сервиса:
```typescript
useEffect(() => {
  const checkAI = async () => {
    const isAvailable = await checkAIServiceHealth();
    setAiServiceAvailable(isAvailable);
  };
  checkAI();
}, []);
```

### 2. Обработка сообщений
При отправке сообщения:
- Если AI сервис доступен → отправляется запрос к `/ai-test/chat`
- Если AI недоступен → используется локальный поиск по ключевым словам

### 3. Отображение статуса
Интерфейс показывает текущий статус:
- 🟢 "AI активен" - когда сервис работает
- 🔴 "Локальный режим" - когда используется fallback

## 🚀 Использование

AI ассистент автоматически доступен на страницах:
- `/jobs` - поиск вакансий
- `/companies` - поиск стажировок  
- `/` - главная страница

## 📡 API эндпоинт

### POST /ai-test/chat
**Отправляемые данные:**
```json
{
  "message": "Ваше сообщение",
  "model": "gemma3:latest"
}
```

**Получаемые данные:**
```json
{
  "success": true,
  "data": {
    "response": "Ответ AI агента"
  },
  "processingTime": 1250
}
```

## 🛠️ Настройка

### Модель по умолчанию
В файле `src/lib/api/aiApi.ts`:
```typescript
export async function sendAIChatMessage(
  message: string, 
  model: string = 'gemma3:latest'  // ← Модель по умолчанию
)
```

### Базовый URL
Настраивается в `src/config/api.ts`:
```typescript
BASE_URL: (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartmatch-three.vercel.app/')
```

## 🎉 Готово к использованию!

AI ассистент полностью интегрирован и готов к работе с реальным AI API!
