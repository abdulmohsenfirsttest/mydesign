"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabase";

const times = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
// Meeting-3 service catalog: 5 design services (handled by the designers) +
// 1 management service (routed to the Project Manager, not the design team).
const designServices = ["Interior Design", "Exterior Design", "Landscape Design", "Interior & Exterior", "Full Package"];
const managementServices = ["Renovation Planning & Construction Management"];

const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  // Build the stored date from LOCAL components (not toISOString, which is UTC and
  // can roll back a day in UTC+3 when the page is opened in the early morning).
  return { label: d.toLocaleDateString("en-US", { weekday: "short" }), date: d.getDate(), full: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` };
});

export default function BookPage() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [booked, setBooked] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    await Promise.all([
      supabase.from("bookings").insert({ name, phone, email, service: selectedService, date: selectedDay, time: selectedTime, status: "Pending" }),
      supabase.from("clients").upsert({ name, phone, email, password: "123123" }, { onConflict: "phone", ignoreDuplicates: true }),
    ]);
    setBooked(true);
  }

  return (
    <>
      <Navbar />
      <main className="bg-[#0a0a0a] min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs text-white/40 tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>APPOINTMENT</p>
          <h1 className="text-4xl md:text-5xl text-white mb-3" style={{ fontFamily: "var(--font-playfair)" }}>Book a Consultation</h1>
          <p className="text-white/40 text-sm mb-12" style={{ fontFamily: "var(--font-inter)" }}>
            Schedule a meeting with our team to discuss your project.
          </p>

          {booked ? (
            <div className="border border-white/10 p-12 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl text-white mb-3" style={{ fontFamily: "var(--font-playfair)" }}>Appointment Confirmed</h2>
              <p className="text-white/40 text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>{selectedService}</p>
              <p className="text-white/60 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{selectedDay} at {selectedTime}</p>
              <div className="border-t border-white/[0.08] mt-8 pt-8">
                <p className="text-white/50 text-sm mb-2" style={{ fontFamily: "var(--font-inter)" }}>Your client portal is ready.</p>
                <p className="text-white/25 text-xs mb-6" style={{ fontFamily: "var(--font-inter)" }}>
                  Track your project, review meeting notes, access files, and approve deliverables — all in one place.
                </p>
                <Link
                  href={`/auth/login?phone=${encodeURIComponent(phone)}`}
                  className="inline-block px-8 py-3 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}>
                  Access Your Portal →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-8">
                {/* Step 1 - Service */}
                <div>
                  <h3 className="text-white text-sm tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>01 — SELECT SERVICE</h3>
                  <p className="text-white/25 text-xs mb-3 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>DESIGN</p>
                  <div className="space-y-2 mb-6">
                    {designServices.map(s => (
                      <button key={s} onClick={() => setSelectedService(s)}
                        className={`w-full text-left px-5 py-4 border text-sm transition-colors ${selectedService === s ? "border-white text-white bg-white/5" : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"}`}
                        style={{ fontFamily: "var(--font-inter)" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="text-white/25 text-xs mb-3 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>MANAGEMENT</p>
                  <div className="space-y-2">
                    {managementServices.map(s => (
                      <button key={s} onClick={() => setSelectedService(s)}
                        className={`w-full text-left px-5 py-4 border text-sm transition-colors ${selectedService === s ? "border-white text-white bg-white/5" : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"}`}
                        style={{ fontFamily: "var(--font-inter)" }}>
                        {s}
                        <span className="block text-white/25 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>Handled by our Project Management team</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2 - Date */}
                <div>
                  <h3 className="text-white text-sm tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>02 — SELECT DATE</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map(d => (
                      <button key={d.full} onClick={() => setSelectedDay(d.full)}
                        className={`flex flex-col items-center py-3 border text-xs transition-colors ${selectedDay === d.full ? "border-white text-white bg-white/5" : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/70"}`}
                        style={{ fontFamily: "var(--font-inter)" }}>
                        <span>{d.label}</span>
                        <span className="text-base mt-1">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3 - Time */}
                <div>
                  <h3 className="text-white text-sm tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>03 — SELECT TIME</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {times.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className={`py-3 border text-xs transition-colors ${selectedTime === t ? "border-white text-white bg-white/5" : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/70"}`}
                        style={{ fontFamily: "var(--font-inter)" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary + Form */}
              <div className="lg:col-span-2">
                <div className="border border-white/10 p-6 sticky top-24">
                  <h3 className="text-white text-sm tracking-widest mb-6" style={{ fontFamily: "var(--font-inter)" }}>YOUR BOOKING</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                      <span className="text-white/40">Service</span>
                      <span className="text-white/80 text-right max-w-[150px]">{selectedService || "—"}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                      <span className="text-white/40">Date</span>
                      <span className="text-white/80">{selectedDay || "—"}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                      <span className="text-white/40">Time</span>
                      <span className="text-white/80">{selectedTime || "—"}</span>
                    </div>
                  </div>
                  <form onSubmit={handleBook} className="space-y-3">
                    <input type="text" required placeholder="Your name" value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-transparent border border-white/20 text-white text-xs px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
                      style={{ fontFamily: "var(--font-inter)" }} />
                    <input type="email" required placeholder="Email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-transparent border border-white/20 text-white text-xs px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
                      style={{ fontFamily: "var(--font-inter)" }} />
                    <input type="tel" required placeholder="Phone / WhatsApp" value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-transparent border border-white/20 text-white text-xs px-4 py-3 focus:outline-none focus:border-white/60 transition-colors placeholder-white/20"
                      style={{ fontFamily: "var(--font-inter)" }} />
                    <button type="submit" disabled={!selectedService || !selectedDay || !selectedTime}
                      className="w-full py-3 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-30 mt-2"
                      style={{ fontFamily: "var(--font-inter)" }}>
                      Confirm Booking
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
