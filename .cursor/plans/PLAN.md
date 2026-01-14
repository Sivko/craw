# План разработки игры "Крокодил"

## Todos

| id | content | status |
|----|---------|--------|
| 1 | Настройка инфраструктуры (PostgreSQL, Redis, Docker) | completed |
| 2 | Создание схемы базы данных и миграций | completed |
| 3 | Настройка Redis Streamer для real-time обновлений | completed |
| 4 | Реализация авторизации (Telegram MiniApp + гостевой вход) | completed |
| 5 | Модуль комнат с настройками (сложность, таймер) | completed |
| 6 | Игровая логика (матчи, выбор слов, ротация художника) | completed |
| 7 | Модуль чата с историей сообщений | completed |
| 8 | Модуль рисунков с сохранением в WebP | completed |
| 9 | WebSocket Gateway с интеграцией Redis Streamer | pending |
| 10 | Frontend авторизация и создание комнат | pending |
| 11 | Интеграция PixiJS для рисования | pending |
| 12 | Real-time обновления холста через Redis Streamer | pending |
| 13 | Real-time обновления чата через Redis Streamer | pending |
| 14 | Адаптивный дизайн для мобильных и десктопных устройств | pending |
| 15 | Админка: авторизация через Secret header | pending |
| 16 | Админка: управление словарями для разных уровней сложности | pending |
| 17 | Тестирование и оптимизация | pending |

---

## Описание проекта

Игра "Крокодил" - это многопользовательская игра, где один игрок рисует слово, а остальные пытаются его угадать. Игра поддерживает мобильные и десктопные устройства с авторизацией через Telegram MiniApp или простым вводом имени.

---

## Архитектура проекта

### Структура проекта

```
craw/
├── frontend/              # Next.js приложение (FSD архитектура)
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   ├── (game)/
│   │   └── api/
│   ├── shared/           # Переиспользуемые компоненты и утилиты
│   │   ├── ui/           # UI компоненты (кнопки, инпуты и т.д.)
│   │   ├── lib/          # Утилиты и хелперы
│   │   ├── hooks/        # Общие хуки
│   │   ├── api/          # API клиенты
│   │   └── config/       # Конфигурация
│   ├── entities/         # Бизнес-сущности
│   │   ├── user/
│   │   ├── room/
│   │   ├── game/
│   │   ├── chat/
│   │   └── drawing/
│   ├── features/         # Функциональные возможности
│   │   ├── auth/
│   │   ├── create-room/
│   │   ├── join-room/
│   │   ├── start-game/
│   │   ├── draw-canvas/
│   │   ├── send-message/
│   │   └── guess-word/
│   ├── widgets/          # Крупные самостоятельные блоки
│   │   ├── room-lobby/
│   │   ├── game-screen/
│   │   ├── chat-panel/
│   │   └── drawing-canvas/
│   ├── pages/            # Страницы приложения
│   │   ├── auth-page/
│   │   ├── room-page/
│   │   └── game-page/
│   └── processes/        # Бизнес-процессы
│       ├── room-management/
│       └── game-flow/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/         # Авторизация
│   │   ├── rooms/         # Логика комнат
│   │   ├── games/         # Игровая логика
│   │   ├── chat/          # Чат
│   │   ├── drawings/      # Рисунки
│   │   ├── websocket/     # WebSocket gateway
│   │   └── admin/         # Админка
│   │       ├── auth/      # Админ авторизация
│   │       └── dictionaries/ # Управление словарями
│   └── prisma/            # Prisma схема
├── shared/               # Общие типы и утилиты
└── docker-compose.yml    # Docker конфигурация
```

---

## Архитектура фронтенда (Feature-Sliced Design)

### Принципы FSD

Frontend приложение организовано по методологии **Feature-Sliced Design (FSD)**, которая обеспечивает масштабируемость, переиспользуемость и понятную структуру кода.

### Слои архитектуры (от низкого к высокому уровню)

#### 1. **shared** - Переиспользуемые ресурсы
Базовые компоненты, утилиты и конфигурация, не зависящие от бизнес-логики.

**Структура:**
```
shared/
├── ui/                    # UI компоненты
│   ├── button/
│   ├── input/
│   ├── modal/
│   ├── timer/
│   └── avatar/
├── lib/                   # Утилиты
│   ├── api/
│   │   ├── client.ts      # HTTP клиент (axios)
│   │   └── websocket.ts   # WebSocket клиент
│   ├── utils/
│   │   ├── format.ts
│   │   └── validation.ts
│   └── constants/
├── hooks/                 # Общие хуки
│   ├── useWebSocket.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── api/                   # API клиенты
│   ├── auth.ts
│   ├── rooms.ts
│   ├── games.ts
│   └── chat.ts
└── config/                # Конфигурация
    ├── env.ts
    └── routes.ts
```

#### 2. **entities** - Бизнес-сущности
Сущности предметной области с их данными и базовой логикой.

**Структура:**
```
entities/
├── user/
│   ├── model/
│   │   ├── types.ts       # Типы пользователя
│   │   └── store.ts       # Zustand store
│   └── ui/
│       └── user-card/
├── room/
│   ├── model/
│   │   ├── types.ts
│   │   └── store.ts
│   └── ui/
│       └── room-info/
├── game/
│   ├── model/
│   │   ├── types.ts
│   │   └── store.ts
│   └── ui/
│       └── game-status/
├── chat/
│   ├── model/
│   │   ├── types.ts
│   │   └── store.ts
│   └── ui/
│       └── message-item/
└── drawing/
    ├── model/
    │   ├── types.ts
    │   └── store.ts
    └── ui/
        └── drawing-preview/
```

**Пример структуры entity:**
```
entities/user/
├── model/
│   ├── types.ts           # User, UserState
│   ├── store.ts           # useUserStore
│   └── api.ts             # API методы для user
├── ui/
│   ├── user-card/         # Компонент карточки пользователя
│   │   ├── index.ts
│   │   └── user-card.tsx
│   └── user-avatar/
└── index.ts               # Public API
```

#### 3. **features** - Функциональные возможности
Конкретные пользовательские сценарии и действия.

