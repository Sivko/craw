/**
 * DTO для ответа авторизации
 */
export class AuthResponseDto {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      username?: string;
      telegramId?: string;
    };
    token: string;
  };
  error: null;
}
