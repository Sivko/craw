import { io, Socket } from 'socket.io-client';

/**
 * WebSocket клиент для real-time обновлений
 */
export class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  /**
   * Подключение к WebSocket серверу
   */
  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    return this.socket;
  }

  /**
   * Отключение от WebSocket сервера
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Получение экземпляра socket
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Проверка подключения
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton экземпляр
export const wsClient = new WebSocketClient();