**Структура:**
```
features/
├── auth/
│   ├── telegram-auth/
│   │   ├── ui/
│   │   │   └── telegram-auth-button.tsx
│   │   └── model/
│   │       └── useTelegramAuth.ts
│   └── guest-auth/
│       ├── ui/
│       │   └── guest-auth-form.tsx
│       └── model/
│           └── useGuestAuth.ts
├── create-room/
│   ├── ui/
│   │   └── create-room-form.tsx
│   └── model/
│       └── useCreateRoom.ts
├── join-room/
│   ├── ui/
│   │   └── join-room-form.tsx
│   └── model/
│       └── useJoinRoom.ts
├── start-game/
│   ├── ui/
│   │   └── start-game-button.tsx
│   └── model/
│       └── useStartGame.ts
├── draw-canvas/
│   ├── ui/
│   │   └── drawing-tools.tsx
│   └── model/
│       ├── useDrawing.ts
│       └── usePixiCanvas.ts
├── send-message/
│   ├── ui/
│   │   └── message-input.tsx
│   └── model/
│       └── useSendMessage.ts
└── guess-word/
    ├── ui/
    │   └── guess-input.tsx
    └── model/
        └── useGuessWord.ts
```

**Пример структуры feature:**
```
features/create-room/
├── ui/
│   ├── create-room-form/
│   │   ├── index.ts
│   │   └── create-room-form.tsx
│   └── room-settings/
│       └── room-settings.tsx
├── model/
│   ├── useCreateRoom.ts   # Хук для создания комнаты
│   └── types.ts
└── index.ts               # Public API
```

#### 4. **widgets** - Крупные самостоятельные блоки
Композиция features и entities для создания сложных интерфейсных блоков.

**Структура:**
```
widgets/
├── room-lobby/
│   ├── ui/
│   │   ├── room-lobby.tsx
│   │   ├── players-list/
│   │   └── room-settings-panel/
│   └── model/
│       └── useRoomLobby.ts
├── game-screen/
│   ├── ui/
│   │   ├── game-screen.tsx
│   │   ├── canvas-area/
│   │   ├── game-info/
│   │   └── scoreboard/
│   └── model/
│       └── useGameScreen.ts
├── chat-panel/
│   ├── ui/
│   │   ├── chat-panel.tsx
│   │   ├── messages-list/
│   │   └── message-input-area/
│   └── model/
│       └── useChatPanel.ts
└── drawing-canvas/
    ├── ui/
    │   ├── drawing-canvas.tsx
    │   ├── canvas-container/
    │   └── tools-panel/
    └── model/
        ├── useDrawingCanvas.ts
        └── usePixiRenderer.ts
```

**Пример структуры widget:**
```
widgets/room-lobby/
├── ui/
│   ├── room-lobby.tsx
│   ├── players-list/
│   │   ├── index.ts
│   │   └── players-list.tsx
│   └── room-settings-panel/
│       └── room-settings-panel.tsx
├── model/
│   └── useRoomLobby.ts
└── index.ts
```

#### 5. **pages** - Страницы приложения
Композиция widgets для создания полноценных страниц.

**Структура:**
```
pages/
├── auth-page/
│   ├── ui/
│   │   └── auth-page.tsx
│   └── model/
│       └── useAuthPage.ts
├── room-page/
│   ├── ui/
│   │   └── room-page.tsx
│   └── model/
│       └── useRoomPage.ts
└── game-page/
    ├── ui/
    │   └── game-page.tsx
    └── model/
        └── useGamePage.ts
```

**Пример структуры page:**
```
pages/room-page/
├── ui/
│   └── room-page.tsx      # Композиция widgets
└── model/
    └── useRoomPage.ts
```

#### 6. **processes** - Бизнес-процессы
Сложные бизнес-процессы, охватывающие несколько страниц и состояний.

**Структура:**
```
processes/
├── room-management/
│   ├── model/
│   │   ├── useRoomManagement.ts
│   │   └── room-flow.ts
│   └── ui/
│       └── room-provider.tsx
└── game-flow/
    ├── model/
    │   ├── useGameFlow.ts
    │   └── game-state-machine.ts
    └── ui/
        └── game-provider.tsx
```

### Правила импортов (Public API)

Каждый слой экспортирует только необходимые части через `index.ts`:

```typescript
// ✅ Правильно - импорт из public API
import { Button } from '@/shared/ui'
import { useUserStore } from '@/entities/user'
import { CreateRoomForm } from '@/features/create-room'
import { RoomLobby } from '@/widgets/room-lobby'

// ❌ Неправильно - прямой импорт внутренних файлов
import { Button } from '@/shared/ui/button/button.tsx'
import { useUserStore } from '@/entities/user/model/store.ts'
```

### Управление состоянием

- **Zustand** для глобального состояния:
  - `entities/*/model/store.ts` - stores для сущностей
  - `features/*/model/` - локальное состояние фич
- **TanStack Query** для серверного состояния:
  - Кэширование API запросов
  - Автоматическая синхронизация данных
- **WebSocket hooks** для real-time:
  - `shared/hooks/useWebSocket.ts` - базовый хук
  - `features/*/model/useWebSocket*.ts` - специализированные хуки

### Интеграция с Next.js App Router

```
app/
├── layout.tsx             # Root layout
├── page.tsx               # Главная страница
├── (auth)/
│   └── auth/
│       └── page.tsx       # Использует pages/auth-page
├── (game)/
│   ├── room/
│   │   └── [code]/
│   │       └── page.tsx   # Использует pages/room-page
│   └── game/
│       └── [roomId]/
│           └── page.tsx   # Использует pages/game-page
└── api/
    └── ...                # API routes для проксирования
```

### Примеры использования

**Создание фичи:**
```typescript
// features/create-room/model/useCreateRoom.ts
import { useMutation } from '@tanstack/react-query'
import { roomsApi } from '@/shared/api'
import { useRouter } from 'next/navigation'

export const useCreateRoom = () => {
  const router = useRouter()
  
  return useMutation({
    mutationFn: roomsApi.create,
    onSuccess: (room) => {
      router.push(`/room/${room.code}`)
    }
  })
}
```

**Создание виджета:**
```typescript
// widgets/room-lobby/ui/room-lobby.tsx
import { RoomLobby } from '@/entities/room'
import { CreateRoomForm } from '@/features/create-room'
import { PlayersList } from './players-list'

export const RoomLobbyWidget = () => {
  return (
    <div>
      <RoomLobby />
      <PlayersList />
      <CreateRoomForm />
    </div>
  )
}
```

---

## Этап 1: Настройка инфраструктуры

### 1.1 Инициализация проектов

- [ ] Создать Next.js проект (frontend)
- [ ] Создать NestJS проект (backend)
- [ ] Настроить TypeScript конфигурацию
- [ ] Настроить ESLint и Prettier
- [ ] Создать shared пакет для общих типов
- [ ] Настроить структуру FSD для frontend:
  - Создать папки слоев (shared, entities, features, widgets, pages, processes)
  - Настроить path aliases в tsconfig.json (`@/shared`, `@/entities`, и т.д.)
  - Создать базовую структуру для каждого слоя

