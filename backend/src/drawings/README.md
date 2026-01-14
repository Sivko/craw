# Модуль рисунков (Drawings)

Модуль для работы с рисунками игроков. Обеспечивает загрузку, конвертацию в WebP формат и хранение рисунков.

## Функциональность

- Загрузка рисунков в формате base64 (PNG, JPEG, JPG, WebP)
- Автоматическая конвертация в WebP формат для оптимизации размера
- Сохранение файлов локально в директории `uploads/drawings`
- Получение рисунков по ID, matchId или userId
- Статическая раздача файлов через `/uploads/drawings/`

## Структура модуля

```
drawings/
├── drawings.module.ts          # Модуль NestJS
├── drawings.controller.ts      # HTTP контроллер
├── drawings.service.ts         # Бизнес-логика
├── drawings.repository.ts      # Доступ к данным
├── file-storage.service.ts     # Работа с файлами и конвертация
├── dto/
│   ├── create-drawing.dto.ts  # DTO для загрузки
│   └── drawing-response.dto.ts # DTO для ответов
└── README.md
```

## API Endpoints

### POST /drawings
Загрузка рисунка

**Request Body:**
```json
{
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "matchId": "clx1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx9876543210",
    "matchId": "clx1234567890",
    "userId": "clx1111111111",
    "userName": "Player1",
    "imageUrl": "/uploads/drawings/clx1234567890-1234567890.webp",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "error": null
}
```

### GET /drawings/:id
Получение информации о рисунке по ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx9876543210",
    "matchId": "clx1234567890",
    "userId": "clx1111111111",
    "userName": "Player1",
    "imageUrl": "/uploads/drawings/clx1234567890-1234567890.webp",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "error": null
}
```

### GET /drawings/:id/file
Получение файла изображения (возвращает WebP файл)

### GET /drawings/user/:userId
Получение всех рисунков пользователя

**Query Parameters:**
- `limit` (default: 50) - количество результатов
- `offset` (default: 0) - смещение для пагинации

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx9876543210",
      "matchId": "clx1234567890",
      "userId": "clx1111111111",
      "userName": "Player1",
      "imageUrl": "/uploads/drawings/clx1234567890-1234567890.webp",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "error": null
}
```

## Особенности реализации

### Конвертация в WebP

Все загруженные изображения автоматически конвертируются в WebP формат с использованием библиотеки `sharp`:
- Качество: 85%
- Усилие сжатия: 6 (баланс между размером и скоростью)

### Хранение файлов

Файлы сохраняются локально в директории `uploads/drawings/` с именем формата:
```
{matchId}-{timestamp}.webp
```

### Валидация

- Проверка формата изображения (PNG, JPEG, JPG, WebP)
- Проверка base64 формата
- Проверка прав доступа (только художник матча может загрузить рисунок)
- Проверка существования матча

### Статическая раздача

Файлы доступны через статический маршрут `/uploads/drawings/{filename}` благодаря настройке в `main.ts`.

## Зависимости

- `sharp` - библиотека для работы с изображениями и конвертации в WebP
- `@nestjs/platform-express` - для статической раздачи файлов

## Установка зависимостей

```bash
npm install sharp
npm install --save-dev @types/node
```

## Переменные окружения

Не требуются. Директория для загрузок создается автоматически при первом запуске.

## Обработка ошибок

- `400 Bad Request` - неверный формат изображения или отсутствие прав доступа
- `404 Not Found` - рисунок или матч не найден
- `500 Internal Server Error` - ошибка при обработке изображения

## Интеграция с другими модулями

Модуль интегрирован с:
- `PrismaModule` - для работы с базой данных
- `AuthModule` - для проверки авторизации пользователя

## Пример использования

```typescript
// Загрузка рисунка
const response = await fetch('/drawings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    imageData: canvas.toDataURL('image/png'),
    matchId: 'clx1234567890'
  })
});

// Получение файла изображения
const imageUrl = `/uploads/drawings/${drawing.imageUrl}`;
```
