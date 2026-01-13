# Модуль комнат (Rooms Module)

Модуль для управления игровыми комнатами с настройками сложности и таймера.

## Структура

```
rooms/
├── dto/
│   ├── create-room.dto.ts      # DTO для создания комнаты
│   ├── room-response.dto.ts    # DTO для ответов API
│   └── join-room.dto.ts        # DTO для присоединения к комнате
├── rooms.controller.ts         # HTTP контроллер
├── rooms.service.ts            # Бизнес-логика
├── rooms.repository.ts         # Доступ к данным
├── rooms.module.ts             # NestJS модуль
└── README.md                   # Документация
```

## API Endpoints

### POST /rooms
Создание новой комнаты.

**Требования:**
- Авторизация (JWT токен)
- Валидация настроек (сложность, таймер)

**Request Body:**
```json
{
  "difficulty": "easy" | "medium" | "hard",
  "timer": 30-180
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "room-id",
    "code": "ABC123",
    "hostId": "user-id",
    "hostName": "User Name",
    "settings": {
      "difficulty": "easy",
      "timer": 60
    },
    "status": "waiting",
    "users": [...],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "error": null
}
```

### GET /rooms/:code
Получение информации о комнате по коду.

**Требования:**
- Авторизация (JWT токен)

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### POST /rooms/:code/join
Присоединение к комнате.

**Требования:**
- Авторизация (JWT токен)
- Комната должна быть в статусе "waiting"

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### POST /rooms/:code/leave
Выход из комнаты.

**Требования:**
- Авторизация (JWT токен)
- Пользователь должен быть участником комнаты

**Особенности:**
- Если пользователь является хостом, комната удаляется
- Публикуется событие в Redis Stream `room:updates`

**Response:**
```json
{
  "success": true,
  "data": { ... } | null,
  "error": null
}
```

### DELETE /rooms/:code
Удаление комнаты (только хост).

**Требования:**
- Авторизация (JWT токен)
- Пользователь должен быть хостом комнаты

**Response:**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

## Валидация настроек

### Сложность (difficulty)
- `easy` - легкий уровень
- `medium` - средний уровень
- `hard` - сложный уровень

### Таймер (timer)
- Минимум: 30 секунд
- Максимум: 180 секунд

## Статусы комнаты

- `waiting` - ожидание игроков (по умолчанию)
- `playing` - игра идет
- `finished` - игра завершена

## Redis Stream Events

Модуль публикует следующие события в поток `room:updates`:

- `room:created` - комната создана
- `room:deleted` - комната удалена
- `room:user-joined` - пользователь присоединился
- `room:user-left` - пользователь покинул комнату

## Генерация кода комнаты

Код комнаты генерируется автоматически при создании:
- Формат: 6 символов (A-Z, 0-9)
- Пример: `ABC123`
- Уникальность проверяется автоматически

## Зависимости

- `PrismaModule` - доступ к базе данных
- `RedisStreamerModule` - публикация событий в Redis Streams
- `AuthModule` - авторизация пользователей
