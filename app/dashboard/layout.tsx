import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import Script from 'next/script';


import { DataStreamProvider } from '@/components/data-stream-provider';
import RightSidebar from '@/components/right-sidebar';
import { ChatProvider } from '@/components/chat-context';
import { MainContentWrapper } from '@/components/main-content-wrapper';
import DashboardLayoutClient from '@/components/dashboard-layout-client';

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
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </>
  );
}
