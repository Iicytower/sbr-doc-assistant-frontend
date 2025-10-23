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
          className="fixed left-0 top-1/2 z-50 p-2 -translate-y-1/2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition border border-blue-600"
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
          className="fixed right-0 top-1/2 z-50 p-2 -translate-y-1/2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition border border-blue-600"
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
