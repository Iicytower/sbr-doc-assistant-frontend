
// Wszystkie funkcje backendowe zamockowane lub usunięte
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter documentId is required.',
    ).toResponse();
  }

  // MOCK: pomiń autoryzację, zakładaj zawsze dostęp
  // const session = await auth();
  // if (!session?.user) {
  //   return new ChatSDKError('unauthorized:suggestions').toResponse();
  // }

  // MOCK: zwróć pustą tablicę sugestii
  return Response.json([], { status: 200 });
}
