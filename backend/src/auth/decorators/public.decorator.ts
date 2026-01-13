import { SetMetadata } from '@nestjs/common';

/**
 * Декоратор для публичных эндпоинтов
 * Используется для отключения проверки авторизации
 */
export const Public = () => SetMetadata('isPublic', true);
