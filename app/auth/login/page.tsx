"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1000);
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

        <h1 className="text-3xl text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Welcome back</h1>
        <p className="text-white/40 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>Sign in to your client portal</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Email</label>
            <input type="email" required placeholder="you@example.com"
              className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
              style={{ fontFamily: "var(--font-inter)" }} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Password</label>
            <input type="password" required placeholder="••••••••"
              className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
              style={{ fontFamily: "var(--font-inter)" }} />
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-white/30 hover:text-white/60 cursor-pointer transition-colors" style={{ fontFamily: "var(--font-inter)" }}>
              Forgot password?
            </span>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 border border-white text-white text-sm tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-inter)" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 border-t border-white/10" />
          <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>OR</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        <button className="mt-4 w-full py-3 border border-white/20 text-white/60 text-sm hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-3"
          style={{ fontFamily: "var(--font-inter)" }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-white/60 hover:text-white transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
