"use client";
import { useSidebarVisibility } from "@/components/sidebar-visibility-context";
import React, { useEffect, useState } from "react";

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  // Wyśrodkowanie czatu między fixed sidebarami
  // Lewy sidebar: w-64 (16rem), prawy: w-80 (20rem)
  return (
    <main className="flex flex-col flex-1 items-center justify-center bg-background min-h-screen pl-64 pr-80">
      <div className="w-full max-w-3xl flex flex-col flex-1 mx-auto">
        {children}
      </div>
    </main>
  );
}
