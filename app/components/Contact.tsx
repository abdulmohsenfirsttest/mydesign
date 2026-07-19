"use client";

import { useState, FormEvent } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section id="contact" className="bg-background py-20 border-t border-soft">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2
            className="text-4xl md:text-5xl text-foreground mb-5"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Contact Us
          </h2>
          <p className="text-muted-2 leading-relaxed max-w-sm" style={{ fontFamily: "var(--font-inter)" }}>
            This is the space to share your business&apos;s contact information. Let people know the best ways to get in touch and encourage them to reach out.
          </p>
        </div>

        {sent ? (
          <div className="flex items-center justify-center border border-border p-12 text-muted-1 text-sm" style={{ fontFamily: "var(--font-inter)" }}>
            Thank you — we&apos;ll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>
                  First name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors placeholder-muted-4"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>
                  Last name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>
                Email *
              </label>
              <input
                type="email"
                required
                className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-2 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>
                  Address
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent border border-border text-foreground text-sm px-4 py-3 focus:outline-none focus:border-strong transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 border border-foreground text-foreground text-sm tracking-widest hover:bg-foreground hover:text-background transition-colors mt-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
