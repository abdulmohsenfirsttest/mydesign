"use client";
import { useState } from "react";

const threads = [
  {
    id: 1, client: "Ahmed Al-Rashid", project: "Villa Interior — Al Nakheel", time: "2h ago", unread: 3,
    preview: "Thank you Sara! I'll take a look today and share feedback.",
    messages: [
      { sender: "Sara (Team)", text: "Good morning! The 3D renders for the living room are ready for review. We've prepared 3 different lighting options.", time: "10:02 AM", me: true },
      { sender: "Ahmed Al-Rashid", text: "Thank you Sara! I'll take a look today and share feedback.", time: "11:30 AM", me: false },
      { sender: "Sara (Team)", text: "Also, we need to confirm the marble selection by end of week for the contractor.", time: "12:45 PM", me: true },
    ],
  },
  {
    id: 2, client: "Nora Al-Ghamdi", project: "Jewelry Store — Riyadh Gallery", time: "5h ago", unread: 0,
    preview: "Got it. I'll review and sign today.",
    messages: [
      { sender: "Omar (Team)", text: "Hi Nora! The final design package has been sent for e-signature. Please check the Financial section.", time: "9:00 AM", me: true },
      { sender: "Nora Al-Ghamdi", text: "Got it. I'll review and sign today.", time: "2:00 PM", me: false },
    ],
  },
  {
    id: 3, client: "Faisal Al-Otaibi", project: "Corporate Office — NEOM", time: "1d ago", unread: 0,
    preview: "Could you confirm the headcount and department breakdown?",
    messages: [
      { sender: "Reem (Team)", text: "To start the space planning, could you share the headcount by department?", time: "Yesterday", me: true },
    ],
  },
];

export default function AdminMessagesPage() {
  const [selected, setSelected] = useState(threads[0]);
  const [input, setInput] = useState("");

  return (
    <div className="flex h-screen">
      <div className="w-72 border-r border-white/[0.06] flex flex-col">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h1 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>MESSAGES</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map(t => (
            <button key={t.id} onClick={() => setSelected(t)}
              className={`w-full text-left px-5 py-4 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors ${selected.id === t.id ? "bg-white/[0.05]" : ""}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-white/70 text-xs font-medium" style={{ fontFamily: "var(--font-inter)" }}>{t.client}</span>
                <div className="flex items-center gap-2">
                  {t.unread > 0 && <span className="w-4 h-4 rounded-full bg-white text-black text-xs flex items-center justify-center">{t.unread}</span>}
                  <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{t.time}</span>
                </div>
              </div>
              <p className="text-white/30 text-xs mb-1" style={{ fontFamily: "var(--font-inter)" }}>{t.project}</p>
              <p className="text-white/20 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{t.preview}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <p className="text-white text-sm" style={{ fontFamily: "var(--font-inter)" }}>{selected.client}</p>
          <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{selected.project}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selected.messages.map((m, i) => (
            <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-sm px-4 py-3 ${m.me ? "bg-white text-black" : "border border-white/[0.08] bg-[#161616] text-white/70"}`}>
                {!m.me && <p className="text-white/40 text-xs mb-1" style={{ fontFamily: "var(--font-inter)" }}>{m.sender}</p>}
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{m.text}</p>
                <p className={`text-xs mt-1 ${m.me ? "text-black/40" : "text-white/20"}`} style={{ fontFamily: "var(--font-inter)" }}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Reply to client..."
            className="flex-1 bg-transparent border border-white/20 text-white text-sm px-4 py-2.5 focus:outline-none focus:border-white/40 transition-colors placeholder-white/20"
            style={{ fontFamily: "var(--font-inter)" }} />
          <button onClick={() => setInput("")} disabled={!input}
            className="px-5 py-2.5 border border-white text-white text-xs hover:bg-white hover:text-black transition-colors disabled:opacity-30"
            style={{ fontFamily: "var(--font-inter)" }}>Send</button>
        </div>
      </div>
    </div>
  );
}
