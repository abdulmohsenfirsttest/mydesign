"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const countryCodes = [
  { code: "+966", flag: "🇸🇦" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+965", flag: "🇰🇼" },
  { code: "+974", flag: "🇶🇦" },
  { code: "+973", flag: "🇧🇭" },
  { code: "+968", flag: "🇴🇲" },
  { code: "+1",   flag: "🇺🇸" },
  { code: "+44",  flag: "🇬🇧" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [phone, setPhone] = useState(() => (searchParams.get("phone") ?? "").replace(/\D/g, ""));
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fullPhone = `${countryCode.code}${phone}`;
    const { data, error: dbError } = await supabase
      .from("clients")
      .select("id, name")
      .eq("phone", fullPhone)
      .eq("password", password)
      .single();

    if (dbError || !data) {
      setError("Incorrect phone number or password.");
      setLoading(false);
      return;
    }

    localStorage.setItem("client_id", data.id);
    localStorage.setItem("client_name", data.name);
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

        <h1 className="text-3xl text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Client Portal</h1>
        <p className="text-white/40 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>Sign in to access your project portal.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs text-white/40 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
              style={{ fontFamily: "var(--font-inter)" }} />
          </div>

          {error && <p className="text-red-400/70 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}

          <button type="submit" disabled={loading || phone.length < 8 || !password}
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
