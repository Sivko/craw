# Модуль авторизации

Модуль авторизации предоставляет два способа входа в систему:
1. **Telegram MiniApp** - авторизация через Telegram Web App
2. **Гостевой вход** - простая авторизация по имени

## Установка зависимостей

Перед использованием модуля необходимо установить зависимости:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt class-validator class-transformer
npm install --save-dev @types/passport-jwt
```

## Переменные окружения

Добавьте следующие переменные в `.env` файл:

```env
# JWT настройки
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Telegram Bot Token (для валидации данных от Telegram MiniApp)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

## API Endpoints

### POST /auth/telegram

Авторизация через Telegram MiniApp.

**Тело запроса:**
```json
{
  "id": "123456789",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://...",
  "auth_date": "1234567890",
  "hash": "hash-string-from-telegram"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "username": "johndoe",
      "telegramId": "123456789"
    },
    "token": "jwt-token"
  },
  "error": null
}
```

### POST /auth/guest

Гостевой вход.

**Тело запроса:**
```json
{
  "name": "Guest User"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "Guest User"
    },
    "token": "jwt-token"
  },
  "error": null
}
```

## Использование в других модулях

### Защита эндпоинтов

По умолчанию все эндпоинты защищены JWT авторизацией. Для публичных эндпоинтов используйте декоратор `@Public()`:

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Get()
  @Public()
  getPublicData() {
    return { message: 'This is public' };
  }
}
```

### Получение текущего пользователя

Используйте декоратор `@CurrentUser()` для получения текущего пользователя:

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('protected')
export class ProtectedController {
  @Get('profile')
  getProfile(@CurrentUser() user) {
    return user;
  }
}
```

## Безопасность

- JWT токены имеют срок действия (по умолчанию 7 дней)
- Данные от Telegram валидируются через HMAC-SHA256
- Данные от Telegram считаются устаревшими через 24 часа
- Все входные данные валидируются через `class-validator`

## Структура модуля

```
auth/
├── dto/
│   ├── telegram-auth.dto.ts      # DTO для Telegram авторизации
│   ├── guest-auth.dto.ts          # DTO для гостевого входа
│   └── auth-response.dto.ts       # DTO для ответа авторизации
├── strategies/
│   └── jwt.strategy.ts             # JWT стратегия для Passport
├── guards/
│   └── jwt-auth.guard.ts          # Guard для защиты эндпоинтов
├── decorators/
│   ├── public.decorator.ts        # Декоратор для публичных эндпоинтов
│   └── current-user.decorator.ts  # Декоратор для получения текущего пользователя
├── auth.controller.ts             # Контроллер авторизации
├── auth.service.ts                # Сервис авторизации
├── auth.module.ts                 # Модуль авторизации
└── README.md                      # Документация
```
