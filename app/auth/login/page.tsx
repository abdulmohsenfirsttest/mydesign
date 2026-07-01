"use client";
import { useState, Suspense } from "react";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const id = phone.trim();

    // Everyone signs in from this one portal, by EMAIL or PHONE. We look up by
    // phone then email with separate .eq() calls (values are safely encoded) —
    // never a string-built .or() filter, which would be injectable.
    let admin = (await supabase.from("admins").select("id, name, role").eq("phone", id).eq("password", password).maybeSingle()).data;
    if (!admin) admin = (await supabase.from("admins").select("id, name, role").eq("email", id).eq("password", password).maybeSingle()).data;

    if (admin) {
      localStorage.setItem("admin_session", "true");
      localStorage.setItem("admin_id", admin.id);
      localStorage.setItem("admin_name", admin.name);
      localStorage.setItem("admin_role", admin.role ?? "manager");
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

    localStorage.setItem("client_id", client.id);
    localStorage.setItem("client_name", client.name);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>my</span>
          </div>
          <span className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-inter)" }}>Design & Build</span>
        </Link>

        <h1 className="text-3xl text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Sign In</h1>
        <p className="text-white/40 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>Clients and team — sign in with your email or phone.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Email or Phone</label>
            <input type="text" required value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="email@mysaudi.co or 05xxxxxxxx"
              className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
              style={{ fontFamily: "var(--font-inter)" }} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
              style={{ fontFamily: "var(--font-inter)" }} />
          </div>
          {error && <p className="text-red-400/70 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}
          <button type="submit" disabled={loading || !phone || !password}
            className="w-full py-3 border border-white text-white text-sm tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-30"
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
