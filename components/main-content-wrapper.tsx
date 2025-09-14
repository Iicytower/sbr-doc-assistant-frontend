"use client";
import { useSidebarVisibility } from "@/components/sidebar-visibility-context";
import React, { useEffect, useState } from "react";

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { leftSidebarVisible, rightSidebarVisible } = useSidebarVisibility();
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  // Szerokość sidebaru: 320px (w-80)
  const left = leftSidebarVisible ? 320 : 0;
  const right = rightSidebarVisible ? 320 : 0;
  const bothHidden = !leftSidebarVisible && !rightSidebarVisible;

  useEffect(() => {
    function checkMobilePortrait() {
      if (typeof window !== 'undefined') {
        const mq = window.matchMedia('(orientation: portrait) and (max-width: 800px)');
        setIsMobilePortrait(mq.matches);
      }
    }
    checkMobilePortrait();
    window.addEventListener('resize', checkMobilePortrait);
    window.addEventListener('orientationchange', checkMobilePortrait);
    return () => {
      window.removeEventListener('resize', checkMobilePortrait);
      window.removeEventListener('orientationchange', checkMobilePortrait);
    };
  }, []);

  let style: React.CSSProperties;
  if (bothHidden && isMobilePortrait) {
    style = {
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      maxWidth: '100%',
      boxSizing: 'border-box',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    };
  } else if (bothHidden) {
    style = {
      marginLeft: 'auto',
      marginRight: 'auto',
      maxWidth: 700,
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    };
  } else {
    style = {
      paddingLeft: left,
      paddingRight: right,
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'padding 0.3s cubic-bezier(0.4,0,0.2,1)',
    };
  }

  return (
    <div style={style} className="relative flex flex-col bg-background">
      {children}
    </div>
  );
}
