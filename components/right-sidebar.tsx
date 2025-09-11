"use client";

import React, { useState, useEffect, useRef } from "react";

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
        {activeTab === "documents" ? (
          <div>
            {/* TODO: Wstaw zawartość zakładki Documents */}
            <p className="text-muted-foreground">Documents content goes here.</p>
          </div>
        ) : null}
        {activeTab === "settings" ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">Zmiana hasła</h2>
            <ChangePasswordForm />
            <hr className="my-6" />
            <DeleteAccountSection />
          </div>
        ) : null}
      </div>
    </aside>
  );
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
      if (!apiClient) throw new Error("Błąd inicjalizacji klienta API.");
      await apiClient.deleteUser();
      // Usuń tokeny
      apiClient.clearToken();
      localStorage.removeItem('lastSelectedChatId');
      // Przekieruj na landing page
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.body?.message || err?.message || "Błąd usuwania konta.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <h2 className="text-lg font-semibold mb-2 text-red-600">Usuń konto</h2>
      <p className="text-sm text-muted-foreground mb-2">Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane zostaną trwale usunięte.</p>
      <button
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-60"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        Usuń konto
      </button>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-sidebar p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2 text-red-600">Potwierdź usunięcie konta</h3>
            <p className="mb-4 text-sm">Czy na pewno chcesz usunąć swoje konto? Tej operacji nie można cofnąć.</p>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded bg-muted text-sidebar-foreground"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Anuluj
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold disabled:opacity-60"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Usuwanie..." : "Usuń na zawsze"}
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
      setError("Nowe hasła nie są identyczne.");
      return;
    }
    if (!oldPassword || !newPassword) {
      setError("Wszystkie pola są wymagane.");
      return;
    }
    setLoading(true);
    try {
      const apiClient = apiClientRef.current;
      if (!apiClient) throw new Error("Błąd inicjalizacji klienta API.");
      await apiClient.changeUserPassword({ oldPassword, newPassword });
      setSuccess("Hasło zostało zmienione.");
      setOldPassword("");
      setNewPassword("");
      setRepeatNewPassword("");
    } catch (err: any) {
      setError(err?.body?.message || err?.message || "Błąd zmiany hasła.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Stare hasło</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded bg-background text-sidebar-foreground"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Nowe hasło</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded bg-background text-sidebar-foreground"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Powtórz nowe hasło</label>
        <input
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
        {loading ? "Zmiana..." : "Zmień hasło"}
      </button>
    </form>
  );
}
