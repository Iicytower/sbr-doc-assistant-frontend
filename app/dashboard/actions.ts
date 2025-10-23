// MOCKED: All backend/database actions are disabled for local/dev use. All data is static/dummy and no real backend/database operations are performed.

// MOCKED: All backend/database actions are disabled for local/dev use.
// All functions below return static/dummy data and do not perform any real backend/database operations.

export async function saveChatModelAsCookie(model: string) {
  // No-op for mock
  return;
}

export async function generateTitleFromUserMessage({ message }: { message: any }) {
  return 'Mock Title';
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  // No-op for mock
  return;
}

export async function updateChatVisibility({ chatId, visibility }: { chatId: string; visibility: any }) {
  // No-op for mock
  return;
}
