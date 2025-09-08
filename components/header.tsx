"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { status } = useSession();

  return (
    <header className="w-full flex justify-end items-center px-6 py-3 border-b bg-background sticky top-0 z-40">
      {status === "unauthenticated" && (
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
