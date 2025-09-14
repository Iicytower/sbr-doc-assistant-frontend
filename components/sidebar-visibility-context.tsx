"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useIsMobilePortrait } from "@/hooks/use-is-mobile-portrait";

interface SidebarVisibilityContextType {
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  showLeftSidebar: () => void;
  hideLeftSidebar: () => void;
  showRightSidebar: () => void;
  hideRightSidebar: () => void;
}

const SidebarVisibilityContext = createContext<SidebarVisibilityContextType | undefined>(undefined);

export const SidebarVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const isMobilePortrait = useIsMobilePortrait();
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      return !(isMobile && isPortrait);
    }
    return true;
  });
  const [rightSidebarVisible, setRightSidebarVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      return !(isMobile && isPortrait);
    }
    return true;
  });

  // Hide both sidebars when switching to mobile portrait
  useEffect(() => {
    if (isMobilePortrait) {
      setLeftSidebarVisible(false);
      setRightSidebarVisible(false);
    }
  }, [isMobilePortrait]);

  const showLeftSidebar = () => setLeftSidebarVisible(true);
  const hideLeftSidebar = () => setLeftSidebarVisible(false);
  const showRightSidebar = () => setRightSidebarVisible(true);
  const hideRightSidebar = () => setRightSidebarVisible(false);

  return (
    <SidebarVisibilityContext.Provider
      value={{
        leftSidebarVisible,
        rightSidebarVisible,
        showLeftSidebar,
        hideLeftSidebar,
        showRightSidebar,
        hideRightSidebar,
      }}
    >
      {children}
    </SidebarVisibilityContext.Provider>
  );
};

export const useSidebarVisibility = () => {
  const context = useContext(SidebarVisibilityContext);
  if (!context) {
    throw new Error("useSidebarVisibility must be used within a SidebarVisibilityProvider");
  }
  return context;
};
