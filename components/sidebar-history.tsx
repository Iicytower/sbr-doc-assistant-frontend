'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
// import { useParams, useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { useState } from 'react';

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import ApiClient from '@/backend/backend';
import { toast } from 'sonner';
import { useChatContext } from './chat-context';
import { ChatItem } from './sidebar-history-item';
import useSWRInfinite from 'swr/infinite';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, useSidebar } from '@/components/ui/sidebar';
import type { Chat } from '@/lib/db/schema';

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { activeChat, setActiveChatId } = useChatContext();

  // Zmiana nazwy czatu
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  // Fetch all chats at once (no pagination)
  const { data: chats, isLoading, mutate } = useSWRInfinite(
    () => '/api/history',
    async () => {
      const api = new ApiClient();
      const chatHistory = await api.findAllChats();
      const chats = chatHistory.chats.map((item: any) => ({
        id: item.id,
        title: item.name,
        createdAt: item.createdAt ?? new Date(),
      }));
      return { chats };
    },
    { fallbackData: [] }
  );

  // Flatten all chats from all pages (should be only one page now)
  const allChats: Chat[] = chats && Array.isArray(chats)
    ? chats.flatMap((page) => (page.chats ? page.chats : []))
    : [];

  const hasEmptyChatHistory = allChats.length === 0;

  // Helper: kliknięcie czatu
  const handleSelectChat = async (chatId: string) => {
    if (activeChat?.id === chatId) return;
    // Zapisz id czatu do localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSelectedChatId', chatId);
    }
    await setActiveChatId(chatId);
    setOpenMobile(false);
  };

  // Usuwanie czatu przez customowy backend
  const handleDelete = async () => {
    if (!deleteId) return;
    const api = new ApiClient();
    toast.promise(
      api.deleteChatById({ chatId: deleteId }),
      {
        loading: 'Deleting chat...',
        success: () => {
          mutate((chatHistories) => {
            if (chatHistories) {
              return chatHistories.map((chatHistory) => ({
                ...chatHistory,
                chats: chatHistory.chats.filter((chat: Chat) => chat.id !== deleteId),
              }));
            }
          });
          if (activeChat?.id === deleteId) {
            setActiveChatId('');
          }
          return 'Chat deleted successfully';
        },
        error: (err) => {
          if (err instanceof Error) return err.message;
          return 'Failed to delete chat';
        },
      },
    );
    setShowDeleteDialog(false);
  };

  // Zmiana nazwy czatu
  const handleRename = async () => {
    if (!renameId || !renameValue.trim()) return;
    setRenameLoading(true);
    const api = new ApiClient();
    toast.promise(
      api.chatRename({ chatId: renameId, newName: renameValue.trim() }),
      {
        loading: 'Renaming chat...',
        success: () => {
          mutate(undefined, { revalidate: true }); // wymuś pobranie najnowszych danych z backendu
          setRenameId(null);
          setRenameValue('');
          setShowRenameDialog(false);
          setRenameLoading(false);
          return 'Chat renamed successfully';
        },
        error: (err) => {
          setRenameLoading(false);
          if (err instanceof Error) return err.message;
          return 'Failed to rename chat';
        },
      },
    );
  };

  // Grupowanie czatów po dacie
  const groupChatsByDate = (chats: Chat[]) => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);
    return chats.reduce(
      (groups, chat) => {
        const chatDate = new Date(chat.createdAt);
        if (isToday(chatDate)) {
          groups.today.push(chat);
        } else if (isYesterday(chatDate)) {
          groups.yesterday.push(chat);
        } else if (chatDate > oneWeekAgo) {
          groups.lastWeek.push(chat);
        } else if (chatDate > oneMonthAgo) {
          groups.lastMonth.push(chat);
        } else {
          groups.older.push(chat);
        }
        return groups;
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      } as {
        today: Chat[];
        yesterday: Chat[];
        lastWeek: Chat[];
        lastMonth: Chat[];
        older: Chat[];
      },
    );
  };

  const groupedChats = groupChatsByDate(allChats);

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Today</div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="flex gap-2 items-center px-2 h-8 rounded-md"
              >
                <div
                  className="h-4 rounded-md flex-1"
                  style={{ maxWidth: `${item}%`, background: 'rgba(60,60,60,0.1)' }}
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  // Jeśli użytkownik nie jest zalogowany
  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex flex-row gap-2 justify-center items-center px-2 w-full text-sm text-zinc-500">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <div className="flex flex-col gap-6">
              {groupedChats.today.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Today</div>
                  {groupedChats.today.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat?.id === chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onRename={(chatId: string, currentTitle: string) => {
                        setRenameId(chatId);
                        setRenameValue(currentTitle);
                        setShowRenameDialog(true);
                      }}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}
              {groupedChats.yesterday.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Yesterday</div>
                  {groupedChats.yesterday.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat?.id === chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onRename={(chatId: string, currentTitle: string) => {
                        setRenameId(chatId);
                        setRenameValue(currentTitle);
                        setShowRenameDialog(true);
                      }}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}
              {groupedChats.lastWeek.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Last 7 days</div>
                  {groupedChats.lastWeek.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat?.id === chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onRename={(chatId: string, currentTitle: string) => {
                        setRenameId(chatId);
                        setRenameValue(currentTitle);
                        setShowRenameDialog(true);
                      }}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}
              {groupedChats.lastMonth.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Last 30 days</div>
                  {groupedChats.lastMonth.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat?.id === chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onRename={(chatId: string, currentTitle: string) => {
                        setRenameId(chatId);
                        setRenameValue(currentTitle);
                        setShowRenameDialog(true);
                      }}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}
              {groupedChats.older.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Older than last month</div>
                  {groupedChats.older.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat?.id === chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onRename={(chatId: string, currentTitle: string) => {
                        setRenameId(chatId);
                        setRenameValue(currentTitle);
                        setShowRenameDialog(true);
                      }}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Dialog usuwania czatu */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog zmiany nazwy czatu */}
      <AlertDialog open={showRenameDialog} onOpenChange={(open) => {
        setShowRenameDialog(open);
        if (!open) {
          setRenameId(null);
          setRenameValue('');
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename chat</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for this chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            className="w-full border rounded px-2 py-1 mt-2"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename();
            }}
            disabled={renameLoading}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRenameDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename} disabled={renameLoading || !renameValue.trim()}>
              {renameLoading ? 'Renaming...' : 'Rename'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}