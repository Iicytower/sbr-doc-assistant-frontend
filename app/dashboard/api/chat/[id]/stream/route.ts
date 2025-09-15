
// Wszystkie funkcje backendowe zamockowane lub usunięte
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import { createUIMessageStream, } from 'ai';
import { getStreamContext } from '../../route';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: chatId } = await params;

  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  if (!chatId) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  // MOCK: pomiń autoryzację, zakładaj zawsze dostęp
  // const session = await auth();
  // if (!session?.user) {
  //   return new ChatSDKError('unauthorized:chat').toResponse();
  // }

  // MOCK: Zwracaj pusty stream lub przykładową odpowiedź
  const emptyDataStream = createUIMessageStream<ChatMessage>({
    execute: () => {},
  });
  return new Response(emptyDataStream, { status: 200 });
}
