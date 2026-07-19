"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Meetings are now staff-internal — clients no longer see meeting logs here.
// This page renders a simple on-brand empty state pointing back to the project page.
export default function MessagesPage() {
  const router = useRouter();

  useEffect(() => {
    const clientId = localStorage.getItem("client_id");
    if (!clientId) { router.push("/auth/login"); return; }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="border border-soft bg-surface p-12 max-w-md w-full text-center">
        <h1 className="text-2xl text-foreground mb-3" style={{ fontFamily: "var(--font-playfair)" }}>Project updates</h1>
        <p className="text-muted-2 text-sm leading-relaxed mb-8" style={{ fontFamily: "var(--font-inter)" }}>
          Your project updates live on your project page.
        </p>
        <Link href="/dashboard/projects"
          className="inline-block px-6 py-2.5 border border-foreground text-foreground text-xs tracking-widest hover:bg-foreground hover:text-background transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>
          Go to projects →
        </Link>
      </div>
    </div>
  );
}
