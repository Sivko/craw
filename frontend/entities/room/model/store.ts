import { create } from 'zustand';
import { Room, RoomState } from './types';

interface RoomStore extends RoomState {
  setRoom: (room: Room) => void;
  clearRoom: () => void;
  updateRoom: (updates: Partial<Room>) => void;
}

/**
 * Zustand store для управления состоянием комнаты
 */
export const useRoomStore = create<RoomStore>((set) => ({
  currentRoom: null,
  setRoom: (room) => set({ currentRoom: room }),
  clearRoom: () => set({ currentRoom: null }),
  updateRoom: (updates) =>
    set((state) => ({
      currentRoom: state.currentRoom
        ? { ...state.currentRoom, ...updates }
        : null,
    })),
}));
