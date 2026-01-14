import { create } from 'zustand';
import { Match, GameState } from './types';

interface GameStore extends GameState {
  setMatch: (match: Match) => void;
  clearMatch: () => void;
  setTimeRemaining: (time: number) => void;
  updateScore: (userId: string, score: number) => void;
}

/**
 * Zustand store для управления состоянием игры
 */
export const useGameStore = create<GameStore>((set) => ({
  currentMatch: null,
  timeRemaining: 0,
  scores: {},
  setMatch: (match) =>
    set({
      currentMatch: match,
    }),
  clearMatch: () =>
    set({
      currentMatch: null,
      timeRemaining: 0,
      scores: {},
    }),
  setTimeRemaining: (time) =>
    set({
      timeRemaining: time,
    }),
  updateScore: (userId, score) =>
    set((state) => ({
      scores: {
        ...state.scores,
        [userId]: score,
      },
    })),
}));
