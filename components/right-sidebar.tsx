"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSidebarVisibility } from "@/components/sidebar-visibility-context";

export default function RightSidebar() {
  const [activeTab, setActiveTab] = useState<"documents" | "settings">("documents");
  const { rightSidebarVisible, hideRightSidebar } = useSidebarVisibility();

  return (
    <aside
      className={`fixed right-0 top-0 h-full w-[20vw] bg-sidebar border-l border-sidebar-border shadow-lg flex flex-col z-40 text-sidebar-foreground transition-transform duration-300 ${rightSidebarVisible ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ willChange: 'transform' }}
    >
  {/* Button to hide the sidebar */}
      {rightSidebarVisible && (
        <button
          type="button"
          className="absolute top-1/2 left-0 z-50 p-2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-sidebar-accent text-sidebar-accent-foreground shadow-lg hover:bg-sidebar-accent/90 transition border border-sidebar-border"
          onClick={hideRightSidebar}
          aria-label="Hide right sidebar"
        >
          {/* Chevron right (rounded) */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-7">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
      <div className="flex border-b border-sidebar-border relative">
        <button
          type="button"
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-tl-md ${activeTab === "documents" ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-100"}`}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
        <button
          type="button"
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-tr-md ${activeTab === "settings" ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-100"}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-background">
        {activeTab === "documents" ? (
          <div>
            <UploadDocumentSection />
          </div>
        ) : null}
        {activeTab === "settings" ? (
          <div>
            {/* ThemeSwitcher at the top */}
            <ThemeSwitcher />
            <hr className="my-6" />
            {/* Change password in the middle */}
            <h2 className="text-lg font-semibold mb-4">Change password</h2>
            <ChangePasswordForm />
            <hr className="my-6" />
            {/* Delete account at the bottom */}
            <DeleteAccountSection />
            <hr className="my-6" />
            <button
              className="w-full mt-8 bg-sidebar-accent text-sidebar-accent-foreground py-2 rounded font-semibold disabled:opacity-60"
              onClick={() => {
                // TODO should use apiClient.logout()
                localStorage.removeItem('backend_client_token');
                localStorage.removeItem('lastSelectedChatId');
                document.cookie = "backend_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/";
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
// Section for uploading PDF/Markdown document
// ThemeSwitcher component for theme toggle
function ThemeSwitcher() {
  const { theme, setTheme, systemTheme } = useTheme();
  return (
    <div className="mb-4">
  <label className="block text-sm font-medium mb-2 text-blue-600">Theme</label>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded transition-colors ${theme === 'light' ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          onClick={() => setTheme('light')}
        >
          Light
        </button>
        <button
          className={`px-3 py-1 rounded transition-colors ${theme === 'dark' ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          onClick={() => setTheme('dark')}
        >
          Dark
        </button>
        <button
          className={`px-3 py-1 rounded transition-colors ${theme === 'system' ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          onClick={() => setTheme('system')}
        >
          System
        </button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">Current: {theme === 'system' ? `System (${systemTheme})` : theme}</div>
    </div>
  );
}
function UploadDocumentSection() {
  // Collapsed state for folders and main sections
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [collapsedGeneral, setCollapsedGeneral] = useState(false);
  const [collapsedUser, setCollapsedUser] = useState(false);
  // Drag-and-drop for category change (Your documents only)
  // All useState at the top!
  // Drag-and-drop for category change (Your documents only)
  const [draggedDoc, setDraggedDoc] = useState<any | null>(null);
  const [dragOverCat, setDragOverCat] = useState<string | null>(null);
  // Obsługa wielu plików
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // New structure: userDocuments, generalDocuments
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [generalDocuments, setGeneralDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  // Ref do śledzenia menu
  const menuRef = useRef<HTMLDivElement>(null);
  // Zamknij menu po kliknięciu poza
  useEffect(() => {
    if (!menuOpenId) return;
    function handleClickOutside(e: MouseEvent) {
      // Jeśli menuRef jest ustawione i kliknięto poza menu
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<any | null>(null);
  // State for change category dialog
  const [changeCategoryDoc, setChangeCategoryDoc] = useState<any | null>(null);
  const [changeCategoryInput, setChangeCategoryInput] = useState<string>("");
  const [changeCategoryDropdownOpen, setChangeCategoryDropdownOpen] = useState(false);
  const [changeCategoryIsCustom, setChangeCategoryIsCustom] = useState(false);
  const changeCategoryInputRef = useRef<HTMLInputElement>(null);
  const [changeCategoryLoading, setChangeCategoryLoading] = useState(false);
  const [changeCategoryError, setChangeCategoryError] = useState<string | null>(null);
  // Initialize selectedDocuments from localStorage (if exists)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("selectedDocuments");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  // Ref to "Select all" checkbox
  const selectAllRef = useRef<HTMLInputElement>(null);
  // Number of all documents (both types)
  const allDocuments = [...generalDocuments, ...userDocuments];
  // Set indeterminate on "Select all" checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedDocuments.length > 0 && selectedDocuments.length < allDocuments.length;
    }
  }, [selectedDocuments, allDocuments.length]);

  // Group documents by category
  function groupByCategory(docs: any[]) {
    return docs.reduce((acc: Record<string, any[]>, doc) => {
      const cat = doc.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    }, {});
  }
  const generalDocsByCategory = groupByCategory(generalDocuments);
  const userDocsByCategory = groupByCategory(userDocuments);

  // Zbierz tylko kategorie z dokumentów użytkownika
  const userCategories = Object.keys(userDocsByCategory).filter(Boolean);
  // allCategories is still used for upload, userCategories for change category
  const allCategories = Array.from(new Set([
    ...Object.keys(generalDocsByCategory),
    ...Object.keys(userDocsByCategory)
  ])).filter(Boolean);

  // Stan wybranej/wpisanej kategorii
  const [categoryInput, setCategoryInput] = useState<string>("");
  // Czy dropdown z kategoriami jest otwarty
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  // Czy użytkownik wpisuje własną kategorię
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  // Ref do inputa kategorii
  const categoryInputRef = useRef<HTMLInputElement>(null);
  
  // Prepare apiClientRef for upload in the next step
  const apiClientRef = useRef<any>(null);
  useEffect(() => {
    if (!apiClientRef.current) {
      import("../backend/backend").then((mod) => {
        apiClientRef.current = new mod.default();
        fetchDocuments();
      });
    } else {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save selectedDocuments to localStorage on every change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("selectedDocuments", JSON.stringify(selectedDocuments));
      } catch {}
    }
  }, [selectedDocuments]);

  const fetchDocuments = async () => {
    setDocsLoading(true);
    setDocsError(null);
    try {
      const apiClient = apiClientRef.current;
  if (!apiClient) throw new Error("API client initialization error.");
      const res = await apiClient.findAllDocuments();
      setUserDocuments(res.userDocuments || []);
      setGeneralDocuments(res.generalDocuments || []);
      // Synchronizuj selectedDocuments z istniejącymi dokumentami (oba typy)
      setSelectedDocuments((prev) => {
        const allIds = [...(res.generalDocuments || []), ...(res.userDocuments || [])].map((doc: any) => doc.id);
        // Jeśli localStorage puste, domyślnie zaznacz wszystkie
        if (!prev || prev.length === 0) return allIds;
        // Zostaw tylko istniejące
        return allIds.filter((id: string) => prev.includes(id));
      });
    } catch (err: any) {
  setDocsError(err?.body?.message || err?.message || "Error fetching documents.");
    } finally {
      setDocsLoading(false);
    }
  };

  // Handle upload in the next step
  // Upload wielu plików po kolei
  const handleUpload = async () => {
    setError(null);
    setSuccess(null);
    if (!files.length) {
      setError("Select at least one file to upload.");
      return;
    }
    if (!categoryInput.trim()) {
      setError("Select or enter a category.");
      return;
    }
    setLoading(true);
    let successCount = 0;
    let errorCount = 0;
    for (const file of files) {
      try {
        const apiClient = apiClientRef.current;
        if (!apiClient) throw new Error("API client initialization error.");
        await apiClient.addDocument({ category: categoryInput.trim(), files: [file] });
        successCount++;
      } catch (err: any) {
        errorCount++;
      }
    }
    if (successCount && !errorCount) {
      setSuccess(successCount === 1 ? "File has been uploaded." : `${successCount} files have been uploaded.`);
    } else if (successCount && errorCount) {
      setSuccess(`${successCount} files uploaded, ${errorCount} failed.`);
      setError("Some files failed to upload.");
    } else {
      setError("File upload error.");
    }
    setFiles([]);
    setCategoryInput("");
    setIsCustomCategory(false);
    fetchDocuments();
    setLoading(false);
  };

  const handleDelete = async (doc: any) => {
    setDocsError(null);
    setDocsLoading(true);
    try {
      const apiClient = apiClientRef.current;
      if (!apiClient) throw new Error("Błąd inicjalizacji klienta API.");
      await apiClient.deleteDocument({ filename: doc.filename, mimetype: doc.mimetype });
      setMenuOpenId(null);
      setConfirmDeleteDoc(null);
      fetchDocuments();
    } catch (err: any) {
      setDocsError(err?.body?.message || err?.message || "Błąd usuwania dokumentu.");
    } finally {
      setDocsLoading(false);
    }
  };

  // Drag-and-drop logic
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => {
        const newFiles = Array.from(e.dataTransfer.files ?? []).filter(f => !prev.some(pf => pf.name === f.name && pf.size === f.size));
        return [...prev, ...newFiles];
      });
    }
  };

  return (
    <div>
      <div
        ref={dropRef}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        role="region"
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 mb-4 transition-colors ${dragActive ? "border-sidebar-accent bg-sidebar-accent/10" : "border-muted bg-muted/50"}`}
        style={{ minHeight: 120 }}
      >
        <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full">
          <svg className="size-10 text-sidebar-foreground/50 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
          <span className="text-sm font-medium text-sidebar-foreground/100">Drag & drop here<br/>or <span className="underline text-sidebar-foreground/50">click to select</span></span>
          <span className="text-xs text-sidebar-foreground/20">Allowed: csv, docx, md, ods, odt, pdf, txt, xlsx</span>
          <input
            id="file-upload"
            type="file"
            accept=".csv,.docx,.md,.ods,.odt,.pdf,.txt,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.text,text/markdown,text/plain,text/csv"
            className="hidden"
            multiple
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                setFiles(prev => {
                  const newFiles = Array.from(e.target.files ?? []).filter(f => !prev.some(pf => pf.name === f.name && pf.size === f.size));
                  return [...prev, ...newFiles];
                });
              } else {
                setFiles([]);
              }
            }}
            value={''}
          />
        </label>
        {files.length > 0 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-wrap items-center gap-2 bg-background px-3 py-1 rounded shadow border mt-2 max-w-full">
            {files.map((file, idx) => (
              <div key={file.name + file.size + idx} className="flex items-center gap-1 bg-muted px-2 py-1 rounded mb-1">
                <span className="text-xs font-medium truncate max-w-[90px]" title={file.name}>{file.name}</span>
                <button
                  className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                  type="button"
                  aria-label="Remove file"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom combo box kategorii */}
      <div className="mb-4 w-full">
        <label htmlFor="category-input" className="block text-sm font-medium mb-2">Folder</label>
        <div className="relative w-full">
          <input
            id="category-input"
            ref={categoryInputRef}
            type="text"
            className="w-full px-3 py-2 border rounded bg-background text-sidebar-foreground"
            placeholder="Select or enter folder"
            value={categoryInput}
            onChange={e => {
              setCategoryInput(e.target.value);
              setIsCustomCategory(!allCategories.includes(e.target.value));
              setCategoryDropdownOpen(true);
            }}
            onFocus={() => setCategoryDropdownOpen(true)}
            onBlur={() => setTimeout(() => setCategoryDropdownOpen(false), 120)}
            autoComplete="off"
          />
          {/* Dropdown z kategoriami użytkownika */}
          {categoryDropdownOpen && userCategories.length > 0 && (
            <div
              className="absolute left-0 mt-1 rounded shadow-lg border border-sidebar-border z-20"
              style={{
                background: "#374151", // szare tło (Tailwind: bg-gray-700)
                minWidth: categoryInputRef.current?.offsetWidth || '100%',
                width: categoryInputRef.current?.offsetWidth || '100%',
                maxHeight: 180,
                overflowY: 'auto',
              }}
            >
              {userCategories
                .filter(cat => cat.toLowerCase().includes(categoryInput.toLowerCase()) || !categoryInput)
                .map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className="block w-full text-left px-3 py-2 text-sm text-white"
                    style={{
                      background: '#374151', // domyślne tło
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#1f2937'; // hover: bg-gray-800
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#374151';
                    }}
                    onMouseDown={e => {
                      e.preventDefault();
                      setCategoryInput(cat);
                      setIsCustomCategory(false);
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    {cat}
                  </button>
                ))}
            </div>
          )}
        </div>
        {isCustomCategory && categoryInput.trim() && (
          <div className="mt-1 text-xs text-muted-foreground">New category: <span className="font-semibold">{categoryInput.trim()}</span></div>
        )}
      </div>

      <button
        type="button"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-60 mb-2 transition-colors hover:bg-blue-700"
        onClick={handleUpload}
        disabled={loading || files.length === 0}
      >
        {loading ? "Sending..." : files.length === 1 ? "Upload Document" : `Upload ${files.length} Documents`}
      </button>
      {error && (
        <div className="bg-blue-100 text-blue-600 border border-blue-600 rounded px-3 py-2 text-sm mb-2 flex items-center justify-between">
          <span>{error}</span>
          <button
            className="ml-2 text-blue-600 hover:text-blue-700 text-lg font-bold px-1 rounded focus:outline-none"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            type="button"
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="bg-blue-100 text-blue-700 border border-blue-600 rounded px-3 py-2 text-sm mb-2 flex items-center justify-between">
          <span>{success}</span>
          <button
            className="ml-2 text-blue-700 hover:text-blue-900 text-lg font-bold px-1 rounded focus:outline-none"
            onClick={() => setSuccess(null)}
            aria-label="Dismiss success"
            type="button"
          >
            ×
          </button>
        </div>
      )}

      <hr className="my-4" />
      {/* Preuploaded Documents pogrupowane po kategoriach */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            {Object.keys(generalDocsByCategory).length > 0 && (
              <input
                type="checkbox"
                ref={selectAllRef}
                className="accent-sidebar-accent mr-2"
                checked={
                  Object.values(generalDocsByCategory).flat().length > 0 &&
                  Object.values(generalDocsByCategory).flat().every(doc => selectedDocuments.includes(doc.id))
                }
                onChange={e => {
                  const allIds = Object.values(generalDocsByCategory).flat().map(doc => doc.id);
                  if (e.target.checked) {
                    setSelectedDocuments(prev => Array.from(new Set([...prev, ...allIds])));
                  } else {
                    setSelectedDocuments(prev => prev.filter(id => !allIds.includes(id)));
                  }
                }}
                disabled={Object.values(generalDocsByCategory).flat().length === 0}
              />
            )}
            <h3 className="text-base font-semibold tracking-tight">Preuploaded documents</h3>
            <button
              type="button"
              className="ml-2 p-1 rounded hover:bg-muted"
              onClick={() => setCollapsedGeneral(v => !v)}
              aria-label={collapsedGeneral ? "Expand section" : "Collapse section"}
            >
              {collapsedGeneral ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
              )}
            </button>
          </div>
        {docsLoading ? (
          <div className="text-muted-foreground text-sm">Ładowanie...</div>
        ) : docsError ? (
          <div className="bg-red-100 text-red-700 border border-red-200 rounded px-3 py-2 text-sm mb-2">{docsError}</div>
        ) : collapsedGeneral ? null : (
          Object.keys(generalDocsByCategory).length === 0 ? (
            <div className="text-muted-foreground text-sm">Brak dokumentów.</div>
          ) : (
            Object.entries(generalDocsByCategory).map(([cat, docs]) => (
              <div key={cat} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    className="accent-sidebar-accent"
                    checked={docs.length > 0 && docs.every(doc => selectedDocuments.includes(doc.id))}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedDocuments(prev => [
                          ...prev.filter(id => !docs.some(doc => doc.id === id)),
                          ...docs.map(doc => doc.id)
                        ]);
                      } else {
                        setSelectedDocuments(prev => prev.filter(id => !docs.some(doc => doc.id === id)));
                      }
                    }}
                    disabled={docs.length === 0}
                  />
                  <span className="font-semibold text-sidebar-foreground/80">{cat}</span>
                  <button
                    type="button"
                    className="ml-2 p-1 rounded hover:bg-muted"
                    onClick={() => setCollapsedFolders(f => ({ ...f, [cat]: !f[cat] }))}
                    aria-label={collapsedFolders[cat] ? "Expand folder" : "Collapse folder"}
                  >
                    {collapsedFolders[cat] ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                    )}
                  </button>
                </div>
                {collapsedFolders[cat] ? null : (
                  <div className="grid grid-cols-1 gap-2">
                    {docs.map((doc: any) => (
                      <div key={doc.id} className={`flex items-center justify-between bg-background border rounded-lg px-3 py-2 shadow-sm transition group ${selectedDocuments.includes(doc.id) ? 'border-sidebar-accent' : 'border-muted'}` }>
                        <div className="flex items-center gap-2 truncate max-w-[180px]" title={doc.filename}>
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedDocuments(prev => [...prev, doc.id]);
                              } else {
                                setSelectedDocuments(prev => prev.filter(id => id !== doc.id));
                              }
                            }}
                            className="accent-sidebar-accent"
                          />
                          <span className="font-medium truncate">{doc.filename}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )
        )}
      </div>
      {/* User Documents pogrupowane po kategoriach */}
      <div>
        <div className="flex items-center mb-2">
          {Object.keys(userDocsByCategory).length > 0 && (
            <input
              type="checkbox"
              className="accent-sidebar-accent mr-2"
              checked={
                Object.values(userDocsByCategory).flat().length > 0 &&
                Object.values(userDocsByCategory).flat().every(doc => selectedDocuments.includes(doc.id))
              }
              onChange={e => {
                const allIds = Object.values(userDocsByCategory).flat().map(doc => doc.id);
                if (e.target.checked) {
                  setSelectedDocuments(prev => Array.from(new Set([...prev, ...allIds])));
                } else {
                  setSelectedDocuments(prev => prev.filter(id => !allIds.includes(id)));
                }
              }}
              disabled={Object.values(userDocsByCategory).flat().length === 0}
            />
          )}
          <h3 className="text-base font-semibold tracking-tight">Your documents</h3>
          <button
            type="button"
            className="ml-2 p-1 rounded hover:bg-muted"
            onClick={() => setCollapsedUser(v => !v)}
            aria-label={collapsedUser ? "Expand section" : "Collapse section"}
          >
            {collapsedUser ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
            )}
          </button>
        </div>
        {docsLoading ? (
          <div className="text-muted-foreground text-sm">Ładowanie...</div>
        ) : docsError ? (
          <div className="bg-red-100 text-red-700 border border-red-200 rounded px-3 py-2 text-sm mb-2">{docsError}</div>
        ) : collapsedUser ? null : (
          Object.keys(userDocsByCategory).length === 0 ? (
            <div className="text-muted-foreground text-sm">Brak dokumentów.</div>
          ) : (
            Object.entries(userDocsByCategory).map(([cat, docs]) => (
              <div key={cat} className="mb-4">
                <div
                  className={`flex items-center gap-2 mb-2 rounded transition-colors ${dragOverCat === cat ? 'bg-sidebar-accent/20' : ''}`}
                  onDragOver={e => {
                    e.preventDefault();
                    setDragOverCat(cat);
                  }}
                  onDragLeave={e => setDragOverCat(null)}
                  onDrop={async e => {
                    e.preventDefault();
                    setDragOverCat(null);
                    if (draggedDoc && draggedDoc.category !== cat) {
                      setChangeCategoryLoading(true);
                      try {
                        const apiClient = apiClientRef.current;
                        if (!apiClient) throw new Error("API client initialization error.");
                        await apiClient.changeDocumentCategory({ documentId: draggedDoc.id, newCategory: cat });
                        setDraggedDoc(null);
                        fetchDocuments();
                      } catch (err: any) {
                        setChangeCategoryError(err?.body?.message || err?.message || "Category change error.");
                      } finally {
                        setChangeCategoryLoading(false);
                      }
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    className="accent-sidebar-accent"
                    checked={docs.length > 0 && docs.every(doc => selectedDocuments.includes(doc.id))}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedDocuments(prev => [
                          ...prev.filter(id => !docs.some(doc => doc.id === id)),
                          ...docs.map(doc => doc.id)
                        ]);
                      } else {
                        setSelectedDocuments(prev => prev.filter(id => !docs.some(doc => doc.id === id)));
                      }
                    }}
                    disabled={docs.length === 0}
                  />
                  <span className="font-semibold text-sidebar-foreground/80">{cat}</span>
                  <button
                    type="button"
                    className="ml-2 p-1 rounded hover:bg-muted"
                    onClick={() => setCollapsedFolders(f => ({ ...f, [cat]: !f[cat] }))}
                    aria-label={collapsedFolders[cat] ? "Expand folder" : "Collapse folder"}
                  >
                    {collapsedFolders[cat] ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                    )}
                  </button>
                  {dragOverCat === cat && draggedDoc && (
                    <span className="ml-2 text-xs text-sidebar-accent">Drop to move here</span>
                  )}
                </div>
                {collapsedFolders[cat] ? null : (
                  <div className="grid grid-cols-1 gap-2">
                    {docs.map((doc: any) => (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between bg-background border rounded-lg px-3 py-2 shadow-sm transition group ${selectedDocuments.includes(doc.id) ? 'border-sidebar-accent' : 'border-muted'}`}
                        draggable
                        onDragStart={e => {
                          setDraggedDoc(doc);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => setDraggedDoc(null)}
                      >
                        <div className="flex items-center gap-2 truncate" title={doc.filename}>
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedDocuments(prev => [...prev, doc.id]);
                              } else {
                                setSelectedDocuments(prev => prev.filter(id => id !== doc.id));
                              }
                            }}
                            className="accent-sidebar-accent"
                          />
                          <span className="font-medium truncate">{doc.filename}</span>
                        </div>
                        <div className="relative flex items-center">
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-sidebar-accent/20 focus:outline-none min-h-0"
                            onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)}
                            aria-label="Open document menu"
                          >
                            <svg className="size-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
                          </button>
                          {menuOpenId === doc.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 mt-2 w-36 bg-popover border border-sidebar-border rounded shadow-lg z-50"
                            >
                              <button
                                type="button"
                                className="block w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  setChangeCategoryDoc(doc);
                                  setChangeCategoryInput(""); // input is empty by default
                                  setChangeCategoryIsCustom(false);
                                }}
                              >
                                Change folder
                              </button>
                              <button
                                type="button"
                                className="block w-full text-left px-3 py-2 text-xs hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  setConfirmDeleteDoc(doc);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Confirmation popup for deleting document */}
                {confirmDeleteDoc && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-sidebar p-6 rounded shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-2 text-red-600">Confirm document deletion</h3>
                        <p className="mb-4 text-sm">Are you sure you want to delete the document <span className='font-semibold'>{confirmDeleteDoc.filename}</span>? This operation cannot be undone.</p>
                      {docsError && <div className="text-red-500 text-sm mb-2">{docsError}</div>}
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 rounded bg-muted text-sidebar-foreground"
                          onClick={() => setConfirmDeleteDoc(null)}
                          disabled={docsLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded bg-red-600 text-white font-semibold disabled:opacity-60"
                          onClick={() => handleDelete(confirmDeleteDoc)}
                          disabled={docsLoading}
                        >
                            {docsLoading ? "Deleting..." : "Delete forever"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Change category dialog */}
                {changeCategoryDoc && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-sidebar p-4 rounded shadow-lg max-w-sm w-full  m-[10px]">
                      <h3 className="text-lg font-bold mb-2 text-blue-600">Change document folder</h3>
                      <p className="mb-4 text-sm">Select or enter a new folder for <span className='font-semibold'>{changeCategoryDoc.filename}</span>.</p>
                      <div className="mb-4 w-full">
                        <label htmlFor="change-category-input" className="block text-sm font-medium mb-2">Folder</label>
                        <div className="relative w-full">
                          <input
                            id="change-category-input"
                            ref={changeCategoryInputRef}
                            type="text"
                            className="w-full px-3 py-2 border rounded bg-background text-sidebar-foreground"
                            placeholder="Select or enter folder"
                            value={changeCategoryInput}
                            onChange={e => {
                              setChangeCategoryInput(e.target.value);
                              setChangeCategoryIsCustom(!allCategories.includes(e.target.value));
                              setChangeCategoryDropdownOpen(true);
                            }}
                            onFocus={() => setChangeCategoryDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setChangeCategoryDropdownOpen(false), 120)}
                            autoComplete="off"
                          />
                          {/* Dropdown z kategoriami użytkownika */}
                          {changeCategoryDropdownOpen && userCategories.length > 0 && (
                            <div
                              className="absolute left-0 mt-1 rounded shadow-lg border border-sidebar-border z-20"
                              style={{
                                background: "#374151",
                                minWidth: changeCategoryInputRef.current?.offsetWidth || '100%',
                                width: changeCategoryInputRef.current?.offsetWidth || '100%',
                                maxHeight: 180,
                                overflowY: 'auto',
                              }}
                            >
                              {userCategories
                                .filter(cat => cat.toLowerCase().includes(changeCategoryInput.toLowerCase()) || !changeCategoryInput)
                                .map(cat => (
                                  <button
                                    key={cat}
                                    type="button"
                                    className="block w-full text-left px-3 py-2 text-sm text-white"
                                    style={{ background: '#374151' }}
                                    onMouseEnter={e => {
                                      (e.currentTarget as HTMLButtonElement).style.background = '#1f2937';
                                    }}
                                    onMouseLeave={e => {
                                      (e.currentTarget as HTMLButtonElement).style.background = '#374151';
                                    }}
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      setChangeCategoryInput(cat);
                                      setChangeCategoryIsCustom(false);
                                      setChangeCategoryDropdownOpen(false);
                                    }}
                                  >
                                    {cat}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                        {changeCategoryIsCustom && changeCategoryInput.trim() && (
                          <div className="mt-1 text-xs text-muted-foreground">New category: <span className="font-semibold">{changeCategoryInput.trim()}</span></div>
                        )}
                      </div>
                      {changeCategoryError && (
                        <div className="bg-red-100 text-red-700 border border-red-200 rounded px-3 py-2 text-sm mb-2 flex items-center justify-between">
                          <span>{changeCategoryError}</span>
                          <button
                            className="ml-2 text-red-400 hover:text-red-700 text-lg font-bold px-1 rounded focus:outline-none"
                            onClick={() => setChangeCategoryError(null)}
                            aria-label="Dismiss error"
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 rounded bg-muted text-sidebar-foreground"
                          onClick={() => {
                            setChangeCategoryDoc(null);
                            setChangeCategoryInput("");
                            setChangeCategoryError(null);
                          }}
                          disabled={changeCategoryLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-60"
                          onClick={async () => {
                            setChangeCategoryError(null);
                            if (!changeCategoryInput.trim()) {
                              setChangeCategoryError("Select or enter a category.");
                              return;
                            }
                            setChangeCategoryLoading(true);
                            try {
                              const apiClient = apiClientRef.current;
                              if (!apiClient) throw new Error("API client initialization error.");
                              await apiClient.changeDocumentCategory({ documentId: changeCategoryDoc.id, newCategory: changeCategoryInput.trim() });
                              setChangeCategoryDoc(null);
                              setChangeCategoryInput("");
                              setChangeCategoryError(null);
                              fetchDocuments();
                            } catch (err: any) {
                              setChangeCategoryError(err?.body?.message || err?.message || "Category change error.");
                            } finally {
                              setChangeCategoryLoading(false);
                            }
                          }}
                          disabled={changeCategoryLoading}
                        >
                          {changeCategoryLoading ? "Changing..." : "Change category"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
}
// Sekcja usuwania konta (przeniesiona poza główny komponent)
function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClientRef = useRef<any>(null);
  useEffect(() => {
    if (!apiClientRef.current) {
      import("../backend/backend").then((mod) => {
        apiClientRef.current = new mod.default();
      });
    }
  }, []);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    try {
      const apiClient = apiClientRef.current;
        if (!apiClient) throw new Error("API client initialization error.");
      await apiClient.deleteUser();
      // Usuń tokeny
      apiClient.clearToken();
      localStorage.removeItem('lastSelectedChatId');
      // Przekieruj na landing page
      window.location.href = "/";
    } catch (err: any) {
        setError(err?.body?.message || err?.message || "Account deletion error.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
        <h2 className="text-lg font-semibold mb-2 text-red-600">Delete account</h2>
        <p className="text-sm text-muted-foreground mb-2">Account deletion is irreversible. All your data will be permanently deleted.</p>
      <button
        type="button"
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-60"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        Delete account
      </button>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-sidebar p-6 rounded shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2 text-red-600">Confirm account deletion</h3>
              <p className="mb-4 text-sm">Are you sure you want to delete your account? This operation cannot be undone.</p>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded bg-muted text-sidebar-foreground"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold disabled:opacity-60"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiClientRef = useRef<any>(null);
  useEffect(() => {
    if (!apiClientRef.current) {
      import("../backend/backend").then((mod) => {
        apiClientRef.current = new mod.default();
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
      if (newPassword !== repeatNewPassword) {
        setError("New passwords do not match.");
      return;
    }
      if (!oldPassword || !newPassword) {
        setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const apiClient = apiClientRef.current;
        if (!apiClient) throw new Error("API client initialization error.");
      await apiClient.changeUserPassword({ oldPassword, newPassword });
        setSuccess("Password has been changed.");
      setOldPassword("");
      setNewPassword("");
      setRepeatNewPassword("");
    } catch (err: any) {
        setError(err?.body?.message || err?.message || "Password change error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="old-password" className="block text-sm font-medium mb-1">Old password</label>
        <input
          id="old-password"
          type="password"
          className="w-full px-3 py-2 border rounded bg-background text-sidebar-foreground"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium mb-1">New password</label>
        <input
          id="new-password"
          type="password"
          className="w-full px-3 py-2 border rounded bg-background text-sidebar-foreground"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="repeat-new-password" className="block text-sm font-medium mb-1">Repeat new password</label>
        <input
          id="repeat-new-password"
          type="password"
          className="w-full px-3 py-2 border rounded bg-background text-sidebar-foreground"
          value={repeatNewPassword}
          onChange={e => setRepeatNewPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="w-full bg-sidebar-accent text-sidebar-accent-foreground py-2 rounded font-semibold disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Changing..." : "Change password"}
      </button>
    </form>
  );
}
