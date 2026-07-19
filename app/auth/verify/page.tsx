"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      if (el) (el as HTMLInputElement).focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 rounded-full border-2 border-foreground flex items-center justify-center">
            <span className="text-foreground font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>my</span>
          </div>
          <span className="text-foreground font-semibold text-sm" style={{ fontFamily: "var(--font-inter)" }}>Design & Build</span>
        </Link>

        <h1 className="text-3xl text-foreground mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Verify your account</h1>
        <p className="text-muted-2 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>
          We sent a 6-digit code to your email and phone
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-3">
            {code.map((digit, i) => (
              <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-12 h-14 bg-transparent border border-border text-foreground text-xl text-center focus:outline-none focus:border-strong transition-colors"
                style={{ fontFamily: "var(--font-inter)" }} />
            ))}
          </div>
          <button type="submit" disabled={loading || code.some(d => !d)}
            className="w-full py-3 border border-foreground text-foreground text-sm tracking-widest hover:bg-foreground hover:text-background transition-colors disabled:opacity-30"
            style={{ fontFamily: "var(--font-inter)" }}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="mt-6 text-muted-3 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
          Didn&apos;t receive a code?{" "}
          <span className="text-muted-1 hover:text-foreground cursor-pointer transition-colors">Resend</span>
        </p>
      </div>
    </div>
  );
}
