// MOCKED: All backend/database actions are disabled for local/dev use. All data is static/dummy and no real backend/database operations are performed.

// MOCKED: All backend/database actions are disabled for local/dev use.
// All functions below return static/dummy data and do not perform any real backend/database operations.

// Types for mocks
type User = { id: string; email: string; password?: string };
type Chat = { id: string; userId: string; title: string; visibility: string };
type DBMessage = { id: string; chatId: string; role: string; parts: any; createdAt: Date; attachments: any[] };
type VisibilityType = string;
type ArtifactKind = string;

// Dummy data
const dummyUser: User = { id: 'user1', email: 'test@example.com' };
const dummyChat: Chat = { id: 'chat1', userId: 'user1', title: 'Mock Chat', visibility: 'public' };
const dummyMessage: DBMessage = { id: 'msg1', chatId: 'chat1', role: 'user', parts: ['Hello'], createdAt: new Date(), attachments: [] };

export async function getUser(email: string): Promise<Array<User>> {
  return [dummyUser];
}

export async function createUser(email: string, password: string) {
  return { id: 'user2', email };
}

export async function createGuestUser() {
  return [{ id: 'guest1', email: 'guest@example.com' }];
}

export async function saveChat({ id, userId, title, visibility }: { id: string; userId: string; title: string; visibility: VisibilityType }) {
  return { id, userId, title, visibility };
}

export async function deleteChatById({ id }: { id: string }) {
  return { id };
}

export async function getChatsByUserId({ id, limit, startingAfter, endingBefore }: { id: string; limit: number; startingAfter: string | null; endingBefore: string | null }) {
  return { chats: [dummyChat], hasMore: false };
}

export async function getChatById({ id }: { id: string }) {
  return dummyChat;
}

export async function saveMessages({ messages }: { messages: Array<DBMessage> }) {
  return messages;
}

export async function getMessagesByChatId({ id }: { id: string }) {
  return [dummyMessage];
}

export async function voteMessage({ chatId, messageId, type }: { chatId: string; messageId: string; type: 'up' | 'down' }) {
  return { chatId, messageId, isUpvoted: type === 'up' };
}

export async function getVotesByChatId({ id }: { id: string }) {
  return [{ chatId: id, messageId: 'msg1', isUpvoted: true }];
}

export async function saveDocument({ id, title, kind, content, userId }: { id: string; title: string; kind: ArtifactKind; content: string; userId: string }) {
  return { id, title, kind, content, userId };
}

export async function getDocumentsById({ id }: { id: string }) {
  return [{ id, title: 'Doc', kind: 'text', content: '...', userId: 'user1' }];
}

export async function getDocumentById({ id }: { id: string }) {
  return { id, title: 'Doc', kind: 'text', content: '...', userId: 'user1' };
}

export async function deleteDocumentsByIdAfterTimestamp({ id, timestamp }: { id: string; timestamp: Date }) {
  return { id, deleted: true };
}

export async function saveSuggestions({ suggestions }: { suggestions: any[] }) {
  return suggestions;
}

export async function getSuggestionsByDocumentId({ id }: { id: string }) {
  return [{ id: 's1', suggestion: 'Try this' }];
}

export async function getMessageById({ id }: { id: string }) {
  return [dummyMessage];
}

export async function deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp }: { chatId: string; timestamp: Date }) {
  return { chatId, deleted: true };
}

export async function updateChatVisiblityById({ chatId, visibility }: { chatId: string; visibility: 'private' | 'public' }) {
  return { chatId, visibility };
}

export async function getMessageCountByUserId({ id, differenceInHours }: { id: string; differenceInHours: number }) {
  return 1;
}

export async function createStreamId({ streamId, chatId }: { streamId: string; chatId: string }) {
  return { streamId, chatId };
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  return ['stream1'];
}

