"use client";
import { useSidebarVisibility } from '@/components/sidebar-visibility-context';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { Button } from '@/components/ui/button';
import { SidebarContent, SidebarHeader, SidebarMenu } from '@/components/ui/sidebar';




import { useChatContext } from './chat-context';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';




import { useEffect } from 'react';

export function AppSidebar() {
  const { leftSidebarVisible, hideLeftSidebar, showLeftSidebar } = useSidebarVisibility();
  const { clearChat } = useChatContext();

  useEffect(() => {
    // (obsługa klawisza jest już w Sidebar, więc nie trzeba duplikować)
  }, []);

  return (
    <>
      {/* Przycisk do pokazania sidebara usunięty, zostaje tylko globalny SidebarFloatingToggles */}
      <aside
        className={`fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border shadow-lg flex flex-col z-40 text-sidebar-foreground transition-transform duration-300 ${leftSidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ willChange: 'transform' }}
        // NIE renderuj żadnych SidebarTrigger, SidebarRail itp. – tylko własny przycisk
      >
        {/* Przycisk do ukrywania sidebara */}
        {leftSidebarVisible && (
          <button
            type="button"
            className="absolute top-1/2 right-0 z-50 p-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-sidebar-accent text-sidebar-accent-foreground shadow-lg hover:bg-sidebar-accent/90 transition border border-sidebar-border"
            onClick={hideLeftSidebar}
            aria-label="Hide left sidebar"
          >
            {/* Chevron left (rounded) */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-7">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            <span className="font-semibold text-lg">Chats</span>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => {
                localStorage.removeItem('lastSelectedChatId');
                clearChat();
              }}
            >
              <PlusIcon size={16} />
              <span className="hidden md:inline">New chat</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarHistory />
          </SidebarMenu>
        </SidebarContent>
      </aside>
    </>
  );
}
 

