"use client";

import React, { useState } from "react";


export default function RightSidebar() {
  const [activeTab, setActiveTab] = useState<"documents" | "settings">("documents");

  return (
    <aside className="fixed right-0 top-0 h-full w-80 bg-sidebar border-l border-sidebar-border shadow-lg flex flex-col z-40 text-sidebar-foreground">
      <div className="flex border-b border-sidebar-border">
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-tl-md ${activeTab === "documents" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-muted"}`}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-tr-md ${activeTab === "settings" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-muted"}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-background">
        {activeTab === "documents" && (
          <div>
            {/* TODO: Wstaw zawartość zakładki Documents */}
            <p className="text-muted-foreground">Documents content goes here.</p>
          </div>
        )}
        {activeTab === "settings" && (
          <div>
            {/* TODO: Wstaw zawartość zakładki Settings */}
            <p className="text-muted-foreground">Settings content goes here.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
