"use client";
import { useState, useSyncExternalStore } from "react";
import SiteHeader from "../components/site/SiteHeader";
import SiteFooter from "../components/site/SiteFooter";
import { ArrowButton, Container, Eyebrow, ThinArrow } from "../components/site/primitives";
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

// `days` is computed when the module loads, but this page is prerendered at build
// time, so the server HTML would carry the build day's dates. The date grid is
// therefore drawn only once the page has mounted in the browser (same-height
// placeholders before that), which avoids a hydration mismatch on any later day.
const subscribeNoop = () => () => {};
const useIsClient = () => useSyncExternalStore(subscribeNoop, () => true, () => false);

// v5.0.0 "Start a Project" styling (Wix /blank look) — fixed public-site palette.
// Step headings are real <h2>s, so they carry the Eyebrow's type classes directly
// (Eyebrow renders a <p>, which cannot sit inside a heading).
const STEP_TITLE = "font-body text-[9.5px] uppercase leading-none tracking-[0.25em] text-site-cream/70";
const OPTION =
  "border bg-transparent font-body transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-site-cream";
const OPTION_ON = "border-site-cream bg-site-cream/5 text-site-cream";
const OPTION_OFF = "border-site-line text-site-cream/70 hover:border-site-cream/50 hover:text-site-cream";
const FIELD_LABEL = "block font-body text-[14px] leading-none text-site-cream";
const FIELD =
  "mt-2 w-full rounded-none border-0 border-b border-site-line bg-transparent px-0 py-3 font-body text-[15px] text-site-cream placeholder:text-site-cream/40 transition-colors duration-200 motion-reduce:transition-none focus:border-site-cream focus:outline-none autofill:shadow-[inset_0_0_0_1000px_var(--site-ink)] autofill:[-webkit-text-fill-color:var(--site-cream)]";