### 1.2 База данных

- [ ] Настроить PostgreSQL
- [ ] Настроить Prisma ORM
- [ ] Создать схему базы данных:
  - Таблица `users` (id, telegramId, username, name, createdAt)
  - Таблица `rooms` (id, hostId, settings, status, createdAt, updatedAt)
  - Таблица `room_users` (roomId, userId, joinedAt, score)
  - Таблица `matches` (id, roomId, drawerId, word, difficulty, startedAt, endedAt)
  - Таблица `drawings` (id, matchId, userId, imageUrl, createdAt)
  - Таблица `chat_messages` (id, roomId, userId, matchId, message, createdAt)
  - Таблица `word_dictionary` (id, word, difficulty, language, isActive, createdAt, updatedAt)
- [ ] Создать миграции
- [ ] Заполнить начальными данными словари для всех уровней сложности

### 1.3 Redis и Redis Streamer

- [ ] Настроить Redis
- [ ] Настроить Redis Streamer для real-time обновлений
- [ ] Создать сервисы для работы с потоками:
  - Поток для обновлений комнаты (`room:updates`)
  - Поток для обновлений холста/рисунка (`drawing:updates`)
  - Поток для сообщений чата (`chat:messages`)
  - Поток для игровых событий (`game:events`)
- [ ] Реализовать Consumer группы для обработки потоков
- [ ] Настроить механизм подписки на потоки через WebSocket

### 1.4 Docker

- [ ] Создать docker-compose.yml с сервисами:
  - PostgreSQL
  - Redis
  - Backend (NestJS)
  - Frontend (Next.js)
- [ ] Настроить переменные окружения (.env файлы)

---

## Этап 2: Backend разработка

### 2.1 Авторизация

- [ ] Создать модуль `auth`
- [ ] Реализовать Telegram MiniApp авторизацию:
  - Валидация данных от Telegram
  - Создание/обновление пользователя
  - Генерация JWT токена
- [ ] Реализовать простую авторизацию по имени:
  - Создание временного пользователя
  - Генерация сессии
- [ ] Middleware для проверки авторизации

### 2.2 Модуль комнат (Rooms)

- [ ] Создать модуль `rooms`
- [ ] Endpoints:
  - `POST /rooms` - создание комнаты
    - Валидация настроек (сложность, таймер)
    - Генерация уникального кода комнаты
  - `GET /rooms/:code` - получение информации о комнате
  - `POST /rooms/:code/join` - присоединение к комнате
  - `POST /rooms/:code/leave` - выход из комнаты
  - `DELETE /rooms/:code` - удаление комнаты (только хост)
- [ ] Валидация настроек комнаты:
  - Сложность: `easy`, `medium`, `hard`
  - Таймер: 30-180 секунд

### 2.3 Модуль игр (Games)

- [ ] Создать модуль `games`
- [ ] Сервис для работы со словами:
  - Получение слов из БД (таблица `word_dictionary`)
  - Выбор случайного слова по уровню сложности
  - Фильтрация активных слов
- [ ] Логика матча:
  - Начало матча (выбор художника, слова)
  - Отсчет таймера
  - Проверка правильных ответов
  - Завершение матча
  - Ротация художника
- [ ] Endpoints:
  - `POST /games/:roomId/start` - начать игру
  - `POST /games/:roomId/guess` - отправить предположение
  - `GET /games/:roomId/current` - текущий матч

### 2.4 Модуль чата (Chat)

- [ ] Создать модуль `chat`
- [ ] Endpoints:
  - `GET /chat/:roomId/messages` - получить историю сообщений
  - `POST /chat/:roomId/messages` - отправить сообщение
- [ ] Хранение сообщений в БД
- [ ] Очистка истории при новом матче
- [ ] Публикация сообщений в Redis Stream (`chat:messages`)
- [ ] Consumer для обработки сообщений из потока

### 2.5 Модуль рисунков (Drawings)

- [ ] Создать модуль `drawings`
- [ ] Endpoints:
  - `POST /drawings` - загрузка рисунка (base64/webp)
  - `GET /drawings/:id` - получение рисунка
  - `GET /drawings/user/:userId` - рисунки пользователя
- [ ] Конвертация в WebP формат
- [ ] Хранение файлов (локально или S3)

### 2.6 WebSocket Gateway и Redis Streamer

- [ ] Создать WebSocket Gateway для real-time обновлений
- [ ] Реализовать подписку на Redis Streams:
  - Подписка на поток `drawing:updates` для обновлений холста
  - Подписка на поток `chat:messages` для сообщений чата
  - Подписка на поток `room:updates` для обновлений комнаты
  - Подписка на поток `game:events` для игровых событий
- [ ] Публикация событий в Redis Streams:
  - При обновлении рисунка → `drawing:updates`
  - При отправке сообщения → `chat:messages`
  - При изменении комнаты → `room:updates`
  - При игровых событиях → `game:events`
- [ ] Consumer сервис для чтения из потоков и рассылки через WebSocket
- [ ] Обработка событий от клиентов и публикация в потоки
- [ ] События WebSocket:
  - `room:update` - обновление состояния комнаты
  - `room:user-joined` - пользователь присоединился
  - `room:user-left` - пользователь покинул комнату
  - `game:started` - игра началась
  - `game:drawing-update` - обновление рисунка (из Redis Stream)
  - `game:guess` - новое предположение
  - `game:correct-guess` - правильный ответ
  - `game:ended` - игра завершена
  - `chat:message` - новое сообщение в чате (из Redis Stream)

#### Оптимизация WebSocket для холста

- [ ] Реализовать батчинг обновлений холста:
  - Собирать несколько событий рисования в один пакет
  - Отправлять батчи с интервалом (например, каждые 50-100ms)
  - Ограничить размер батча (максимум N событий)
- [ ] Дебаунсинг на клиенте:
  - Собирать события рисования в буфер
  - Отправлять накопленные события с задержкой
  - Оптимизировать частоту отправки (throttle)
- [ ] Сжатие данных:
  - Использовать бинарный формат для координат (Int16 вместо JSON)
  - Применять delta-кодирование (относительные координаты)
  - Сжатие больших пакетов (gzip/deflate)
- [ ] Оптимизация формата данных:
  - Минимизировать размер payload (убрать лишние поля)
  - Использовать короткие ключи в JSON
  - Кэшировать часто используемые значения
- [ ] Приоритизация сообщений:
  - Критичные события (начало/конец рисования) отправлять немедленно
  - Промежуточные координаты батчить
- [ ] Обработка переполнения:
  - Пропускать старые события при переполнении буфера
  - Отправлять только последнее состояние при восстановлении соединения

