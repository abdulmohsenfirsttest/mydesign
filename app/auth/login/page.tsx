"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState(() => searchParams.get("phone") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // If a session already exists we OFFER a shortcut — we do NOT force a redirect,
  // so the form stays reachable to sign in as a different account (e.g. switch
  // from a client session to the owner). Admin takes precedence.
  const [existing, setExisting] = useState<{ href: string; name: string } | null>(null);

  useEffect(() => {
    const next = localStorage.getItem("admin_session")
      ? { href: "/admin", name: localStorage.getItem("admin_name") || "the team portal" }
      : localStorage.getItem("client_id")
        ? { href: "/dashboard", name: localStorage.getItem("client_name") || "your dashboard" }
        : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a client-only store
    if (next) setExisting(next);
  }, []);

  // A fresh sign-in always starts from a clean slate, so a leftover session of
  // the other kind can never shadow the new one (owner vs. client).
  function clearSession() {
    ["admin_session", "admin_id", "admin_name", "admin_role", "admin_permissions", "client_id", "client_name"]
      .forEach(k => localStorage.removeItem(k));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const id = phone.trim();

    // Everyone signs in from this one portal, by EMAIL or PHONE. We look up by
    // phone then email with separate .eq() calls (values are safely encoded) —
    // never a string-built .or() filter, which would be injectable.
    let admin = (await supabase.from("admins").select("id, name, role, permissions").eq("phone", id).eq("password", password).maybeSingle()).data;
    if (!admin) admin = (await supabase.from("admins").select("id, name, role, permissions").eq("email", id).eq("password", password).maybeSingle()).data;

    if (admin) {
      clearSession();
      localStorage.setItem("admin_session", "true");
      localStorage.setItem("admin_id", admin.id);
      localStorage.setItem("admin_name", admin.name);
      localStorage.setItem("admin_role", admin.role ?? "manager");
      localStorage.setItem("admin_permissions", JSON.stringify(admin.permissions ?? null));
      router.push("/admin");
      return;
    }

    let client = (await supabase.from("clients").select("id, name").eq("phone", id).eq("password", password).maybeSingle()).data;
    if (!client) client = (await supabase.from("clients").select("id, name").eq("email", id).eq("password", password).maybeSingle()).data;

    if (!client) {
      setError("Incorrect email/phone or password.");
      setLoading(false);
      return;
    }

    clearSession();
    localStorage.setItem("client_id", client.id);
    localStorage.setItem("client_name", client.name);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-full border-2 border-foreground flex items-center justify-center">
            <span className="text-foreground font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>my</span>
          </div>
          <span className="text-foreground font-semibold text-sm" style={{ fontFamily: "var(--font-inter)" }}>Design & Build</span>
        </Link>

        <h1 className="text-3xl text-foreground mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Sign In</h1>
        <p className="text-muted-2 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>Clients and team — sign in with your email or phone.</p>

        {existing && (
          <div className="mb-6 border border-border bg-fill px-4 py-3 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
            <span className="text-muted-1">You&apos;re already signed in as {existing.name}. </span>
            <Link href={existing.href} className="text-foreground underline underline-offset-2">Continue →</Link>
            <span className="text-muted-2"> or sign in below to switch account.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Email or Phone</label>
            <input type="text" required value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="email@mysaudi.co or 05xxxxxxxx"
              className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors placeholder-muted-4"
              style={{ fontFamily: "var(--font-inter)" }} />
          </div>
          <div>
            <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors placeholder-muted-4"
              style={{ fontFamily: "var(--font-inter)" }} />
          </div>
          {error && <p className="text-red-400/70 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}
          <button type="submit" disabled={loading || !phone || !password}
            className="w-full py-3 border border-foreground text-foreground text-sm tracking-widest hover:bg-foreground hover:text-background transition-colors disabled:opacity-30"
            style={{ fontFamily: "var(--font-inter)" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
