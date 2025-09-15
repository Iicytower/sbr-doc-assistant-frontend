import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import Script from 'next/script';


import { DataStreamProvider } from '@/components/data-stream-provider';
import RightSidebar from '@/components/right-sidebar';
import { ChatProvider } from '@/components/chat-context';
import { MainContentWrapper } from '@/components/main-content-wrapper';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // MOCK: pomiń autoryzację, zakładaj zawsze dostęp
  const [session, cookieStore] = await Promise.all([{ user: { id: 'mock-user', name: 'Mock User' } }, cookies()]);
  const isCollapsed = false;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <ChatProvider>
        <DataStreamProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="flex flex-row w-full min-h-screen">
              <AppSidebar />
              <MainContentWrapper>
                <SidebarInset className="max-w-[100vw]">{children}</SidebarInset>
              </MainContentWrapper>
              <RightSidebar />
            </div>
          </SidebarProvider>
        </DataStreamProvider>
      </ChatProvider>
    </>
  );
}