### 2.7 Модуль админки (Admin)

- [ ] Создать модуль `admin`
- [ ] Админ авторизация:
  - Middleware для проверки Secret header (`X-Admin-Secret`)
  - Валидация секретного ключа из переменных окружения
  - Guard для защиты админских роутов
- [ ] Модуль управления словарями (`admin/dictionaries`):
  - Endpoints:
    - `GET /admin/dictionaries` - получить все слова (с фильтрацией по сложности)
    - `GET /admin/dictionaries/:id` - получить слово по ID
    - `POST /admin/dictionaries` - добавить новое слово
    - `PUT /admin/dictionaries/:id` - обновить слово
    - `DELETE /admin/dictionaries/:id` - удалить слово (мягкое удаление через isActive)
    - `POST /admin/dictionaries/bulk` - массовое добавление слов
    - `GET /admin/dictionaries/stats` - статистика по словарям
  - Валидация данных:
    - Проверка уникальности слова для уровня сложности
    - Валидация уровня сложности (easy, medium, hard)
    - Валидация языка
- [ ] Настройка nginx для production:
  - Конфигурация для проксирования админки
  - Проверка Secret header на уровне nginx
  - Блокировка доступа без правильного заголовка

---

## Этап 3: Frontend разработка

### 3.1 Настройка Next.js и FSD структуры

- [ ] Настроить App Router
- [ ] Настроить path aliases для FSD слоев
- [ ] Создать базовую структуру FSD слоев:
  - `shared/` - UI компоненты, утилиты, хуки, API клиенты
  - `entities/` - user, room, game, chat, drawing
  - `features/` - auth, create-room, join-room, start-game, draw-canvas, send-message, guess-word
  - `widgets/` - room-lobby, game-screen, chat-panel, drawing-canvas
  - `pages/` - auth-page, room-page, game-page
  - `processes/` - room-management, game-flow
- [ ] Настроить API routes для проксирования запросов
- [ ] Настроить WebSocket клиент в `shared/lib/api/websocket.ts`
- [ ] Настроить Zustand stores для entities
- [ ] Настроить TanStack Query для серверного состояния

### 3.2 Компоненты авторизации (FSD)

- [ ] **entities/user**: Создать модель пользователя
  - Типы пользователя (`model/types.ts`)
  - Zustand store (`model/store.ts`)
  - API методы (`model/api.ts`)
- [ ] **features/auth/telegram-auth**: Авторизация через Telegram MiniApp
  - UI компонент (`ui/telegram-auth-button.tsx`)
  - Хук `useTelegramAuth` (`model/useTelegramAuth.ts`)
- [ ] **features/auth/guest-auth**: Гостевой вход
  - UI компонент (`ui/guest-auth-form.tsx`)
  - Хук `useGuestAuth` (`model/useGuestAuth.ts`)
- [ ] **pages/auth-page**: Страница авторизации
  - Композиция features/auth компонентов
- [ ] Страница `/auth` в App Router

### 3.3 Компоненты комнаты (FSD)

- [ ] **entities/room**: Модель комнаты
  - Типы комнаты (`model/types.ts`)
  - Zustand store (`model/store.ts`)
  - API методы (`model/api.ts`)
- [ ] **features/create-room**: Создание комнаты
  - UI форма (`ui/create-room-form.tsx`)
  - Хук `useCreateRoom` (`model/useCreateRoom.ts`)
  - Валидация настроек (сложность, таймер)
- [ ] **features/join-room**: Присоединение к комнате
  - UI форма (`ui/join-room-form.tsx`)
  - Хук `useJoinRoom` (`model/useJoinRoom.ts`)
- [ ] **widgets/room-lobby**: Лобби комнаты
  - Композиция компонентов (`ui/room-lobby.tsx`)
  - Список игроков (`ui/players-list/`)
  - Настройки комнаты (`ui/room-settings-panel/`)
  - Хук `useRoomLobby` (`model/useRoomLobby.ts`)
- [ ] **pages/room-page**: Страница комнаты
  - Композиция widgets/room-lobby
- [ ] Страница `/room/[code]` в App Router

### 3.4 Интеграция PixiJS (FSD)

- [ ] Установить и настроить PixiJS
- [ ] **entities/drawing**: Модель рисунка
  - Типы рисунка (`model/types.ts`)
  - Zustand store для состояния холста (`model/store.ts`)
- [ ] **features/draw-canvas**: Функциональность рисования
  - Хук `usePixiCanvas` (`model/usePixiCanvas.ts`) - инициализация PixiJS
  - Хук `useDrawing` (`model/useDrawing.ts`) - логика рисования
  - UI инструментов (`ui/drawing-tools.tsx`) - кисть, ластик, очистка
  - Настройки кисти (размер, цвет)
  - Отправка данных рисунка на сервер (публикация в Redis Stream)
  - Получение обновлений холста из Redis Stream через WebSocket
- [ ] **widgets/drawing-canvas**: Виджет холста
  - Компонент `DrawingCanvas` (`ui/drawing-canvas.tsx`)
  - Контейнер для PixiJS (`ui/canvas-container/`)
  - Панель инструментов (`ui/tools-panel/`)
  - Хук `useDrawingCanvas` (`model/useDrawingCanvas.ts`)
- [ ] **widgets/drawing-viewer**: Просмотр рисунка (для не-художников)
  - Подписка на обновления холста через WebSocket
  - Синхронизация состояния рисунка из Redis Stream
- [ ] Адаптация для мобильных устройств (touch события)
- [ ] Экспорт в WebP формат

### 3.5 Компоненты игры (FSD)

- [ ] **entities/game**: Модель игры
  - Типы игры (`model/types.ts`)
  - Zustand store (`model/store.ts`)
  - API методы (`model/api.ts`)
- [ ] **features/start-game**: Начало игры
  - UI кнопка (`ui/start-game-button.tsx`)
  - Хук `useStartGame` (`model/useStartGame.ts`)
- [ ] **features/guess-word**: Угадывание слова
  - UI инпут (`ui/guess-input.tsx`)
  - Хук `useGuessWord` (`model/useGuessWord.ts`)
- [ ] **shared/ui/timer**: Компонент таймера
- [ ] **shared/ui/scoreboard**: Компонент таблицы очков
- [ ] **widgets/game-screen**: Основной экран игры
  - Композиция компонентов (`ui/game-screen.tsx`)
  - Область холста (`ui/canvas-area/`)
  - Информация об игре (`ui/game-info/`)
  - Таблица очков (`ui/scoreboard/`)
  - Отображение слова (только для художника)
  - Хук `useGameScreen` (`model/useGameScreen.ts`)
