"use client";
import { useEffect } from "react";

export default function ResetLastChatId() {
  useEffect(() => {
    localStorage.removeItem("lastSelectedChatId");
  }, []);
  return null;
}
