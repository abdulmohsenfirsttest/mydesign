"use client";

import { useState, FormEvent } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section id="contact" className="py-24 px-6 bg-neutral-950">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-400 mb-3 font-medium">
          Contact
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Let&apos;s create something great
        </h2>
        <p className="text-neutral-400 mb-12">
          Have a project in mind? I&apos;d love to hear about it. Send me a message
          and I&apos;ll get back to you as soon as possible.
        </p>

        {sent ? (
          <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/30 p-10 text-indigo-300 text-lg font-medium">
            Message sent! I&apos;ll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-neutral-400 mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                placeholder="Project inquiry"
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                placeholder="Tell me about your project..."
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors text-base"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