- [ ] **pages/game-page**: Страница игры
  - Композиция widgets/game-screen

### 3.6 Компоненты чата (FSD)

- [ ] **entities/chat**: Модель чата
  - Типы сообщений (`model/types.ts`)
  - Zustand store (`model/store.ts`)
  - API методы (`model/api.ts`)
- [ ] **features/send-message**: Отправка сообщения
  - UI инпут (`ui/message-input.tsx`)
  - Хук `useSendMessage` (`model/useSendMessage.ts`)
  - Отправка сообщения на сервер (публикация в Redis Stream)
- [ ] **shared/ui/chat-message**: Компонент отдельного сообщения
- [ ] **widgets/chat-panel**: Панель чата
  - Композиция компонентов (`ui/chat-panel.tsx`)
  - Список сообщений (`ui/messages-list/`)
  - Область ввода (`ui/message-input-area/`)
  - Подписка на обновления чата через WebSocket (из Redis Stream)
  - Отображение сообщений в реальном времени
  - Подсветка правильных ответов
  - Автоскролл к новым сообщениям
  - Хук `useChatPanel` (`model/useChatPanel.ts`)

### 3.7 Real-time обновления через Redis Streamer (FSD)

- [ ] **shared/lib/api/websocket.ts**: WebSocket клиент
  - Базовый класс для подключения
  - Управление соединением
- [ ] **shared/hooks/useWebSocket.ts**: Базовый хук для WebSocket
  - Подключение к WebSocket
  - Обработка переподключения
  - Восстановление подписок
- [ ] **entities/room/model/useRoomUpdates.ts**: Подписка на обновления комнаты
  - Чтение из Redis Stream `room:updates`
- [ ] **entities/game/model/useGameUpdates.ts**: Подписка на игровые события
  - Чтение из Redis Stream `game:events`
- [ ] **entities/drawing/model/useDrawingUpdates.ts**: Подписка на обновления холста
  - Чтение из Redis Stream `drawing:updates`
- [ ] **entities/chat/model/useChatUpdates.ts**: Подписка на сообщения чата
  - Чтение из Redis Stream `chat:messages`
- [ ] Обработка пропущенных сообщений при переподключении

### 3.8 Адаптивный дизайн

- [ ] Mobile-first подход
- [ ] Responsive layout для десктопа
- [ ] Оптимизация для планшетов
- [ ] Тестирование на различных устройствах

---

## Этап 4: Интеграция и тестирование

### 4.1 Интеграция компонентов

- [ ] Интеграция авторизации с комнатами
- [ ] Интеграция PixiJS с игровой логикой
- [ ] Интеграция чата с игрой
- [ ] Интеграция real-time обновлений

### 4.2 Тестирование

- [ ] Unit тесты для backend модулей
- [ ] E2E тесты для критических сценариев
- [ ] Тестирование WebSocket соединений
- [ ] Тестирование на мобильных устройствах
- [ ] Нагрузочное тестирование

### 4.3 Оптимизация

- [ ] Оптимизация размера бандла
- [ ] Оптимизация PixiJS производительности
- [ ] Оптимизация WebSocket сообщений для холста:
  - Реализация батчинга на клиенте и сервере
  - Настройка дебаунсинга для событий рисования
  - Тестирование производительности с разными частотами обновлений
  - Измерение latency и throughput
  - Оптимизация формата данных (бинарный протокол при необходимости)
- [ ] Кэширование статических ресурсов
- [ ] Мониторинг производительности WebSocket:
  - Метрики количества сообщений в секунду
  - Размер сообщений
  - Latency обновлений холста

---

## Этап 5: Админка

### 5.1 Backend админки

- [ ] Создать модуль `admin` в NestJS
- [ ] Реализовать Admin Guard:
  - Проверка заголовка `X-Admin-Secret`
  - Сравнение с `ADMIN_SECRET` из переменных окружения
  - Возврат 401 при неверном секрете
- [ ] Создать модуль `admin/dictionaries`:
  - CRUD операции для словарей
  - Валидация входных данных
  - Поддержка массовых операций
- [ ] Endpoints админки (защищенные Guard):
  - Управление словарями
  - Статистика по словарям

### 5.2 Frontend админки (FSD)

- [ ] **shared/ui/admin-layout**: Layout для админки
- [ ] **features/admin/auth**: Авторизация админа
  - Проверка Secret header
  - Хранение состояния авторизации
- [ ] **entities/dictionary**: Модель словаря
  - Типы словаря (`model/types.ts`)
  - API методы (`model/api.ts`)
- [ ] **features/admin/manage-dictionaries**: Управление словарями
  - UI форма добавления/редактирования слова (`ui/dictionary-form.tsx`)
  - UI таблица словарей (`ui/dictionaries-table.tsx`)
  - Фильтрация по сложности
  - Массовое добавление слов (`ui/bulk-upload.tsx`)
  - Хуки для CRUD операций
- [ ] **widgets/admin-dictionaries-panel**: Панель управления словарями
  - Композиция features/admin/manage-dictionaries
- [ ] **pages/admin-page**: Страница админки
  - Композиция widgets/admin-dictionaries-panel
- [ ] Страница `/admin` в App Router (защищена middleware)

### 5.3 Настройка nginx для production

- [ ] Конфигурация nginx для админки:
  ```nginx
  location /admin {
    # Проверка Secret header
    if ($http_x_admin_secret != "your-secret-key") {
      return 403;
    }
    proxy_pass http://backend;
    proxy_set_header X-Admin-Secret $http_x_admin_secret;
  }
  ```
- [ ] Настройка переменных окружения для админки
- [ ] Документация по настройке доступа

---

## Этап 6: Дополнительные функции

### 6.1 Улучшения UX

- [ ] Анимации переходов
- [ ] Звуковые эффекты
- [ ] Уведомления
- [ ] Подсказки для новых игроков

### 6.2 Статистика

- [ ] Личная статистика игрока
- [ ] История рисунков пользователя
- [ ] Рейтинг игроков

### 6.3 Дополнительные настройки

- [ ] Кастомные словари
- [ ] Настройки кисти (больше опций)
- [ ] Темы оформления

---

## Технические детали

### База данных (Prisma Schema)

