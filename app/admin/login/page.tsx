"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === "admin2026") {
      localStorage.setItem("admin_session", "true");
      router.push("/admin");
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-full border border-white/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-playfair)" }}>my</span>
          </div>
          <span className="text-white text-xs font-medium tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>Admin</span>
        </div>

        <h1 className="text-2xl text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Owner Access</h1>
        <p className="text-white/40 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>Enter your password to access the dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
            style={{ fontFamily: "var(--font-inter)" }} />
          {error && <p className="text-red-400/70 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}
          <button type="submit"
            className="w-full py-3 border border-white text-white text-sm tracking-widest hover:bg-white hover:text-black transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}>Sign In</button>
        </form>
      </div>
    </div>
  );
}
