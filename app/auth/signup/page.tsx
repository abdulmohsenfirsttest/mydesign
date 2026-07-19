"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/auth/verify"), 1000);
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

        <h1 className="text-3xl text-foreground mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Create account</h1>
        <p className="text-muted-2 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>Access your project portal</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>First name</label>
              <input type="text" required className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors" style={{ fontFamily: "var(--font-inter)" }} />
            </div>
            <div>
              <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Last name</label>
              <input type="text" required className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors" style={{ fontFamily: "var(--font-inter)" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Email</label>
            <input type="email" required placeholder="you@example.com" className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors placeholder-muted-4" style={{ fontFamily: "var(--font-inter)" }} />
          </div>
          <div>
            <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Phone</label>
            <input type="tel" required placeholder="+966 5XX XXX XXXX" className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors placeholder-muted-4" style={{ fontFamily: "var(--font-inter)" }} />
          </div>
          <div>
            <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Password</label>
            <input type="password" required placeholder="••••••••" className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors placeholder-muted-4" style={{ fontFamily: "var(--font-inter)" }} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 border border-foreground text-foreground text-sm tracking-widest hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 mt-2"
            style={{ fontFamily: "var(--font-inter)" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-muted-3 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" className="text-muted-1 hover:text-foreground transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
