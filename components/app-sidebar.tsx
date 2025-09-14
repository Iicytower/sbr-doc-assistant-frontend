'use client';

import type { User } from 'next-auth';
import { useSidebarVisibility } from '@/components/sidebar-visibility-context';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';

import { useChatContext } from './chat-context';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';


export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { clearChat } = useChatContext();
  const { leftSidebarVisible, hideLeftSidebar } = useSidebarVisibility();

  // Handler tworzenia nowego czatu
  const handleNewChat = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSelectedChatId', 'undefined');
    }
    clearChat();
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border shadow-lg flex flex-col z-40 text-sidebar-foreground transition-transform duration-300 ${leftSidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ willChange: 'transform' }}
    >
      {/* Przycisk do chowania sidebaru */}
      {leftSidebarVisible && (
        <button
          className="absolute top-1/2 right-0 z-50 p-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-sidebar-accent text-sidebar-accent-foreground shadow-lg hover:bg-sidebar-accent/90 transition border border-sidebar-border"
          onClick={hideLeftSidebar}
          aria-label="Ukryj lewy sidebar"
        >
          {/* Chevron left (obły) */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-7">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center relative">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-1 h-8 md:p-2 md:h-fit"
                  onClick={handleNewChat}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" className="hidden md:block">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <div className="pb-[5vh]" />
    </aside>
  );
}
