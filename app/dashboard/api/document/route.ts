
import type { ArtifactKind } from '@/components/artifact';
// Wszystkie funkcje backendowe zamockowane lub usunięte
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter id is missing',
    ).toResponse();
  }

  // MOCK: pomiń autoryzację, zakładaj zawsze dostęp
  // const session = await auth();
  // if (!session?.user) {
  //   return new ChatSDKError('unauthorized:document').toResponse();
  // }

  // MOCK: zwróć pustą tablicę dokumentów
  return Response.json([], { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter id is required.',
    ).toResponse();
  }

  // MOCK: pomiń autoryzację, zakładaj zawsze dostęp
  // const session = await auth();
  // if (!session?.user) {
  //   return new ChatSDKError('not_found:document').toResponse();
  // }

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: ArtifactKind } =
    await request.json();

  // MOCK: zwróć przykładowy dokument
  return Response.json({ id, content, title, kind, userId: 'mock-user' }, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const timestamp = searchParams.get('timestamp');

  if (!id) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter id is required.',
    ).toResponse();
  }

  if (!timestamp) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter timestamp is required.',
    ).toResponse();
  }

  // MOCK: pomiń autoryzację, zakładaj zawsze dostęp
  // const session = await auth();
  // if (!session?.user) {
  //   return new ChatSDKError('unauthorized:document').toResponse();
  // }

  // MOCK: zawsze zwracaj sukces
  return Response.json({ success: true }, { status: 200 });
}
