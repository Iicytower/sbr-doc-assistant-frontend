// Mock implementation for missing db queries
// TODO: Replace with real implementations when backend is ready

export async function getChatById({ id }: { id: string }) {
  return {
    id,
    userId: 'mock-user',
    visibility: 'public',
    title: 'Mock Chat',
  };
}

export async function getMessagesByChatId({ id }: { id: string }) {
  return [];
}

export async function getVotesByChatId({ id }: { id: string }) {
  return [];
}

export async function voteMessage({ chatId, messageId, type }: { chatId: string; messageId: string; type: 'up' | 'down' }) {
  return { success: true };
}

export async function getDocumentById({ id }: { id: string }) {
  return {
    id,
    title: 'Mock Document',
    kind: 'text',
    content: 'Mock content',
    createdAt: new Date(),
  };
}

export async function saveSuggestions({ suggestions }: { suggestions: any[] }) {
  return { success: true };
}

export async function saveDocument({ id, title, content, kind, userId }: { id: string; title: string; content: string; kind: string; userId: string }) {
  return { success: true };
}

export async function saveMessages({ messages }: { messages: any[] }) {
  return { success: true };
}
