"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Admins now sign in from the client portal (/auth/login).
// This route just redirects there for any old links/bookmarks.
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/login");
  }, [router]);
  return null;
}
