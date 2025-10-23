
import type { NextRequest } from 'next/server';
// Wszystkie funkcje backendowe zamockowane lub usunięte
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = Number.parseInt(searchParams.get('limit') || '10');
  const startingAfter = searchParams.get('starting_after');
  const endingBefore = searchParams.get('ending_before');

  if (startingAfter && endingBefore) {
    return new ChatSDKError(
      'bad_request:api',
      'Only one of starting_after or ending_before can be provided.',
    ).toResponse();
  }

  // MOCK: pomiń autoryzację, zakładaj zawsze dostęp
  // const session = await auth();
  // if (!session?.user) {
  //   return new ChatSDKError('unauthorized:chat').toResponse();
  // }

  // MOCK: zwróć pustą tablicę czatów
  return Response.json([]);
}
