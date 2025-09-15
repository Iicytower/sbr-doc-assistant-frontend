import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';

import { redirect } from 'next/navigation';
import ApiClient from '@/backend/backend';


export default async function Page() {
  // MOCK: pomiń autoryzację, zakładaj zawsze dostęp
  const session = { user: { id: 'mock-user', name: 'Mock User' } };
  // if (!session) {
  //   redirect('/api/auth/guest');
  // }
  const cookieStore = await cookies();
  const apiClient = new ApiClient(cookieStore.get('backend_token')?.value);

  if (!apiClient.getToken()) {
    redirect('/');
  }

  return (
    <>
      <Chat
        isReadonly={false}
        autoResume={false}
        disableSuggestedActions={true}
      />
      <DataStreamHandler />
    </>
  );
}
