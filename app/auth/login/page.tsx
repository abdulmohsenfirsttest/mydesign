"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const countryCodes = [
  { code: "+966", flag: "🇸🇦", label: "SA" },
  { code: "+971", flag: "🇦🇪", label: "AE" },
  { code: "+965", flag: "🇰🇼", label: "KW" },
  { code: "+974", flag: "🇶🇦", label: "QA" },
  { code: "+973", flag: "🇧🇭", label: "BH" },
  { code: "+968", flag: "🇴🇲", label: "OM" },
  { code: "+1",   flag: "🇺🇸", label: "US" },
  { code: "+44",  flag: "🇬🇧", label: "GB" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const p = searchParams.get("phone");
    if (p) setPhone(p.replace(/\D/g, ""));
  }, [searchParams]);

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 800);
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 900);
  }

  function handleResend() {
    setResent(true);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    setTimeout(() => setResent(false), 3000);
  }

  const Logo = () => (
    <Link href="/" className="flex items-center gap-3 mb-10">
      <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center">
        <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>my</span>
      </div>
      <span className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-inter)" }}>Design & Build</span>
    </Link>
  );

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Logo />
          <h1 className="text-3xl text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Enter the code</h1>
          <p className="text-white/40 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>
            We sent a 6-digit code to {countryCode.code} {phone}
          </p>
          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex gap-3">
              {otp.map((digit, i) => (
                <input key={i} ref={el => { inputRefs.current[i] = el; }} type="text" inputMode="numeric"
                  maxLength={1} value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                  className="w-12 h-14 bg-transparent border border-white/20 text-white text-xl text-center focus:outline-none focus:border-white/60 transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }} />
              ))}
            </div>
            <button type="submit" disabled={loading || otp.some(d => !d)}
              className="w-full py-3 border border-white text-white text-sm tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-30"
              style={{ fontFamily: "var(--font-inter)" }}>
              {loading ? "Verifying..." : "Verify & Enter Portal"}
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between text-xs" style={{ fontFamily: "var(--font-inter)" }}>
            <button onClick={() => setStep("phone")} className="text-white/30 hover:text-white/60 transition-colors">← Change number</button>
            <button onClick={handleResend} className="text-white/30 hover:text-white/60 transition-colors">
              {resent ? "✓ Code resent" : "Resend code"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Logo />
        <h1 className="text-3xl text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Client Portal</h1>
        <p className="text-white/40 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>
          Enter your phone number to receive a sign-in code.
        </p>
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Phone Number</label>
            <div className="flex">
              <div className="relative">
                <select value={countryCode.code}
                  onChange={e => setCountryCode(countryCodes.find(c => c.code === e.target.value) ?? countryCodes[0])}
                  className="appearance-none bg-[#1a1a1a] border border-white/20 border-r-0 text-white/70 text-sm pl-3 pr-7 py-3 focus:outline-none focus:border-white/50 cursor-pointer h-full"
                  style={{ fontFamily: "var(--font-inter)" }}>
                  {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="5X XXX XXXX"
                className="flex-1 bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
                style={{ fontFamily: "var(--font-inter)" }} />
            </div>
          </div>
          <button type="submit" disabled={loading || phone.length < 8}
            className="w-full py-3 border border-white text-white text-sm tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-30"
            style={{ fontFamily: "var(--font-inter)" }}>
            {loading ? "Sending..." : "Send Code"}
          </button>
        </form>
        <p className="mt-8 text-center text-white/20 text-xs leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
          By continuing, you agree to receive an SMS verification code.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
