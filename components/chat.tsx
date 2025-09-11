'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
// import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
// import { unstable_serialize } from 'swr/infinite';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';

import { useChatContext } from './chat-context';
import ApiClient from '@/backend/backend';

export function Chat({
  isReadonly,
  session,
  autoResume,
  disableSuggestedActions = false,
}: {
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  disableSuggestedActions?: boolean;
}) {
  const { activeChat, loading: chatLoading, error: chatError } = useChatContext();
  const id = activeChat?.id || '';
  const initialMessages = activeChat?.messages || [];
  const initialChatModel = activeChat?.name || '';
  const { visibilityType } = useChatVisibility({
    chatId: id,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');

  const apiClient = new ApiClient();

  // Custom transport do useChat, korzystający z apiClient.chatPrompt()
  const customChatTransport = {
    async sendMessages({ messages, id, body }: any) {
      // Wyciągamy prompt z ostatniej wiadomości użytkownika
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').at(-1);
      const prompt = lastUserMsg?.parts?.find((p: any) => p.type === 'text')?.text || '';
      const categories = body?.categories;
      const chatId = localStorage.getItem('lastSelectedChatId') as string;
      // Wywołanie apiClient.chatPrompt
      const response = await apiClient.chatPrompt({ prompt, categories, chatId });
      // Zwróć nową wiadomość asystenta, aby useChat dodał ją do rozmowy
      if (response?.llmResponse?.text) {
        messages.push({
            id: crypto.randomUUID(),
            metadata: {
              createdAt: new Date().toISOString(),
            },
            role: 'assistant',
            parts: [{ type: 'text', text: response.llmResponse.text }],
          });

        setMessages(messages);
      }
      return { messages };
    },
  };

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: customChatTransport,
    // Wszystkie akcje przy wysyłaniu wiadomości zostały usunięte
  });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  // useEffect usunięty – brak automatycznego wysyłania wiadomości i modyfikacji historii przeglądarki

  // Usunięto pobieranie votes przez useSWR – nie będzie requestu do /api/vote

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  if (chatLoading) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400">Ładowanie czatu...</div>;
  }
  if (chatError) {
    return <div className="flex-1 flex items-center justify-center text-red-400">Błąd: {chatError}</div>;
  }
  if (!activeChat) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400">Wybierz czat z listy po lewej</div>;
  }

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background touch-pan-y overscroll-behavior-contain">
        <ChatHeader
          chatId={id}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={status}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          selectedModelId={initialChatModel}
        />

        <div className="sticky bottom-0 flex gap-2 px-2 md:px-4 pb-3 md:pb-4 mx-auto w-full bg-background max-w-4xl z-[1] border-t-0">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              sendMessage={sendMessage}
              selectedModelId={initialChatModel}
              disableSuggestedActions={disableSuggestedActions}
            />
          )}
        </div>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        isReadonly={isReadonly}
        selectedModelId={initialChatModel}
      />
    </>
  );
}
