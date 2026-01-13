# Модуль чата (Chat Module)

Модуль для управления сообщениями в чате комнат с поддержкой истории сообщений и интеграцией с Redis Streams для real-time обновлений.

## Структура

```
chat/
├── dto/
│   ├── create-message.dto.ts      # DTO для создания сообщения
│   └── message-response.dto.ts     # DTO для ответов API
├── chat.controller.ts              # HTTP контроллер
├── chat.service.ts                 # Бизнес-логика
├── chat.repository.ts              # Доступ к данным
├── chat.module.ts                  # NestJS модуль
└── README.md                       # Документация
```

## API Endpoints

### POST /chat/:roomId/messages
Отправка сообщения в чат комнаты.

**Требования:**
- Авторизация (JWT токен)
- Пользователь должен быть участником комнаты
- Сообщение должно быть от 1 до 500 символов

**Request Body:**
```json
{
  "message": "Текст сообщения"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "message-id",
    "roomId": "room-id",
    "userId": "user-id",
    "userName": "User Name",
    "matchId": "match-id" | null,
    "message": "Текст сообщения",
    "isCorrect": false,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "error": null
}
```

**Особенности:**
- Если есть активный матч, система проверяет, является ли сообщение правильным ответом
- Художник не может угадывать слово, но может отправлять обычные сообщения
- Сообщение публикуется в Redis Stream `chat:messages` для real-time обновлений

### GET /chat/:roomId/messages
Получение истории сообщений для комнаты.

**Требования:**
- Авторизация (JWT токен)

**Query Parameters:**
- `limit` (optional, default: 100) - максимальное количество сообщений
- `offset` (optional, default: 0) - смещение для пагинации

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "message-id",
      "roomId": "room-id",
      "userId": "user-id",
      "userName": "User Name",
      "matchId": "match-id" | null,
      "message": "Текст сообщения",
      "isCorrect": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "error": null
}
```

## Бизнес-логика

### Отправка сообщений
1. Проверка существования комнаты
2. Проверка участия пользователя в комнате
3. Если есть активный матч:
   - Проверка, является ли сообщение правильным ответом
   - Художник не может угадывать слово
4. Сохранение сообщения в БД
5. Публикация в Redis Stream для real-time обновлений

### Проверка правильности ответа
- Сообщение сравнивается с загаданным словом (без учета регистра и пробелов)
- Если ответ правильный, поле `isCorrect` устанавливается в `true`
- Правильные ответы могут использоваться для начисления очков

### Очистка истории
- Метод `clearMessages(roomId)` очищает всю историю сообщений для комнаты
- Метод `clearMessagesByMatch(matchId)` очищает сообщения для конкретного матча
- Очистка может быть вызвана при начале нового матча

## Интеграция с Redis Streams

Модуль публикует все сообщения в Redis Stream `chat:messages` через `RedisStreamerService`. Формат события:

```typescript
{
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}
```

## Использование в других модулях

Модуль экспортирует `ChatService` и `ChatRepository` для использования в других модулях:

```typescript
import { ChatService } from '../chat/chat.service';

// Очистка истории при начале нового матча
await this.chatService.clearMessages(roomId);
```

## Обработка ошибок

- `BadRequestException` - пользователь не является участником комнаты
- `NotFoundException` - комната или пользователь не найдены
- `ValidationException` - неверный формат сообщения (валидация через DTO)