```prisma
model User {
  id          String   @id @default(cuid())
  telegramId  String?  @unique
  username    String?
  name        String
  createdAt   DateTime @default(now())
  
  rooms       RoomUser[]
  drawings    Drawing[]
  chatMessages ChatMessage[]
  matches     Match[]  @relation("Drawer")
}

model Room {
  id          String   @id @default(cuid())
  code        String   @unique
  hostId      String
  host        User     @relation("Host", fields: [hostId], references: [id])
  settings    Json     // { difficulty: string, timer: number }
  status      String   @default("waiting") // waiting, playing, finished
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       RoomUser[]
  matches     Match[]
  chatMessages ChatMessage[]
}

model RoomUser {
  id        String   @id @default(cuid())
  roomId    String
  userId    String
  score     Int      @default(0)
  joinedAt  DateTime @default(now())
  
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([roomId, userId])
}

model Match {
  id          String   @id @default(cuid())
  roomId      String
  drawerId    String
  drawer      User     @relation("Drawer", fields: [drawerId], references: [id])
  word        String
  difficulty  String
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  
  room        Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  drawing     Drawing?
  chatMessages ChatMessage[]
}

model Drawing {
  id          String   @id @default(cuid())
  matchId     String   @unique
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  imageUrl    String
  createdAt   DateTime @default(now())
  
  match       Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
}

model ChatMessage {
  id          String   @id @default(cuid())
  roomId      String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  matchId     String?
  match       Match?   @relation(fields: [matchId], references: [id])
  message     String
  isCorrect   Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  room        Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
}

model WordDictionary {
  id          String   @id @default(cuid())
  word        String
  difficulty  String   // easy, medium, hard
  language    String   @default("ru")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([word, difficulty, language])
  @@index([difficulty, isActive])
}
```

### WebSocket события

#### Клиент → Сервер

- `room:join` - присоединиться к комнате
- `room:leave` - покинуть комнату
- `game:start` - начать игру
- `game:draw` - обновление рисунка
- `game:guess` - предположение
- `chat:message` - сообщение в чат

#### Сервер → Клиент (через Redis Streamer)

- `room:updated` - обновление комнаты (из потока `room:updates`)
- `room:user-joined` - пользователь присоединился (из потока `room:updates`)
- `room:user-left` - пользователь покинул (из потока `room:updates`)
- `game:started` - игра началась (из потока `game:events`)
- `game:drawing-update` - обновление рисунка (из потока `drawing:updates`)
- `game:guess-received` - получено предположение (из потока `game:events`)
- `game:correct-guess` - правильный ответ (из потока `game:events`)
- `game:ended` - игра завершена (из потока `game:events`)
- `chat:new-message` - новое сообщение (из потока `chat:messages`)

**Важно**: Все обновления холста и чата проходят через Redis Streamer для обеспечения синхронизации между всеми клиентами и инстансами сервера.

### API Endpoints

#### Авторизация
- `POST /auth/telegram` - авторизация через Telegram
- `POST /auth/guest` - гостевой вход

#### Комнаты
- `POST /rooms` - создать комнату
- `GET /rooms/:code` - получить комнату
- `POST /rooms/:code/join` - присоединиться
- `POST /rooms/:code/leave` - покинуть
- `DELETE /rooms/:code` - удалить комнату

#### Игры
- `POST /games/:roomId/start` - начать игру
- `POST /games/:roomId/guess` - отправить предположение
- `GET /games/:roomId/current` - текущий матч

#### Чат
- `GET /chat/:roomId/messages` - история сообщений
- `POST /chat/:roomId/messages` - отправить сообщение

#### Рисунки
- `POST /drawings` - загрузить рисунок
- `GET /drawings/:id` - получить рисунок
- `GET /drawings/user/:userId` - рисунки пользователя

#### Админка (требует заголовок `X-Admin-Secret`)
- `GET /admin/dictionaries` - получить все слова (query: `?difficulty=easy&isActive=true`)
- `GET /admin/dictionaries/:id` - получить слово по ID
- `POST /admin/dictionaries` - добавить новое слово
  ```json
  {
    "word": "крокодил",
    "difficulty": "easy",
    "language": "ru"
  }
  ```
- `PUT /admin/dictionaries/:id` - обновить слово
- `DELETE /admin/dictionaries/:id` - деактивировать слово (мягкое удаление)
- `POST /admin/dictionaries/bulk` - массовое добавление слов
  ```json
  {
    "words": [
      { "word": "слово1", "difficulty": "easy", "language": "ru" },
      { "word": "слово2", "difficulty": "medium", "language": "ru" }
    ]
  }
  ```
- `GET /admin/dictionaries/stats` - статистика по словарям
  ```json
  {
    "total": 1000,
    "byDifficulty": {
      "easy": 400,
      "medium": 350,
      "hard": 250
    },
    "active": 950,
    "inactive": 50
  }
  ```

---

## Порядок разработки (Рекомендуемый)

1. **Неделя 1**: Настройка инфраструктуры, БД, базовые модули backend
2. **Неделя 2**: Авторизация, модуль комнат, WebSocket gateway
3. **Неделя 3**: Игровая логика, модуль чата, модуль рисунков
4. **Неделя 4**: Frontend авторизация, создание комнат, лобби
5. **Неделя 5**: Интеграция PixiJS, игровой экран
6. **Неделя 6**: Чат, real-time обновления, адаптивный дизайн
7. **Неделя 7**: Админка (backend + frontend), управление словарями
8. **Неделя 8**: Тестирование, оптимизация, багфиксы
9. **Неделя 9**: Дополнительные функции, полировка

---

## Зависимости

### Frontend
- `next` - Next.js фреймворк
- `react` - React библиотека
- `pixi.js` - Графическая библиотека
- `zustand` - Управление состоянием
- `socket.io-client` - WebSocket клиент
- `axios` - HTTP клиент
- `zod` - Валидация схем
- `tanstack-query` - Кеширование запросов

### Backend
- `@nestjs/core` - NestJS core
- `@nestjs/websockets` - WebSocket поддержка
- `@nestjs/platform-socket.io` - Socket.io адаптер
- `prisma` - ORM
- `@prisma/client` - Prisma клиент
- `redis` - Redis клиент
- `ioredis` - Redis клиент для Node.js
- `jsonwebtoken` - JWT токены
- `class-validator` - Валидация DTO
- `class-transformer` - Трансформация объектов

---

