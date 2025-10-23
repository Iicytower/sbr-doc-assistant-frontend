"use client";
// Kontekst czatu do dynamicznego przeładowywania rozmowy
import React, { createContext, useContext, useState, useCallback } from 'react';

import ApiClient from '@/backend/backend';
import type { ChatMessage } from '@/lib/types';

interface ChatData {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  activeChat: ChatData | null;
  setActiveChatId: (chatId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChat, setActiveChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setActiveChatId = useCallback(async (chatId: string) => {
    setLoading(true);
    setError(null);
    try {
      const api = new ApiClient();
      const chat = await api.getChatById({ chatId });
      // Mapuj wiadomości na typ ChatMessage z lib/types
  const messages: ChatMessage[] = (chat.messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        parts: [
          { type: 'text', text: msg.content },
        ],
        metadata: { createdAt: msg.createdAt || new Date().toISOString() },
        attachments: msg.attachments || [],
      }));
      setActiveChat({
        id: chat.id,
        name: chat.name,
        messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load chat');
      setActiveChat(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setActiveChat(null);
    setError(null);
    setLoading(false);
  }, []);

  return (
    <ChatContext.Provider value={{ activeChat, setActiveChatId, loading, error, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
};
