# Игра "Крокодил"

Многопользовательская игра, где один игрок рисует слово, а остальные пытаются его угадать.

## Технологии

- **Backend**: NestJS, PostgreSQL, Redis, Prisma
- **Frontend**: Next.js, React, TypeScript
- **Infrastructure**: Docker, Docker Compose

## Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Node.js 20+ (для локальной разработки)

### Запуск через Docker Compose

#### Автоматическая инициализация

Используйте скрипт инициализации для автоматической настройки:

```bash
./scripts/init.sh
```

Скрипт выполнит:
- Создание `.env` файла из примера
- Запуск PostgreSQL и Redis
- Установку зависимостей
- Выполнение миграций базы данных
- Заполнение базы данных начальными данными

#### Ручная настройка

1. Скопируйте файл с переменными окружения:
   ```bash
   cp .env.example .env
   ```

2. При необходимости отредактируйте `.env` файл

3. Запустите все сервисы:
   ```bash
   docker-compose up -d
   ```

4. Выполните миграции базы данных:
   ```bash
   docker-compose exec backend npm run prisma:migrate
   ```

5. Заполните базу данных начальными данными:
   ```bash
   docker-compose exec backend npm run prisma:seed
   ```

6. Откройте в браузере:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Локальная разработка

#### Backend

1. Перейдите в директорию backend:
   ```bash
   cd backend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте `.env` файл на основе `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Убедитесь, что PostgreSQL и Redis запущены (через Docker Compose или локально)

5. Выполните миграции:
   ```bash
   npm run prisma:migrate
   ```

6. Заполните базу данных:
   ```bash
   npm run prisma:seed
   ```

7. Запустите сервер разработки:
   ```bash
   npm run start:dev
   ```

#### Frontend

1. Перейдите в директорию frontend:
   ```bash
   cd frontend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте `.env.local` файл на основе `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Запустите сервер разработки:
   ```bash
   npm run dev
   ```

## Структура проекта

```
craw/
├── backend/          # NestJS API
│   ├── src/
│   ├── prisma/       # Prisma схема и миграции
│   └── package.json
├── frontend/         # Next.js приложение
│   ├── app/
│   └── package.json
├── shared/           # Общие типы и утилиты
└── docker-compose.yml
```

## Переменные окружения

### Backend (.env)

```env
DATABASE_URL="postgresql://craw:craw_password@localhost:5432/craw"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_SECRET="your-secret-key-change-in-production"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
ADMIN_SECRET="your-admin-secret-key-change-in-production"
PORT=3001
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
NEXT_PUBLIC_TELEGRAM_BOT_NAME="your-bot-name"
```

## Полезные команды

### Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Просмотр логов
docker-compose logs -f [service_name]

# Перезапуск сервиса
docker-compose restart [service_name]
```

### Prisma

```bash
# Создание миграции
npm run prisma:migrate

# Генерация Prisma Client
npm run prisma:generate

# Открыть Prisma Studio
npm run prisma:studio

# Заполнить базу данных начальными данными
npm run prisma:seed
```

## Разработка

Подробный план разработки находится в файле `.cursor/plans/PLAN.md`.
