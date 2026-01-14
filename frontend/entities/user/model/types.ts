/**
 * Типы для пользователя
 */
export interface User {
  id: string;
  telegramId?: string;
  username?: string;
  name: string;
  createdAt: string;
}

export interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