## Переменные окружения

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/craw"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_SECRET="your-secret-key"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
ADMIN_SECRET="your-admin-secret-key"  # Секретный ключ для админки
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
NEXT_PUBLIC_TELEGRAM_BOT_NAME="your-bot-name"
```

---

## Админка - Детали реализации

### Авторизация через Secret Header

Админка использует простую авторизацию через секретный ключ в HTTP заголовке. Это позволяет:
- Использовать nginx для проверки доступа в production
- Избежать сложной системы сессий для админки
- Легко интегрировать с reverse proxy

#### Backend реализация

**Admin Guard (NestJS):**
```typescript
// admin/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminSecret = request.headers['x-admin-secret'];
    const expectedSecret = this.configService.get('ADMIN_SECRET');
    
    return adminSecret === expectedSecret;
  }
}
```

**Использование:**
```typescript
// admin/dictionaries/dictionaries.controller.ts
@Controller('admin/dictionaries')
@UseGuards(AdminGuard)
export class DictionariesController {
  // Все endpoints защищены AdminGuard
}
```

#### Nginx конфигурация для production

**Пример конфигурации:**
```nginx
# Проверка Secret header на уровне nginx
location /admin {
  # Проверка наличия и правильности Secret header
  if ($http_x_admin_secret != "your-admin-secret-key") {
    return 403;
  }
  
  # Проксирование на backend
  proxy_pass http://localhost:3001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  
  # Передача Secret header на backend
  proxy_set_header X-Admin-Secret $http_x_admin_secret;
  
  proxy_cache_bypass $http_upgrade;
}
```

**Альтернативный вариант с использованием переменных:**
```nginx
# В http блоке
map $http_x_admin_secret $admin_allowed {
  default 0;
  "your-admin-secret-key" 1;
}

# В server блоке
location /admin {
  if ($admin_allowed = 0) {
    return 403;
  }
  
  proxy_pass http://localhost:3001;
  proxy_set_header X-Admin-Secret $http_x_admin_secret;
  # ... остальные proxy настройки
}
```

### Управление словарями

#### Структура данных словаря

```typescript
interface WordDictionary {
  id: string;
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string; // 'ru', 'en', etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### API примеры использования

**Добавление слова:**
```bash
curl -X POST http://localhost:3001/admin/dictionaries \
  -H "X-Admin-Secret: your-admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "крокодил",
    "difficulty": "easy",
    "language": "ru"
  }'
```

**Массовое добавление:**
```bash
curl -X POST http://localhost:3001/admin/dictionaries/bulk \
  -H "X-Admin-Secret: your-admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "words": [
      {"word": "слон", "difficulty": "easy", "language": "ru"},
      {"word": "компьютер", "difficulty": "medium", "language": "ru"},
      {"word": "философия", "difficulty": "hard", "language": "ru"}
    ]
  }'
```

**Получение статистики:**
```bash
curl -X GET http://localhost:3001/admin/dictionaries/stats \
  -H "X-Admin-Secret: your-admin-secret-key"
```

#### Frontend интеграция

**Пример использования в компоненте:**
```typescript
// features/admin/manage-dictionaries/model/useDictionaries.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { dictionariesApi } from '@/shared/api';

export const useDictionaries = (difficulty?: string) => {
  return useQuery({
    queryKey: ['dictionaries', difficulty],
    queryFn: () => dictionariesApi.getAll({ difficulty }),
  });
};

export const useCreateDictionary = () => {
  return useMutation({
    mutationFn: dictionariesApi.create,
  });
};
```

**Настройка axios для админки:**
```typescript
// shared/lib/api/admin-client.ts
import axios from 'axios';

export const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'X-Admin-Secret': process.env.NEXT_PUBLIC_ADMIN_SECRET, // Только для клиентских запросов
  },
});
```

**Важно**: В production рекомендуется проверять Secret header только на уровне nginx, а не передавать его из клиента. Для этого можно использовать отдельный поддомен или путь с защитой на уровне reverse proxy.

### Безопасность

1. **Secret ключ должен быть:**
   - Длинным и случайным (минимум 32 символа)
   - Храниться в переменных окружения
   - Не попадать в git репозиторий
   - Регулярно обновляться

2. **Рекомендации:**
   - Использовать HTTPS для всех запросов к админке
   - Ограничить доступ к админке по IP (в nginx)
   - Логировать все запросы к админке
   - Рассмотреть возможность добавления rate limiting

3. **Пример ограничения по IP в nginx:**
```nginx
location /admin {
  allow 192.168.1.0/24;  # Разрешить только локальную сеть
  allow 10.0.0.0/8;       # Или другую сеть
  deny all;               # Запретить все остальное
  
  if ($http_x_admin_secret != "your-admin-secret-key") {
    return 403;
  }
  
  proxy_pass http://localhost:3001;
}
```

---

## Оптимизация WebSocket для холста - Детали реализации

### Проблема

При активном рисовании может генерироваться большое количество событий (десятки в секунду), что приводит к:
- Перегрузке сети
- Высокой нагрузке на сервер
- Задержкам в доставке сообщений
- Проблемам на мобильных устройствах с медленным интернетом

### Решения

#### 1. Батчинг обновлений

**Принцип**: Собирать несколько событий рисования в один пакет перед отправкой.

**Backend реализация:**
```typescript
// websocket/drawing-batcher.service.ts
@Injectable()
export class DrawingBatcherService {
  private batches = new Map<string, DrawingEvent[]>();
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_INTERVAL = 50; // ms

  addEvent(roomId: string, event: DrawingEvent) {
    if (!this.batches.has(roomId)) {
      this.batches.set(roomId, []);
      setTimeout(() => this.flushBatch(roomId), this.BATCH_INTERVAL);
    }
    
    const batch = this.batches.get(roomId)!;
    batch.push(event);
    
    if (batch.length >= this.BATCH_SIZE) {
      this.flushBatch(roomId);
    }
  }

  private flushBatch(roomId: string) {
    const batch = this.batches.get(roomId);
    if (!batch || batch.length === 0) return;
    
    // Отправка батча через WebSocket
    this.gateway.sendDrawingBatch(roomId, batch);
    this.batches.delete(roomId);
  }
}
```

**Frontend реализация:**
```typescript
// features/draw-canvas/model/useDrawingBatcher.ts
export const useDrawingBatcher = () => {
  const batchRef = useRef<DrawingEvent[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout>();

  const addToBatch = useCallback((event: DrawingEvent) => {
    batchRef.current.push(event);
    
    // Отправка при достижении размера батча
    if (batchRef.current.length >= 10) {
      flushBatch();
      return;
    }
    
    // Отправка через интервал
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    
    flushTimeoutRef.current = setTimeout(() => {
      flushBatch();
    }, 50);
  }, []);

  const flushBatch = useCallback(() => {
    if (batchRef.current.length === 0) return;
    
    socket.emit('game:draw-batch', {
      roomId,
      events: batchRef.current
    });
    
    batchRef.current = [];
  }, [roomId]);

  return { addToBatch, flushBatch };
};
```

#### 2. Дебаунсинг и Throttling

**Принцип**: Ограничить частоту отправки событий.

**Frontend реализация:**
```typescript
// features/draw-canvas/model/useDrawingThrottle.ts
export const useDrawingThrottle = (callback: (event: DrawingEvent) => void) => {
  const lastSentRef = useRef<number>(0);
  const THROTTLE_MS = 16; // ~60 FPS

  return useCallback((event: DrawingEvent) => {
    const now = Date.now();
    
    // Критичные события (начало/конец) отправляем сразу
    if (event.type === 'start' || event.type === 'end') {
      callback(event);
      return;
    }
    
    // Throttle для промежуточных событий
    if (now - lastSentRef.current >= THROTTLE_MS) {
      callback(event);
      lastSentRef.current = now;
    }
  }, [callback]);
};
```

#### 3. Оптимизация формата данных

**Принцип**: Минимизировать размер каждого сообщения.

**Оптимизированный формат:**
```typescript
// До оптимизации (JSON)
{
  "type": "draw",
  "x": 123.456,
  "y": 789.012,
  "color": "#FF0000",
  "brushSize": 5,
  "pressure": 0.8,
  "timestamp": 1234567890123
}
// Размер: ~120 байт

// После оптимизации (бинарный формат)
// [type:1][x:2][y:2][color:3][brushSize:1][pressure:1]
// Размер: ~10 байт

// Или компактный JSON с короткими ключами
{
  "t": "d",
  "x": 123,
  "y": 789,
  "c": "#F00",
  "b": 5,
  "p": 80
}
// Размер: ~50 байт
```

**Реализация компактного формата:**
```typescript
// shared/lib/drawing/compact-format.ts
export const compactDrawingEvent = (event: DrawingEvent) => ({
  t: event.type === 'draw' ? 'd' : event.type === 'start' ? 's' : 'e',
  x: Math.round(event.x),
  y: Math.round(event.y),
  c: event.color.substring(1), // Убрать #
  b: event.brushSize,
  p: Math.round(event.pressure * 100)
});

export const expandDrawingEvent = (compact: CompactDrawingEvent): DrawingEvent => ({
  type: compact.t === 'd' ? 'draw' : compact.t === 's' ? 'start' : 'end',
  x: compact.x,
  y: compact.y,
  color: `#${compact.c}`,
  brushSize: compact.b,
  pressure: compact.p / 100
});
```

#### 4. Delta-кодирование

**Принцип**: Отправлять только изменения относительно предыдущего состояния.

```typescript
// Отправка относительных координат вместо абсолютных
const deltaEncode = (events: DrawingEvent[]): DeltaEvent[] => {
  let lastX = 0;
  let lastY = 0;
  
  return events.map(event => {
    const deltaX = event.x - lastX;
    const deltaY = event.y - lastY;
    lastX = event.x;
    lastY = event.y;
    
    return {
      ...event,
      dx: deltaX,
      dy: deltaY
    };
  });
};
```

#### 5. Приоритизация сообщений

**Принцип**: Критичные события отправлять немедленно, остальные батчить.

```typescript
// features/draw-canvas/model/usePriorityDrawing.ts
export const usePriorityDrawing = () => {
  const batcher = useDrawingBatcher();
  
  const sendDrawingEvent = useCallback((event: DrawingEvent) => {
    // Критичные события отправляем сразу
    if (event.type === 'start' || event.type === 'end' || event.type === 'clear') {
      socket.emit('game:draw', event);
      return;
    }
    
    // Остальные батчим
    batcher.addToBatch(event);
  }, [batcher]);
  
  return { sendDrawingEvent };
};
```

#### 6. Обработка переполнения буфера

**Принцип**: При переполнении пропускать старые события, сохраняя только последние.

```typescript
// websocket/drawing-buffer.service.ts
export class DrawingBufferService {
  private readonly MAX_BUFFER_SIZE = 100;
  
