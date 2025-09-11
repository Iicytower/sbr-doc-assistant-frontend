import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import ApiClient from '@/backend/backend';


export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/guest');
  }
  const cookieStore = await cookies();
  const apiClient = new ApiClient(cookieStore.get('backend_token')?.value);

  if (!apiClient.getToken()) {
    redirect('/');
  }

  return (
    <>
      <Chat
        isReadonly={false}
        session={session}
        autoResume={false}
        disableSuggestedActions={true}
      />
      <DataStreamHandler />
    </>
  );
}
