"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FileRow = { id: string; name: string; size: string; url: string; created_at: string; projects: { name: string } | null };

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = localStorage.getItem("client_id");
    if (!clientId) { router.push("/auth/login"); return; }

    function fetchFiles() {
      supabase.from("files").select("*, projects(name)").eq("client_id", clientId!).order("created_at", { ascending: false })
        .then(({ data }) => { setFiles((data as FileRow[]) ?? []); setLoading(false); });
    }

    fetchFiles();

    const channel = supabase.channel("client-files")
      .on("postgres_changes", { event: "*", schema: "public", table: "files", filter: `client_id=eq.${clientId}` }, fetchFiles)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function downloadFile(url: string, name: string) {
    const marker = "/storage/v1/object/public/files/";
    const idx = url.indexOf(marker);
    if (idx === -1) { window.open(url, "_blank"); return; }
    const path = decodeURIComponent(url.slice(idx + marker.length));
    const { data, error } = await supabase.storage.from("files").download(path);
    if (error || !data) { window.open(url, "_blank"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(data);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Files & Deliverables</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>All documents and assets shared by the design team.</p>
      </div>

      {loading ? (
        <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
      ) : files.length === 0 ? (
        <div className="border border-white/[0.08] bg-[#161616] p-12 text-center">
          <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No files yet.</p>
        </div>
      ) : (
        <div className="border border-white/[0.08] bg-[#161616]">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
            <span className="col-span-5">Name</span>
            <span className="col-span-3">Project</span>
            <span className="col-span-2">Size</span>
            <span className="col-span-1">Date</span>
            <span className="col-span-1" />
          </div>
          {files.map((f, i) => (
            <div key={f.id} className={`grid grid-cols-12 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors ${i < files.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
              <div className="col-span-5 flex items-center gap-3">
                <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span className="text-white/70 text-sm truncate" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</span>
              </div>
              <span className="col-span-3 text-white/30 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{f.projects?.name || "—"}</span>
              <span className="col-span-2 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.size}</span>
              <span className="col-span-1 text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                {new Date(f.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <div className="col-span-1 flex justify-end items-center gap-2">
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors" title="Open">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
                <button onClick={() => downloadFile(f.url, f.name)} className="text-white/20 hover:text-white/60 transition-colors" title="Download">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
