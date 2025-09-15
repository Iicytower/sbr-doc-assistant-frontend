// MOCKED: All backend/database actions are disabled for local/dev use. All data is static/dummy and no real backend/database operations are performed.
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';


import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  // MOCK: pomiń autoryzację, zakładaj zawsze dostęp
  const session = { user: { id: 'mock-user', name: 'Mock User' } };
  // if (!session) {
  //   redirect('/api/auth/guest');
  // }
  // if (chat.visibility === 'private') {
  //   if (!session.user) {
  //     return notFound();
  //   }
  //   if (session.user.id !== chat.userId) {
  //     return notFound();
  //   }
  // }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          isReadonly={session?.user?.id !== chat.userId}
          autoResume={true}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        isReadonly={session?.user?.id !== chat.userId}
        autoResume={true}
      />
      <DataStreamHandler />
    </>
  );
}
