"use client";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataStreamProvider } from "@/components/data-stream-provider";
import RightSidebar from "@/components/right-sidebar";
import { ChatProvider } from "@/components/chat-context";
import { MainContentWrapper } from "@/components/main-content-wrapper";

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <ChatProvider>
      <DataStreamProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="flex flex-row w-full min-h-screen justify-center md:gap-4">
            {/* Left Sidebar (desktop) */}
            <div className="hidden md:block w-[19vw] h-full mr-2">
              <AppSidebar />
            </div>
            {/* Mobile Sidebar Overlay */}
            <div
              className={`md:hidden fixed top-0 left-0 z-40 w-[90vw] h-full bg-white transition-transform duration-300 ${leftOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
              <AppSidebar />
            </div>
            {/* Main Chat */}
            <div className="size-full md:w-[59vw] relative flex justify-center">
              <MainContentWrapper>
                <SidebarInset className="max-w-[100vw]">{children}</SidebarInset>
              </MainContentWrapper>
              {/* Mobile Sidebar Toggle Button */}
              <button
                className="md:hidden absolute top-4 left-4 z-50 bg-gray-800 text-white px-3 py-2 rounded"
                onClick={() => setLeftOpen((open) => !open)}
                aria-label="Otwórz/zamknij lewy sidebar"
              >
                ☰
              </button>
              <button
                className="md:hidden absolute top-4 right-4 z-50 bg-gray-800 text-white px-3 py-2 rounded"
                onClick={() => setRightOpen((open) => !open)}
                aria-label="Otwórz/zamknij prawy sidebar"
              >
                ☰
              </button>
            </div>
            {/* Right Sidebar (desktop) */}
            <div className="hidden md:block w-[19vw] h-full ml-2">
              <RightSidebar />
            </div>
            {/* Mobile Right Sidebar Overlay */}
            <div
              className={`md:hidden fixed top-0 right-0 z-40 w-[90vw] h-full bg-white transition-transform duration-300 ${rightOpen ? "translate-x-0" : "translate-x-full"}`}
            >
              <RightSidebar />
            </div>
          </div>
        </SidebarProvider>
      </DataStreamProvider>
    </ChatProvider>
  );
}