export default function BookPage() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const isClient = useIsClient();

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
      <SiteHeader />
      <main data-public-site className="min-h-screen bg-site-ink pb-24 pt-[120px] text-site-cream md:pb-[120px] md:pt-[150px]">
        <Container>
          <div className="mx-auto max-w-[1040px]">
            <Eyebrow className="mb-6 text-site-cream/70">START A PROJECT</Eyebrow>
            <h1 className="font-display text-[length:clamp(44px,6vw,72px)] leading-[1.05] tracking-[-0.01em] text-site-cream">
              Start a Project
            </h1>
            <p className="mb-14 mt-5 font-body text-[15px] leading-[1.6] text-site-cream/70 md:mb-20">
              Book a consultation with our team to discuss your project.
            </p>

            {booked ? (
              <div className="mx-auto max-w-[560px] border border-site-line bg-site-panel px-6 py-12 text-center sm:px-12 sm:py-14">
                <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-site-line">
                  <svg aria-hidden="true" className="h-6 w-6 text-site-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mb-4 font-display text-[length:clamp(32px,4vw,40px)] leading-[1.1] text-site-cream">Appointment Confirmed</h2>
                <p className="mb-1 font-body text-[15px] text-site-cream/70">{selectedService}</p>
                <p className="font-body text-[15px] text-site-cream">{selectedDay} at {selectedTime}</p>
                <div className="mt-10 border-t border-site-line pt-10">
                  <p className="mb-2 font-body text-[15px] text-site-cream">Your client portal is ready.</p>
                  <p className="mx-auto mb-8 max-w-[400px] font-body text-[13px] leading-[1.6] text-site-cream/50">
                    Track your project, review meeting notes, access files, and approve deliverables — all in one place.
                  </p>
                  <ArrowButton href={`/auth/login?phone=${encodeURIComponent(phone)}`} variant="cream">
                    Access Your Portal
                  </ArrowButton>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-14 lg:grid-cols-5 lg:gap-16">
                <div className="space-y-14 lg:col-span-3">
                  {/* Step 1 - Service */}
                  <section aria-labelledby="book-step-service">
                    <h2 id="book-step-service" className={`mb-7 ${STEP_TITLE}`}>01 — SERVICE</h2>
                    <Eyebrow className="mb-3 text-site-bronze">DESIGN</Eyebrow>
                    <div className="mb-8 space-y-2">
                      {designServices.map(s => (
                        <button key={s} type="button" aria-pressed={selectedService === s} onClick={() => setSelectedService(s)}
                          className={`w-full px-5 py-4 text-left text-[15px] ${OPTION} ${selectedService === s ? OPTION_ON : OPTION_OFF}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <Eyebrow className="mb-3 text-site-bronze">MANAGEMENT</Eyebrow>
                    <div className="space-y-2">
                      {managementServices.map(s => (
                        <button key={s} type="button" aria-pressed={selectedService === s} onClick={() => setSelectedService(s)}
                          className={`w-full px-5 py-4 text-left text-[15px] ${OPTION} ${selectedService === s ? OPTION_ON : OPTION_OFF}`}>
                          {s}
                          <span className="mt-1.5 block font-body text-[13px] text-site-cream/50">Handled by our Project Management team</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Step 2 - Date */}
                  <section aria-labelledby="book-step-date">
                    <h2 id="book-step-date" className={`mb-7 ${STEP_TITLE}`}>02 — DATE</h2>
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {isClient
                        ? days.map(d => (
                            <button key={d.full} type="button" aria-pressed={selectedDay === d.full} onClick={() => setSelectedDay(d.full)}
                              className={`flex flex-col items-center py-3 text-[12px] sm:text-[13px] ${OPTION} ${selectedDay === d.full ? OPTION_ON : OPTION_OFF}`}>
                              <span>{d.label}</span>
                              <span className="mt-1.5 font-display text-[20px] leading-none sm:text-[24px]">{d.date}</span>
                            </button>
                          ))
                        : days.map((_, i) => (
                            // Same box as a date button (borders + py-3 + label line + 6px + numeral), empty until mount.
                            <div key={i} aria-hidden="true" className="h-[70px] border border-site-line sm:h-[75.5px]" />
                          ))}
                    </div>
                  </section>

                  {/* Step 3 - Time */}
                  <section aria-labelledby="book-step-time">
                    <h2 id="book-step-time" className={`mb-7 ${STEP_TITLE}`}>03 — TIME</h2>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {times.map(t => (
                        <button key={t} type="button" aria-pressed={selectedTime === t} onClick={() => setSelectedTime(t)}
                          className={`py-3.5 text-[14px] ${OPTION} ${selectedTime === t ? OPTION_ON : OPTION_OFF}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Summary + Form */}
                <div className="lg:col-span-2">
                  <div className="space-y-12 lg:sticky lg:top-[112px]">
                    <section aria-labelledby="book-summary" className="border border-site-line bg-site-panel p-6 sm:p-8">
                      <h2 id="book-summary" className={`mb-6 ${STEP_TITLE}`}>YOUR BOOKING</h2>
                      <dl className="font-body text-[14px]">
                        <div className="flex justify-between gap-6 border-b border-site-line py-3">
                          <dt className="text-site-cream/60">Service</dt>
                          <dd className="max-w-[60%] text-right text-site-cream">{selectedService || "—"}</dd>
                        </div>
                        <div className="flex justify-between gap-6 border-b border-site-line py-3">
                          <dt className="text-site-cream/60">Date</dt>
                          <dd className="text-right text-site-cream">{selectedDay || "—"}</dd>
                        </div>
                        <div className="flex justify-between gap-6 py-3">
                          <dt className="text-site-cream/60">Time</dt>
                          <dd className="text-right text-site-cream">{selectedTime || "—"}</dd>
                        </div>
                      </dl>
                    </section>

                    {/* Step 4 - Details */}
                    <section aria-labelledby="book-step-details">
                      <h2 id="book-step-details" className={`mb-8 ${STEP_TITLE}`}>04 — YOUR DETAILS</h2>
                      <form onSubmit={handleBook} className="space-y-8">
                        <div>
                          <label htmlFor="book-name" className={FIELD_LABEL}>Full name<span aria-hidden="true">*</span></label>
                          <input id="book-name" type="text" required placeholder="Your name" value={name}
                            onChange={e => setName(e.target.value)}
                            className={FIELD} />
                        </div>
                        <div>
                          <label htmlFor="book-email" className={FIELD_LABEL}>Email<span aria-hidden="true">*</span></label>
                          <input id="book-email" type="email" required placeholder="Email" value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={FIELD} />
                        </div>
                        <div>
                          <label htmlFor="book-phone" className={FIELD_LABEL}>Phone / WhatsApp<span aria-hidden="true">*</span></label>
                          <input id="book-phone" type="tel" required placeholder="Phone / WhatsApp" value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className={FIELD} />
                        </div>
                        <button type="submit" disabled={!selectedService || !selectedDay || !selectedTime}
                          className="mt-10 flex h-[53px] w-full items-center justify-center bg-site-olive px-[26px] font-body text-[15px] leading-none text-site-cream transition-colors duration-200 hover:bg-[#636a53] motion-reduce:transition-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-site-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-site-olive">
                          <span>Confirm Booking</span>
                          <ThinArrow className="ml-[26px]" />
                        </button>
                      </form>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
