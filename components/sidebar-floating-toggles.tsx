"use client";
import React from "react";
import { useSidebarVisibility } from "@/components/sidebar-visibility-context";

export function SidebarFloatingToggles() {
  const {
    leftSidebarVisible,
    rightSidebarVisible,
    showLeftSidebar,
    showRightSidebar,
  } = useSidebarVisibility();

  return (
    <>
      {!leftSidebarVisible && (
        <button
          type="button"
          className="fixed left-0 top-1/2 z-50 p-2 -translate-y-1/2 rounded-full bg-sidebar-accent text-sidebar-accent-foreground shadow-lg hover:bg-sidebar-accent/90 transition border border-sidebar-border"
          onClick={showLeftSidebar}
          aria-label="Pokaż lewy sidebar"
        >
          {/* Chevron right (obły) */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-7">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
      {!rightSidebarVisible && (
        <button
          type="button"
          className="fixed right-0 top-1/2 z-50 p-2 -translate-y-1/2 rounded-full bg-sidebar-accent text-sidebar-accent-foreground shadow-lg hover:bg-sidebar-accent/90 transition border border-sidebar-border"
          onClick={showRightSidebar}
          aria-label="Pokaż prawy sidebar"
        >
          {/* Chevron left (obły) */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-7">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}
    </>
  );
}
