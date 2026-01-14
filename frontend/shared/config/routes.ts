/**
 * Маршруты приложения
 */
export const routes = {
  home: '/',
  auth: '/auth',
  room: (code: string) => `/room/${code}`,
  game: (roomId: string) => `/game/${roomId}`,
} as const;