  addEvent(roomId: string, event: DrawingEvent) {
    const buffer = this.getBuffer(roomId);
    
    buffer.push(event);
    
    // Если буфер переполнен, оставляем только последние события
    if (buffer.length > this.MAX_BUFFER_SIZE) {
      const keepCount = Math.floor(this.MAX_BUFFER_SIZE * 0.7);
      buffer.splice(0, buffer.length - keepCount);
    }
  }
}
```

### Метрики для мониторинга

```typescript
// websocket/drawing-metrics.service.ts
@Injectable()
export class DrawingMetricsService {
  private metrics = {
    eventsPerSecond: 0,
    averageMessageSize: 0,
    averageLatency: 0,
    batchEfficiency: 0 // Процент событий в батчах
  };

  recordEvent(size: number, latency: number, isBatched: boolean) {
    // Обновление метрик
    // Экспорт в Prometheus/Grafana
  }
}
```

### Рекомендуемые параметры

- **Батчинг**: 5-10 событий или 50-100ms интервал
- **Throttling**: 16-33ms (30-60 FPS)
- **Максимальный размер батча**: 20-30 событий
- **Размер буфера**: 50-100 событий
- **Критичные события**: start, end, clear - отправлять немедленно

### Тестирование производительности

- [ ] Нагрузочное тестирование с разным количеством одновременных художников
- [ ] Измерение latency на разных типах соединений (3G, 4G, WiFi)
- [ ] Тестирование на мобильных устройствах
- [ ] Мониторинг использования памяти и CPU
- [ ] Сравнение производительности до и после оптимизации

---

## Полезные ресурсы

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [PixiJS Documentation](https://pixijs.com/guides)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Redis Streams](https://redis.io/docs/data-types/streams/)
- [Socket.io Documentation](https://socket.io/docs/v4)

---

## Архитектура Redis Streamer

### Потоки Redis

1. **`drawing:updates`** - Обновления холста
   - Содержит данные о рисовании (координаты, цвет, размер кисти)
   - Публикуется художником при каждом действии рисования
   - Читается всеми участниками комнаты для синхронизации холста

2. **`chat:messages`** - Сообщения чата
   - Содержит текст сообщения, автора, время
   - Публикуется при отправке сообщения
   - Читается всеми участниками комнаты

3. **`room:updates`** - Обновления состояния комнаты
   - Изменение настроек, присоединение/выход игроков
   - Публикуется при изменении состояния комнаты

4. **`game:events`** - Игровые события
   - Начало/конец матча, правильные ответы, смена художника
   - Публикуется при игровых событиях

### Механизм работы

1. Клиент отправляет событие через WebSocket
2. Сервер публикует событие в соответствующий Redis Stream
3. Consumer сервис читает из потока
4. Consumer рассылает событие всем подключенным клиентам через WebSocket
5. Клиенты получают обновления и синхронизируют состояние
