import { create } from 'zustand';
import { ChatMessage, ChatState } from './types';

interface ChatStore extends ChatState {
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
}

/**
 * Zustand store для управления состоянием чата
 */
export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) =>
    set({
      messages,
    }),
  clearMessages: () =>
    set({
      messages: [],
    }),
}));
