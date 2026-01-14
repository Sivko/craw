import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { wsClient } from '../lib/api/websocket';

/**
 * Базовый хук для работы с WebSocket
 */
export function useWebSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Подключаемся к WebSocket
    const socket = wsClient.connect(token);
    socketRef.current = socket;

    return () => {
      // Отключаемся при размонтировании
      wsClient.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef.current;
}
